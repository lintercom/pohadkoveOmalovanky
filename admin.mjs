import { apiFetch, API_CONFIG } from './api-client.mjs';
import { COMPANION_CATALOG } from './runtime/companions.mjs';
import { STORY_PROMPT, IMAGE_PROMPT, PDF_DESIGN_PROMPT, IMAGE_REVIEW_PROMPT } from './runtime/prompts.mjs';
const $ = s => document.querySelector(s), authUrl = API_CONFIG.base.split('/functions/')[0] + '/auth/v1/';
const adminEmail = 'petrlavikweb@gmail.com';
let session = null, expiry = 0, activeTab = 'overview', currentOrder = null, orderOpener = null, revision = 0;
const paging = { orders: 0, checks: 0 };
const names = { awaiting_payment:'Čeká na platbu', payment_failed:'Neúspěšná platba', queued:'Ve frontě', generating:'Vzniká příběh', ready:'Hotovo', needs_action:'Vyžaduje řešení', refund_pending:'Čeká na vrácení', refunded:'Vráceno', expired:'Vypršelo', clear:'Bez překážky', clarify:'Potřebuje upřesnění', unsupported:'Nepodporované', uncertain:'Dostupnost neověřena', pending:'Probíhá', complete:'Dokončeno', failed:'Chyba', refused:'Odmítnuto' };
const date = s => s ? new Date(s).toLocaleString('cs-CZ') : '—';
const money = n => new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK'}).format(Number(n)||0);
function node(tag, text = '', cls = '') { const n = document.createElement(tag); n.textContent = text; if (cls) n.className = cls; return n; }
function showLogin(message = '') {
  revision++; session = null; expiry = 0; currentOrder = null; $('#admin-order-dialog').close();
  $('#admin-app').hidden = true; $('#admin-login').hidden = false; $('#admin-login-status').textContent = message;
  $('#admin-password').value = ''; $('#admin-note').value = ''; $('#admin-order-body').replaceChildren();
  for (const selector of ['#admin-stats','#orders-results','#checks-results','#admin-product']) $(selector).replaceChildren();
  $('#admin-username').focus();
}
async function auth(path, body, token = null) {
  const response = await fetch(authUrl + path, { method:'POST', headers:{apikey:API_CONFIG.publishableKey,'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:JSON.stringify(body),credentials:'omit',redirect:'error',signal:AbortSignal.timeout(15000) });
  if (!response.ok) throw Error('AUTH_FAILED'); return response.status === 204 ? null : response.json();
}
async function ensureSession() {
  if (!session) throw Error('SIGNED_OUT');
  if (Date.now() >= expiry - 60000) {
    const refreshed = await auth('token?grant_type=refresh_token',{refresh_token:session.refresh_token});
    session = refreshed; expiry = Date.now() + refreshed.expires_in * 1000;
  }
}
async function api(route, body = undefined) {
  await ensureSession();
  const response = await apiFetch('admin/' + route, {method:body===undefined?'GET':'POST',headers:{authorization:'Bearer '+session.access_token,...(body===undefined?{}:{'content-type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(15000)});
  if (response.status === 401 || response.status === 403) { showLogin('Přihlášení vypršelo nebo účet nemá oprávnění správce.'); throw Error('SIGNED_OUT'); }
  if (!response.ok) throw Error('ADMIN_FAILED'); return response;
}
const get = async (route,body) => (await api(route,body)).json();
function definition(parent, pairs) { const dl = node('dl','','admin-definition'); for (const [label,value] of pairs) dl.append(node('dt',label),node('dd',String(value??'—'))); parent.append(dl); }
function table(parent, headers, rows, render) {
  parent.replaceChildren(); if (!rows.length) { parent.append(node('p','Zatím tu nic není.','admin-empty')); return; }
  const wrap = node('div','','admin-table-wrap'), t = node('table','','admin-table'), head = node('thead'), tr = node('tr');
  for (const title of headers) tr.append(node('th',title)); head.append(tr); const body = node('tbody');
  for (const row of rows) { const line = node('tr'); render(line,row); body.append(line); } t.append(head,body); wrap.append(t); parent.append(wrap);
}
const cell = (tr, text) => { const td = node('td',String(text??'—')); tr.append(td); return td; };
async function overview(version) {
  const [data,settings] = await Promise.all([get('overview'),get('settings')]); if (version !== revision) return;
  $('#admin-stats').replaceChildren();
  for (const [value,label] of [[data.orders,'Objednávek'],[data.ready,'Hotových pohádek'],[data.needs_action,'Vyžaduje řešení'],[money(data.cost_czk),'Náklady na výrobu']]) { const n = node('div','','admin-stat'); n.append(node('b',String(value)),node('span',label)); $('#admin-stats').append(n); }
  const services = $('#admin-services'); services.replaceChildren();
  for (const label of ['Databáze připojená',`${data.checks} kontrol celkem`,`${data.today_checks} / ${settings.day_limit} kontrol dnes`,'Platby nepřipojené','AI výroba nepřipojená']) services.append(node('span',label));
}
async function list(kind, version) {
  const form = $('#'+kind+'-filter'), params = new URLSearchParams(new FormData(form)); params.set('offset',paging[kind]);
  const data = await get(kind+'?'+params); if (version !== revision) return;
  if (kind === 'orders') table($('#orders-results'),['Objednávka','Vytvořeno','Stav','Cena','Náklady'],data.rows,(tr,o)=>{
    const td = cell(tr,''); const b = node('button',o.id.slice(0,8)); b.type='button'; b.setAttribute('aria-label','Otevřít objednávku '+o.id); b.addEventListener('click',()=>openOrder(o.id,b)); td.append(b,node('small',o.id));
    cell(tr,date(o.created_at)); cell(tr,names[o.status]||o.status); cell(tr,money(o.amount/100)); cell(tr,money(o.cost_czk));
  });
  else table($('#checks-results'),['Čas','Výsledek','Technická kontrola','Poskytovatel','Důvod'],data.rows,(tr,c)=>{ cell(tr,date(c.created_at)); cell(tr,names[c.outcome]||c.outcome); cell(tr,c.checks?.technical==='supported'?'Podporované':c.checks?.technical==='clarification_required'?'Opravit údaje':c.checks?.technical==='unsupported'?'Nepodporované':'Neověřeno'); cell(tr,c.provider==='unconfigured'?'AI nepřipojená':c.provider); const td=cell(tr,(c.reasons||[]).join(', ')||'—'); td.append(node('small',c.rules_version)); });
  $('#'+kind+'-prev').disabled=paging[kind]===0; $('#'+kind+'-next').disabled=!data.has_more; $('#'+kind+'-page').textContent='Strana '+(paging[kind]/25+1);
}
function content() {
  $('#admin-prompt').textContent=[STORY_PROMPT,IMAGE_PROMPT,PDF_DESIGN_PROMPT,IMAGE_REVIEW_PROMPT].join('\n\n');
  $('#admin-catalog').replaceChildren();
  for (const c of COMPANION_CATALOG) { const a=node('article'); if (c.artwork) { const img=document.createElement('img'); img.src=c.artwork; img.alt=c.kind; a.append(img); } a.append(node('h3',c.name),node('p',c.kind)); $('#admin-catalog').append(a); }
}
async function settings(version) {
  const s=await get('settings'); if(version!==revision)return;
  $('#minute-limit').value=s.minute_limit; $('#day-limit').value=s.day_limit;
  $('#admin-product').replaceChildren();
  for(const [k,v] of [['Cena',money(s.product.priceCzk)],['Sešit',s.product.pages+' stran'],['Pravidla',s.product.rulesVersion],['Obrázkový model',s.image.model],['Databáze','Supabase · Frankfurt']]) $('#admin-product').append(node('dt',k),node('dd',v));
}
async function load() {
  const version=++revision; $('#admin-status').textContent='Načítáme…';
  try { if(activeTab==='overview')await overview(version); else if(['orders','checks'].includes(activeTab))await list(activeTab,version); else if(activeTab==='settings')await settings(version); else content(); if(version===revision)$('#admin-status').textContent=''; }
  catch { if(version===revision)$('#admin-status').textContent='Data se nepodařilo načíst. Zkuste přehled obnovit nebo se přihlaste znovu.'; }
}
async function openOrder(id,opener) {
  $('#admin-status').textContent='Načítáme objednávku…';
  try { const o=await get('order',{id}); currentOrder=o; orderOpener=opener; const body=$('#admin-order-body'); body.replaceChildren();
    definition(body,[['Objednávka',o.id],['Stav',names[o.status]||o.status],['Vytvořeno',date(o.created_at)],['Cena',money(o.amount/100)],['Náklady',money(o.cost_czk)],['Rozpočet',money(o.budget_czk)],['Důvod',o.reason||'—']]);
    const attempts=node('div'); table(attempts,['Krok','Stav','Model','Náklady'],o.attempts,(tr,a)=>{cell(tr,a.stage);cell(tr,names[a.status]||a.status);cell(tr,a.model);cell(tr,money(a.cost_czk));});body.append(attempts);
    $('#admin-note').value=o.note; $('#note-status').textContent=''; $('#admin-download-pdf').hidden=o.status!=='ready'||!o.pdf_key;
    $('#admin-order-dialog').showModal(); $('#admin-close-order').focus(); $('#admin-status').textContent='';
  } catch { $('#admin-status').textContent='Detail objednávky se nepodařilo načíst.'; }
}
$('#admin-login-form').addEventListener('submit',async e=>{e.preventDefault();const button=$('#admin-login-submit');button.disabled=true;$('#admin-login-status').textContent='Přihlašujeme…';
  try { if($('#admin-username').value.trim()!=='admin')throw Error('AUTH_FAILED');
    session=await auth('token?grant_type=password',{email:adminEmail,password:$('#admin-password').value}); expiry=Date.now()+session.expires_in*1000;
    await get('session'); $('#admin-password').value=''; $('#admin-login').hidden=true; $('#admin-app').hidden=false; $('#admin-login-status').textContent=''; activeTab='overview';for(const b of document.querySelectorAll('[data-admin-tab]'))b.dataset.adminTab===activeTab?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current');for(const p of document.querySelectorAll('[data-admin-panel]'))p.hidden=p.dataset.adminPanel!==activeTab;$('#admin-refresh').focus();await load();
  } catch { showLogin('Přihlášení se nezdařilo. Zkontrolujte jméno a heslo nebo dostupnost služby.'); } finally { button.disabled=false; }
});
$('#admin-logout').addEventListener('click',async()=>{try{if(session)await auth('logout?scope=global',{},session.access_token);showLogin('Jste odhlášeni.');}catch{$('#admin-status').textContent='Odhlášení na serveru se nezdařilo. Zkuste to znovu.';}});
for(const button of document.querySelectorAll('[data-admin-tab]'))button.addEventListener('click',()=>{activeTab=button.dataset.adminTab;for(const b of document.querySelectorAll('[data-admin-tab]')){if(b===button)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}for(const p of document.querySelectorAll('[data-admin-panel]'))p.hidden=p.dataset.adminPanel!==activeTab;load();});
$('#admin-refresh').addEventListener('click',load);
for(const kind of ['orders','checks']){ $('#'+kind+'-filter').addEventListener('submit',e=>{e.preventDefault();paging[kind]=0;load();});for(const [dir,delta] of [['prev',-25],['next',25]])$('#'+kind+'-'+dir).addEventListener('click',()=>{paging[kind]=Math.max(0,paging[kind]+delta);load();}); }
$('#admin-settings-form').addEventListener('submit',async e=>{e.preventDefault();const b=e.submitter;b.disabled=true;try{await get('settings',{minute_limit:Number($('#minute-limit').value),day_limit:Number($('#day-limit').value)});$('#settings-status').textContent='Limity uložené.';}catch{$('#settings-status').textContent='Uložení se nezdařilo. Zkontrolujte hodnoty.';}finally{b.disabled=false;}});
$('#admin-note-form').addEventListener('submit',async e=>{e.preventDefault();if(!currentOrder)return;const b=e.submitter;b.disabled=true;try{await get('note',{id:currentOrder.id,note:$('#admin-note').value});$('#note-status').textContent='Poznámka uložená.';}catch{$('#note-status').textContent='Poznámku se nepodařilo uložit.';}finally{b.disabled=false;}});
$('#admin-close-order').addEventListener('click',()=>$('#admin-order-dialog').close());$('#admin-order-dialog').addEventListener('close',()=>orderOpener?.focus());
$('#admin-download-pdf').addEventListener('click',async()=>{if(!currentOrder)return;try{const r=await api('pdf',{id:currentOrder.id}),url=URL.createObjectURL(await r.blob()),a=document.createElement('a');a.href=url;a.download='pohadka.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{$('#note-status').textContent='PDF se nepodařilo stáhnout.';}});
$('#admin-copy-prompt').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#admin-prompt').textContent);$('#admin-status').textContent='Instrukce zkopírovány.';}catch{$('#admin-status').textContent='Schránka není dostupná. Otevřete náhled a zkopírujte text ručně.';}});
$('#admin-password-form').addEventListener('submit',async e=>{e.preventDefault();if($('#admin-new-password').value!==$('#admin-confirm-password').value){$('#password-status').textContent='Nová hesla se neshodují.';return;}const b=e.submitter;b.disabled=true;
  try { await auth('token?grant_type=password',{email:adminEmail,password:$('#admin-current-password').value});await ensureSession();
    const r=await fetch(authUrl+'user',{method:'PUT',headers:{apikey:API_CONFIG.publishableKey,authorization:'Bearer '+session.access_token,'content-type':'application/json'},body:JSON.stringify({password:$('#admin-new-password').value,current_password:$('#admin-current-password').value}),credentials:'omit',redirect:'error',signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('PASSWORD_FAILED');e.target.reset();$('#password-status').textContent='Heslo změněné.';
  }catch{$('#password-status').textContent='Heslo se nepodařilo změnit. Ověřte současné heslo a požadavky Supabase.';}finally{b.disabled=false;}
});
window.addEventListener('pagehide',()=>{session=null;});

