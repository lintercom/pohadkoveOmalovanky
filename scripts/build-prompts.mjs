import fs from 'node:fs';
import path from 'node:path';

// The supplied document is the only source; do not maintain parallel prompt copies.
const root=path.resolve(import.meta.dirname,'..');
const source=fs.readFileSync(path.join(root,'spec/Ridici_prompt_6_omalovanek_v1_6.md'),'utf8').replaceAll('\r\n','\n');
const section=(start,end)=>{
  const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
  if(a<0||b<0)throw Error('PROMPT_SECTION_MISSING: '+start);
  return source.slice(a+start.length,b).trim();
};
const fenced=text=>{
  const match=text.match(/```text\n([\s\S]*?)\n```/);
  if(!match)throw Error('PROMPT_TEXT_MISSING');
  return match[1];
};
const prompts={
  STORY_PROMPT:fenced(section('## 3. Hlavní řídící prompt','## 4. Pevná instrukce')),
  IMAGE_PROMPT:fenced(section('## 4. Pevná instrukce','## 4.1.')),
  IMAGE_REVIEW_PROMPT:section('## 5.1. Povinná kontrola skutečně vygenerovaných obrázků','## 5.2.'),
  MANUAL_MODE_PROMPT:section('## 5.2. Ruční test z tlačítka „Zkopírovat výsledný prompt“','## 6.'),
  REFERENCE_WORKFLOW_PROMPT:section('## 5. Co dělá web a co dělá AI','## 5.1.').match(/^4\. (.+)$/m)?.[1]
};
// PDF decoration is separate from the supplied story and image instructions.
const design=JSON.parse(fs.readFileSync(path.join(root,'spec/pdf-design.json'),'utf8'));
prompts.PDF_DESIGN_PROMPT=`Vzhled PDF navazuje na web ${design.brand}. Logo je typografické, nikoli nový obrázek: dva řádky „${design.wordmark[0]}“ a „${design.wordmark[1]}“, zaoblené vložené písmo ${design.headingFont}, horní řádek ${design.green}, dolní ${design.ink}, drobné podtržení ve třech barvách ${design.ribbon.join(', ')}. Na první straně umísti toto logo vlevo vedle jediného názvu pohádky a nad názvem malé označení „${design.startLabel}“ v barvě ${design.accent}. Využij stávající prostor záhlaví, nezmenšuj kvůli dekoraci kreslicí plochu. Na dalších stranách neopakuj název příběhu ani úvodní označení. Na všech stranách přidej nenápadný typografický podpis „${design.brand}“ do patičky vlevo a číslo strany vpravo, s drobným ukazatelem 1–6 mezi nimi. Textový panel má téměř bílé pozadí ${design.panel}, tenký obrys ${design.line} a zaoblení přibližně 12 bodů. Běžný text je tmavý ${design.ink}; zachovej 15 bodů a řádkování 21 bodů. Barevná značka a navigační prvky patří jen do sazby PDF mimo ilustraci. Omalovatelné scény zůstávají zcela černobílé a bíle nevyplněné; do obrazových promptů logo, text ani barevné dekorace nevkládej. Tato novější instrukce upravuje pouze grafickou sazbu sešitu, nikoli příběh, šestistránkový rozsah, zvýrazněné barevné fráze nebo pravidla výroby.`;
if(!prompts.REFERENCE_WORKFLOW_PROMPT)throw Error('REFERENCE_WORKFLOW_MISSING');
fs.writeFileSync(path.join(root,'server/prompts.mjs'),'// Generated from spec/Ridici_prompt_6_omalovanek_v1_6.md by scripts/build-prompts.mjs.\n'+Object.entries(prompts).map(([key,value])=>'export const '+key+'='+JSON.stringify(value)+';').join('\n')+'\n');
console.log('Prompts compiled from the supplied v1.6 specification.');
