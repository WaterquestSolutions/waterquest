import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
const root=path.resolve('private-downloads');
const catalogue=JSON.parse(fs.readFileSync(path.join(root,'catalogue.json'),'utf8'));
export default async function handler(req,res){
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Cache-Control','public, max-age=0, must-revalidate');
 res.setHeader('X-Robots-Tag','noindex');
 if(!['GET','HEAD'].includes(req.method)){res.statusCode=405;res.setHeader('Allow','GET, HEAD');return res.end('Open the download link to read the document.');}
 const url=new URL(req.url,'https://waterquestsolutions.com');
 let file=url.searchParams.get('file');
 if(!file){try{file=decodeURIComponent(url.pathname.replace(/^\/downloads\//,''));}catch{res.statusCode=400;return res.end('Invalid document path.');}}
 const item=Object.hasOwn(catalogue,file||'')?catalogue[file]:null;
 if(!item){res.statusCode=404;return res.end('Product information not found.');}
 const disk=path.resolve(root,file);
 if(!disk.startsWith(root+path.sep)){res.statusCode=404;return res.end('Product information not found.');}
 let stat;try{stat=fs.statSync(disk);if(!stat.isFile())throw Error();}catch{res.statusCode=503;return res.end('Document temporarily unavailable. Contact bruce@waterquestsolutions.com.');}
 res.statusCode=200;res.setHeader('Content-Type',item.type==='zip'?'application/zip':'application/pdf');
 res.setHeader('Content-Length',stat.size);res.setHeader('Content-Disposition',`attachment; filename="${path.basename(file)}"`);
 if(req.method==='HEAD')return res.end();
 try{await pipeline(fs.createReadStream(disk),res);}catch{if(!res.headersSent){res.statusCode=500;res.end('Download interrupted.');}else res.destroy();}
}
