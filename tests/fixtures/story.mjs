import {readFile} from 'node:fs/promises';
const sample=JSON.parse(await readFile(new URL('../../spec/sample-story.json',import.meta.url),'utf8'));
// Synthetic structural fixture, not a visually verified generated story.
export function story(){return {
  status:'ready',language:'cs',child_age:4,difficulty:'preschool',title_cs:sample.title_cs,
  world_rules_cs:['Postavy chodí po lesních cestách.','Zvířata mluví.','Voda teče v potoce.'],
  characters:[{id:'child',name_cs:'Eliška',role:'main',visual_description_en:'Short straight hair and simple overalls.'}],
  recurring_objects:[{id:'flower',visual_description_en:'A large flower with five rounded petals.',invariant_features_en:['Five rounded petals.'],allowed_state_changes_cs:['Květina se narovná.']}],
  pages:Array.from({length:6},(_,i)=>({
    ...structuredClone(sample.pages[0]),page_number:i+1,character_ids:['child'],scene_description_cs:'Dítě ukazuje na květinu.',
    scene_plan:{main_action_cs:['Vítá','Ukazuje','Zvedá','Nese','Zalévá','Mává'][i]+' květinu',location_zone_cs:'Místo '+i,shot_type:['wide','medium','over_shoulder'][i%3],camera_angle_en:'View '+i,composition_en:'Arrangement '+i,difference_from_previous_cs:'Nová akce a uspořádání.'},
    character_states:[{character_id:'child',state_cs:'Stojí u květiny.'}],object_states:[{object_id:'flower',state_cs:'Roste u cesty.'}],
    image_prompt_en:'Black and white child pointing at a large flower.'
  }))
};}
