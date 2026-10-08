// JSON Schema for the v1.6 text plan. Extra fields are preserved, never stripped.
const text={type:'string',minLength:1,pattern:'\\S'};
const list=(items,minItems=0,maxItems)=>({type:'array',items,minItems,...(maxItems===undefined?{}:{maxItems})});
const object=properties=>({type:'object',properties,required:Object.keys(properties)});
const states=id=>list(object({[id]:text,state_cs:text}));
export const STORY_SCHEMA={
  $schema:'https://json-schema.org/draft/2020-12/schema',
  ...object({
    status:{enum:['ready']},title_cs:text,language:{enum:['cs']},child_age:{type:'integer',minimum:3,maximum:9},
    difficulty:{enum:['preschool','early_school','school']},world_rules_cs:list(text,3,6),
    characters:list(object({id:text,name_cs:text,role:text,visual_description_en:text}),1,3),
    recurring_objects:list(object({id:text,visual_description_en:text,invariant_features_en:list(text,1),allowed_state_changes_cs:list(text)})),
    pages:list(object({
      page_number:{type:'integer',minimum:1,maximum:6},story_text_cs:text,
      color_target:object({object_cs:text,color_cs:text,color_en:{enum:['red','yellow','green','blue','purple','pink','orange']},phrase_cs:text}),
      character_ids:{...list(text,1),uniqueItems:true},scene_description_cs:text,
      scene_plan:object({main_action_cs:text,location_zone_cs:text,shot_type:{enum:['wide','medium','over_shoulder','close_up']},camera_angle_en:text,composition_en:text,difference_from_previous_cs:text}),
      character_states:states('character_id'),object_states:states('object_id'),image_prompt_en:text
    }),6,6)
  })
};

// Only the vocabulary used by STORY_SCHEMA is needed; no external runtime package.
export function validateStoryStructure(value,schema=STORY_SCHEMA,path='story') {
  const invalid=()=>{throw Error('INVALID_STORY_SCHEMA: '+path);};
  if(schema.enum&&!schema.enum.includes(value))invalid();
  if(schema.type==='object'){
    if(!value||typeof value!=='object'||Array.isArray(value))invalid();
    for(const key of schema.required||[])if(!Object.hasOwn(value,key))invalid();
    for(const [key,rule] of Object.entries(schema.properties||{}))if(Object.hasOwn(value,key))validateStoryStructure(value[key],rule,path+'.'+key);
  }else if(schema.type==='array'){
    if(!Array.isArray(value)||value.length<(schema.minItems||0)||(schema.maxItems!==undefined&&value.length>schema.maxItems))invalid();
    if(schema.uniqueItems&&new Set(value.map(item=>JSON.stringify(item))).size!==value.length)invalid();
    value.forEach((item,index)=>validateStoryStructure(item,schema.items,path+'['+index+']'));
  }else if(schema.type==='string'){
    if(typeof value!=='string'||value.length<(schema.minLength||0)||(schema.pattern&&!new RegExp(schema.pattern,'u').test(value)))invalid();
  }else if(schema.type==='integer'&&(!Number.isInteger(value)||value<schema.minimum||value>schema.maximum))invalid();
  return value;
}
