const http=require('http'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'dist');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.webp':'image/webp','.pdf':'application/pdf','.svg':'image/svg+xml'};
http.createServer(async(req,res)=>{
  let relative;
  try{relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  if(relative.startsWith('/api/')){
    try{
      const {handleApi}=await import('./server/worker.mjs');
      const options={method:req.method,headers:req.headers};
      if(!['GET','HEAD'].includes(req.method)){options.body=req;options.duplex='half';}
      const response=await handleApi(new Request('http://127.0.0.1:4173'+req.url,options));
      res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
    }catch{res.writeHead(500).end('Request failed');}return;
  }
  const file=path.resolve(root,'.'+(relative==='/'?'/index.html':relative));
  if(!file.startsWith(root+path.sep)||relative.startsWith('/server/')){res.writeHead(403).end();return;}
  fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:data);});
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
