import { PRODUCT, IMAGE_SETTINGS } from './product.mjs';
import { requireApproval } from './preflight.mjs';
import { IMAGE_REVIEW_PROMPT } from './prompts.mjs';
const hash=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(n=>n.toString(16).padStart(2,'0')).join('');
const terminal=new Set(['ready','needs_action','refund_pending','refunded','payment_failed','expired']);
const channels=new Set(['direct','organic','paid_search','social','partner','other']);
const event=(state,order,name)=>{const key=order.id+':'+name;if(!state.metrics[key])state.metrics[key]={orderId:order.id,name,audience:'parent',source:order.source,at:Date.now()};};
export function createOrderEngine({store,preflightServices,provider,clock=Date.now,retentionDays=30,concurrency=1}){
 if(!store||!Number.isInteger(concurrency)||concurrency<1||!Number.isInteger(retentionDays)||retentionDays<1)throw Error('INVALID_RUNTIME');
 const change=(id,fn)=>store.transaction(s=>{const o=s.orders[id];if(!o)throw Error('ORDER_NOT_FOUND');return fn(o,s);});
 return {
  async create({approvalToken,input,photo=null,source='direct'}){
   const approved=await requireApproval(approvalToken,input,photo,preflightServices);const token=crypto.randomUUID()+crypto.randomUUID();const accessHash=await hash(token);
   const id=store.transaction(s=>{
    // Same approved submission cannot create multiple payable orders on refresh.
    if(Object.values(s.orders).some(o=>o.approvalToken===approvalToken))throw Error('ORDER_ALREADY_EXISTS');
    const id=crypto.randomUUID();s.orders[id]={id,approvalToken,fingerprint:approved.fingerprint,status:'awaiting_payment',amount:PRODUCT.priceCzk*100,currency:'czk',accessHash,createdAt:clock(),expiresAt:clock()+retentionDays*86400000,source:channels.has(source)?source:'other',attempts:{},costCzk:0,reservedCzk:0,budgetCzk:preflightServices.orderBudget,completed:[],outbox:false,leaseUntil:0,provider,rulesVersion:PRODUCT.rulesVersion};return id;
   });return {id,accessToken:token,status:'awaiting_payment'};
  },
  acceptPayment(verifiedEvent){
   // Call only after server signature verification, never with client JSON.
   if(!verifiedEvent?.id||!verifiedEvent.paymentId||!verifiedEvent.orderId)throw Error('INVALID_PAYMENT_EVENT');
   return store.transaction(s=>{
    if(s.events[verifiedEvent.id])return {duplicate:true};const o=s.orders[verifiedEvent.orderId];if(!o)throw Error('ORDER_NOT_FOUND');
    if(verifiedEvent.amount!==o.amount||verifiedEvent.currency!==o.currency)throw Error('PAYMENT_MISMATCH');
    if(verifiedEvent.type==='payment_failed'){if(o.status==='awaiting_payment'){o.status='payment_failed';event(s,o,'payment_failed');}s.events[verifiedEvent.id]=o.id;return {status:o.status};}
    if(verifiedEvent.type!=='paid')throw Error('INVALID_PAYMENT_TYPE');
    if(o.paymentId&&o.paymentId!==verifiedEvent.paymentId)throw Error('SECOND_PAYMENT_REQUIRES_REVIEW');
    if(Object.values(s.orders).some(x=>x.id!==o.id&&x.paymentId===verifiedEvent.paymentId))throw Error('PAYMENT_ALREADY_ASSIGNED');
    s.events[verifiedEvent.id]=o.id;
    if(o.paymentId)return {duplicate:true};o.paymentId=verifiedEvent.paymentId;o.status=o.expiresAt<=clock()?'needs_action':'queued';o.reason=o.expiresAt<=clock()?'PAYMENT_AFTER_EXPIRY':null;o.outbox=o.status==='queued';event(s,o,'purchase');return {status:o.status};
   });
  },
  pending(){return store.transaction(s=>Object.values(s.orders).filter(o=>o.outbox&&!terminal.has(o.status)).map(o=>o.id));},
  async status(id,token){const tokenHash=await hash(token||'');return change(id,o=>{if(o.accessHash!==tokenHash||o.expiresAt<=clock())throw Error('ACCESS_DENIED');return {id:o.id,status:o.status,completedStages:[...o.completed],canDownload:o.status==='ready',remedy:o.status==='needs_action'?'Upravit zadání po domluvě nebo požádat o vrácení platby.':null};});},
  async file(id,token,storage){await this.status(id,token);const key=change(id,o=>{if(o.status!=='ready'||!o.pdfKey)throw Error('NOT_READY');return o.pdfKey;});return storage.getPrivate(key);},
  async run(id,adapters){
   const leaseId=crypto.randomUUID();
   const claimed=store.transaction(s=>{
    const o=s.orders[id];if(!o||!o.paymentId||terminal.has(o.status)||o.leaseUntil>clock())return false;
    if(Object.values(s.orders).filter(x=>x.leaseUntil>clock()).length>=concurrency)return false;
    if(Object.values(o.attempts).some(a=>a.status==='pending')){o.status='needs_action';o.reason='UNCERTAIN_PRIOR_ATTEMPT';o.outbox=false;event(s,o,'failed');return false;}
    o.leaseId=leaseId;o.leaseUntil=clock()+300000;o.status='generating';return true;
   });if(!claimed)return {claimed:false};
   const stages=['story','image:1','image:2','image:3','image:4','image:5','image:6','pdf'];
   try{
    for(const stage of stages){
     const reservation=change(id,o=>{
      if(o.status!=='generating'||o.leaseId!==leaseId||o.leaseUntil<=clock())throw Error('LEASE_LOST');if(o.completed.includes(stage))return null;
      const estimate=adapters.estimate(stage);if(!Number.isFinite(estimate)||estimate<0||o.costCzk+o.reservedCzk+estimate>o.budgetCzk)throw Error('BUDGET_LIMIT');
      if(o.attempts[stage])throw Error('ATTEMPT_ALREADY_EXISTS');
      const attempt={id:crypto.randomUUID(),status:'pending',estimate,startedAt:clock(),model:stage.startsWith('image:')?IMAGE_SETTINGS.model:adapters.textModel||'local',quality:stage.startsWith('image:')?IMAGE_SETTINGS.quality:null,size:stage.startsWith('image:')?IMAGE_SETTINGS.size:null};o.attempts[stage]=attempt;o.reservedCzk+=estimate;o.leaseUntil=clock()+300000;return {...attempt};
     });if(!reservation)continue;
     // Actual provider calls belong to configured adapters. A timeout leaves the
     // recorded attempt uncertain and is never automatically paid again.
     const verifiedImages=change(id,o=>Object.entries(o.attempts).filter(([key,a])=>key.startsWith('image:')&&a.visualReview?.passed===true).map(([key,a])=>({pageNumber:Number(key.split(':')[1]),outputKey:a.outputKey})));
     const receipt=await adapters.execute({orderId:id,stage,idempotencyKey:reservation.id,imageSettings:IMAGE_SETTINGS,verifiedImages,reviewInstructions:IMAGE_REVIEW_PROMPT});
     const stop=change(id,o=>{
      if(o.leaseId!==leaseId)throw Error('LEASE_LOST');const a=o.attempts[stage];
      if(!receipt||!Number.isFinite(receipt.costCzk)||receipt.costCzk<0||!receipt.requestId||!receipt.outputKey)throw Error('INVALID_COST_RECEIPT');
      a.status='complete';a.requestId=receipt.requestId;a.usage=Object.fromEntries(Object.entries(receipt.usage||{}).filter(([k,v])=>['input_tokens','output_tokens','total_tokens'].includes(k)&&Number.isFinite(v)&&v>=0));a.costCzk=receipt.costCzk;a.outputKey=receipt.outputKey;a.completedAt=clock();o.costCzk+=receipt.costCzk;o.reservedCzk-=a.estimate;o.completed.push(stage);
      if(o.status!=='generating'||o.leaseUntil<=clock())return 'LEASE_LOST';
      if(o.costCzk>o.budgetCzk)return 'BUDGET_EXCEEDED';
      if(stage.startsWith('image:')){
       const review=receipt.visualReview;
       if(review?.outputKey!==receipt.outputKey||review.passed!==true||['matchesText','consistentIdentity','consistentEquipment','worldRules','coloringStyle'].some(key=>review[key]!==true))return 'IMAGE_REVIEW_REQUIRED';
       a.visualReview={passed:true};
      }
      if(stage==='pdf'){
       if(receipt.verifiedPages!==6)return 'INVALID_PDF';
       const review=receipt.illustrationsReview,pdf=receipt.pdfReview,keys=verifiedImages.map(image=>image.outputKey);
       if(keys.length!==6||review?.passed!==true||review.distinctScenes!==true||review.consistentIdentityAndEquipment!==true||!Array.isArray(review.outputKeys)||review.outputKeys.length!==6||new Set(review.outputKeys).size!==6||keys.some(key=>!review.outputKeys.includes(key)))return 'ILLUSTRATIONS_REVIEW_REQUIRED';
       if(pdf?.outputKey!==receipt.outputKey||pdf.passed!==true||['sixPages','singleTitle','visibleContent','correctColorPhrases','embeddedCzechFont','noUnintendedCropping'].some(key=>pdf[key]!==true))return 'PDF_REVIEW_REQUIRED';
       a.pdfReviewed=true;o.pdfKey=receipt.outputKey;
      }
      return null;
     });
     if(stop)throw Error(stop);
    }
    change(id,(o,s)=>{if(o.status!=='generating'||o.leaseId!==leaseId||o.leaseUntil<=clock())throw Error('LEASE_LOST');o.status='ready';o.outbox=false;o.leaseUntil=0;event(s,o,'generation_ready');});return {status:'ready'};
   }catch(error){change(id,(o,s)=>{if(o.leaseId!==leaseId)return;o.status='needs_action';o.outbox=false;o.leaseUntil=0;o.reason=['PROVIDER_REFUSED','BUDGET_LIMIT','BUDGET_EXCEEDED','INVALID_PDF','IMAGE_REVIEW_REQUIRED','ILLUSTRATIONS_REVIEW_REQUIRED','PDF_REVIEW_REQUIRED'].includes(error.code||error.message)?(error.code||error.message):'CHECK_REQUIRED';event(s,o,'failed');s.audit.push({orderId:id,reason:o.reason,provider,rulesVersion:PRODUCT.rulesVersion,at:clock()});});return {status:'needs_action'};}
  },
  async requestRefund(id,token){await this.status(id,token);return change(id,o=>{if(o.status==='refund_pending'||o.status==='refunded')return {status:o.status};if(o.status!=='needs_action')throw Error('REFUND_NOT_AVAILABLE');o.status='refund_pending';o.refundKey='refund:'+o.id;return {status:o.status,idempotencyKey:o.refundKey};});},
  confirmRefund(id,providerRefundId){if(!providerRefundId)throw Error('REFUND_NOT_VERIFIED');return change(id,(o,s)=>{if(o.status==='refunded')return;if(o.status!=='refund_pending')throw Error('INVALID_REFUND_STATE');o.refundId=providerRefundId;o.status='refunded';event(s,o,'refund');});},
  async expire(storage){const expired=store.transaction(s=>Object.values(s.orders).filter(o=>o.expiresAt<=clock()).map(o=>({id:o.id,keys:Object.values(o.attempts).map(a=>a.outputKey).filter(Boolean)})));for(const item of expired){for(const key of item.keys)await storage.deletePrivate(key);change(item.id,o=>{o.status='expired';o.accessHash='';o.pdfKey=null;for(const a of Object.values(o.attempts))delete a.outputKey;});}return expired.length;}
 };
}
