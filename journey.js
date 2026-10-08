'use strict';
document.querySelectorAll('[data-journey]').forEach(journey=>{
 const tabs=[...journey.querySelectorAll('[data-journey-tab]')];
 const panels=[...journey.querySelectorAll('[data-journey-panel]')];
 function select(index,focus=false){
  tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;});
  if(focus)tabs[index].focus();
 }
 tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>select(index));
  tab.addEventListener('keydown',event=>{
   let next;
   if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%tabs.length;
   if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index+tabs.length-1)%tabs.length;
   if(event.key==='Home')next=0;
   if(event.key==='End')next=tabs.length-1;
   if(next===undefined)return;
   event.preventDefault();select(next,true);
  });
 });
});
