export async function verifyStripeSignature(raw,header,secret,now=Math.floor(Date.now()/1000)){
 if(!secret||typeof raw!=='string'||raw.length>262144)throw Error('INVALID_WEBHOOK');
 const parts=String(header||'').split(',').map(p=>p.trim().split('='));const timestamps=parts.filter(([k])=>k==='t');
 if(timestamps.length!==1)throw Error('INVALID_SIGNATURE');const time=Number(timestamps[0][1]);if(!Number.isInteger(time)||Math.abs(now-time)>300)throw Error('EXPIRED_SIGNATURE');
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 let valid=false;for(const [kind,value] of parts){if(kind!=='v1'||!/^[a-f0-9]{64}$/i.test(value))continue;const bytes=Uint8Array.from(value.match(/../g).map(s=>parseInt(s,16)));if(await crypto.subtle.verify('HMAC',key,bytes,new TextEncoder().encode(time+'.'+raw)))valid=true;}
 if(!valid)throw Error('INVALID_SIGNATURE');return JSON.parse(raw);
}
export async function handlePaymentWebhook(request,{secret,engine,resolvePayment,liveMode=false}){
 if(!secret||!engine||typeof resolvePayment!=='function')return new Response('Payment integration unavailable',{status:503});
 if(request.method!=='POST')return new Response('Method not allowed',{status:405});
 if(Number(request.headers.get('content-length'))>262144)return new Response('Too large',{status:413});
 const reader=request.body?.getReader();let size=0;const chunks=[];if(reader)for(;;){const r=await reader.read();if(r.done)break;size+=r.value.length;if(size>262144){await reader.cancel();return new Response('Too large',{status:413});}chunks.push(r.value);}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
 try{const payload=await verifyStripeSignature(new TextDecoder().decode(bytes),request.headers.get('stripe-signature'),secret);if(payload.livemode!==liveMode)throw Error('MODE_MISMATCH');if(!['payment_intent.succeeded','payment_intent.payment_failed'].includes(payload.type))return new Response('Ignored',{status:200});const payment=await resolvePayment(payload);if(payment.id!==payload.id)throw Error('EVENT_MISMATCH');engine.acceptPayment(payment);return new Response('Accepted',{status:200});}catch(error){return new Response(error.message==='INVALID_SIGNATURE'||error.message==='EXPIRED_SIGNATURE'?'Invalid signature':'Webhook requires review',{status:error.message==='INVALID_SIGNATURE'||error.message==='EXPIRED_SIGNATURE'?400:409});}
}
