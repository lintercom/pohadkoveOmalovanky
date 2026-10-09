'use strict';
document.querySelectorAll('[data-reader]').forEach(reader=>{
 let current=0;const pages=[...reader.querySelectorAll('[data-page]')];
 const select=index=>{current=Math.max(0,Math.min(pages.length-1,index));pages.forEach((p,i)=>p.hidden=i!==current);reader.querySelectorAll('[data-page-select]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));reader.querySelector('[data-previous]').disabled=current===0;reader.querySelector('[data-next]').disabled=current===pages.length-1;reader.querySelector('[data-reader-status]').textContent=`Strana ${current+1} z ${pages.length}`;if(document.activeElement?.disabled&&reader.contains(document.activeElement))reader.querySelectorAll('[data-page-select]')[current].focus();};
 reader.querySelectorAll('[data-page-select]').forEach(b=>b.addEventListener('click',()=>select(Number(b.dataset.pageSelect))));reader.querySelector('[data-previous]').addEventListener('click',()=>select(current-1));reader.querySelector('[data-next]').addEventListener('click',()=>select(current+1));
 (reader.closest('dialog')||reader).addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();select(current+(event.key==='ArrowRight'?1:-1));}});
});
// Integration point only; no network analytics, customer input or advertising IDs.
window.productEvent=(name)=>{if(!['form_start','form_complete','sample_download'].includes(name))return;window.dispatchEvent(new CustomEvent('product:event',{detail:{name,audience:'parent'}}));};
document.querySelectorAll('a[download]').forEach(a=>a.addEventListener('click',()=>window.productEvent('sample_download')));
