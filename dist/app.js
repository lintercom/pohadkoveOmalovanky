'use strict';
const themes = [
  { name: 'Kouzelný les', text: 'Tam, kde i stromy vyprávějí.' },
  { name: 'Zvířecí kamarádi', text: 'Malé tlapky, velká přátelství.' },
  { name: 'Zatoulaný obláček', text: 'Za dobrodružstvím až do nebe.' },
  { name: 'Podmořský svět', text: 'Tajemství pod modrou hladinou.' },
  { name: 'Vesmír', text: 'Ke hvězdám a ještě kousek dál.' },
  { name: 'Dinosauři', text: 'Po stopách velikých kamarádů.' }
];
const faqs = [
  ['Co všechno dostanu za 80 Kč?', 'Jeden digitální sešit: originální český příběh s vaším dítětem v hlavní roli a šest navazujících omalovánek. Vše v jednom PDF na A4 na šířku pro domácí tisk. Platí se jednorázově, bez předplatného.'],
  ['Mohu zadat vlastní nebo známou postavu?', 'Ano. U kamaráda zvolte Vlastní zadání a napište postavu či veřejně známou osobnost. Samotné známé jméno není důvodem blokace. Případné konkrétní omezení vám kontrola vysvětlí; alternativu za vás automaticky nevybere.'],
  ['Co se kontroluje před platbou?', 'Úplnost zadání, fotografie, dostupnost generátoru a možnost vytvořit celý sešit. Při chybě nebo nedokončené kontrole se platba ani výroba nespustí. Výsledné obrázky mohou i po kontrole narazit na odmítnutí či technickou chybu.'],
  ['Proč je část textu barevná?', 'Každá stránka v příběhu pojmenuje barvu velkého předmětu. Zvýrazněná fráze pomůže propojit vyprávění s obrázkem. Samotná omalovánka zůstává černobílá.'],
  ['Musím nahrát fotografii dítěte?', 'Nemusíte. Stačí stručně popsat vlasy, účes a případně brýle. Fotografie je pouze inspirací pro kreslenou postavu, nikoli podkladem pro přesnou fotografickou kopii.'],
  ['Zvládne omalovánky i čtyřleté dítě?', 'Ano. Pro děti ve věku 3–4 let počítáme s velkými plochami a jednoduchými výraznými obrysy. Starší děti dostanou o něco bohatší obrázky a delší text. Ukázku pro čtyřleté děti si můžete zdarma stáhnout.'],
  ['Přijde mi domů tištěná knížka?', 'Dostanete digitální PDF, které si vytisknete doma na A4 na šířku. Jedna strana PDF patří na jeden list. Tištěnou knihu ani fyzické doručení produkt neobsahuje.'],
  ['Jak dlouho příprava pohádky trvá?', 'Příprava zabere několik minut. Přesný čas závisí na tvorbě obrázků; konkrétní dobu bude možné upřesnit po ověření ostrého provozu. V tomto designovém náhledu se personalizované pohádky zatím nevyrábějí.'],
  ['Mohu změnit zadání pohádky?', 'Před potvrzením platby se můžete vracet a údaje upravovat. Po zahájení výroby už změny nejsou součástí objednávky. Nové zadání znamená nový sešit za 80 Kč.'],
  ['Co když se pohádku nepodaří vytvořit?', 'V ostrém provozu má být u objednávky vidět skutečný stav tvorby. Při definitivním nedoručení se vrátí platba. Platební brána a výroba zatím nejsou v tomto náhledu připojeny.'],
  ['Co se stane s nahranou fotografií?', 'Při vyplňování zůstává fotografie v prohlížeči. Po kliknutí na kontrolu zadání ji odešleme serveru pro ověření. V této verzi ji neukládáme ani neposíláme generativní AI. Z formuláře ji odstraníte tlačítkem nebo obnovením stránky.']
];
const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
$('#theme-grid').innerHTML = themes.map((t,i) => `<button class="theme-card" data-create="${t.name}"><span class="theme-number" aria-hidden="true">0${i+1}</span><span class="theme-description"><span class="theme-title">${t.name}</span><span class="theme-text">${t.text}</span></span><span class="theme-select">Vybrat</span></button>`).join('');
$('#faq-list').innerHTML = faqs.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('');
const state = { step:0, name:'', age:4, appearance:'', theme:'Zvířecí kamarádi', custom:'', companion:'Překvapení', companionName:'', customCompanion:'', check:null, checking:false, requestId:0, wish:'', email:'', photo:null, photoURL:null };
let lastOpener = null;
function openDialog(id, opener){lastOpener=opener || document.activeElement;$(id).showModal();}
document.querySelectorAll('dialog').forEach(dialog=>{
  dialog.addEventListener('close',()=>lastOpener?.focus());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
});
function startStory(theme){
  if(theme && ![...themes.map(t=>t.name),'Vlastní téma'].includes(theme))throw new Error('Neznámé téma');
  invalidateCheck();if(theme)state.theme=theme;state.step=0;renderForm();openDialog('#creator');
}
document.addEventListener('click',e=>{
  const create=e.target.closest('[data-create]'); if(create)startStory(create.dataset.create);
  const close=e.target.closest('[data-close]'); if(close)document.getElementById(close.dataset.close).close();
  const edit=e.target.closest('[data-edit]'); if(edit){saveFields();state.step=Number(edit.dataset.edit);renderForm();}
  const info=e.target.closest('[data-info]'); if(info)showInfo(info.dataset.info);
});
$('#sample-open').addEventListener('click',()=>{
  const page=$('#sample-open').cloneNode(true);page.removeAttribute('id');page.removeAttribute('aria-label');
  const article=document.createElement('article');article.className='sample-sheet';article.innerHTML=page.innerHTML;
  $('#preview-content').replaceChildren(article);openDialog('#preview');
});
function showInfo(type){
  const info={
    purchase:['O nákupu','Připravovaný produkt obsahuje šest stran českého příběhu s omalovánkami v PDF za 80 Kč. Součástí není tisk ani doručení fyzické knihy.','Tento web je designový náhled. Objednávku ani platbu zde zatím nelze odeslat. Před spuštěním bude doplněn provozovatel, úplné nákupní podmínky a skutečný proces doručení a reklamací.'],
    privacy:['Vaše soukromí','Vyplněné údaje a fotografie zůstávají při vyplňování v paměti prohlížeče. Kliknutím na kontrolu se zadání a případná fotografie odešlou našemu serveru. Kontrola je v této verzi neukládá ani nepředává generativní AI. Po obnovení stránky se formulář vymaže.','Nepoužíváme analytické ani reklamní cookies. Písma se načítají ze služby Google Fonts. Před spuštěním skutečné výroby budou zveřejněny informace o správci údajů, zpracovatelích a lhůtách uchování.'],
    contact:['Kontakt','Kontaktní údaje a identifikace skutečného provozovatele budou doplněny před zahájením prodeje.','V tomto náhledu neprobíhají platby ani doručování objednávek.']
  }[type];
  $('#info-title').textContent=info[0];$('#info-content').innerHTML=info.slice(1).map(p=>`<p>${p}</p>`).join('');openDialog('#info');
}
function field(id,label,value,max,placeholder='',type='text'){return `<div class="field"><label for="${id}">${label}</label><input id="${id}" name="${id}" type="${type}" value="${esc(value)}" maxlength="${max}" placeholder="${placeholder}" ${id==='name'?'autocomplete="given-name"':id==='email'?'autocomplete="email"':'autocomplete="off"'} aria-describedby="${id}-error"><p class="error" id="${id}-error" aria-live="polite"></p></div>`;}
function saveFields(){['name','appearance','custom','companion','companionName','customCompanion','wish','email'].forEach(k=>{const el=document.getElementById(k);if(el)state[k]=el.value;});const age=$('input[name="age"]:checked');if(age)state.age=Number(age.value);const theme=$('input[name="theme"]:checked');if(theme)state.theme=theme.value;}
function renderForm(){
  $('#creator-title').textContent=['Kdo bude hlavním hrdinou?','Vyberte příběhu prostředí.','Zkontrolujeme zadání před platbou.'][state.step];
  document.querySelectorAll('[data-step]').forEach(el=>{const active=Number(el.dataset.step)===state.step;el.classList.toggle('active',active);if(active)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  $('#back').hidden=state.step===0;$('#next').textContent=state.step===2?'Zkontrolovat zadání':'Pokračovat';$('#next').disabled=state.checking;
  if(state.step===0){
    $('#form-content').innerHTML=field('name','Jak se jmenuje hlavní hrdina?',state.name,30,'Například Eliška')+`<div class="field"><span class="field-label" id="age-label">Kolik je dítěti let?</span><div class="ages" role="radiogroup" aria-labelledby="age-label">${[3,4,5,6,7,8,9].map(a=>`<label class="age-option"><input type="radio" name="age" value="${a}" ${state.age===a?'checked':''}><span>${a} ${a<5?'roky':'let'}</span></label>`).join('')}</div><small>Podle věku přizpůsobíme text a obtížnost omalovánek.</small></div><div class="photo-area">${state.photoURL?`<img class="photo-preview" src="${state.photoURL}" alt="Vybraná fotografie dítěte"><button type="button" class="inline-button" id="remove-photo">Odstranit fotografii</button>`:'<label for="photo">＋ Přidat fotografii <span>&nbsp;· nepovinné</span></label>'}<input id="photo" type="file" accept="image/jpeg,image/png"><p>JPG nebo PNG, nejvýše 10 MB. Obličej bez zakrytí a dalších osob.<br>Při kontrole zadání ji odešleme serveru; v této verzi ji neukládáme.</p><p id="photo-error" class="error" aria-live="polite"></p></div>${!state.photoURL?`<div class="field"><label for="appearance">Jak náš hrdina vypadá?</label><textarea id="appearance" maxlength="200" placeholder="Například hnědé vlasy po ramena a kulaté brýle." aria-describedby="appearance-error">${esc(state.appearance)}</textarea><small>Bez fotografie potřebujeme krátký popis vlasů, účesu, případně brýlí.</small><p class="error" id="appearance-error" aria-live="polite"></p></div>`:''}`;
    $('#photo').addEventListener('change',uploadPhoto);$('#remove-photo')?.addEventListener('click',()=>{saveFields();invalidateCheck();URL.revokeObjectURL(state.photoURL);state.photo=null;state.photoURL=null;renderForm();});
  } else if(state.step===1){
    $('#form-content').innerHTML=`<div class="field"><span class="field-label" id="theme-label">Vyberte dobrodružství</span><div class="form-themes" role="radiogroup" aria-labelledby="theme-label">${[...themes,{name:'Vlastní téma'}].map(t=>`<label class="theme-choice"><input type="radio" name="theme" value="${t.name}" ${state.theme===t.name?'checked':''}><span>${t.name}</span></label>`).join('')}</div></div><div id="custom-field" ${state.theme==='Vlastní téma'?'':'hidden'}>${field('custom','O čem má pohádka být?',state.custom,120,'Třeba výprava za duhou')}</div><div class="row-two"><div class="field"><label for="companion">Kamarád do příběhu</label><select id="companion">${['Překvapení','Pejsek','Kočička','Králíček','Medvídek','Malý dráček','Vlastní zadání'].map(c=>`<option ${state.companion===c?'selected':''}>${c}</option>`).join('')}</select></div>${field('companionName','Jméno kamaráda (nepovinné)',state.companionName,60,'Vymyslíme, pokud nevyplníte')}</div><div id="custom-companion-field" ${state.companion==='Vlastní zadání'?'':'hidden'}>${field('customCompanion','Vlastní postava nebo osobnost',state.customCompanion,120,'Napište, s kým chce dítě prožít příběh')}<p class="field-hint">Může jít o vlastní i známou postavu či veřejně známou osobnost. Vaše zadání bez nové volby nepřepisujeme.</p></div><details class="optional-details" ${state.wish?'open':''}><summary>Chcete přidat něco osobního?</summary><div class="field"><label for="wish" class="field-hint">Oblíbená věc, místo nebo malé přání</label><textarea id="wish" maxlength="300" placeholder="Například: Má ráda duhu a kytičky.">${esc(state.wish)}</textarea></div></details>`;
    $('#companion').addEventListener('change',()=>{state.companion=$('#companion').value;$('#custom-companion-field').hidden=state.companion!=='Vlastní zadání';});document.querySelectorAll('input[name="theme"]').forEach(el=>el.addEventListener('change',()=>{state.theme=el.value;$('#custom-field').hidden=state.theme!=='Vlastní téma';}));
  } else {
    $('#form-content').innerHTML=`<div class="summary-card"><div class="summary-row"><span>Hlavní hrdina</span><strong>${esc(state.name)} · ${state.age} ${state.age<5?'roky':'let'} <button type="button" class="summary-edit" data-edit="0">Upravit</button></strong></div><div class="summary-row"><span>Dobrodružství</span><strong>${esc(state.theme==='Vlastní téma'?state.custom:state.theme)} <button type="button" class="summary-edit" data-edit="1">Upravit</button></strong></div><div class="summary-row"><span>Kamarád</span><strong>${esc(state.companion==='Vlastní zadání'?state.customCompanion:state.companion)}${state.companionName?' · '+esc(state.companionName):''}</strong></div><div class="summary-row"><span>Podoba hrdiny</span>${state.photoURL?`<img class="photo-preview" src="${state.photoURL}" alt="Vybraná fotografie">`:`<strong>${esc(state.appearance)}</strong>`}</div>${state.wish?`<div class="summary-row"><span>Osobní přání</span><strong>${esc(state.wish)}</strong></div>`:''}<div class="summary-row total"><span>Celkem</span><strong>80 Kč</strong></div><p class="field-hint">6 stran · český příběh · PDF pro tisk na A4 na šířku</p></div><div style="margin-top:20px">${field('email','E-mail pro doručení odkazu',state.email,254,'vas@email.cz','email')}</div><p class="review-note">Nejprve ověříme údaje a dostupnost tvorby celého sešitu. Kliknutím na kontrolu odešlete zadání a případnou fotografii serveru. Kontrola neprovádí platbu ani placené generování.</p><div id="preflight-status" class="preflight-status" role="status" aria-live="polite"></div><p class="review-note">Pohádku vytváří AI. Po zaplacení a zahájení výroby zadání nelze měnit. Kontrola není ověřením práv ani zárukou přijetí všech budoucích obrázků.</p>`;
  }
  if(state.step===2)renderCheckStatus();$('#creator').scrollTop=0;
}
async function uploadPhoto(e){
  const file=e.target.files[0];if(!file)return;saveFields();const error=$('#photo-error');
  if(!['image/jpeg','image/png'].includes(file.type)){error.textContent='Vyberte prosím fotografii JPG nebo PNG. HEIC zatím tento náhled nepodporuje.';e.target.value='';return;}
  if(file.size>10*1024*1024){error.textContent='Fotografie je příliš velká. Vyberte soubor menší než 10 MB.';e.target.value='';return;}
  const url=URL.createObjectURL(file);
  try{const img=new Image();img.src=url;await img.decode();if(state.photoURL)URL.revokeObjectURL(state.photoURL);invalidateCheck();state.photo=file;state.photoURL=url;renderForm();}
  catch{URL.revokeObjectURL(url);error.textContent='Fotografii nelze načíst. Zkuste jiný obrázek.';e.target.value='';}
}
function validateStep(){
  let valid=true;document.querySelectorAll('.error').forEach(e=>e.textContent='');
  const error=(id,text)=>{document.getElementById(id+'-error').textContent=text;const input=document.getElementById(id);input.setAttribute('aria-invalid','true');if(valid)input.focus();valid=false;};
  document.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
  if(state.step===0){if(!state.name.trim())error('name','Napište prosím jméno hlavního hrdiny.');if(!state.photo&&!state.appearance.trim())error('appearance','Napište krátký popis nebo přidejte fotografii.');}
  if(state.step===1&&state.theme==='Vlastní téma'&&!state.custom.trim())error('custom','Napište prosím vlastní téma pohádky.');
  if(state.step===1&&state.companion==='Vlastní zadání'&&!state.customCompanion.trim())error('customCompanion','Napište prosím vlastní postavu nebo osobnost.');
  return valid;
}
$('#story-form').addEventListener('submit',async e=>{e.preventDefault();saveFields();if(state.step<2&&validateStep()){state.step++;renderForm();$('#creator-title').setAttribute('tabindex','-1');$('#creator-title').focus();}else if(state.step===2&&validateStep())await checkOrder();});
$('#back').addEventListener('click',()=>{saveFields();state.step=Math.max(0,state.step-1);renderForm();});
// Stage the visible form only. No payment or order is created by this tool.
if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  Promise.resolve(document.modelContext.registerTool({name:'start_story_configuration',title:'Začít tvořit pohádku',description:'Open the story form with a selected theme. Does not submit personal data, create an order, or charge money.',inputSchema:{type:'object',properties:{theme:{type:'string',enum:[...themes.map(t=>t.name),'Vlastní téma']}},required:['theme'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||typeof input.theme!=='string'||Object.keys(input).some(k=>k!=='theme'))throw new Error('Očekáváno platné téma');startStory(input.theme);return{opened:true,step:'Dítě',theme:state.theme};}},{signal:lifecycle.signal})).catch(()=>{});
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
