import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {definitions,defaults} from '../public/assets/calculators-v2/definitions.js';
import {equipmentRoutes,screenPumps,equipmentHTML} from '../public/assets/calculators-v2/equipment.js';
test('all twenty calculators have specific working product routes beside the results',()=>{
 assert.deepEqual(Object.keys(equipmentRoutes).sort(),Object.keys(definitions).sort());
 for(const id of Object.keys(definitions)){
  const source=fs.readFileSync(`public/knowledge-hub/engineering-calculators/${id}-calculator/index.html`,'utf8');
  assert.ok(source.includes(equipmentHTML(id)),id);
  for(const item of equipmentRoutes[id])assert.ok(fs.existsSync('public'+item.url.split('#')[0]+'index.html'),item.url);
 }
});
test('pump candidates meet flow and drive demand at the entered operating point',()=>{
 const v=defaults('pump-sizing'),matches=screenPumps(v);assert.ok(matches.length);
 for(const c of matches){assert.ok(c.flow>=v.flow);assert.ok(c.power>=v.flow*v.pressure/(600*v.ve/100*v.me/100));}
 assert.deepEqual(screenPumps({...v,pressure:161}),[]);
 assert.deepEqual(screenPumps({...v,flow:500}),[]);
 assert.deepEqual(screenPumps({...v,speed:2001}),[]);
 assert.deepEqual(screenPumps({...v,flow:0}),[]);
 assert.deepEqual(screenPumps({...v,ve:101}),[]);
 assert.ok(screenPumps({...v,speed:1900}).every(c=>c.boosted));
});
