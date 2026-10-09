'use strict';
(() => {
 const panel=document.getElementById('cookie-notice');if(!panel)return;
 const version='1',name='fairytale_cookie_notice',maxAge=180*24*60*60;
 const details=document.getElementById('cookie-details'),settings=document.getElementById('cookie-settings');
 const root=document.documentElement;let opener=null;
 function remembered(){try{return document.cookie.split(';').some(value=>value.trim()===name+'='+version);}catch{return false;}}
 function measure(){root.style.setProperty('--cookie-height',panel.hidden?'0px':Math.ceil(panel.getBoundingClientRect().height+16)+'px');}
 function expand(value){details.hidden=!value;settings.setAttribute('aria-expanded',String(value));measure();}
 function show(trigger=null){opener=trigger;panel.hidden=false;expand(!!trigger);if(trigger)settings.focus();measure();}
 function hide(){panel.hidden=true;measure();opener?.focus();opener=null;}
 function save(){
  try{document.cookie=name+'='+version+'; Max-Age='+maxAge+'; Path=/; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'');}catch{}
  // Disabled storage must never block using the website.
  hide();
 }
 settings.addEventListener('click',()=>expand(details.hidden));
 document.getElementById('cookie-confirm').addEventListener('click',save);
 document.getElementById('cookie-save').addEventListener('click',save);
 document.querySelectorAll('[data-cookie-open]').forEach(button=>button.addEventListener('click',()=>show(button)));
 panel.addEventListener('keydown',event=>{if(event.key==='Escape'&&opener){event.preventDefault();hide();}});
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(measure).observe(panel);
 window.addEventListener('resize',measure);
 if(!remembered())show();else measure();
})();
