import { PRODUCT, IMAGE_SETTINGS, validateInput } from './product.mjs';
const labels={clear:'Bez zjištěné překážky',clarify:'Potřebujeme upřesnění',unsupported:'Požadavek není podporovaný',uncertain:'Dostupnost nelze předem spolehlivě ověřit'};
const result=(outcome,code,message,checks={},extra={})=>({outcome,label_cs:labels[outcome],status:outcome==='clear'?'approved':outcome==='unsupported'?'blocked':'needs_review',can_generate:outcome==='clear',reason_codes:code?[code]:[],message_cs:message,checks,suggested_alternative_cs:null,...extra});
export const unavailable=()=>result('uncertain','MISSING_CONFIGURATION','Tvorba a platby nejsou připojené. Zadání nyní nelze schválit. Platba ani generování se nespustily.',{technical:'unknown',provider:'unknown',rights:'unknown'});
const digest=async bytes=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
export async function fingerprint(input,photo,provider){return digest(new TextEncoder().encode(JSON.stringify({input,photoDigest:photo?await digest(await photo.arrayBuffer()):null,provider,rulesVersion:PRODUCT.rulesVersion,image:IMAGE_SETTINGS})));}
async function validPhoto(photo){if(!photo)return true;const b=new Uint8Array(await photo.slice(0,8).arrayBuffer());return photo.type==='image/png'?[137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v):b[0]===255&&b[1]===216&&b[2]===255;}
export async function preflight(raw,photo=null,services={}){
 const checked=validateInput(raw,photo);let checks={technical:'unknown',provider:'unknown',rights:'unknown'};
 const finish=async r=>{
  // No names, photos, free text, email or historical name blacklist in the audit.
  const audit={id:crypto.randomUUID(),at:new Date().toISOString(),outcome:r.outcome,reasons:r.reason_codes,provider:services.provider||'unconfigured',rulesVersion:PRODUCT.rulesVersion,model:IMAGE_SETTINGS.model,checks:r.checks};
  if(services.recordCheck)try{await services.recordCheck(audit);}catch{return result('uncertain','AUDIT_UNAVAILABLE','Kontrolu nelze bezpečně zaznamenat. Platba se nespustila.',checks);}
  return r;
 };
 if(!checked.valid)return finish(result('clarify','INVALID_INPUT','Opravte označené údaje.',{...checks,technical:'clarification_required'},{field_errors:checked.errors}));
 if(!await validPhoto(photo))return finish(result('unsupported','INVALID_PHOTO','Soubor nemá podporovaný formát JPEG nebo PNG.',{...checks,technical:'unsupported'}));
 checks.technical='supported';
 if(!services.provider||!Number.isFinite(services.orderBudget)||services.orderBudget<=0||['checkProvider','moderate','assessRights','saveApproval','loadApproval','recordCheck'].some(k=>typeof services[k]!=='function'))return finish({...unavailable(),checks});
 try{
  const provider=await services.checkProvider(IMAGE_SETTINGS);
  if(provider?.available!==true||provider.supportsExactSettings!==true)return finish(result('uncertain','PROVIDER_UNAVAILABLE','Podporu přesného nastavení nelze ověřit. Nejde o zákaz konkrétní postavy.',checks));
  if(!Number.isFinite(provider.estimatedTotalCost)||provider.estimatedTotalCost<0||provider.estimatedTotalCost>services.orderBudget)return finish(result('uncertain','BUDGET_UNVERIFIED','Náklad celého sešitu se nevejde do ověřeného limitu.',checks));
  // These adapters must use verified rules/non-generative provider checks. A paid
  // classifier requires a separate explicit budget and cost receipt; never test images.
  const [policy,rights]=await Promise.all([services.moderate({input:checked.input,photo}),services.assessRights({input:checked.input,purpose:'private-customer-commercial-service'})]);
  checks.provider=policy?.status==='approved'?'no_obstacle':policy?.status==='blocked'?'unsupported':policy?.status==='clarify'?'clarification_required':'unknown';
  checks.rights=rights?.status==='cleared'?'cleared':rights?.status==='restricted'?'restricted':'unresolved';
  if(policy?.status==='blocked')return finish(result('unsupported','PROVIDER_POLICY',policy.message_cs||'Konkrétní obsah nesplňuje pravidla poskytovatele.',checks,{suggested_alternative_cs:'Můžete sami zvolit originálního parťáka z katalogu.'}));
  if(policy?.status==='clarify')return finish(result('clarify','AMBIGUOUS_REQUEST',policy.message_cs||'Upřesněte, koho a jakou scénu máte na mysli.',checks));
  if(policy?.status!=='approved')return finish(result('uncertain','POLICY_UNVERIFIED','Přijatelnost obsahu nelze předem spolehlivě ověřit.',checks));
  if(checks.rights!=='cleared')return finish(result('clarify','RIGHTS_UNRESOLVED',rights?.message_cs||'Potřebujeme upřesnit oprávnění pro zamýšlené použití. Nejde o technický zákaz postavy.',checks));
  const key=await fingerprint(checked.input,photo,services.provider);
  const approval={token:crypto.randomUUID(),fingerprint:key,input:checked.input,rulesVersion:PRODUCT.rulesVersion,provider:services.provider,model:IMAGE_SETTINGS.model,expiresAt:Date.now()+900000};
  // Audit must persist before an approval token is issued.
  const response=await finish(result('clear',null,'Kontrola nezjistila překážku. Přijetí všech budoucích obrázků nelze zaručit.',checks));
  if(!response.can_generate)return response;
  await services.saveApproval(approval);return {...response,approval_token:approval.token};
 }catch{return finish(result('uncertain','CHECK_INCONCLUSIVE','Kontrolu se nepodařilo dokončit. Platba ani generování se nespustily.',checks));}
}
export async function requireApproval(token,raw,photo,services){
 const c=validateInput(raw,photo);if(!c.valid||!token||typeof services?.loadApproval!=='function')throw Error('PREFLIGHT_NOT_APPROVED');
 const a=await services.loadApproval(token);
 if(!a||a.token!==token||!Number.isFinite(a.expiresAt)||a.expiresAt<=Date.now()||a.rulesVersion!==PRODUCT.rulesVersion||a.provider!==services.provider||a.model!==IMAGE_SETTINGS.model||a.fingerprint!==await fingerprint(c.input,photo,services.provider))throw Error('PREFLIGHT_NOT_APPROVED');return a;
}
