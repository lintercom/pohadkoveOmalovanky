import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
test('four native disclosures keep explanations and actions beside each step without JS',async()=>{
 const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
 const section=html.slice(html.indexOf('<section class="creation-journey'),html.indexOf('<section class="section wrap faq'));
 const bubbles=[...section.matchAll(/<details class="journey-bubble">([\s\S]*?)<\/details>/g)];
 assert.equal(bubbles.length,4);
 for(const [i,b] of bubbles.entries()){
  assert.match(b[1],/^<summary>/);assert.match(b[1],/<\/summary><div class="journey-detail">/);
  assert.match(b[1],/<a class="button" href=/);assert.ok(b[1].includes('>'+String(i+1)+'</span>'));
 }
 assert.ok(!section.includes('role="tab'));assert.ok(!section.includes('tabindex="-1"'));
 for(const copy of ['Zkontrolujte zadání','Pohádku a obrázky vytvoří AI','Hotové PDF si stáhněte přímo z webu'])assert.ok(section.includes(copy),copy);
 for(const href of ['/vytvorit/','/navody/jak-vytisknout-omalovanky/','#ukazka'])assert.ok(section.includes('href="'+href+'"'));
 assert.ok(!html.includes('ChatGPT'));assert.ok(!html.includes('chatgpt.com/'));assert.ok(!html.includes('nejsou spuštěné'));assert.ok(!html.includes('Zkopírujte zadání'));
 assert.equal((section.match(/class="journey-art /g)||[]).length,2);
});
test('decorative curve follows expanded steps and narrow layouts without changing disclosures',async()=>{
 let narrow=false,extra=0,resize;
 const strokes=[{setAttribute(k,v){this[k]=v;}},{setAttribute(k,v){this[k]=v;}}];
 const svg={setAttribute(k,v){this[k]=v;}};
 const bubbles=Array.from({length:4},(_,i)=>({querySelector(){return {getBoundingClientRect(){return {left:narrow?(i%2)*18:(i%2)*230,top:i*180+(i>0?extra:0),width:narrow?302:530,height:118};}};},addEventListener(k,fn){this[k]=fn;}}));
 const trail={querySelectorAll:s=>s==='.journey-bubble'?bubbles:strokes,querySelector:()=>svg,getBoundingClientRect:()=>({left:0,top:0,width:narrow?320:840,height:660+extra})};
 vm.runInNewContext(await readFile(new URL('../dist/journey.js',import.meta.url),'utf8'),{document:{querySelectorAll:()=>[trail]},window:{addEventListener(k,fn){resize=fn;}}});
 assert.match(strokes[0].d,/M 265 59/);const before=strokes[0].d;
 extra=250;bubbles[0].toggle();assert.notEqual(strokes[0].d,before);assert.equal(svg.viewBox,'0 0 840 910');
 narrow=true;resize();assert.match(strokes[0].d,/M 151 59/);assert.equal(strokes[0].d,strokes[1].d);assert.equal(svg.viewBox,'0 0 320 910');
});
