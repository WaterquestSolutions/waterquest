import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import handler from '../api/product-download.js';
test('open literature downloads serve exact catalogued bytes without sending contact data',async()=>{
 const actualFetch=globalThis.fetch;let externalCalls=0;
 globalThis.fetch=(url,options)=>{if(!String(url).startsWith('http://127.0.0.1:')){externalCalls++;throw Error('Unexpected external request');}return actualFetch(url,options);};
 const server=http.createServer((req,res)=>handler(req,res));await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 try{
  const catalogue=JSON.parse(fs.readFileSync('private-downloads/catalogue.json'));
  for(const [file,item] of Object.entries(catalogue)){
   const url=base+'/downloads/'+file;
   const head=await fetch(url,{method:'HEAD'});assert.equal(head.status,200);assert.equal((await head.text()).length,0);
   const response=await fetch(url);assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),item.type==='zip'?'application/zip':'application/pdf');
   const bytes=fs.readFileSync('private-downloads/'+file);assert.equal(Number(response.headers.get('content-length')),bytes.length);assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes);
  }
  for(const suffix of ['?file=../package.json','?file=__proto__','?file=missing.pdf'])assert.equal((await fetch(base+'/api/product-download'+suffix)).status,404);
  assert.equal((await fetch(base+'/downloads/pumps/WQS-pump-p1.pdf',{method:'POST',body:'email=qa%40example.com'})).status,405);
  assert.equal(externalCalls,0);
 }finally{globalThis.fetch=actualFetch;await new Promise(r=>server.close(r));}
});
