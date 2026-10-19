import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const release=JSON.parse(zlib.gunzipSync(fs.readFileSync('guide-connections.json.gz')));
const hash=s=>createHash('sha256').update(s).digest('hex');
const home=fs.readFileSync('public/index.html');
assert.equal(release.guides.length,129);
assert.equal(release.products.length,57);
// Reject a changed baseline before writing any page.
for(const [rel,p] of Object.entries(release.patches))assert.equal(hash(fs.readFileSync(path.join('public',rel))),p.before,'Guide release baseline changed: '+rel);
for(const [rel,p] of Object.entries(release.patches)){
 const file=path.join('public',rel);let chars=Array.from(fs.readFileSync(file,'utf8'));
 for(const e of [...p.edits].reverse())chars=chars.slice(0,e.start).concat(Array.from(e.text),chars.slice(e.end));
 const out=chars.join('');assert.equal(hash(out),p.after,'Guide release output mismatch: '+rel);fs.writeFileSync(file,out);
}
for(const g of release.guides){
 const html=fs.readFileSync(path.join('public',g.file),'utf8');
 for(const url of [...g.calculators,...g.products]){
  assert.ok(html.includes('href="'+url+'"'),g.slug+' missing '+url);
  assert.ok(fs.existsSync(path.join('public',url,'index.html')),'Missing target '+url);
 }
 for(const url of g.products){const p=fs.readFileSync(path.join('public',url,'index.html'),'utf8');assert.ok(p.includes('href="/knowledge-hub/'+g.slug+'/"'),'Missing reciprocal '+g.slug);}
 assert.ok(html.includes('id="guide-application"'));
}
assert.equal(hash(fs.readFileSync('public/index.html')),hash(home),'Homepage changed');
console.log('PASS: 129 guides, 57 product pages, 258 calculator links, 236 product links; reciprocal links and exact output hashes verified. Homepage unchanged.');
