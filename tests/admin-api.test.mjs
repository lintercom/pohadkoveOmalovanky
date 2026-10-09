import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdminApi } from '../server/admin-api.mjs';
const id='00000000-0000-4000-8000-000000000001';
const reply=(data,status=200)=>Response.json(data,{status});
const request=(route,body)=>new Request('https://example.com/admin/'+route,{method:body===undefined?'GET':'POST',headers:{authorization:'Bearer token','content-type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
test('private endpoints require verified membership before reading or writing',async()=>{
  let touched=false;
  const handle=createAdminApi({verifyAdmin:async()=>null,adminOverview:async()=>{touched=true;}});
  for(const route of ['overview','settings','orders','checks']) assert.equal((await handle(request(route),route,reply)).status,401);
  assert.equal((await handle(request('pdf',{id}),'pdf',reply)).status,401);
  assert.equal(touched,false);
});
test('admin settings whitelist fields and enforce bounded limits',async()=>{
  let saved;
  const handle=createAdminApi({verifyAdmin:async()=>({user_id:id}),adminSaveSettings:async s=>saved=s});
  assert.equal((await handle(request('settings',{minute_limit:101,day_limit:300}),'settings',reply)).status,400);
  assert.equal((await handle(request('settings',{minute_limit:30,day_limit:300,secret:'discard'}),'settings',reply)).status,200);
  assert.deepEqual(saved,{minute_limit:30,day_limit:300});
});
test('order notes preserve author, oversized input and unfinished PDFs are rejected',async()=>{
  let saved,downloads=0;
  const handle=createAdminApi({verifyAdmin:async()=>({user_id:id}),adminOrder:async()=>({status:'queued',pdf_key:'private.pdf'}),adminSaveNote:async(...args)=>saved=args,getPrivate:async()=>{downloads++;}});
  assert.equal((await handle(request('note',{id,note:'x'.repeat(2001)}),'note',reply)).status,400);
  assert.equal((await handle(request('note',{id,note:'Prověřit'}),'note',reply)).status,200);
  assert.deepEqual(saved,[id,'Prověřit',id]);
  assert.equal((await handle(request('pdf',{id}),'pdf',reply)).status,409);
  assert.equal(downloads,0);
  assert.equal((await handle(request('note',{id,note:'x'.repeat(9000)}),'note',reply)).status,413);
});
test('invalid filters never reach database and pagination is bounded',async()=>{
  let calls=0;
  const handle=createAdminApi({verifyAdmin:async()=>({user_id:id}),adminList:async()=>{calls++;return Array.from({length:26},()=>({id}));}});
  assert.equal((await handle(request('orders?status=injected'),'orders',reply)).status,400);
  assert.equal(calls,0);
  const data=await (await handle(request('orders'),'orders',reply)).json();
  assert.equal(data.rows.length,25); assert.equal(data.has_more,true);
});
