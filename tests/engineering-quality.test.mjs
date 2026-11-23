import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync('public/'+p,'utf8');
test('unresolved source coefficients are not offered as selectable numerical ratings',()=>{
 for(const slug of ['4-2-3-2-directional-control-valves','4-3-directional-control-valves','po-check-valve-dn6']){
  const source=read('products/water-hydraulic-valves/'+slug+'/index.html');
  const values=[...source.matchAll(/<dd\b[^>]*>(.*?)<\/dd>/gs)].map(m=>m[1]);
  assert.ok(values.some(v=>v.includes('Coefficient labels unresolved')));
  assert.ok(!values.some(v=>/Cv 0\.62\s*\/\s*Kv 0\.75/.test(v)));
  assert.match(source,/Obtain written confirmation/);
 }
});
test('every practical guide has a bounded example and a working next action',()=>{
 const guides=JSON.parse(fs.readFileSync('scripts/guide-manifest.json','utf8'));
 for(const guide of guides){const source=read(guide.file);assert.equal((source.match(/<!-- EQ:worked-record -->/g)||[]).length,1);assert.match(source,/Illustrative, not a field result/);assert.match(source,/Record the evidence/);assert.match(source,/data-eq-download/);}
});
test('engineering evidence registers point to real local equipment and document resources',()=>{
 const data=JSON.parse(read('assets/engineering-quality/document-register.json'));
 assert.equal(data.records.length,57);
 const catalogue=JSON.parse(fs.readFileSync('private-downloads/catalogue.json','utf8'));
 for(const r of data.records){assert.ok(fs.existsSync('public'+r.route+'index.html'));for(const u of r.documents){const pathname=u.split(/[?#]/)[0];assert.ok(fs.existsSync('public'+pathname)||pathname.startsWith('/downloads/')&&catalogue[pathname.slice(11)],u);}}
});
test('all legacy pages with missing primary landmarks now contain exactly one main',()=>{
 for(const route of ['about','products','industries/water-hydraulics-for-fire-suppression-systems']){const source=read(route+'/index.html');assert.equal((source.match(/<main\b/g)||[]).length,1);assert.equal((source.match(/<\/main>/g)||[]).length,1);}
});
