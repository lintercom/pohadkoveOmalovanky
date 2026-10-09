import { PRODUCT, IMAGE_SETTINGS } from './product.mjs';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const statuses = ['awaiting_payment','payment_failed','queued','generating','ready','needs_action','refund_pending','refunded','expired'];
export function createAdminApi(backend) {
  return async function handle(request, route, reply) {
    try {
      const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
      const admin = await backend.verifyAdmin(token);
      if (!admin) return reply({ error: 'ADMIN_ACCESS_REQUIRED' }, 401);
      const url = new URL(request.url);
      if (request.method === 'GET') {
        if (route === 'session') return reply({ login_name: admin.login_name });
        if (route === 'overview') return reply(await backend.adminOverview());
        if (route === 'settings') return reply({ ...(await backend.adminSettings()), product: PRODUCT, image: IMAGE_SETTINGS, services: { database: true, payments: false, generation: false, delivery: false } });
        if (['orders','checks'].includes(route)) {
          const offset = Number(url.searchParams.get('offset') || 0), status = url.searchParams.get('status') || '', id = url.searchParams.get('id') || '';
          if (!Number.isInteger(offset) || offset < 0 || offset > 100000 || (id && !uuid.test(id)) || (status && !(route === 'orders' ? statuses : ['clear','clarify','unsupported','uncertain']).includes(status))) return reply({ error: 'INVALID_FILTER' }, 400);
          const rows = await backend.adminList(route, { offset, status, id });
          return reply({ rows: rows.slice(0,25), has_more: rows.length > 25 });
        }
      }
      if (request.method !== 'POST') return reply({ error: 'METHOD_NOT_ALLOWED' }, 405);
      if (Number(request.headers.get('content-length')) > 8192) return reply({ error: 'TOO_LARGE' }, 413);
      // Bound chunked bodies as well as Content-Length before JSON parsing.
      const reader = request.body?.getReader(); let size = 0; const chunks = [];
      if (!reader) return reply({ error: 'INVALID_INPUT' }, 400);
      for (;;) { const { value, done } = await reader.read(); if (done) break; size += value.length; if (size > 8192) { await reader.cancel(); return reply({ error: 'TOO_LARGE' }, 413); } chunks.push(value); }
      const bytes = new Uint8Array(size); let p = 0; for (const c of chunks) { bytes.set(c,p); p += c.length; }
      let body; try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { return reply({ error: 'INVALID_INPUT' }, 400); }
      if (!body || typeof body !== 'object' || Array.isArray(body)) return reply({ error: 'INVALID_INPUT' }, 400);
      if (route === 'settings') {
        const { minute_limit, day_limit } = body;
        if (!Number.isInteger(minute_limit) || minute_limit < 1 || minute_limit > 100 || !Number.isInteger(day_limit) || day_limit < 1 || day_limit > 3000) return reply({ error: 'INVALID_SETTINGS' }, 400);
        await backend.adminSaveSettings({ minute_limit, day_limit }); return reply({ saved: true });
      }
      if (!uuid.test(body.id)) return reply({ error: 'INVALID_ORDER_ID' }, 400);
      const order = await backend.adminOrder(body.id); if (!order) return reply({ error: 'ORDER_NOT_FOUND' }, 404);
      if (route === 'order') return reply(order);
      if (route === 'note') {
        if (typeof body.note !== 'string' || body.note.length > 2000) return reply({ error: 'INVALID_NOTE' }, 400);
        await backend.adminSaveNote(body.id, body.note, admin.user_id); return reply({ saved: true });
      }
      if (route === 'pdf') {
        if (order.status !== 'ready' || !order.pdf_key) return reply({ error: 'PDF_NOT_READY' }, 409);
        const response = reply({});
        response.headers.set('content-type','application/pdf'); response.headers.set('content-disposition','attachment; filename=pohadka.pdf');
        return new Response(await backend.getPrivate(order.pdf_key), { headers: response.headers });
      }
      return reply({ error: 'NOT_FOUND' }, 404);
    } catch { return reply({ error: 'ADMIN_SERVICE_UNAVAILABLE' }, 503); }
  };
}
