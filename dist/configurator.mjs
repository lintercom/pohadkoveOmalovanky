import { PRODUCT, validateInput } from './runtime/product.mjs';
import { getCompanion, recommendedCompanionIds } from './runtime/companions.mjs';
import { activeInput, buildStoryBrief } from './runtime/story-brief.mjs';

const $=s=>document.querySelector(s), form=$('#configurator'), dialog=$('#check-dialog');
let photo=null, photoURL=null, photoIssue='', checking=false, revision=0, controller=null, result=null, opener=null, paymentPending=false;
const selected=name=>form.querySelector(`input[name="${name}"]:checked`)?.value||'';
function currentInput(){
 const choice=selected('companion');
 const data=Object.fromEntries(['child_name','appearance_description','custom_companion','custom_theme','personal_wish','requested_scenes'].map(id=>[id,$('#'+id).value]));
 return activeInput({...data,child_age:$('#child_age').value?Number($('#child_age').value):null,theme:selected('theme'),companion_mode:choice.startsWith('catalog:')?'catalog':choice,companion_id:choice.startsWith('catalog:')?choice.slice(8):'',companion_name:''});
}
function summary(target){
 const input=currentInput(),c=getCompanion(input.companion_id);
 const values=[['Hlavní hrdina',input.child_name.trim()||'Doplňte jméno'],['Věk',input.child_age?input.child_age+' let':'Vyberte věk'],['Parťák',input.companion_mode==='none'?'Bez parťáka':input.companion_mode==='custom'?(input.custom_companion.trim()||'Doplňte vlastního parťáka'):c?c.name+' · '+c.kind:'Vyberte parťáka'],['Svět',input.theme==='Vlastní téma'?(input.custom_theme.trim()||'Doplňte vlastní svět'):input.theme||'Vyberte svět'],['Podoba',photo?'S fotografií':input.appearance_description.trim()||'Doplňte popis nebo fotografii']];
 if(input.personal_wish.trim())values.push(['Další přání',input.personal_wish.trim()]);
 if(input.requested_scenes.trim())values.push(['Scény',input.requested_scenes.trim()]);
 target.replaceChildren(...values.flatMap(([label,value])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;return [dt,dd];}));
}
function invalidate(){revision++;controller?.abort();controller=null;checking=false;result=null;$('#continue-payment').hidden=true;$('#copy-status').textContent='';$('#check-result').textContent='Zadání se změnilo. Je potřeba nová kontrola.';}
function update(){
 const world=selected('theme'),recommended=recommendedCompanionIds(world);
 $('#partak').hidden=!world;
 form.querySelectorAll('input[name="companion"]').forEach(control=>{
  const visible=!!world&&(!control.value.startsWith('catalog:')||recommended.includes(control.value.slice(8)));
  control.closest('.pick-option').hidden=!visible;control.disabled=!visible;
  if(!visible)control.checked=false;
 });
 $('#custom-companion-field').hidden=selected('companion')!=='custom';
 $('#custom-world-field').hidden=selected('theme')!=='Vlastní téma';
 $('#appearance-field').hidden=!!photo;summary($('#live-summary'));
}
function errorTarget(key){return {companion_mode:'companion-group',companion_id:'companion-group',theme:'theme-group',photo:'photo'}[key]||key;}
function clearErrors(){form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));form.querySelectorAll('.error').forEach(el=>el.textContent='');}
function displayErrors(errors){let first=null;for(const [key,message] of Object.entries(errors)){const target=$('#'+errorTarget(key));const error=$('#'+key+'-error')||$('#companion_mode-error');if(error)error.textContent=message;if(target){target.setAttribute('aria-invalid','true');first||=target;}}if(first){const control=first.matches('fieldset')?first.querySelector('input'):first;control?.focus();first.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}return first;}
function validate(){clearErrors();const checked=validateInput(currentInput(),photo),errors={...checked.errors};if(!selected('companion')){delete errors.custom_companion;errors.companion_mode='Vyberte parťáka nebo možnost Bez parťáka.';}if(photoIssue)errors.photo=photoIssue;displayErrors(errors);return !Object.keys(errors).length;}
function refreshPrompt(){const brief=buildStoryBrief(currentInput(),{photoPresent:!!photo});$('#prompt-preview').value=brief.prompt;$('#photo-copy-note').hidden=!photo;summary($('#check-summary'));return brief.prompt;}
function showResult(value){
 result=value;const title=document.createElement('strong'),message=document.createElement('p');
 title.textContent=value.label_cs||({clear:'Bez zjištěné překážky',clarify:'Potřebujeme upřesnění',unsupported:'Požadavek není podporovaný',uncertain:'Dostupnost nelze předem spolehlivě ověřit'}[value.outcome]||'Kontrolu se nepodařilo dokončit');message.textContent=value.message_cs;$('#check-result').replaceChildren(title,message);$('#check-result').dataset.outcome=value.outcome||'uncertain';
 if(value.suggested_alternative_cs){const p=document.createElement('p');p.textContent=value.suggested_alternative_cs;$('#check-result').append(p);}
 $('#retry-check').hidden=!['uncertain',undefined].includes(value.outcome);
 $('#continue-payment').hidden=value.outcome!=='clear';$('#continue-payment').disabled=value.checkout_available!==true||!value.approval_token;
 if(value.outcome==='clear'&&value.checkout_available!==true){const p=document.createElement('p');p.textContent='Platební brána zatím není připojená. Prompt si můžete zdarma zkopírovat.';$('#check-result').append(p);}
}
async function check(){
 if(checking)return;const version=revision,bodyInput=currentInput();refreshPrompt();checking=true;controller=new AbortController();const signal=controller.signal;const timeout=setTimeout(()=>controller?.abort(),15000);
 $('#check-result').textContent='Ověřujeme dostupnost serverové kontroly…';$('#check-result').setAttribute('aria-busy','true');$('#retry-check').hidden=true;$('#continue-payment').hidden=true;
 try{
  if(window.staticPreview){showResult({outcome:'uncertain',label_cs:'Serverová kontrola zatím není připojená',message_cs:'Formulář prošel pouze lokální validací. Přijetí zadání poskytovatelem není ověřené. Údaje ani fotografie se neodeslaly; úplný prompt si můžete zkopírovat pro ruční použití v ChatGPT.'});return;}
  const readiness=await fetch('/api/readiness',{signal,credentials:'same-origin',cache:'no-store'});if(!readiness.ok)throw Error('SERVER_ERROR');const available=await readiness.json();
  if(version!==revision)return;
  if(available.configured!==true){showResult({...available,outcome:'uncertain',label_cs:'Serverová kontrola zatím není připojená',message_cs:'Formulář prošel pouze lokální validací. Technická dostupnost ani přijetí poskytovatelem nejsou potvrzené. Údaje ani fotografie se neodeslaly. Prompt můžete zdarma zkopírovat a použít v ChatGPT.'});return;}
  $('#check-result').textContent='Kontrolujeme technickou podporu a přijatelnost konkrétního zadání…';const body=new FormData();body.set('input',JSON.stringify(bodyInput));if(photo)body.set('photo',photo,'reference.'+(photo.type==='image/png'?'png':'jpg'));
  const response=await fetch('/api/preflight',{method:'POST',body,signal,credentials:'same-origin'});if(!response.ok)throw Error('SERVER_ERROR');const value=await response.json();
  if(!['clear','clarify','unsupported','uncertain'].includes(value.outcome)||typeof value.message_cs!=='string'||(value.outcome==='clear'&&(!value.approval_token||value.can_generate!==true)))throw Error('INVALID_RESPONSE');
  if(version===revision)showResult(value);
 }catch(error){if(version===revision)showResult({outcome:'uncertain',label_cs:'Kontrolu se nepodařilo dokončit',message_cs:'Server neodpověděl spolehlivě. Zadání zůstalo zachované; můžete kontrolu zopakovat. Platba ani generování se nespustily.'});}
 finally{clearTimeout(timeout);if(version===revision){checking=false;controller=null;$('#check-result').removeAttribute('aria-busy');}}
}
form.addEventListener('input',event=>{if(event.target.type==='file')return;invalidate();update();const key=event.target.id;$('#'+key+'-error')?.replaceChildren();event.target.removeAttribute('aria-invalid');});
form.addEventListener('change',event=>{if(event.target.type!=='file'){invalidate();update();}});
$('#photo').addEventListener('change',async event=>{
 invalidate();const file=event.target.files[0];if(!file)return;const version=revision;photoIssue='';
 if(!['image/png','image/jpeg'].includes(file.type)||file.size>PRODUCT.maxPhotoBytes||!file.size)photoIssue='Vyberte JPEG nebo PNG do 10 MB.';
 if(!photoIssue){try{const bitmap=await createImageBitmap(file);bitmap.close();}catch{photoIssue='Fotografii nelze přečíst. Vyberte jiný JPEG nebo PNG.';}}
 if(version!==revision)return;
 if(photoIssue){$('#photo-error').textContent=photoIssue;event.target.setAttribute('aria-invalid','true');event.target.value='';return;}
 if(photoURL)URL.revokeObjectURL(photoURL);photo=file;photoURL=URL.createObjectURL(file);$('#photo-preview').src=photoURL;$('#photo-selection').hidden=false;$('#photo-error').textContent='';event.target.removeAttribute('aria-invalid');update();
});
$('#remove-photo').addEventListener('click',()=>{invalidate();if(photoURL)URL.revokeObjectURL(photoURL);photo=null;photoURL=null;photoIssue='';$('#photo').value='';$('#photo-preview').removeAttribute('src');$('#photo-selection').hidden=true;$('#photo-error').textContent='';update();$('#photo').focus();});
form.addEventListener('submit',event=>{event.preventDefault();if(!validate())return;opener=$('#check-submit');refreshPrompt();dialog.showModal();$('#close-check').focus();window.productEvent?.('form_complete');check();});
$('#close-check').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{controller?.abort();revision++;checking=false;controller=null;$('#check-result').removeAttribute('aria-busy');opener?.focus();});
$('#retry-check').addEventListener('click',()=>{if(validate())check();});
$('#edit-input').addEventListener('click',()=>{const key=Object.keys(result?.field_errors||{})[0]||(['AMBIGUOUS_REQUEST','PROVIDER_POLICY','RIGHTS_UNRESOLVED'].some(r=>result?.reason_codes?.includes(r))?'companion_mode':'child_name');const target=$('#'+errorTarget(key));opener=(target?.matches('fieldset')?target.querySelector('input'):target)||$('#check-submit');dialog.close();opener.focus();target?.scrollIntoView({block:'center'});if(result?.field_errors)displayErrors(result.field_errors);});
$('#select-prompt').addEventListener('click',()=>{$('#prompt-details').open=true;const text=$('#prompt-preview');text.focus();text.select();text.setSelectionRange(0,text.value.length);});
$('#copy-prompt').addEventListener('click',async()=>{const prompt=refreshPrompt();try{if(!navigator.clipboard?.writeText)throw Error('NO_CLIPBOARD');await navigator.clipboard.writeText(prompt);$('#copy-status').textContent='Prompt zkopírován';}catch{$('#prompt-details').open=true;$('#select-prompt').click();$('#copy-status').textContent='Schránka není dostupná. Text je označený; zkopírujte jej pomocí Ctrl+C nebo nabídky Kopírovat.';}});
$('#continue-payment').addEventListener('click',async()=>{if(paymentPending||checking||result?.outcome!=='clear'||result.checkout_available!==true)return;paymentPending=true;$('#continue-payment').disabled=true;try{const response=await fetch('/api/checkout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({input:currentInput(),approval_token:result.approval_token})});const checkout=await response.json();const url=new URL(checkout.url);if(!response.ok||url.protocol!=='https:')throw Error('CHECKOUT_UNAVAILABLE');location.assign(url.href);}catch{$('#copy-status').textContent='Platbu nelze otevřít. Zadání zůstalo zachované a nic se nezaplatilo.';}finally{paymentPending=false;$('#continue-payment').disabled=false;}});
window.addEventListener('pagehide',()=>{controller?.abort();if(photoURL)URL.revokeObjectURL(photoURL);});
update();window.productEvent?.('form_start');
