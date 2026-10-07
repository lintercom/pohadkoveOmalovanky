import { getCompanion, companionContext, CATALOG_VERSION } from './companions.mjs';
export const PRODUCT = Object.freeze({ pages: 6, priceCzk: 80, language: 'cs', rulesVersion: '1.6', maxPhotoBytes: 10 * 1024 * 1024 });
export const IMAGE_SETTINGS = Object.freeze({ model: 'gpt-image-2', quality: 'medium', size: '1536x1024', n: 1 });
export const COLORS = Object.freeze({ red: '#C62828', yellow: '#AD7900', green: '#2E7D32', blue: '#1565C0', purple: '#7B1FA2', pink: '#C83F81', orange: '#C45B00' });
export const THEMES = ['Kouzelný les', 'Zvířecí kamarádi', 'Zatoulaný obláček', 'Podmořský svět', 'Vesmír', 'Dinosauři', 'Vlastní téma'];
export const COMPANIONS = ['Překvapení', 'Pejsek', 'Kočička', 'Králíček', 'Medvídek', 'Malý dráček', 'Vlastní zadání'];

export function validateInput(raw, photo = null) {
  const errors = {};
  const string = (key, max, required = false) => {
    const value = typeof raw?.[key] === 'string' ? raw[key].trim() : '';
    if ((required && !value) || value.length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/u.test(value)) errors[key] = `Vyplňte platnou hodnotu (nejvýše ${max} znaků).`;
    return value;
  };
  const input = {
    child_name: string('child_name', 30, true), child_age: raw?.child_age,
    theme: string('theme', 120, true), custom_theme: string('custom_theme', 120),
    companion_type: string('companion_type', 120), custom_companion: string('custom_companion', 120),
    companion_name: string('companion_name', 60), appearance_description: string('appearance_description', 200, !photo),
    personal_wish: string('personal_wish', 300), requested_scenes:string('requested_scenes',500),
    companion_mode:raw?.companion_mode || (raw?.companion_type==='Bez parťáka'?'none':'custom'),
    companion_id:string('companion_id',60), catalog_version:CATALOG_VERSION
  };
  if (!Number.isInteger(input.child_age) || input.child_age < 3 || input.child_age > 9) errors.child_age = 'Vyberte věk od 3 do 9 let.';
  if (!THEMES.includes(input.theme)) errors.theme = 'Vyberte téma nebo vlastní téma.';
  if (input.theme === 'Vlastní téma' && !input.custom_theme) errors.custom_theme = 'Popište vlastní téma.';
  if (!['none','catalog','custom'].includes(input.companion_mode)) errors.companion_mode='Vyberte parťáka nebo příběh bez parťáka.';
  if (input.companion_mode==='catalog' && !getCompanion(input.companion_id)) errors.companion_id='Vyberte postavu z katalogu.';
  if (input.companion_mode==='custom' && !input.custom_companion && !COMPANIONS.includes(input.companion_type)) errors.custom_companion='Popište vlastního parťáka.';
  if (input.companion_mode==='custom' && input.companion_type==='Vlastní zadání' && !input.custom_companion) errors.custom_companion='Popište vlastního parťáka.';
  if(input.companion_mode!=='catalog')input.companion_id='';
  if(input.companion_mode==='none'){input.companion_type='Bez parťáka';input.companion_name='';input.custom_companion='';}
  if (photo && (!['image/png', 'image/jpeg'].includes(photo.type) || photo.size <= 0 || photo.size > PRODUCT.maxPhotoBytes)) errors.photo = 'Vyberte JPEG nebo PNG do 10 MB.';
  // Client-supplied approval, price, model, page count and photo-present flags are ignored.
  return { valid: !Object.keys(errors).length, input, errors };
}

