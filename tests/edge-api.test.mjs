import test from 'node:test';
import assert from 'node:assert/strict';
import { createEdgeApi } from '../server/edge-api.mjs';
import { apiFetch, API_CONFIG } from '../dist/api-client.mjs';
const base = 'https://dboxrlvmgxfuzllhrcwe.supabase.co/functions/v1/story-api/';
const key = 'sb_publishable_test';
const input = { child_name: 'Test', child_age: 4, theme: 'Kouzelný les', appearance_description: 'Krátké vlasy', companion_mode: 'none' };
function setup({ budget = true, connected = true } = {}) {
  const audit = [];
  return { audit, handle: createEdgeApi({ publishableKey: key, backend: {
    verifyConnection: async () => { if (!connected) throw Error('Unavailable'); },
    consumeCheckBudget: async () => budget, recordCheck: async a => audit.push(a)
  }}) };
}
const req = (route, options = {}) => new Request(base + route, { ...options, headers: { origin: 'http://127.0.0.1:4173', apikey: key, ...options.headers } });
test('CORS allows localhost and Pages, denies unknown origins and absent key', async () => {
  const { handle } = setup();
  for (const origin of ['http://127.0.0.1:4173', 'https://lintercom.github.io']) {
    const r = await handle(req('readiness', { headers: { origin } }));
    assert.equal(r.status, 200); assert.equal(r.headers.get('access-control-allow-origin'), origin);
    const body = await r.json(); assert.equal(body.database_connected, true); assert.equal(body.generation_available, false);
  }
  assert.equal((await handle(req('readiness', { headers: { origin: 'https://bad.example' } }))).status, 403);
  assert.equal((await handle(req('readiness', { headers: { apikey: '' } }))).status, 401);
  assert.equal((await handle(req('preflight', { method: 'OPTIONS' }))).status, 204);
});
test('server check audits non-personal fields and never approves without AI provider', async () => {
  const { handle, audit } = setup();
  const body = new FormData(); body.set('input', JSON.stringify(input));
  const r = await handle(req('preflight', { method: 'POST', body })); const value = await r.json();
  assert.equal(r.status, 200); assert.equal(value.outcome, 'uncertain'); assert.equal(value.can_generate, false);
  assert.equal(value.checks.technical, 'supported'); assert.equal(value.approval_token, undefined);
  assert.equal(audit.length, 1); assert.ok(!JSON.stringify(audit).includes('Krátké vlasy'));
  assert.equal((await handle(req('checkout', { method: 'POST' }))).status, 503);
});
test('missing fields, invalid photo, oversized requests, rate limit and database failure are handled', async () => {
  const { handle } = setup();
  let r = await handle(req('preflight', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }));
  assert.equal((await r.json()).outcome, 'clarify');
  const form = new FormData(); form.set('input', JSON.stringify(input)); form.set('photo', new Blob(['invalid'], { type: 'image/png' }), 'photo.png');
  r = await handle(req('preflight', { method: 'POST', body: form })); assert.equal((await r.json()).outcome, 'unsupported');
  assert.equal((await handle(req('preflight', { method: 'POST', headers: { 'content-length': '20000000' }, body: '{}' }))).status, 413);
  assert.equal((await setup({ budget: false }).handle(req('preflight', { method: 'POST', body: '{}' }))).status, 429);
  assert.equal((await setup({ connected: false }).handle(req('readiness'))).status, 503);
});
test('client routes directly to the shared Supabase API, without cookies or secret keys', async () => {
  let sent;
  await apiFetch('readiness', {}, async (url, options) => { sent = { url, options }; return Response.json({}); });
  assert.equal(sent.url, API_CONFIG.base + '/readiness');
  assert.equal(sent.options.credentials, 'omit'); assert.ok(sent.options.headers.apikey.startsWith('sb_publishable_'));
  assert.throws(() => apiFetch('../private'), /UNKNOWN_API_ROUTE/);
});
