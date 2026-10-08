export const CATALOG_VERSION = '2026-10-v2';
export const COMPANION_CATALOG = Object.freeze([
  {id:'pip-dog',name:'Pip',kind:'veselý pejsek',description:'Dodá odvahu a nikdy nenechá kamaráda samotného.',appearance:'Small puppy with long floppy ears, round muzzle, plain triangular neckerchief; no other clothes.',character:'Cheerful, supportive; helps the child carry and find things.'},
  {id:'lisi-fox',name:'Lisa',kind:'zvědavá liška',description:'Všimne si drobné stopy a ráda hledá nové cesty.',appearance:'Small fox with large triangular ears, broad white muzzle and tail tip, simple small cross-body satchel; no other clothes.',character:'Curious, observant; follows clues together with the child.'},
  {id:'borek-dragon',name:'Bořek',kind:'přátelský dráček',description:'Pomůže přes překážku a umí trpělivě naslouchat.',appearance:'Small friendly dragon with rounded wings, short rounded horns, plain vest, broad belly; no other clothes.',character:'Patient, gentle; helps safely reach objects without fire.'},
  {id:'blik-robot',name:'Blik',kind:'malý robot',description:'Rád zkouší nápady a učí se spolu s dítětem.',appearance:'Small rounded robot, two round eyes, square chest pocket, simple rounded limbs; no letters or screens with text.',character:'Thoughtful, playful; tests simple solutions, makes harmless mistakes.'},
  {id:'jiskra-unicorn',name:'Jiskra',kind:'kouzelný jednorožec',description:'Vnáší do výpravy fantazii a povzbuzuje ostatní.',appearance:'Small unicorn, one short rounded horn, simple flowing mane, one star medallion, no other clothes.',character:'Kind, imaginative; encourages the child and notices beauty.'},
  {id:'dino-dinosaur',name:'Bronťa',kind:'odvážný dinosaurus',description:'Odvaha pro něj znamená pomoci, i když má trochu strach.',appearance:'Small friendly dinosaur with rounded back plates and a plain small backpack, broad feet, gentle rounded muzzle.',character:'Brave and considerate; works with the child to overcome small obstacles.'},
  {id:'bublik-dolphin',name:'Bublík',kind:'hravý delfín',description:'Zná mořské cestičky a pomůže objevit poklady pod hladinou.',appearance:'Small friendly dolphin with rounded fins, gently curved body, large kind eyes and a plain small neckerchief; no other clothes.',character:'Playful, helpful; explores the sea together with the child.',artwork:'/assets/companions/bublik-dolphin.png'},
  {id:'pirko-bird',name:'Pírko',kind:'zvídavý ptáček',description:'Ukáže cestu mezi oblaky a všimne si všeho z výšky.',appearance:'Small rounded bird with a short beak, friendly eyes, small rounded wings and a plain tiny cross-body satchel; no other clothes.',character:'Curious, gentle; guides the child through the sky and helps find the way.',artwork:'/assets/companions/pirko-bird.png'}
].map((c,index)=>Object.freeze({...c,version:CATALOG_VERSION,index,reference:c.artwork||'/assets/companions-v1.png',referenceCell:c.artwork?{column:0,row:0,columns:1,rows:1}:{column:index%3,row:Math.floor(index/3),columns:3,rows:2}})));
export const getCompanion = id => COMPANION_CATALOG.find(c=>c.id===id);
// Configurator recommendations only; these are not provider restrictions.
const WORLD_COMPANIONS=Object.freeze({
 'Kouzelný les':['pip-dog','lisi-fox','borek-dragon','jiskra-unicorn','pirko-bird'],
 'Zvířecí kamarádi':['pip-dog','lisi-fox','bublik-dolphin','pirko-bird'],
 'Zatoulaný obláček':['borek-dragon','pirko-bird'],
 'Podmořský svět':['bublik-dolphin'],
 'Vesmír':['blik-robot'],
 'Dinosauři':['dino-dinosaur']
});
export const recommendedCompanionIds=theme=>!theme?[]:[...(WORLD_COMPANIONS[theme]||COMPANION_CATALOG.map(c=>c.id))];
export function companionContext(input){
 if(input.companion_mode==='none')return {mode:'none',instruction:'Do not add a recurring companion. The child leads the story.'};
 if(input.companion_mode==='catalog'){const c=getCompanion(input.companion_id);if(!c)throw Error('INVALID_COMPANION');return {mode:'catalog',...c,name:input.companion_name||c.name,instruction:'Keep the same appearance, clothes and character in all relevant scenes. Give this companion a real action matching the illustration. Use only its selected reference cell, never the entire cast.'};}
 return {mode:'custom',description:input.custom_companion||input.companion_type,name:input.companion_name,instruction:'Do not silently replace the requested companion. Ask for clarification if the identity is ambiguous.'};
}
