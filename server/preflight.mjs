import { PRODUCT, IMAGE_SETTINGS, validateInput } from './product.mjs';
const labels={clear:'Bez zjištěné překážky',clarify:'Potřebujeme upřesnění',unsupported:'Požadavek není podporovaný',uncertain:'Dostupnost nelze předem spolehlivě ověřit'};
const result=(outcome,code,message,checks={},extra={})=>({outcome,label_cs:labels[outcome],status:outcome==='clear'?'approved':outcome==='unsupported'?'blocked':'needs_review',can_generate:outcome==='clear',reason_codes:code?[code]:[],message_cs:message,checks,suggested_alternative_cs:null,...extra});
export const unavailable=()=>result('uncertain','MISSING_CONFIGURATION','Tvorba a platby nejsou připojené. Zadání nyní nelze schválit. Platba ani generování se nespustily.',{technical:'unknown',provider:'unknown',rights:'unknown'});
const digest=async bytes=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
export async function fingerprint(input,provider){return digest(new TextEncoder().encode(JSON.stringify({input,provider,rulesVersion:PRODUCT.rulesVersion,image:IMAGE_SETTINGS})));}
export async function preflight(raw,services={}){
 const checked=validateInput(raw);let checks={technical:'unknown',provider:'unknown',rights:'unknown'};
 const finish=async r=>{
  // No names, free text, email or historical name blacklist in the audit.
  const audit={id:crypto.randomUUID(),at:new Date().toISOString(),outcome:r.outcome,reasons:r.reason_codes,provider:services.provider||'unconfigured',rulesVersion:PRODUCT.rulesVersion,model:IMAGE_SETTINGS.model,checks:r.checks};
  if(services.recordCheck)try{await services.recordCheck(audit);}catch{return result('uncertain','AUDIT_UNAVAILABLE','Kontrolu nelze bezpečně zaznamenat. Platba se nespustila.',checks);}
  return r;
 };
 if(!checked.valid)return finish(result('clarify','INVALID_INPUT','Opravte označené údaje.',{...checks,technical:'clarification_required'},{field_errors:checked.errors}));
 checks.technical='supported';
 if(!services.provider||!Number.isFinite(services.orderBudget)||services.orderBudget<=0||['checkProvider','moderate','saveApproval','loadApproval','recordCheck'].some(k=>typeof services[k]!=='function'))return finish({...unavailable(),checks});
 try{
  const provider=await services.checkProvider(IMAGE_SETTINGS);
  if(provider?.available!==true||provider.supportsExactSettings!==true)return finish(result('uncertain','PROVIDER_UNAVAILABLE','Podporu přesného nastavení nelze ověřit. Nejde o zákaz konkrétní postavy.',checks));
  if(!Number.isFinite(provider.estimatedTotalCost)||provider.estimatedTotalCost<0||provider.estimatedTotalCost>services.orderBudget)return finish(result('uncertain','BUDGET_UNVERIFIED','Náklad celého sešitu se nevejde do ověřeného limitu.',checks));
  // These adapters must use verified rules/non-generative provider checks. A paid
  // classifier requires a separate explicit budget and cost receipt; never test images.
  const [policy,rights]=await Promise.all([services.moderate({input:checked.input}),
   Promise.resolve().then(()=>services.assessRights?.({input:checked.input,purpose:'private-customer-commercial-service'})).catch(()=>({status:'unknown'}))]);
  checks.provider=policy?.status==='approved'?'no_obstacle':policy?.status==='blocked'?'unsupported':policy?.status==='clarify'?'clarification_required':'unknown';
  checks.rights=rights?.status==='cleared'?'cleared':rights?.status==='restricted'?'restricted':'unresolved';
  if(policy?.status==='blocked')return finish(result('unsupported','PROVIDER_POLICY',policy.message_cs||'Konkrétní obsah nesplňuje pravidla poskytovatele.',checks,{suggested_alternative_cs:'Můžete sami zvolit originálního parťáka z katalogu.'}));
  if(policy?.status==='clarify')return finish(result('clarify','AMBIGUOUS_REQUEST',policy.message_cs||'Upřesněte, koho a jakou scénu máte na mysli.',checks));
  if(policy?.status!=='approved')return finish(result('uncertain','POLICY_UNVERIFIED','Přijatelnost obsahu nelze předem spolehlivě ověřit.',checks));
  if(checks.rights==='restricted')return finish(result('clarify','RIGHTS_RESTRICTED',rights?.message_cs||'Je evidován konkrétní konflikt zamýšleného použití. Potřebujeme jej vyjasnit; nejde o technický zákaz postavy.',checks));
  const key=await fingerprint(checked.input,services.provider);
  const refusal=typeof services.findRejection==='function'?await services.findRejection({fingerprint:key,provider:services.provider,model:IMAGE_SETTINGS.model,rulesVersion:PRODUCT.rulesVersion}):null;
  if(refusal?.repeated===true&&refusal.fingerprint===key&&refusal.provider===services.provider&&refusal.model===IMAGE_SETTINGS.model&&refusal.rulesVersion===PRODUCT.rulesVersion)return finish(result('unsupported','KNOWN_GENERATOR_REJECTION','Toto přesné zadání poskytovatel opakovaně odmítl. Platba ani nový pokus se nespustily. Upravte zadání; odmítnutí není důkazem porušení práv.',checks));
  const approval={token:crypto.randomUUID(),fingerprint:key,input:checked.input,rulesVersion:PRODUCT.rulesVersion,provider:services.provider,model:IMAGE_SETTINGS.model,expiresAt:Date.now()+900000};
  // Audit must persist before an approval token is issued.
  const response=await finish(result('clear',null,'Kontrola nezjistila překážku. Přijetí všech budoucích obrázků nelze zaručit. Kontrola nepotvrzuje oprávnění ke komerčnímu použití.',checks));
  if(!response.can_generate)return response;
  await services.saveApproval(approval);return {...response,approval_token:approval.token};
 }catch{return finish(result('uncertain','CHECK_INCONCLUSIVE','Kontrolu se nepodařilo dokončit. Platba ani generování se nespustily.',checks));}
}
export async function requireApproval(token,raw,services){
 const c=validateInput(raw);if(!c.valid||!token||typeof services?.loadApproval!=='function')throw Error('PREFLIGHT_NOT_APPROVED');
 const a=await services.loadApproval(token);
 if(!a||a.token!==token||!Number.isFinite(a.expiresAt)||a.expiresAt<=Date.now()||a.rulesVersion!==PRODUCT.rulesVersion||a.provider!==services.provider||a.model!==IMAGE_SETTINGS.model||a.fingerprint!==await fingerprint(c.input,services.provider))throw Error('PREFLIGHT_NOT_APPROVED');return a;
}
