import { handlePaymentWebhook } from './payment-webhook.mjs';
import { preflight, unavailable } from './preflight.mjs';
import { PRODUCT } from './product.mjs';
const json = (data,status=200) => new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex','x-content-type-options':'nosniff'}});
async function readBounded(request,max) {
  if (Number(request.headers.get('content-length')) > max) throw new Error('TOO_LARGE');
  const reader=request.body?.getReader(); if(!reader) return new Uint8Array();
  const chunks=[]; let length=0;
  for (;;) { const {done,value}=await reader.read(); if(done)break; length+=value.length;if(length>max){await reader.cancel();throw new Error('TOO_LARGE');}chunks.push(value); }
  const body=new Uint8Array(length);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length;}return body;
}
export async function handleApi(request,services={}) {
  const url=new URL(request.url);
  if(url.pathname==='/api/payments/webhook'){if(!services.webhook)return json(unavailable(),503);const r=await handlePaymentWebhook(request,services.webhook);r.headers.set('cache-control','no-store');r.headers.set('x-robots-tag','noindex');return r;}
  const orderRoute=url.pathname.match(/^\/api\/orders\/([a-zA-Z0-9-]+)(\/pdf)?$/);
  if(orderRoute){if(request.method!=='GET')return json({error:'METHOD_NOT_ALLOWED'},405);if(!services.engine)return json(unavailable(),503);const token=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';try{if(orderRoute[2]){if(!services.storage)return json(unavailable(),503);const file=await services.engine.file(orderRoute[1],token,services.storage);return new Response(file,{headers:{'content-type':'application/pdf','content-disposition':'attachment; filename=pohadka.pdf','cache-control':'no-store','x-robots-tag':'noindex','x-content-type-options':'nosniff'}});}return json(await services.engine.status(orderRoute[1],token));}catch{return json({error:'RESULT_UNAVAILABLE'},404);}}
  if (url.pathname === '/api/readiness' && request.method === 'GET') return json(unavailable());
  if (url.pathname === '/api/preflight') {
    if(request.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
    const origin=request.headers.get('origin');
    if(origin && origin!==url.origin)return json({error:'ORIGIN_NOT_ALLOWED'},403);
    try {
      const bytes=await readBounded(request,PRODUCT.maxPhotoBytes+64*1024);
      const bodyRequest=new Request(url,{method:'POST',headers:{'content-type':request.headers.get('content-type')||''},body:bytes});
      let input,photo=null;
      if((request.headers.get('content-type')||'').startsWith('multipart/form-data')) {
        const form=await bodyRequest.formData();const fields=form.get('input');if(typeof fields!=='string')throw new Error('INVALID_INPUT');input=JSON.parse(fields);const file=form.get('photo');if(file && typeof file!=='string' && file.size)photo=file;
      } else { input=await bodyRequest.json(); }
      return json(await preflight(input,photo,services.preflight));
    } catch(e) {return json({outcome:'clarify',label_cs:'Potřebujeme upřesnění',status:'needs_review',can_generate:false,reason_codes:['INVALID_INPUT'],message_cs:e.message==='TOO_LARGE'?'Fotografie nebo zadání jsou příliš velké.':'Zadání nelze přečíst. Zkontrolujte vyplněné údaje.',suggested_alternative_cs:null},e.message==='TOO_LARGE'?413:400);}
  }
  // Payment and generation cannot be reached by setting approved=true in a browser.
  if (['/api/checkout','/api/generate'].includes(url.pathname)) return json(unavailable(),503);
  return json({error:'NOT_FOUND'},404);
}
export function createWorker(assets,services={}) {
 return {async fetch(request){
  const url=new URL(request.url),pathname=url.pathname;
  if(pathname.startsWith('/api/'))return handleApi(request,services);
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
  if(pathname.endsWith('/index.html'))return Response.redirect(new URL(pathname.slice(0,-10)+url.search,url),308);
  if(!pathname.endsWith('/')&&assets[pathname+'/index.html'])return Response.redirect(new URL(pathname+'/'+url.search,url),308);
  const key=pathname.endsWith('/')?pathname+'index.html':pathname;
  const found=!pathname.startsWith('/server/')&&assets[key];
  const file=found||assets['/404.html'];
  if(!file)return new Response('Not found',{status:404});
  const bytes=Uint8Array.from(atob(file.base64),c=>c.charCodeAt(0));
  return new Response(request.method==='HEAD'?null:bytes,{status:found?200:404,headers:{'content-type':file.type,'cache-control':'no-cache','x-content-type-options':'nosniff'}});
 }};
}
