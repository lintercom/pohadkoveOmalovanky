'use strict';
const preview=document.getElementById('preview'),open=document.getElementById('sample-open');let opener=null;
function showSample(trigger=open){if(!preview||preview.open)return;opener=trigger;preview.showModal();}
document.querySelectorAll('[data-sample-open],#sample-open').forEach(trigger=>trigger.addEventListener('click',event=>{event.preventDefault();showSample(trigger);}));
preview?.querySelector('[data-close]')?.addEventListener('click',()=>preview.close());
preview?.addEventListener('close',()=>opener?.focus());
preview?.addEventListener('click',event=>{if(event.target!==preview)return;const box=preview.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)preview.close();});
// Keep previously shared sample links working after moving the reader.
function openSampleHash(){if(location.hash==='#ukazka')showSample();}
window.addEventListener('hashchange',openSampleHash);openSampleHash();
// Compatibility with links saved before the standalone configurator.
if(location.hash==='#vytvorit')location.replace('/vytvorit/');
