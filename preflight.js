'use strict';
let checkController = null;
function invalidateCheck() {
  state.requestId++;
  state.check = null;
  state.checking = false;
  checkController?.abort();
  checkController = null;
  if (state.step === 3) renderCheckStatus();
}
function customerInput() {
  return { child_name:state.name, child_age:state.age, theme:state.theme, custom_theme:state.custom,
    companion_type:state.companion, custom_companion:state.customCompanion, companion_name:state.companionName,
    appearance_description:state.appearance, personal_wish:state.wish, requested_scenes:state.requestedScenes, companion_mode:state.companionMode, companion_id:state.companionId };
}
function renderCheckStatus() {
  const node = $('#preflight-status');
  if (!node) return;
  const result = state.check;
  node.dataset.status = state.checking ? 'checking' : result?.status || 'idle';
  if (state.checking) node.innerHTML = '<strong>Kontrolujeme zadání.</strong><p>Platba ani tvorba pohádky se zatím nespouští.</p>';
  else if (!result) node.innerHTML = '<p>Zadání zatím není zkontrolované. Před platbou je potřeba schválení serveru.</p>';
  else {
    const titles = {approved:'Zadání prošlo vstupní kontrolou.',blocked:'Zadání je potřeba upravit.',needs_review:'Kontrolu nelze dokončit.'};
    node.innerHTML = `<strong>${esc(result.label_cs || titles[result.status])}</strong><p>${esc(result.message_cs)}</p>${result.suggested_alternative_cs?`<p>Možná alternativa: ${esc(result.suggested_alternative_cs)}. Pokud ji chcete, upravte sami zadání.</p>`:''}${result.field_errors?`<ul>${Object.values(result.field_errors).map(e=>`<li>${esc(e)}</li>`).join('')}</ul>`:''}`;
  }
  if(result?.checks){const names={technical:'Technická podpora',provider:'Pravidla poskytovatele',rights:'Oprávnění k použití'},values={unknown:'neověřeno',supported:'podporováno',no_obstacle:'bez zjištěné překážky',cleared:'ověřeno',unresolved:'potřebuje upřesnění',restricted:'omezení',unsupported:'nepodporováno',clarification_required:'potřebuje upřesnění'};node.innerHTML+=`<details><summary>Podrobnosti kontroly</summary><div class="check-dimensions">${Object.entries(names).map(([key,label])=>`<div>${label}: ${esc(values[result.checks[key]]||'neověřeno')}</div>`).join('')}</div></details>`;}
  $('#next').disabled = state.checking || result?.status === 'approved';
  $('#next').textContent = state.checking ? 'Probíhá kontrola…' : result?.status === 'approved' ? 'Platby zatím nejsou dostupné' : result ? 'Zkusit kontrolu znovu' : 'Zkontrolovat zadání';
  $('#creator').setAttribute('aria-busy',String(state.checking));
}
async function checkOrder() {
  if (state.checking) return;
  if(window.staticPreview){state.check={status:"needs_review",outcome:"uncertain",can_generate:false,label_cs:"Tvorbu zatím připravujeme",message_cs:"Tento web umožňuje prohlédnout ukázku a sestavit zadání. Serverová kontrola, platby a tvorba vlastního PDF zatím nejsou připojené. Vaše údaje ani fotografie se neodeslaly."};renderCheckStatus();return;}
  const requestId = ++state.requestId;
  const body = new FormData();
  body.set('input',JSON.stringify(customerInput()));
  if (state.photo) body.set('photo',state.photo,state.photo.name);
  checkController = new AbortController();
  state.checking = true;
  state.check = null;
  renderCheckStatus();
  try {
    const response = await fetch('/api/preflight',{method:'POST',body,signal:checkController.signal,credentials:'same-origin'});
    const result = await response.json();
    if (!['approved','blocked','needs_review'].includes(result.status) || typeof result.message_cs !== 'string' || result.can_generate !== (result.status === 'approved') || (result.status === 'approved' && typeof result.approval_token !== 'string')) throw new Error('INVALID_RESPONSE');
    if (requestId !== state.requestId) return;
    state.check = result;
  } catch (error) {
    if (error.name === 'AbortError' || requestId !== state.requestId) return;
    state.check = {status:'needs_review',can_generate:false,reason_codes:['CHECK_INCONCLUSIVE'],message_cs:'Kontrolu se nepodařilo dokončit. Platba ani generování se nespustily. Zkuste to později.'};
  } finally {
    if (requestId === state.requestId) { state.checking = false;checkController=null;renderCheckStatus(); }
  }
}
document.addEventListener('input',event=>{if(event.target.closest('#story-form'))invalidateCheck();});
document.addEventListener('change',event=>{if(event.target.closest('#story-form'))invalidateCheck();});
