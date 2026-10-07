import { preflight, unavailable } from './preflight.mjs';
import { PRODUCT } from './product.mjs';
const json = (data,status=200) => new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
async function readBounded(request,max) {
  if (Number(request.headers.get('content-length')) > max) throw new Error('TOO_LARGE');
  const reader=request.body?.getReader(); if(!reader) return new Uint8Array();
  const chunks=[]; let length=0;
  for (;;) { const {done,value}=await reader.read(); if(done)break; length+=value.length;if(length>max){await reader.cancel();throw new Error('TOO_LARGE');}chunks.push(value); }
  const body=new Uint8Array(length);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length;}return body;
}
export async function handleApi(request) {
  const url=new URL(request.url);
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
      return json(await preflight(input,photo));
    } catch(e) {return json({status:'blocked',can_generate:false,reason_codes:['INVALID_INPUT'],message_cs:e.message==='TOO_LARGE'?'Fotografie nebo zadání jsou příliš velké.':'Zadání nelze přečíst. Zkontrolujte vyplněné údaje.',suggested_alternative_cs:null},e.message==='TOO_LARGE'?413:400);}
  }
  // Payment and generation cannot be reached by setting approved=true in a browser.
  if (['/api/checkout','/api/generate'].includes(url.pathname)) return json(unavailable(),503);
  return json({error:'NOT_FOUND'},404);
}
export function createWorker(assets) {
  return { async fetch(request) {
    const url=new URL(request.url);
    if(url.pathname.startsWith('/api/'))return handleApi(request);
    if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
    const file=assets[url.pathname==='/'?'/index.html':url.pathname];
    if(!file)return new Response('Not found',{status:404});
    const bytes=Uint8Array.from(atob(file.base64),c=>c.charCodeAt(0));
    return new Response(request.method==='HEAD'?null:bytes,{headers:{'content-type':file.type,'cache-control':'no-cache','x-content-type-options':'nosniff'}});
  }};
}
