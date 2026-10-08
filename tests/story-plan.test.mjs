import test from 'node:test';import assert from 'node:assert/strict';
import {story} from './fixtures/story.mjs';import {validateStory} from '../server/product.mjs';import {createImageJobs} from '../server/generation-contract.mjs';
test('v1.6 plan validates and retains new fields; malformed references and repeated scenes fail',()=>{
 const valid=story();assert.equal(validateStory(valid,4),valid);
 for(const mutate of [s=>delete s.world_rules_cs,s=>s.world_rules_cs.pop(),s=>delete s.pages[0].scene_plan,s=>s.pages[0].scene_plan.shot_type='random',s=>s.pages[0].character_states=[],s=>s.pages[0].object_states[0].object_id='missing',s=>s.recurring_objects.push(s.recurring_objects[0]),s=>delete s.recurring_objects[0].invariant_features_en,s=>s.pages.forEach(p=>p.scene_plan.shot_type='wide'),s=>s.pages[1].scene_plan={...s.pages[0].scene_plan},s=>s.pages[0].story_text_cs+=' '+s.pages[0].color_target.phrase_cs]){
  const invalid=story();mutate(invalid);assert.throws(()=>validateStory(invalid,4));
 }
});
test('each image job receives only relevant characters, objects, world and scene state',()=>{
 const plan=story();plan.characters.push({id:'offstage',name_cs:'Jiná postava',role:'supporting',visual_description_en:'A large friendly bird.'});
 plan.recurring_objects.push({id:'offstage_vehicle',visual_description_en:'PRIVATE_UNUSED_DESIGN',invariant_features_en:['Two tracks.'],allowed_state_changes_cs:[]});
 const jobs=createImageJobs(plan,4);
 for(const job of jobs){const prompt=job.body.prompt;assert.ok(prompt.includes('world_rules_cs'));assert.ok(prompt.includes('scene_plan'));assert.ok(prompt.includes('invariant_features_en'));assert.ok(prompt.includes('character_states'));assert.ok(prompt.includes('object_states'));assert.ok(!prompt.includes('offstage'));assert.ok(!prompt.includes('story_text_cs'));assert.ok(!prompt.includes('{{'));}
 plan.pages[0].object_states=[];assert.ok(!createImageJobs(plan,4)[0].body.prompt.includes('Five rounded petals.'));
});
