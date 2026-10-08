import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

test('complete sample is in the dialog, hero image and journey link point to it',async()=>{
 const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
 const main=html.match(/<main id="main">([\s\S]*?)<\/main>/)[1];
 const dialog=html.match(/<dialog id="preview"[\s\S]*?<\/dialog>/)[0];
 assert.ok(!main.includes('data-reader'));assert.ok(!main.includes('sample-section'));
 assert.equal((dialog.match(/data-page="/g)||[]).length,6);
 assert.ok(dialog.includes('download'));assert.ok(dialog.includes('aria-labelledby="preview-title"'));
 assert.ok(main.includes('id="sample-open" type="button" aria-haspopup="dialog" aria-controls="preview"'));
 assert.ok(main.includes('href="#ukazka" data-sample-open'));
 assert.ok(main.includes('id="ukazka"'));assert.ok(main.includes('<noscript>'));
});

test('sample opens, pages by buttons and keyboard, closes and restores the actual trigger',async()=>{
 let doc;
 class Element{
  listeners={};attrs={};disabled=false;hidden=false;
  addEventListener(type,callback){(this.listeners[type]??=[]).push(callback);}
  emit(type,values={}){const event={target:this,preventDefault(){this.prevented=true;},...values};for(const callback of this.listeners[type]||[])callback(event);return event;}
  setAttribute(name,value){this.attrs[name]=value;}
  focus(){doc.activeElement=this;}
 }
 const hero=new Element(),link=new Element(),close=new Element(),dialog=new Element(),reader=new Element();
 const previous=new Element(),next=new Element(),status=new Element();previous.disabled=true;
 const pages=Array.from({length:6},(_,i)=>Object.assign(new Element(),{hidden:i!==0}));
 const dots=pages.map((_,i)=>Object.assign(new Element(),{dataset:{pageSelect:String(i)}}));
 reader.querySelectorAll=selector=>selector==='[data-page]'?pages:dots;
 reader.querySelector=selector=>({'[data-previous]':previous,'[data-next]':next,'[data-reader-status]':status}[selector]);
 reader.contains=element=>[previous,next,...dots].includes(element);
 reader.closest=()=>dialog;
 dialog.open=false;dialog.querySelector=()=>close;
 dialog.showModal=()=>{dialog.open=true;close.focus();};
 dialog.close=()=>{dialog.open=false;dialog.emit('close');};
 dialog.getBoundingClientRect=()=>({left:10,right:800,top:10,bottom:700});
 doc={activeElement:hero,getElementById:id=>({'preview':dialog,'sample-open':hero}[id]),querySelectorAll:selector=>selector==='[data-reader]'?[reader]:selector==='[data-sample-open],#sample-open'?[link,hero]:[],body:{classList:{toggle(){}}}};
 const window=new Element();window.dispatchEvent=()=>{};
 const location={hash:'',replace(){}};
 const context=vm.createContext({document:doc,window,location,matchMedia:()=>({matches:false,addEventListener(){}}),CustomEvent:class{}});
 for(const file of ['app.js','site.js'])vm.runInContext(await readFile(new URL('../dist/'+file,import.meta.url),'utf8'),context);
 assert.equal(hero.emit('click').prevented,true);assert.equal(dialog.open,true);
 for(let i=0;i<5;i++){next.focus();next.emit('click');}
 assert.equal(pages[5].hidden,false);assert.equal(next.disabled,true);assert.equal(doc.activeElement,dots[5]);
 assert.equal(status.textContent,'Strana 6 z 6');assert.equal(dots[5].attrs['aria-pressed'],'true');
 assert.equal(dialog.emit('keydown',{key:'ArrowLeft'}).prevented,true);assert.equal(pages[4].hidden,false);
 dots[0].emit('click');assert.equal(pages[0].hidden,false);assert.equal(previous.disabled,true);
 close.emit('click');assert.equal(dialog.open,false);assert.equal(doc.activeElement,hero);
 link.emit('click');assert.equal(dialog.open,true);
 dialog.emit('click',{clientX:100,clientY:100});assert.equal(dialog.open,true);
 dialog.emit('click',{clientX:0,clientY:0});assert.equal(dialog.open,false);assert.equal(doc.activeElement,link);
 location.hash='#ukazka';window.emit('hashchange');assert.equal(dialog.open,true);
 dialog.close();assert.equal(doc.activeElement,hero);
});
