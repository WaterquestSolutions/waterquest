import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('public');
const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));
const catalogue=JSON.parse(fs.readFileSync('private-downloads/catalogue.json','utf8'));
const guides=JSON.parse(fs.readFileSync('scripts/guide-manifest.json','utf8'));
const pages=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(p.endsWith('.html'))pages.push(p);}}
walk(root);
const redirects=new Map(config.redirects.filter(r=>!r.source.includes(':')).map(r=>[r.source,r.destination]));
function resolve(url){
 let route=decodeURIComponent(url.pathname);
 for(let i=0;i<5&&redirects.has(route);i++)route=redirects.get(route);
 if(route.startsWith('/api/'))return true;
 if(route.startsWith('/downloads/')&&catalogue[route.slice(11)])return fs.existsSync(path.join('private-downloads',route.slice(11)));
 const rel=route.replace(/^\//,'');
 return [rel,rel+'.html',path.join(rel,'index.html')].some(p=>fs.existsSync(path.join(root,p))&&fs.statSync(path.join(root,p)).isFile());
}
const errors=[];let links=0;
for(const file of pages){
 const source=fs.readFileSync(file,'utf8');
 const route='/'+path.relative(root,file).replace(/index\.html$/,'');
 for(const m of source.matchAll(/<(?:a|img|script|link)\b[^>]*?\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)){
  const raw=m[1].replaceAll('&amp;','&');
  if(raw.startsWith('#')||raw.startsWith('data:'))continue;
  let url;try{url=new URL(raw,'https://temporary-turbo-nickel-8xnl9g7.vercel.app'+route);}catch{continue;}
  if(!['temporary-turbo-nickel-8xnl9g7.vercel.app','waterquest-palette-20261016.vercel.app'].includes(url.hostname))continue;
  links++;if(!resolve(url))errors.push({file:path.relative(root,file),url:raw});
 }
}
for(const guide of guides){
 const source=fs.readFileSync(path.join(root,guide.file),'utf8');
 if(!source.includes('id="guide-application"'))errors.push({file:guide.file,error:'Missing application guidance'});
 for(const product of guide.products){
  const source=fs.readFileSync(path.join(root,product,'index.html'),'utf8');
  if(!source.includes('/knowledge-hub/'+guide.slug+'/'))errors.push({file:product,error:'Missing reciprocal guide link'});
 }
}
for(const file of Object.keys(catalogue)){
 if(!fs.existsSync(path.join('private-downloads',file)))errors.push({file,error:'Missing gated document'});
 if(fs.existsSync(path.join('public/downloads',file)))errors.push({file,error:'Document bypasses email gate'});
}
if(guides.length!==129)errors.push({error:'Expected 129 guides'});
if(errors.length){console.error(JSON.stringify(errors,null,2));process.exit(1);}
console.log(`PASS: ${pages.length} HTML pages, ${guides.length} guides, ${links} local references, reciprocal product links and ${Object.keys(catalogue).length} gated documents.`);
