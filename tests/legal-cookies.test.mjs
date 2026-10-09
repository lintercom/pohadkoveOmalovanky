import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const script=await readFile(new URL('../dist/cookies.js',import.meta.url),'utf8');
function setup({cookie='',blocked=false}={}){
 const nodes={};let focus=null,written='';
 for(const id of ['cookie-notice','cookie-details','cookie-settings','cookie-confirm','cookie-save'])nodes[id]={hidden:true,events:{},attrs:{},addEventListener(name,fn){this.events[name]=fn;},setAttribute(k,v){this.attrs[k]=v;},focus(){focus=id;},getBoundingClientRect(){return {height:140};}};
 const footer={events:{},addEventListener(name,fn){this.events[name]=fn;},focus(){focus='footer';}};
 const vars={};const document={getElementById:id=>nodes[id],querySelectorAll:()=>[footer],documentElement:{style:{setProperty(k,v){vars[k]=v;}}}};
 Object.defineProperty(document,'cookie',{get(){if(blocked)throw Error('STORAGE_BLOCKED');return cookie;},set(value){if(blocked)throw Error('STORAGE_BLOCKED');written=value;cookie=value.split(';')[0];}});
 vm.runInNewContext(script,{document,location:{protocol:'https:'},window:{addEventListener(){}},ResizeObserver:class{observe(){}}});
 return {nodes,footer,vars,get written(){return written;},get focus(){return focus;}};
}
test('notice remembers only technical version, reopens and restores focus',()=>{
 const s=setup();assert.equal(s.nodes['cookie-notice'].hidden,false);assert.equal(s.nodes['cookie-details'].hidden,true);assert.equal(s.vars['--cookie-height'],'156px');
 s.nodes['cookie-settings'].events.click();assert.equal(s.nodes['cookie-details'].hidden,false);
 s.nodes['cookie-save'].events.click();assert.equal(s.nodes['cookie-notice'].hidden,true);assert.match(s.written,/^fairytale_cookie_notice=1; Max-Age=15552000; Path=\/; SameSite=Lax; Secure$/);
 s.footer.events.click();assert.equal(s.nodes['cookie-details'].hidden,false);assert.equal(s.focus,'cookie-settings');
 s.nodes['cookie-notice'].events.keydown({key:'Escape',preventDefault(){}});assert.equal(s.focus,'footer');assert.equal(s.nodes['cookie-notice'].hidden,true);
});
test('saved notice stays closed; outdated or blocked storage does not block using the site',()=>{
 assert.equal(setup({cookie:'other=1; fairytale_cookie_notice=1'}).nodes['cookie-notice'].hidden,true);
 assert.equal(setup({cookie:'fairytale_cookie_notice=0'}).nodes['cookie-notice'].hidden,false);
 const s=setup({blocked:true});s.nodes['cookie-confirm'].events.click();assert.equal(s.nodes['cookie-notice'].hidden,true);assert.equal(s.written,'');
});
test('identity is absent from homepage/footer and all routes share legal links and notice',async()=>{
 const home=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
 for(const value of ['05695961','Nová 114','Petr Slavík'])assert.ok(!home.includes(value));
 for(const route of ['smluvni-podminky','soukromi','cookies','vytvorit']){
  const html=await readFile(new URL('../dist/'+route+'/index.html',import.meta.url),'utf8');
  assert.match(html,/id="cookie-notice"/);assert.match(html,/href="\/smluvni-podminky\/"/);assert.match(html,/data-cookie-open/);
  assert.ok(!html.match(/<footer[\s\S]*?<\/footer>/)[0].includes('05695961'));
 }
 const terms=await readFile(new URL('../dist/smluvni-podminky/index.html',import.meta.url),'utf8');assert.match(terms,/05695961/);assert.match(terms,/není plátce DPH/);
 for(const value of ['fetch(','localStorage','child_name'])assert.ok(!script.includes(value));
});
