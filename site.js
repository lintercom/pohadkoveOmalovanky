'use strict';
document.querySelectorAll('[data-reader]').forEach(reader=>{
 let current=0;const pages=[...reader.querySelectorAll('[data-page]')];
 const select=index=>{current=Math.max(0,Math.min(pages.length-1,index));pages.forEach((p,i)=>p.hidden=i!==current);reader.querySelectorAll('[data-page-select]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));reader.querySelector('[data-previous]').disabled=current===0;reader.querySelector('[data-next]').disabled=current===pages.length-1;reader.querySelector('[data-reader-status]').textContent=`Strana ${current+1} z ${pages.length}`;};
 reader.querySelectorAll('[data-page-select]').forEach(b=>b.addEventListener('click',()=>select(Number(b.dataset.pageSelect))));reader.querySelector('[data-previous]').addEventListener('click',()=>select(current-1));reader.querySelector('[data-next]').addEventListener('click',()=>select(current+1));
 reader.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();select(current+(event.key==='ArrowRight'?1:-1));}});
});
const motionButton=document.getElementById('motion-toggle');
const preference=matchMedia('(prefers-reduced-motion: reduce)');let paused=preference.matches;
function updateMotion(){document.body.classList.toggle('motion-paused',paused);if(motionButton){motionButton.setAttribute('aria-pressed',String(paused));motionButton.textContent=paused?'Pohyb pozastaven':'Pozastavit pohyb';}}
motionButton?.addEventListener('click',()=>{paused=!paused;updateMotion();});preference.addEventListener('change',event=>{paused=event.matches;updateMotion();});updateMotion();
document.getElementById('school-form')?.addEventListener('submit',event=>{
 event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;const data=new FormData(form);
 const body=`Dobrý den, mám zájem o pilot příběhu pro školku.\n\nŠkolka: ${data.get('school')||'neuvedeno'}\nVěk: ${data.get('age')}\nVarianta: ${data.get('kind')}\nTéma nebo dotaz: ${data.get('topic')}\n\nProsím o návrh ceny, rozsahu licence a podmínek pilotu.`;
 const status=document.getElementById('school-status');status.textContent='Poptávka je připravena v poštovní aplikaci. Web ji neodeslal; před odesláním ji můžete upravit.';
 location.href='mailto:petrlavikweb@gmail.com?subject='+encodeURIComponent('Poptávka pilotu pro školku')+'&body='+encodeURIComponent(body);
});
// Integration point only; no network analytics, customer input or advertising IDs.
window.productEvent=(name,audience='parent')=>{if(!['form_start','form_complete','sample_download','school_inquiry'].includes(name))return;window.dispatchEvent(new CustomEvent('product:event',{detail:{name,audience:audience==='school'?'school':'parent'}}));};
document.querySelectorAll('a[download]').forEach(a=>a.addEventListener('click',()=>window.productEvent('sample_download')));
