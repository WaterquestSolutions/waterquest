import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
const {default:download}=await import('../api/product-download.js');
const root=path.resolve('public');
const config=JSON.parse(fs.readFileSync('vercel.json'));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.pdf':'application/pdf','.json':'application/json','.csv':'text/csv; charset=utf-8','.txt':'text/plain; charset=utf-8','.xml':'application/xml','.ico':'image/x-icon'};
http.createServer(async(req,res)=>{
 try{
  const u=new URL(req.url,'http://localhost');let route=decodeURIComponent(u.pathname);
  if(route.startsWith('/downloads/')&&/\.(pdf|zip)$/.test(route))return await download(req,res);
  if(route.startsWith('/api/')){res.statusCode=503;res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({ok:false,error:'service_not_configured',message:'This local review does not submit enquiries. Use the email draft option.'}));}
  const redirect=config.redirects.find(r=>r.source===route);if(redirect){res.statusCode=redirect.statusCode||308;res.setHeader('Location',redirect.destination);return res.end();}
  let file=path.resolve(root,'.'+route);if(!file.startsWith(root+path.sep)&&file!==root){res.statusCode=403;return res.end();}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.statusCode=404;return res.end('Page not found');}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');if(req.method==='HEAD')return res.end();fs.createReadStream(file).pipe(res);
 }catch{if(!res.headersSent)res.statusCode=400;res.end('Invalid request');}
}).listen(8767,'127.0.0.1',()=>console.log('Local review: http://127.0.0.1:8767 — enquiry submission disabled'));