export function customerData(input, photo, appearanceFromPhoto) {
  return {
    child_name: input.child_name, child_age: input.child_age,
    theme: input.theme === 'Vlastní téma' ? input.custom_theme : input.theme,
    companion_type: input.companion_type === 'Vlastní zadání' ? input.custom_companion : input.companion_type,
    companion_name: input.companion_name, reference_photo_present: !!photo,
    appearance_description: photo ? appearanceFromPhoto : input.appearance_description,
    personal_wish: input.personal_wish,requested_scenes:input.requested_scenes,companion:companionContext(input)
  };
}

export function validateStory(story, childAge) {
  if (story?.status === 'blocked' || story?.status === 'needs_review') throw new Error('STORY_NOT_APPROVED');
  if (story?.status !== 'ready' || story.language !== 'cs' || story.child_age !== childAge) throw new Error('INVALID_STORY');
  if (typeof story.title_cs !== 'string' || !story.title_cs.trim() || story.title_cs.trim().split(/\s+/u).length > 8) throw new Error('INVALID_STORY_TITLE');
  const difficulty = childAge <= 4 ? 'preschool' : childAge <= 6 ? 'early_school' : 'school';
  if (story.difficulty !== difficulty || !Array.isArray(story.pages) || story.pages.length !== PRODUCT.pages) throw new Error('INVALID_PAGE_COUNT_OR_DIFFICULTY');
  if (!Array.isArray(story.characters) || story.characters.length < 1 || story.characters.length > 3) throw new Error('INVALID_CHARACTERS');
  const ids = new Set(story.characters.map(c => c.id));
  if (ids.size !== story.characters.length || !ids.has('child')) throw new Error('INVALID_CHARACTERS');
  const range = childAge <= 4 ? [25,40] : childAge <= 6 ? [35,50] : [45,65];
  for (const [index, page] of story.pages.entries()) {
    if (page.page_number !== index + 1 || Object.hasOwn(page,'title_cs')) throw new Error('INVALID_PAGE_NUMBER_OR_SCENE_TITLE');
    if (typeof page.story_text_cs !== 'string' || typeof page.image_prompt_en !== 'string' || !page.image_prompt_en.trim() || typeof page.scene_description_cs !== 'string' || !page.scene_description_cs.trim()) throw new Error('INVALID_SCENE');
    const words = page.story_text_cs.trim().split(/\s+/u).length;
    if (words < range[0] || words > range[1]) throw new Error('INVALID_TEXT_LENGTH');
    if (!Array.isArray(page.character_ids) || !page.character_ids.length || page.character_ids.some(id => !ids.has(id))) throw new Error('INVALID_CHARACTER_REFERENCE');
    const target = page.color_target;
    if (!target || !Object.hasOwn(COLORS,target.color_en) || typeof target.phrase_cs !== 'string' || !target.phrase_cs.trim() || !page.story_text_cs.includes(target.phrase_cs) || !target.object_cs || !target.color_cs || !target.phrase_cs.includes(target.color_cs) || !target.phrase_cs.includes(target.object_cs)) throw new Error('INVALID_COLOR_TARGET');
    const stems = {red:'červen',yellow:'žlut',green:'zelen',blue:'modr',purple:'fialov',pink:'růžov',orange:'oranžov'};
    if (!target.color_cs.toLowerCase().startsWith(stems[target.color_en])) throw new Error('COLOR_MISMATCH');
  }
  return story;
}

export function escapeHtml(value) { return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
export function renderStoryText(page) {
  const target = page.color_target;
  if (!target || !Object.hasOwn(COLORS,target.color_en) || !target.phrase_cs || !page.story_text_cs.includes(target.phrase_cs)) throw new Error('INVALID_COLOR_TARGET');
  const index = page.story_text_cs.indexOf(target.phrase_cs);
  return escapeHtml(page.story_text_cs.slice(0,index))+`<strong style="color:${COLORS[target.color_en]}">${escapeHtml(target.phrase_cs)}</strong>`+escapeHtml(page.story_text_cs.slice(index+target.phrase_cs.length));
}
