const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const publicRoot=path.join(root,'dist');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.pdf':'application/pdf','.webp':'image/webp','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.json':'application/json'};
const assets={};
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(['server','.openai','_appgen_meta'].includes(entry.name))continue;const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else{const key='/'+path.relative(publicRoot,file).split(path.sep).join('/');assets[key]={type:mime[path.extname(file)]||'application/octet-stream',base64:fs.readFileSync(file).toString('base64')};}}}
walk(publicRoot);
const dest=path.join(publicRoot,'server');fs.mkdirSync(dest,{recursive:true});
for(const name of ['product','companions','preflight','payment-webhook','worker'])fs.copyFileSync(path.join(root,'server',name+'.mjs'),path.join(dest,name+'.mjs'));
fs.writeFileSync(path.join(dest,'index.js'),`import {createWorker} from './worker.mjs';\nexport default createWorker(${JSON.stringify(assets)});\n`);
fs.writeFileSync(path.join(dest,'package.json'),'{"type":"module"}\n');
console.log(`Worker built with ${Object.keys(assets).length} public assets; no customer data or secrets embedded.`);
