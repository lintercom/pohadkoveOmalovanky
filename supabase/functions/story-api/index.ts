import { createSupabaseBackend } from '../../../server/supabase-backend.mjs';
import { createEdgeApi } from '../../../server/edge-api.mjs';
const secretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
const publicKeys = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}');
const backend = createSupabaseBackend({ url: Deno.env.get('SUPABASE_URL'), secretKey: secretKeys.default || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') });
Deno.serve(createEdgeApi({ backend, publishableKey: publicKeys.default || 'sb_publishable_W2IVdkudVTNMVxh8bcO2mQ_fQhJVP-x' }));
