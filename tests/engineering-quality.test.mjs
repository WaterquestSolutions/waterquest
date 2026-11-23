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
test('removed specification resources cannot be reintroduced by the build',()=>{
 assert.ok(!fs.existsSync('public/specification-resources/index.html'));
 assert.ok(!fs.existsSync('public/assets/engineering-quality/document-register.json'));
 const build=fs.readFileSync('scripts/build-engineering-resources.py','utf8');
 assert.ok(!build.includes('document-register'));
});
test('all legacy pages with missing primary landmarks now contain exactly one main',()=>{
 for(const route of ['about','products','industries/water-hydraulics-for-fire-suppression-systems']){const source=read(route+'/index.html');assert.equal((source.match(/<main\b/g)||[]).length,1);assert.equal((source.match(/<\/main>/g)||[]).length,1);}
});
