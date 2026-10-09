import { preflight, unavailable } from './preflight.mjs';
import { PRODUCT } from './product.mjs';
const allowedOrigins = new Set(['http://127.0.0.1:4173', 'http://localhost:4173', 'https://lintercom.github.io', 'https://moje-pohadka-kouzelne-omalovanky.lifecore.chatgpt.site']);
export function createEdgeApi({ backend, publishableKey }) {
  if (!backend || !publishableKey) throw Error('EDGE_CONFIGURATION_REQUIRED');
  return async function handle(request) {
    const origin = request.headers.get('origin');
    const cors = origin && allowedOrigins.has(origin) ? { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'apikey,content-type', vary: 'Origin' } : {};
    const reply = (data, status = 200) => Response.json(data, { status, headers: { ...cors, 'cache-control': 'no-store', 'x-robots-tag': 'noindex', 'x-content-type-options': 'nosniff' } });
    if (origin && !allowedOrigins.has(origin)) return reply({ error: 'ORIGIN_NOT_ALLOWED' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    // Explicit public-key validation: never accepts a service key from the browser.
    // This key identifies the application, not a signed-in customer/admin.
    if (request.headers.get('apikey') !== publishableKey) return reply({ error: 'API_KEY_REQUIRED' }, 401);
    const route = new URL(request.url).pathname.split('/').at(-1);
    if (route === 'readiness' && request.method === 'GET') {
      try { await backend.verifyConnection(); return reply({ ...unavailable(), configured: true, database_connected: true, generation_available: false, checkout_available: false }); }
      catch { return reply({ ...unavailable(), configured: false, database_connected: false }, 503); }
    }
    if (route === 'checkout') return reply(unavailable(), 503);
    if (route !== 'preflight') return reply({ error: 'NOT_FOUND' }, 404);
    if (request.method !== 'POST') return reply({ error: 'METHOD_NOT_ALLOWED' }, 405);
    try {
      if (!await backend.consumeCheckBudget()) return reply({ error: 'RATE_LIMIT', message_cs: 'Kontrola dosáhla dočasného limitu. Zadání zůstává zachované.' }, 429);
      if (Number(request.headers.get('content-length')) > PRODUCT.maxPhotoBytes + 65536) return reply({ error: 'TOO_LARGE' }, 413);
      const reader = request.body?.getReader(); const chunks = []; let size = 0;
      if (!reader) return reply({ error: 'EMPTY_BODY' }, 400);
      while (true) { const { value, done } = await reader.read(); if (done) break;
        size += value.byteLength; if (size > PRODUCT.maxPhotoBytes + 65536) { await reader.cancel(); return reply({ error: 'TOO_LARGE' }, 413); } chunks.push(value);
      }
      const bytes = new Uint8Array(size); let offset = 0; for (const c of chunks) { bytes.set(c, offset); offset += c.length; }
      const contentType = request.headers.get('content-type') || '';
      const body = new Request(request.url, { method: 'POST', headers: { 'content-type': contentType }, body: bytes });
      let input, photo = null;
      if (contentType.startsWith('multipart/form-data')) {
        const form = await body.formData(); if (typeof form.get('input') !== 'string') return reply({ error: 'INVALID_INPUT' }, 400);
        input = JSON.parse(form.get('input')); const file = form.get('photo'); if (file && typeof file !== 'string' && file.size) photo = file;
      } else if (contentType.startsWith('application/json')) input = await body.json();
      else return reply({ error: 'CONTENT_TYPE_REQUIRED' }, 415);
      // Only the existing technical validation and anonymous audit are active.
      // No approval, persistence of customer input/photo, payment or AI calls.
      const value = await preflight(input, photo, { recordCheck: audit => backend.recordCheck(audit) });
      if (value.reason_codes?.includes('MISSING_CONFIGURATION')) {
        value.label_cs = 'Technická kontrola dokončena';
        value.message_cs = 'Zadání prošlo serverovou kontrolou formuláře. Přijatelnost poskytovatelem AI zatím není ověřená. Zadání ani fotografie se neuložily; můžete zkopírovat prompt. Platba ani generování se nespustily.';
      }
      return reply({ ...value, database_connected: true, checkout_available: false });
    } catch { return reply({ error: 'CHECK_FAILED' }, 503); }
  };
}
