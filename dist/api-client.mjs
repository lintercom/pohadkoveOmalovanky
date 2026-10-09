// This is a PUBLIC key. It grants no access to private tables or storage.
export const API_CONFIG = Object.freeze({
  base: 'https://dboxrlvmgxfuzllhrcwe.supabase.co/functions/v1/story-api',
  publishableKey: 'sb_publishable_W2IVdkudVTNMVxh8bcO2mQ_fQhJVP-x'
});
export function apiFetch(path, options = {}, fetchImpl = fetch) {
  if (!['readiness', 'preflight', 'checkout'].includes(path)) throw Error('UNKNOWN_API_ROUTE');
  return fetchImpl(`${API_CONFIG.base}/${path}`, {
    ...options, credentials: 'omit', redirect: 'error', cache: 'no-store',
    headers: { ...options.headers, apikey: API_CONFIG.publishableKey }
  });
}
