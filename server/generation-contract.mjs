import { requireApproval } from './preflight.mjs';
import { customerData, validateStory, IMAGE_SETTINGS } from './product.mjs';
import { STORY_PROMPT, IMAGE_PROMPT } from './prompts.mjs';

// Integration contract only: no API, payment or image generation is invoked here.
export async function prepareStoryRequest({token,input,photo=null,appearanceFromPhoto='',orderId},services) {
  const approval = await requireApproval(token,input,photo,services);
  if (typeof services.verifyPayment !== 'function' || await services.verifyPayment({orderId,approvalToken:token,fingerprint:approval.fingerprint}) !== true) throw new Error('PAYMENT_NOT_VERIFIED');
  if (photo && !appearanceFromPhoto.trim()) throw new Error('PHOTO_DESCRIPTION_REQUIRED');
  return {messages:[
    {role:'developer',content:STORY_PROMPT+'\nPREFLIGHT_STATUS=approved'},
    {role:'user',content:JSON.stringify(customerData(approval.input,photo,appearanceFromPhoto))}
  ]};
}

export function createImageJobs(story,age,references=[]) {
  validateStory(story,age);
  if (references.some(ref=>!(ref instanceof Blob))) throw new Error('ACTUAL_IMAGE_REFERENCES_REQUIRED');
  return story.pages.map(page=>({pageNumber:page.page_number,endpoint:references.length?'edits':'generations',maxAttempts:1,
    body:{...IMAGE_SETTINGS,prompt:IMAGE_PROMPT+'\n'+JSON.stringify({child_age:age,difficulty:story.difficulty,characters:story.characters,recurring_objects:story.recurring_objects||[],page}),...(references.length?{image:references}:{})}}));
}
