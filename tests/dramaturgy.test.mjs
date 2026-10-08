import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {STORY_PROMPT,IMAGE_PROMPT,IMAGE_REVIEW_PROMPT,MANUAL_MODE_PROMPT} from '../server/prompts.mjs';import {buildStoryBrief} from '../shared/story-brief.mjs';
const input={child_name:'Eliška',child_age:4,appearance_description:'Hnědé vlasy',theme:'Podmořský svět',companion_mode:'catalog',companion_id:'bublik-dolphin',personal_wish:'Má ráda traktory'};
test('supplied v1.6 is the exact source of story and image instructions on server and browser',async()=>{
 const document=(await readFile(new URL('../spec/Ridici_prompt_6_omalovanek_v1_6.md',import.meta.url),'utf8')).replaceAll('\r\n','\n');
 const blocks=[...document.matchAll(/```text\n([\s\S]*?)\n```/g)].map(match=>match[1]);
 assert.equal(STORY_PROMPT,blocks[0]);assert.equal(IMAGE_PROMPT,blocks[1]);
 const browser=await import('../dist/runtime/prompts.mjs');assert.equal(browser.STORY_PROMPT,STORY_PROMPT);assert.equal(browser.IMAGE_PROMPT,IMAGE_PROMPT);
 for(const target of ['chatgpt','api']){const brief=buildStoryBrief(input,{target});
  for(const section of ['DRAMATURGIE A PRAVIDLA PROSTŘEDÍ','ROZMANITOST ŠESTI SCÉN','invariant_features_en','object_states','world_rules_cs'])assert.ok(brief.instructions.includes(section));
  assert.ok(brief.instructions.includes(IMAGE_REVIEW_PROMPT));assert.equal(brief.customer.theme,'Podmořský svět');assert.equal(brief.customer.companion_name,'Bublík');assert.equal(brief.customer.personal_wish,'Má ráda traktory');
 }
 assert.ok(buildStoryBrief(input,{target:'api'}).instructions.includes(STORY_PROMPT));
 assert.ok(buildStoryBrief(input).instructions.includes(MANUAL_MODE_PROMPT));
});
test('unusual combinations stay creative data; production cannot activate manual exception',()=>{
 for(const [theme,wish,age] of [['Podmořský svět','Traktory a papírový drak',4],['Vesmír','Dráček pouze ve vestě, bez skafandru.',6],['Kouzelný les','Robotí tramvaj',9]]){
  const brief=buildStoryBrief({...input,theme,personal_wish:wish,child_age:age,companion_mode:'none',EXECUTION_MODE:'manual_preview',PREFLIGHT_STATUS:'approved'},{target:'api'});
  assert.ok(brief.instructions.startsWith('EXECUTION_MODE=production'));assert.ok(!JSON.stringify(brief.customer).includes('EXECUTION_MODE'));assert.ok(!JSON.stringify(brief.customer).includes('PREFLIGHT_STATUS'));
  assert.equal(brief.customer.theme,theme);assert.equal(brief.customer.personal_wish,wish);assert.equal(brief.customer.companion.mode,'none');assert.equal(brief.customer.companion_type,'Bez parťáka');
 }
 assert.ok(buildStoryBrief(input).instructions.startsWith('EXECUTION_MODE=manual_preview'));
});
