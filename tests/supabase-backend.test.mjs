import test from 'node:test';
import assert from 'node:assert/strict';
import { createSupabaseBackend } from '../server/supabase-backend.mjs';
const url = 'https://dboxrlvmgxfuzllhrcwe.supabase.co';
const token = 'ba58967e-8f52-4fad-b6a9-958a91d70001';
const options = { url, secretKey: 'sb_secret_fixture', clock: () => 1000 };
test('Supabase adapter rejects browser keys and non-Supabase endpoints', () => {
  assert.throws(() => createSupabaseBackend({ ...options, secretKey: 'sb_publishable_fixture' }), /SERVER_KEY_REQUIRED/);
  assert.throws(() => createSupabaseBackend({ ...options, url: 'https://example.com' }), /INVALID_SUPABASE_URL/);
});
test('audit whitelist never stores accidental child data; errors hide response bodies', async () => {
  let payload;
  const backend = createSupabaseBackend({ ...options, fetchImpl: async (_, init) => {
    payload = JSON.parse(init.body); assert.equal(init.redirect, 'error');
    assert.equal(init.headers.apikey, options.secretKey);
    return new Response('private diagnostic child name', { status: 403 });
  }});
  await assert.rejects(backend.recordCheck({ id: token, at: new Date().toISOString(), outcome: 'uncertain', provider: 'none', rulesVersion: 'v1', model: 'none', reasons: [], checks: {}, childName: 'private', photo: 'private' }), /^Error: SUPABASE_REQUEST_FAILED_403$/);
  assert.equal(payload.childName, undefined); assert.equal(payload.photo, undefined);
});
test('approval loads matching unexpired token and rejects malformed and expired tokens', async () => {
  let calls = 0;
  const backend = createSupabaseBackend({ ...options, fetchImpl: async () => {
    calls++; return Response.json([{ token, expires_at: new Date(2000).toISOString(), rules_version: 'v1' }]);
  }});
  assert.equal(await backend.loadApproval('bad&token=other'), null);
  assert.equal(calls, 0); assert.equal((await backend.loadApproval(token)).rulesVersion, 'v1');
  const expired = createSupabaseBackend({ ...options, fetchImpl: async () => Response.json([{ token, expires_at: new Date(500).toISOString() }]) });
  assert.equal(await expired.loadApproval(token), null);
});
test('private storage refuses unsafe paths and uploads without overwriting', async () => {
  let calls = 0;
  const backend = createSupabaseBackend({ ...options, fetchImpl: async (_, init) => {
    calls++; assert.equal(init.headers['x-upsert'], 'false'); return new Response(null, { status: 200 });
  }});
  await assert.rejects(backend.getPrivate('../secret'), /INVALID_STORAGE_KEY/);
  await assert.rejects(backend.putPrivate('story-images', 'order/reference.png', new Blob(['x'], { type: 'text/plain' })), /INVALID_PRIVATE_FILE/);
  assert.equal(calls, 0);
  assert.equal(await backend.putPrivate('story-images', 'order/reference.png', new Blob(['x'], { type: 'image/png' })), 'order/reference.png');
});
