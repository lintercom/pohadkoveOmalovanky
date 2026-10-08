import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

test('home explains the complete current AI workflow and provides usable destinations',async()=>{
 const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
 const section=html.slice(html.indexOf('<section class="creation-journey'),html.indexOf('<section class="section wrap faq'));
 assert.equal((section.match(/data-journey-tab>/g)||[]).length,4);
 assert.equal((section.match(/data-journey-panel/g)||[]).length,4);
 assert.ok(!html.includes('class="quick-steps'));
 for(const copy of ['S POMOCÍ AI','Zkopírovat prompt pro ChatGPT','fotografii přiložte zvlášť','Hotové PDF stáhněte z ChatGPT','automatická výroba a platby ještě nejsou spuštěné'])assert.ok(section.includes(copy),copy);
 for(const href of ['/vytvorit/','https://chatgpt.com/','/navody/jak-vytisknout-omalovanky/','#ukazka'])assert.ok(section.includes('href="'+href+'"'));
 assert.ok(section.includes('rel="noopener noreferrer"'));assert.ok(section.includes('<noscript>'));
 assert.ok(html.includes('src="/journey.js" defer'));
});

test('journey tabs support every step and roving keyboard focus without network calls',async()=>{
 let focused;
 class Element{
  listeners={};attrs={};
  addEventListener(type,fn){this.listeners[type]=fn;}
  setAttribute(name,value){this.attrs[name]=value;}
  focus(){focused=this;}
  emit(type,key){const event={key,preventDefault(){this.prevented=true;}};this.listeners[type](event);return event;}
 }
 const tabs=Array.from({length:4},()=>new Element());
 const panels=Array.from({length:4},()=>({hidden:false}));
 const journey={querySelectorAll:selector=>selector==='[data-journey-tab]'?tabs:panels};
 const context=vm.createContext({document:{querySelectorAll:()=>[journey]}});
 vm.runInContext(await readFile(new URL('../dist/journey.js',import.meta.url),'utf8'),context);
 function selected(index){assert.equal(panels.filter(p=>!p.hidden).length,1);tabs.forEach((tab,i)=>{assert.equal(tab.attrs['aria-selected'],String(i===index));assert.equal(tab.tabIndex,i===index?0:-1);assert.equal(panels[i].hidden,i!==index);});}
 for(let i=0;i<4;i++){tabs[i].emit('click');selected(i);}
 assert.equal(tabs[3].emit('keydown','ArrowRight').prevented,true);selected(0);assert.equal(focused,tabs[0]);
 tabs[0].emit('keydown','ArrowLeft');selected(3);
 tabs[3].emit('keydown','Home');selected(0);
 tabs[0].emit('keydown','End');selected(3);
 tabs[3].emit('keydown','ArrowUp');selected(2);
 tabs[2].emit('keydown','ArrowDown');selected(3);
 assert.ok(!tabs[3].emit('keydown','Tab').prevented);
});
