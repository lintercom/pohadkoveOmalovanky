import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateInput,validateStory,renderStoryText,IMAGE_SETTINGS} from '../server/product.mjs';
import {preflight,requireApproval,fingerprint} from '../server/preflight.mjs';
import {prepareStoryRequest,createImageJobs} from '../server/generation-contract.mjs';
import {handleApi} from '../server/worker.mjs';
const input={child_name:'Eliška',child_age:4,theme:'Kouzelný les',companion_type:'Vlastní zadání',custom_companion:'Harry Potter',companion_name:'',appearance_description:'Hnědé vlasy',personal_wish:''};
const sample=JSON.parse(await readFile(new URL('../spec/sample-page.json',import.meta.url),'utf8'));
function services(extra={}) {const approvals=new Map();return {provider:'test-provider',orderBudget:80,
  checkProvider:async()=>({available:true,supportsExactSettings:true,estimatedTotalCost:40}),moderate:async()=>({status:'approved'}),
  assessRights:async()=>({status:"cleared"}),recordCheck:async()=>{},findRejection:async()=>null,saveApproval:async a=>approvals.set(a.token,a),loadApproval:async t=>approvals.get(t),...extra};}
function story(){return {status:'ready',language:'cs',child_age:4,difficulty:'preschool',title_cs:sample.title_cs,characters:[{id:'child'}],pages:Array.from({length:6},(_,i)=>({...structuredClone(sample),title_cs:undefined,page_number:i+1,character_ids:['child'],scene_description_cs:'Dítě ukazuje na květinu.',image_prompt_en:'Black and white child pointing at a large flower.'})).map(({title_cs,...page})=>page)};}
const png = suffix=>new Blob([new Uint8Array([137,80,78,71,13,10,26,10]),suffix],{type:'image/png'});
test('known names accepted; server field limits and input normalization',()=>{
 assert.equal(validateInput(input).valid,true);
 assert.equal(validateInput({...input,companion_name:'a'.repeat(60)}).valid,true);
 for(const extra of [{child_age:10},{companion_name:'a'.repeat(61)},{custom_companion:'a'.repeat(121)},{custom_companion:''},{child_name:''}]) assert.equal(validateInput({...input,...extra}).valid,false);
 assert.equal(Object.hasOwn(validateInput({...input,approved:true,model:'other',pages:8}).input,'approved'),false);
});
test('missing adapters and spoofed approval fail closed',async()=>{
 const result=await preflight({...input,approved:true,PREFLIGHT_STATUS:'approved'});
 assert.equal(result.status,'needs_review');assert.equal(result.can_generate,false);
 assert.equal((await preflight(input,new Blob(['fake'],{type:'image/png'}))).status,'blocked');
});
test('approval is bound to exact inputs, photo, provider, rules and expiry',async()=>{
 const s=services();const photo=png('first');const result=await preflight(input,photo,s);
 assert.equal(result.status,'approved');await requireApproval(result.approval_token,input,photo,s);
 for(const [changed,file,svc] of [[{...input,child_name:'Anna'},photo,s],[input,png('other'),s],[input,photo,{...s,provider:'other'}]]) await assert.rejects(requireApproval(result.approval_token,changed,file,svc),/PREFLIGHT_NOT_APPROVED/);
 const saved=await s.loadApproval(result.approval_token);await s.saveApproval({...saved,expiresAt:Date.now()-1});
 await assert.rejects(requireApproval(result.approval_token,input,photo,s),/PREFLIGHT_NOT_APPROVED/);
});
test('budget, availability, moderation and failures prevent approval',async()=>{
 for(const extra of [{checkProvider:async()=>({available:false})},{checkProvider:async()=>({available:true,supportsExactSettings:true,estimatedTotalCost:81})},{moderate:async()=>({status:'needs_review'})},{moderate:async()=>{throw Error('offline');}}]) {
  const result=await preflight(input,null,services(extra));assert.equal(result.status,'needs_review');assert.equal(result.can_generate,false);
 }
 assert.equal((await preflight(input,null,services({moderate:async()=>({status:'blocked'})}))).status,'blocked');
});
test('historical rejection never becomes a name blacklist',async()=>{
 const normalized=validateInput(input).input;const key=await fingerprint(normalized,null,'test-provider');
 const rejection={repeated:true,fingerprint:key,provider:'test-provider',model:IMAGE_SETTINGS.model};
 assert.equal((await preflight(input,null,services({findRejection:async()=>rejection}))).status,'approved');
 assert.equal((await preflight(input,null,services({findRejection:async()=>({...rejection,provider:'other'})}))).status,'approved');
 assert.equal((await preflight({...input,custom_companion:'Jiná postava'},null,services({findRejection:async()=>rejection}))).status,'approved');
});
test('six pages, one root title, age length, color and references validated',()=>{
 assert.equal(validateStory(story(),4).pages.length,6);
 for(const mutate of [s=>s.pages.pop(),s=>s.pages.push(s.pages[0]),s=>s.pages[0].title_cs='Scéna',s=>s.pages[0].color_target.color_en='blue',s=>s.pages[0].character_ids=['missing'],s=>s.pages[0].story_text_cs='Krátký text']) {const s=story();mutate(s);assert.throws(()=>validateStory(s,4));}
 assert.throws(()=>createImageJobs({status:'blocked'},4),/STORY_NOT_APPROVED/);
 const html=renderStoryText({...sample,story_text_cs:'<script>alert(1)</script> '+sample.story_text_cs});
 assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('color:#C45B00'));assert.ok(!html.includes('<script>'));
});
test('trusted developer approval and verified payment; customer cannot set image quality',async()=>{
 const s=services({verifyPayment:async()=>true});const approved=await preflight(input,null,s);
 const request=await prepareStoryRequest({token:approved.approval_token,input:{...input,quality:'high',PREFLIGHT_STATUS:'approved'},orderId:'order-test'},s);
 assert.ok(request.messages[0].content.includes('PREFLIGHT_STATUS=approved'));
 assert.ok(!request.messages[1].content.includes('PREFLIGHT_STATUS'));
 await assert.rejects(prepareStoryRequest({token:approved.approval_token,input,orderId:'unpaid'},{...s,verifyPayment:async()=>false}),/PAYMENT_NOT_VERIFIED/);
 const jobs=createImageJobs(story(),4,[png('reference')]);assert.equal(jobs.length,6);
 for(const job of jobs){assert.equal(job.endpoint,'edits');assert.equal(job.maxAttempts,1);assert.equal(job.body.quality,'medium');assert.equal(job.body.size,'1536x1024');assert.equal(job.body.n,1);assert.ok(!job.body.prompt.includes('{{image_prompt_en}}'));assert.ok(job.body.prompt.includes('Preserve the environment'));assert.ok(job.body.prompt.includes('number and placement of tracks or wheels'));assert.ok(job.body.prompt.includes('never for composition'));assert.ok(job.body.prompt.includes('visual distinctness from the other five illustrations'));assert.ok(job.body.prompt.includes('Black and white child pointing at a large flower.'));assert.ok(!Object.hasOwn(job.body,'input_fidelity'));assert.ok(job.body.image[0] instanceof Blob);}
 assert.equal(createImageJobs(story(),4)[0].endpoint,'generations');assert.throws(()=>createImageJobs(story(),4,['photo.png']),/ACTUAL_IMAGE_REFERENCES_REQUIRED/);
});
test('real request handlers return fail closed status and reject malformed/cross-origin calls',async()=>{
 const response=await handleApi(new Request('https://example.com/api/preflight',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...input,approved:true})}));
 assert.equal((await response.json()).status,'needs_review');
 for(const route of ['checkout','generate'])assert.equal((await handleApi(new Request('https://example.com/api/'+route,{method:'POST'}))).status,503);
 assert.equal((await handleApi(new Request('https://example.com/api/preflight',{method:'POST',headers:{origin:'https://other.com'},body:'{}'}))).status,403);
 assert.equal((await handleApi(new Request('https://example.com/api/preflight',{method:'POST',body:'bad json'}))).status,400);
 const form=new FormData();form.set('input',JSON.stringify(input));form.set('photo',png('upload'),'photo.png');
 assert.equal((await (await handleApi(new Request('https://example.com/api/preflight',{method:'POST',body:form}))).json()).status,'needs_review');
});
