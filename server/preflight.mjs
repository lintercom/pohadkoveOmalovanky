import { PRODUCT, IMAGE_SETTINGS, validateInput } from './product.mjs';

export const unavailable = () => ({ status: 'needs_review', can_generate: false, reason_codes: ['MISSING_CONFIGURATION'], message_cs: 'Tvorba pohádek a platební služba zatím nejsou připojené. Zadání nyní nelze schválit. Platba ani generování se nespustily.', suggested_alternative_cs: null });
const result = (status, code, message, extra = {}) => ({ status, can_generate: status === 'approved', reason_codes: code ? [code] : [], message_cs: message, suggested_alternative_cs: null, ...extra });
export async function fingerprint(input, photo, provider) {
  const photoDigest = photo ? [...new Uint8Array(await crypto.subtle.digest('SHA-256', await photo.arrayBuffer()))].map(n=>n.toString(16).padStart(2,'0')).join('') : null;
  const text = JSON.stringify({ input, photoDigest, provider, rulesVersion: PRODUCT.rulesVersion, image: IMAGE_SETTINGS });
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))].map(n=>n.toString(16).padStart(2,'0')).join('');
}
async function validPhotoSignature(photo) {
  if (!photo) return true;
  const bytes = new Uint8Array(await photo.slice(0,8).arrayBuffer());
  return photo.type === 'image/png' ? [137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v) : bytes[0]===255 && bytes[1]===216 && bytes[2]===255;
}

// Adapters are server-owned functions, never configuration supplied in customer JSON.
// No production adapters are configured yet, so the live site cannot approve an order.
export async function preflight(raw, photo = null, services = {}) {
  const checked = validateInput(raw, photo);
  if (!checked.valid) return result('blocked','INVALID_INPUT','Opravte označené údaje. Platba ani generování se nespustily.',{field_errors:checked.errors});
  if (!await validPhotoSignature(photo)) return result('blocked','INVALID_INPUT','Fotografie nemá platný formát JPEG nebo PNG.',{field_errors:{photo:'Soubor není platný JPEG ani PNG.'}});
  if (!services.provider || !Number.isFinite(services.orderBudget) || services.orderBudget <= 0 || ['checkProvider','moderate','findRejection','saveApproval','loadApproval'].some(key=>typeof services[key]!=='function')) return unavailable();
  try {
    const key = await fingerprint(checked.input,photo,services.provider);
    const rejection = await services.findRejection({ fingerprint:key, provider:services.provider, model:IMAGE_SETTINGS.model, rulesVersion:PRODUCT.rulesVersion });
    if (rejection?.repeated === true && rejection.fingerprint === key && rejection.provider === services.provider && rejection.model === IMAGE_SETTINGS.model) return result('blocked','KNOWN_GENERATOR_REJECTION',rejection.message_cs || 'Toto konkrétní zadání generátor opakovaně odmítl. Přesný důvod odmítnutí neznáme. Můžete upravit zadání.');
    const provider = await services.checkProvider(IMAGE_SETTINGS);
    if (provider?.available !== true || provider?.supportsExactSettings !== true) return result('needs_review','PROVIDER_UNAVAILABLE','Dostupnost generátoru pro tento sešit se nepodařilo ověřit. Zkuste to později.');
    if (!Number.isFinite(provider.estimatedTotalCost) || provider.estimatedTotalCost < 0 || provider.estimatedTotalCost > services.orderBudget) return result('needs_review','CHECK_INCONCLUSIVE','Náklady na celý sešit se nepodařilo ověřit v nastaveném limitu. Platba ani generování se nespustily.');
    const moderation = await services.moderate({input:checked.input,photo});
    if (moderation?.status === 'blocked') return result('blocked','UNSUPPORTED_CONTENT',moderation.message_cs || 'Toto konkrétní zadání neprošlo kontrolou obsahu. Upravte jej prosím.',{suggested_alternative_cs:moderation.suggested_alternative_cs || null});
    if (moderation?.status !== 'approved') return result('needs_review','CHECK_INCONCLUSIVE','Kontrolu zadání se nepodařilo dokončit. Platba ani generování se nespustily.');
    const approval = Object.freeze({ token:crypto.randomUUID(), fingerprint:key, input:checked.input, rulesVersion:PRODUCT.rulesVersion, provider:services.provider, model:IMAGE_SETTINGS.model, expiresAt:Date.now()+15*60*1000 });
    await services.saveApproval(approval);
    return result('approved',null,'Zadání prošlo vstupní kontrolou.',{approval_token:approval.token});
  } catch { return result('needs_review','CHECK_INCONCLUSIVE','Kontrolu zadání se nepodařilo dokončit. Platba ani generování se nespustily.'); }
}

export async function requireApproval(token, raw, photo, services) {
  const checked = validateInput(raw,photo);
  if (!checked.valid || !token || typeof services?.loadApproval !== 'function') throw new Error('PREFLIGHT_NOT_APPROVED');
  const approved = await services.loadApproval(token);
  if (!approved || approved.token !== token || !Number.isFinite(approved.expiresAt) || approved.expiresAt <= Date.now() || approved.rulesVersion !== PRODUCT.rulesVersion || approved.provider !== services.provider || approved.model !== IMAGE_SETTINGS.model || approved.fingerprint !== await fingerprint(checked.input,photo,services.provider)) throw new Error('PREFLIGHT_NOT_APPROVED');
  return approved;
}
