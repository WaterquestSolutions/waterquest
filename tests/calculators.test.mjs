import assert from 'node:assert/strict';
import {calculate,water,friction,conversions,convert,unconvert} from '../public/assets/calculators-v2/engine.js';
import {definitions,defaults,validate} from '../public/assets/calculators-v2/definitions.js';
let checks=0;const near=(a,b,tol=1e-9)=>{assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),`${a} != ${b}`);checks++;};
const run=(id,changes={})=>{const x={...defaults(id),...changes};assert.deepEqual(validate(id,x),{});return calculate(id,x);};
const v=(r,label)=>{const row=r.rows.find(x=>x.label===label);assert.ok(row, label);return row.value;};
// Reference examples use deliberately simple independent physical / accounting cases.
let r=run('cylinder-force',{pressure:100,back:0,bore:100,rod:60,eff:100,load:10,sf:1});near(v(r,'Net extension force'),78.53981633974483);near(v(r,'Net retraction force'),50.26548245743669);
r=run('pump-sizing',{flow:60,pressure:100,speed:1000,ve:100,me:100,service:1});near(v(r,'Required displacement'),60);near(v(r,'Shaft power required'),10);near(v(r,'Pump drive torque'),95.4929658551372);
r=run('motor-speed',{flow:60,disp:60,pressure:100,ve:100,me:100,ratio:2,gear_eff:100,target:500});near(v(r,'Motor speed'),1000);near(v(r,'Output speed after gearbox'),500);near(v(r,'Motor shaft torque'),95.4929658551372);near(v(r,'Flow required at target output speed'),60);
r=run('power',{flow:60,pressure:100,hyd_eff:80,motor_eff:80,voltage:100,pf:1,phase:1});near(v(r,'Hydraulic output power'),10);near(v(r,'Electrical input power'),15.625);near(v(r,'Running current estimate'),156.25);
for(const mode of ['pump','motor']){r=run('hydraulic-efficiency',{mode,disp:60,speed:1000,flow:mode==='pump'?54:60/0.9,pressure:100,torque:95.4929658551372*(mode==='pump'?1/0.8:0.8)});near(v(r,'Volumetric efficiency'),90);near(v(r,'Mechanical / hydraulic efficiency'),80);near(v(r,'Overall efficiency'),72);}
r=run('pipe-velocity',{flow:60,diam:100,target:1,factor:0,density:1000});near(v(r,'Velocity in entered pipe'),0.12732395447351627);near(v(r,'Minimum internal diameter'),35.68248232305542);
r=run('flow-rate',{diam:100,velocity:1,volume:60,time:60,density:1000});near(v(r,'Flow from mean velocity'),471.23889803846896);near(v(r,'Flow from timed collection'),60);near(v(r,'Mass flow from velocity method'),7.853981633974483);
r=run('orifice',{diam:10,pressure:5,density:1000,cd:1,holes:1,target:60});near(v(r,'Combined flow through all holes'),149.0188239869415);
r=run('pressure-drop',{pipe:1,valve:2,filter:1,hex:0,filter_mult:2,margin:20,elev:0,flow:60});near(v(r,'Design differential'),6);near(v(r,'Hydraulic power required'),0.6);
r=run('reynolds-number',{velocity:0,diam:25,temp:20,salinity:0,rough:0});near(v(r,'Reynolds number'),0);near(v(r,'Darcy friction factor'),0);
// Published MIT rounded seawater reference near 20 C / 35 g/kg, broad correlation tolerance.
near(water(20,35).rho,1024.8,0.001);near(water(20,0).mu,0.001002,0.000001);near(water(80,0).mu,0.000354,0.000001);
near(friction(1000,0).f,0.064);near(friction(1e5,0).f,0.01798977308427384);near(friction(0,0).f,0);
// Hagen-Poiseuille independent pressure-loss relation at a laminar point.
r=run('pressure-loss',{flow:0.06,diam:10,length:1,k:0,rough:0,temp:20,salinity:0});near(v(r,'Total pressure loss'),128*water(20).mu*1e-6/(Math.PI*0.01**4)/1e5);
r=run('pressure-loss',{flow:0});near(v(r,'Total pressure loss'),0);
r=run('water-hammer',{velocity:1,final:0,length:100,diam:100,wall:10,modulus:200,bulk:2,density:1000,base:100,closure:1});near(v(r,'Wave speed estimate'),1348.3997249264842);near(v(r,'Rapid-change pressure amplitude'),13.483997249264842);
r=run('accumulator',{volume:10,pre:1,pmin:3,pmax:7,atm:1,poly:1,reserve:0});near(v(r,'Nominal gas volume before allowance'),40);near(v(r,'Ideal delivered energy before allowance'),8*Math.log(2)-1);
r=run('energy-savings',{base:10,new:5,hours:1000,load:100,rate:0.1,peak:2,demand:10,months:12,life:2,escalation:10});near(v(r,'Annual electricity reduction'),5000);near(v(r,'First-year total saving'),740);near(v(r,'Undiscounted study-period saving'),1554);
r=run('roi',{capex:100,grant:0,annual:30,opex:10,risk:50,life:2,discount:0,residual:0});near(v(r,'Adjusted annual net benefit'),5);near(v(r,'Net present value'),-90);near(v(r,'Simple payback'),20);
r=run('roi',{annual:0});assert.equal(v(r,'Simple payback'),'No payback');checks++;
r=run('life-cycle-cost',{capex_a:100,capex_b:200,annual_a:10,annual_b:20,risk_a:0,risk_b:0,replace_a:50,replace_b:0,year_a:2,year_b:2,residual_a:30,residual_b:0,life:2,discount:0});near(v(r,'Option A present cost'),140);near(v(r,'Option B present cost'),240);near(v(r,'A saving relative to B'),100);
r=run('carbon-savings',{energy:1000,grid:1,oil:100,oilfactor:2,materials:100,life:2,degrade:50});near(v(r,'Total first-year avoided emissions'),1.3);near(v(r,'Study-period avoided emissions'),2.1);
r=run('oil-spill-cost',{volume:10,cleanup:2,downtime:3,hourly:10,reg:0,env:0,reputation:0,insurance:10,prob:10,life:2});near(v(r,'Gross event cost'),50);near(v(r,'Net event cost after recovery'),40);near(v(r,'Expected annual cost'),4);
r=run('seal-compression',{cs:4,id:50,groove:50,depth:3,width:5});near(v(r,'Estimated installed cross-section'),4);near(v(r,'Radial squeeze after stretch'),25);near(v(r,'Inside-diameter stretch'),0);near(v(r,'Groove volume filled'),Math.PI*16*54/(4*3*53*5)*100);
r=run('surface-finish',{ra:0.254,factor:5,limit:0.4});near(convert(v(r,'Measured Ra'),'µm',true),10);near(v(r,'Assumed Rz estimate'),1.27);
for(const [unit] of Object.entries(conversions))for(const n of [0,0.003,1,25.4,10000])near(unconvert(convert(n,unit,true),unit,true),n);
for(const [id,d] of Object.entries(definitions)){
 const x=defaults(id);if(id==='energy-savings')x.peak=5;if(id==='carbon-savings')x.oilfactor=2;assert.deepEqual(validate(id,x),{});assert.ok(calculate(id,x).rows.length>=3);checks++;
 for(const field of d.fields){
  if(field.options)continue;
  for(const invalid of [null,NaN,Infinity]){assert.ok(validate(id,{...x,[field.id]:invalid})[field.id]);checks++;}
  if(field.positive){assert.ok(validate(id,{...x,[field.id]:0})[field.id]);checks++;}
  if(field.integer){assert.ok(validate(id,{...x,[field.id]:1.5})[field.id]);checks++;}
  const changed={...x,[field.id]:x[field.id]===0?0.5:x[field.id]*1.01};
  if(!Object.keys(validate(id,changed)).length){assert.notEqual(JSON.stringify(calculate(id,changed)),JSON.stringify(calculate(id,x)),`${id}.${field.id} unused`);checks++;}
 }
}
for(const [id,changes,key] of [['cylinder-force',{rod:101},'rod'],['accumulator',{pre:110},'pre'],['accumulator',{pmax:90},'pmax'],['roi',{grant:1e6},'grant'],['life-cycle-cost',{year_a:30},'year_a'],['seal-compression',{groove:49},'groove'],['oil-spill-cost',{insurance:1e9},'insurance'],['pressure-loss',{rough:10},'rough']]){assert.ok(validate(id,{...defaults(id),...changes})[key]);checks++;}
r=run('accumulator',{volume:10,pre:1,pmin:3,pmax:7,atm:1,poly:1+1e-10,reserve:0});near(v(r,'Ideal delivered energy before allowance'),8*Math.log(2)-1,1e-8);
console.log(`PASS: ${checks} numerical, conversion, input-domain and parameter-use checks across ${Object.keys(definitions).length} calculators.`);
