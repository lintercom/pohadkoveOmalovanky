// Server-only adapter. Never import this module from public browser code.
import { PRODUCT } from './product.mjs';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const buckets = new Set(['story-images', 'story-pdfs']);
export function createSupabaseBackend({ url, secretKey, fetchImpl = fetch, clock = Date.now }) {
  if (typeof document !== 'undefined') throw Error('SERVER_ONLY');
  const origin = new URL(url);
  if (origin.protocol !== 'https:' || !origin.hostname.endsWith('.supabase.co') || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) throw Error('INVALID_SUPABASE_URL');
  if (!secretKey || secretKey.startsWith('sb_publishable_')) throw Error('SERVER_KEY_REQUIRED');
  if (!secretKey.startsWith('sb_secret_')) {
    let claims;
    try { claims = JSON.parse(atob(secretKey.split('.')[1])); } catch { throw Error('SERVER_KEY_REQUIRED'); }
    if (claims.role !== 'service_role') throw Error('SERVER_KEY_REQUIRED');
  }
  const headers = { apikey: secretKey };
  if (!secretKey.startsWith('sb_secret_')) headers.authorization = `Bearer ${secretKey}`;
  async function request(path, options = {}) {
    const response = await fetchImpl(new URL(path, origin), {
      ...options, headers: { ...options.headers, ...headers }, redirect: 'error', signal: AbortSignal.timeout(15000)
    });
    // Response bodies may contain customer data: do not put them into errors/logs.
    if (!response.ok) throw Error(`SUPABASE_REQUEST_FAILED_${response.status}`);
    return response;
  }
  const insert = (table, value) => request(`/rest/v1/${table}`, {
    method: 'POST', headers: { 'content-type': 'application/json', prefer: 'return=minimal' }, body: JSON.stringify(value)
  });
  function objectPath(bucket, key) {
    if (!buckets.has(bucket) || !/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_.-]+)+$/.test(key) || key.split('/').some(x => x === '.' || x === '..')) throw Error('INVALID_STORAGE_KEY');
    return `/storage/v1/object/${bucket}/${key.split('/').map(encodeURIComponent).join('/')}`;
  }
  return {
    async verifyAdmin(accessToken) {
      if (!accessToken || accessToken.length > 4096) return null;
      const userResponse = await fetchImpl(new URL('/auth/v1/user', origin), { headers: { apikey: secretKey, authorization: `Bearer ${accessToken}` }, redirect: 'error', signal: AbortSignal.timeout(15000) });
      if (!userResponse.ok) return null;
      const user = await userResponse.json(); if (!uuid.test(user.id)) return null;
      let sessionId; try { sessionId = JSON.parse(atob(accessToken.split('.')[1].replaceAll('-','+').replaceAll('_','/'))).session_id; } catch { return null; }
      if (!uuid.test(sessionId)) return null;
      return (await request('/rest/v1/rpc/verify_story_admin_session', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({p_user:user.id,p_session:sessionId}) })).json();
    },
    async adminOverview() {
      return (await request('/rest/v1/rpc/story_admin_overview', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })).json();
    },
    async adminList(kind, { offset = 0, status = '', id = '' } = {}) {
      const select = kind === 'orders' ? 'id,created_at,status,amount,currency,cost_czk,budget_czk,expires_at,reason' : 'id,created_at,outcome,provider,rules_version,model,reasons,checks';
      const query = new URLSearchParams({ select, order: 'created_at.desc', limit: '26', offset: String(offset) });
      if (status) query.set(kind === 'orders' ? 'status' : 'outcome', `eq.${status}`);
      if (id) query.set('id', `eq.${id}`);
      return (await request(`/rest/v1/story_${kind === 'orders' ? 'orders' : 'checks'}?${query}`)).json();
    },
    async adminOrder(id) {
      const query = new URLSearchParams({ id: `eq.${id}`, select: 'id,created_at,status,amount,currency,cost_czk,budget_czk,expires_at,reason,pdf_key', limit: '1' });
      const rows = await (await request(`/rest/v1/story_orders?${query}`)).json(); if (!rows[0]) return null;
      const attempts = await (await request('/rest/v1/story_attempts?' + new URLSearchParams({ order_id: `eq.${id}`, select: 'id,stage,status,started_at,completed_at,provider,model,cost_czk', order: 'started_at.asc' }))).json();
      const notes = await (await request('/rest/v1/story_admin_notes?' + new URLSearchParams({ order_id: `eq.${id}`, select: 'note,updated_at', limit: '1' }))).json();
      return { ...rows[0], attempts, note: notes[0]?.note || '' };
    },
    async adminSaveNote(id, note, userId) {
      await request('/rest/v1/story_admin_notes', { method: 'POST', headers: { 'content-type': 'application/json', prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ order_id: id, note, updated_by: userId, updated_at: new Date(clock()).toISOString() }) });
    },
    async adminSettings() {
      return (await (await request('/rest/v1/story_admin_settings?id=eq.1&select=minute_limit,day_limit,updated_at')).json())[0];
    },
    async adminSaveSettings(settings) {
      await request('/rest/v1/story_admin_settings?id=eq.1', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...settings, updated_at: new Date(clock()).toISOString() }) });
    },
    async consumeCheckBudget() {
      return (await (await request('/rest/v1/rpc/consume_story_check_budget', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })).json()) === true;
    },
    async verifyConnection() {
      await request('/rest/v1/story_checks?select=id&limit=0');
      return true;
    },
    async recordCheck(audit) {
      // Persist only the existing preflight's non-personal audit fields.
      return insert('story_checks', { id: audit.id, created_at: audit.at, outcome: audit.outcome,
        provider: audit.provider, rules_version: audit.rulesVersion, model: audit.model,
        reasons: audit.reasons, checks: audit.checks });
    },
    async saveApproval(a) {
      if (!uuid.test(a.token) || !Number.isFinite(a.expiresAt) || a.expiresAt <= clock()) throw Error('INVALID_APPROVAL');
      return insert('story_approvals', { token: a.token, fingerprint: a.fingerprint, input: a.input,
        provider: a.provider, rules_version: a.rulesVersion, model: a.model, expires_at: new Date(a.expiresAt).toISOString() });
    },
    async loadApproval(token) {
      if (!uuid.test(token)) return null;
      const query = new URLSearchParams({ token: `eq.${token}`, expires_at: `gt.${new Date(clock()).toISOString()}`, select: '*', limit: '1' });
      const rows = await (await request(`/rest/v1/story_approvals?${query}`)).json();
      const a = rows[0];
      if (!a || a.token !== token || Date.parse(a.expires_at) <= clock()) return null;
      return { token: a.token, fingerprint: a.fingerprint, input: a.input, provider: a.provider,
        rulesVersion: a.rules_version, model: a.model, expiresAt: Date.parse(a.expires_at) };
    },
    async putPrivate(bucket, key, file) {
      const types = bucket === 'story-pdfs' ? ['application/pdf'] : ['image/png', 'image/jpeg', 'image/webp'];
      const limit = bucket === 'story-pdfs' ? 50 * 1024 * 1024 : PRODUCT.maxImageBytes;
      if (!file || !types.includes(file.type) || file.size <= 0 || file.size > limit) throw Error('INVALID_PRIVATE_FILE');
      await request(objectPath(bucket, key), { method: 'POST', headers: { 'content-type': file.type, 'x-upsert': 'false' }, body: file });
      return key;
    },
    async getPrivate(key) {
      // Matches engine.file(): the engine must authorize access before calling this.
      return (await request(objectPath('story-pdfs', key))).arrayBuffer();
    }
  };
}
