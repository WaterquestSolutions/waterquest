import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { prepareSubmission, acceptedResponse } from '../lib/intake.js';

const root=path.join(process.cwd(),'private-downloads');
const logoMarkup=fs.readFileSync(path.join(root,'logo.svg'),'utf8');
const catalogue=JSON.parse(fs.readFileSync(path.join(root,'catalogue.json'),'utf8'));
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function form(res,item,file,status=200,error='',email=''){
 res.statusCode=status;res.setHeader('Content-Type','text/html; charset=utf-8');
 res.end(`<!doctype html><html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Download ${escape(item.title)} | WaterQuest Solutions</title><style>*{box-sizing:border-box}body{margin:0;background:#0E284A;color:white;font:17px/1.6 Arial,sans-serif}header{padding:24px max(24px,calc((100vw - 1120px)/2));border-bottom:1px solid #778FA8}header a{color:white;font-weight:700;text-decoration:none}main{max-width:660px;margin:60px auto;padding:32px;border:1px solid #778FA8;border-top:3px solid #00EEFF;border-radius:12px}h1{font-size:32px;line-height:1.2;margin:14px 0 20px}.label{color:#00EEFF;font-weight:bold;font-size:13px;letter-spacing:2px}label{display:block;font-weight:bold;margin-top:26px}input[type=email]{width:100%;padding:14px;margin:8px 0 18px;border:1px solid #778FA8;border-radius:5px;font:inherit;background:white;color:#0E284A}button{width:100%;padding:15px;background:#00EEFF;color:#0E284A;border:0;border-radius:5px;font:700 17px Arial;cursor:pointer}button:disabled{opacity:.65}.note{font-size:14px;color:#dbe6ef}.error{color:#ffcebd;padding:12px;border:1px solid #ffcebd}a{color:#00EEFF}.trap{position:absolute;left:-10000px}footer{max-width:660px;margin:25px auto;padding:0 32px;font-size:13px;color:#c5d2de}a:focus-visible,button:focus-visible,input:focus-visible{outline:3px solid #00EEFF;outline-offset:4px}@media(max-width:700px){main{margin:28px 16px;padding:24px}h1{font-size:27px}}</style></head><body><header><a href="/" aria-label="WaterQuest Solutions home">${logoMarkup}</a></header><main><span class="label">PRODUCT LITERATURE</span><h1>${escape(item.title)}</h1><p>Enter your email address to download ${item.type==='zip'?'the complete product literature collection':'this product information'}.</p>${error?`<p class="error" role="alert">${escape(error)}</p>`:''}<form method="post" action="/downloads/${escape(file)}"><label for="download-email">Email address</label><input type="email" id="download-email" name="email" value="${escape(email)}" autocomplete="email" maxlength="100" required placeholder="you@company.com"><div class="trap" aria-hidden="true"><label>Leave this blank<input name="website" tabindex="-1" autocomplete="off"></label></div><p class="note">WaterQuest Solutions will record your email address and the product information requested to respond to your interest. This request does not subscribe you to a newsletter.</p><button type="submit">Download ${item.type==='zip'?'all product PDFs (ZIP)':'product information (PDF)'}</button><p class="note" role="status" id="download-status"></p></form><p><a href="${escape(item.page||'/downloads/product-literature/')}">Back to ${item.page?'product':'product literature'}</a></p></main><footer>WaterQuest Solutions<br>558 East Kent Ave S, Vancouver, BC V5X 4V6<br><a href="mailto:bruce@waterquestsolutions.com">bruce@waterquestsolutions.com</a></footer><script>document.querySelector('form').addEventListener('submit',function(){if(this.checkValidity()){document.getElementById('download-status').textContent='Preparing your download. It will start after your request is received.';}});</script></body></html>`);
}
export async function readPayload(req){
 const type=(req.headers['content-type']||'').toLowerCase();
 if(!type.startsWith('application/x-www-form-urlencoded')&&!type.startsWith('application/json'))throw Error('unsupported_type');
 if(req.body&&typeof req.body==='object'&&!Buffer.isBuffer(req.body)){if(Buffer.byteLength(JSON.stringify(req.body))>4096)throw Error('too_large');return req.body;}
 let text=typeof req.body==='string'?req.body:'';
 if(!text)for await(const chunk of req){text+=chunk.toString();if(Buffer.byteLength(text)>4096)throw Error('too_large');}
 if(Buffer.byteLength(text)>4096)throw Error('too_large');
 return type.startsWith('application/json')?JSON.parse(text):Object.fromEntries(new URLSearchParams(text));
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store, max-age=0');res.setHeader('Vercel-CDN-Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Robots-Tag','noindex,nofollow');res.setHeader('Referrer-Policy','same-origin');
 const url=new URL(req.url,'https://waterquestsolutions.com');let file=url.searchParams.get('file');
 if(!file){try{file=decodeURIComponent(url.pathname.replace(/^\/downloads\//,''));}catch{}}
 const item=Object.hasOwn(catalogue,file||'')?catalogue[file]:null;
 if(!item){res.statusCode=404;return res.end('Product information not found.');}
 if(req.method==='GET'||req.method==='HEAD'){if(req.method==='HEAD'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end();}return form(res,item,file);}
 if(req.method!=='POST'){res.statusCode=405;res.setHeader('Allow','GET, HEAD, POST');return res.end('Method not allowed.');}
 const origin=req.headers.origin;
 const allowed=new Set(['https://temporary-turbo-nickel-8xnl9g7.vercel.app','https://temporary-turbo-nickel-8xnl9g7-watequest-solutions.vercel.app','https://waterquest-palette-20261016.vercel.app','https://waterquestsolutions.com','https://www.waterquestsolutions.com',process.env.VERCEL_URL?'https://'+process.env.VERCEL_URL:'']);
 if(origin&&!allowed.has(origin))return form(res,item,file,403,'Please open the download form on the WaterQuest Solutions website.');
 let payload,submission,email='';
 try{
  payload=await readPayload(req);email=typeof payload.email==='string'?payload.email.trim():'';
  if(payload.website)throw Error('invalid_form');
  submission=prepareSubmission({source:'product-literature',fields:{email,consent:true,product:item.title,download:file,request:'Product information download',marketingConsent:false},page:{url:'https://temporary-turbo-nickel-8xnl9g7.vercel.app'+(item.page||'/downloads/product-literature/'),title:item.title}});
 }catch(e){return form(res,item,file,e.message==='too_large'?413:400,'Please enter a valid email address.',email);}
 const disk=path.join(root,file);
 if(!fs.existsSync(disk)){res.statusCode=503;return form(res,item,file,503,'This file is temporarily unavailable. Please try again shortly.',email);}
 try{
  const response=await fetch('https://crm.zoho.com/crm/WebToLeadForm',{method:'POST',redirect:'manual',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/x-www-form-urlencoded',Referer:'https://temporary-turbo-nickel-8xnl9g7.vercel.app/'},body:submission.data});
  if(!acceptedResponse(response,await response.text(),submission.returnURL))throw Error('capture_failed');
 }catch{
  console.error('Product literature request could not be saved',submission.reference);
  return form(res,item,file,502,'We could not save your request. Please try again. Your download will start once it is received.',email);
 }
 res.statusCode=200;res.setHeader('Content-Type',item.type==='zip'?'application/zip':'application/pdf');res.setHeader('Content-Disposition',`attachment; filename="${path.basename(file)}"`);res.setHeader('X-WaterQuest-Reference',submission.reference);
 try{await pipeline(fs.createReadStream(disk,{highWaterMark:65536}),res);}catch{if(!res.headersSent){res.statusCode=500;res.end('Download interrupted.');}else res.destroy();}
}
