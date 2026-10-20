import assert from 'node:assert/strict';
import {defaults,definitions} from '../public/assets/calculators-v2/definitions.js';
import {createReport} from '../public/assets/calculators-v2/report.js';
import {displayMeasurements} from '../public/assets/calculators-v2/display.js';
const pump=createReport('pump-sizing',defaults('pump-sizing'),{us:true});
assert.match(pump.inputs.find(r=>r.label==='Flow rate').value,/^21\.1337641887 US gpm$/);
assert.match(pump.results.find(r=>r.label==='Shaft power required').value,/^22\.328 hp$/);
assert.ok(pump.limitation.includes('2,320.6 psi'));
const metric=createReport('pump-sizing',defaults('pump-sizing'));
assert.equal(metric.inputs.find(r=>r.label==='Flow rate').value,'80 L/min');
assert.equal(metric.results.find(r=>r.label==='Shaft power required').value,'16.65 kW');
const rough=createReport('surface-finish',defaults('surface-finish'));
assert.ok(rough.results.every(r=>!r.value.includes('µin')));
const roughUS=createReport('surface-finish',defaults('surface-finish'),{us:true});
assert.ok(roughUS.results.every(r=>!r.value.includes('µm')));
for(const id of ['pressure-loss','reynolds-number'])assert.ok(createReport(id,defaults(id),{us:true}).results.find(r=>r.label==='Kinematic viscosity').value.endsWith('in²/s'));
assert.equal(displayMeasurements('Piston area 1000 mm²; pressure 160 bar.',true),'Piston area 1.55 in²; pressure 2,320.6 psi.');
for(const id in definitions){const report=createReport(id,defaults(id),{us:true});assert.ok(!report.results.some(r=>/\b(?:bar|mm|kN|L\/min|cm³\/rev|µm)\b/.test(r.value)),id);}
console.log('Selected-unit regression checks passed across all 20 calculators and reports.');
