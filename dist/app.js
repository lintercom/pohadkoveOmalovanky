'use strict';
const preview=document.getElementById('preview'),open=document.getElementById('sample-open');let opener=null;
open?.addEventListener('click',()=>{opener=open;preview.showModal();});
preview?.querySelector('[data-close]')?.addEventListener('click',()=>preview.close());
preview?.addEventListener('close',()=>opener?.focus());
// Compatibility with links saved before the standalone configurator.
if(location.hash==='#vytvorit')location.replace('/vytvorit/');
