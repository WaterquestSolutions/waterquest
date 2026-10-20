/* WaterQuest calculator equations, revision 2026-10-06. All inputs use the stated SI base units.
   Water-property correlations: Sharqawy, Lienhard & Zubair (2010), equations 8 and 22;
   coefficients checked against MIT Seawater Properties v3.1.5. Atmospheric-pressure model only. */
export const G=9.80665;
export const conversions={
 'mm':['in',1/25.4], 'm':['ft',1/0.3048], 'm/s':['ft/s',1/0.3048],
 'L/min':['US gpm',1/3.785411784], 'L':['US gal',1/3.785411784],
 'bar':['psi',100000/6894.757293168], 'bar(g)':['psig',100000/6894.757293168],
 'bar(a)':['psia',100000/6894.757293168], 'kW':['hp',1/0.7456998715822702],
 'kN':['lbf',1000/4.4482216152605], 'N·m':['lbf·in',1/0.1129848290276167],
 'cm³/rev':['in³/rev',1/16.387064], 'kg/m³':['lb/ft³',1/16.01846337396014],
 'kg/s':['lb/s',1/0.45359237], 'GPa':['Mpsi',1/6.894757293168],
 'µm':['µin',1/0.0254], 'mm²/s':['in²/s',1/(25.4**2)], 'mPa·s':['lb/(ft·s)',0.00067196897514], 'mm²':['in²',1/(25.4**2)],
 'kJ':['Btu',1/1.05505585262], '°C':['°F',1.8,32],
 'L/yr':['US gal/yr',1/3.785411784], 'kg CO₂e/kWh':['lb CO₂e/kWh',1/0.45359237],
 'kg CO₂e/L':['lb CO₂e/US gal',3.785411784/0.45359237],
 'kg CO₂e/yr':['lb CO₂e/yr',1/0.45359237], 't CO₂e/yr':['lb CO₂e/yr',1000/0.45359237],
 't CO₂e':['lb CO₂e',1000/0.45359237], 'currency/L':['currency/US gal',3.785411784]
};
export function convert(value,unit,toUS=false){const c=conversions[unit];return c&&toUS?value*c[1]+(c[2]||0):value;}
export function unconvert(value,unit,fromUS=false){const c=conversions[unit];return c&&fromUS?(value-(c[2]||0))/c[1]:value;}
export function unitLabel(unit,us=false,currency='CAD'){return (us&&conversions[unit]?conversions[unit][0]:unit).replace('currency',currency);}
export function water(T,S=0){
 const s=S/1000;
 const rho=999.92293295+0.020341179217*T-0.0061624591598*T*T+0.000022614664708*T**3-4.6570659168e-8*T**4+802.00240891*s-2.0005183488*s*T+0.016771024982*s*T*T-0.000030600536746*s*T**3-0.000016132224742*s*s*T*T;
 const muw=0.000042844324477+1/(0.15700386464*(T+64.99262005)**2-91.296496657);
 const mu=muw*(1+(1.540913604+0.019981117208*T-0.000095203865864*T*T)*s+(7.9739318223-0.075614568881*T+0.00047237011074*T*T)*s*s);
 return {rho,mu,nu:mu/rho};
}
export function friction(Re,rr){
 if(Re===0)return {f:0,regime:'No flow'};
 if(Re<2000)return {f:64/Re,regime:'Laminar'};
 const turbulent=r=>{let f=0.02;for(let i=0;i<40;i++)f=1/(-2*Math.log10(rr/3.7+2.51/(r*Math.sqrt(f))))**2;return f;};
 if(Re<4000){const x=(Re-2000)/2000;return {f:(1-x)*0.032+x*turbulent(4000),regime:'Transitional — estimate'};}
 return {f:turbulent(Re),regime:'Turbulent'};
}
const row=(label,value,unit='')=>({label,value,unit});
export function calculate(id,x){
 let rows=[],notes=[],warnings=[];
 const add=(...a)=>rows.push(row(...a));
 const pct=v=>v/100;
 const hydraulic=(q,p)=>q*p/600;
 const shaft=(t,n)=>t*2*Math.PI*n/60000;
 const pressureWarn=p=>{if(p>160)warnings.push('Pressure exceeds the WaterQuest 160 bar operating limit, including peaks. Check the lower rating of every selected component.');};
 switch(id){
 case 'pressure-loss':case 'reynolds-number':{
  const w=water(x.temp,x.salinity),D=x.diam/1000,v=id==='pressure-loss'?x.flow/60000/(Math.PI*D*D/4):x.velocity;
  const Re=v*D/w.nu,rr=id==='pressure-loss'?x.rough/x.diam:x.rough,{f,regime}=friction(Re,rr);
  if(id==='pressure-loss'){
   const major=f*x.length/D*w.rho*v*v/2/1e5,minor=x.k*w.rho*v*v/2/1e5;
   add('Total pressure loss',major+minor,'bar');add('Straight-pipe loss',major,'bar');add('Fittings / local loss',minor,'bar');add('Flow velocity',v,'m/s');add('Hydraulic power lost',hydraulic(x.flow,major+minor),'kW');
  }
  add('Reynolds number',Re);add('Darcy friction factor',f);add('Flow regime',regime);add('Density used',w.rho,'kg/m³');add('Kinematic viscosity',w.nu*1e6,'mm²/s');
  if(Re>=2000&&Re<4000)warnings.push('Transition flow is uncertain. The displayed friction factor is a linear estimate between Re 2,000 and 4,000, not a validated transition-flow prediction.');
  notes.push('Properties use the atmospheric-pressure water/seawater correlation. Pressure effects, additives and entrained gas are excluded.');break;
 }
 case 'cylinder-force':{
  const ae=Math.PI*x.bore**2/4,ar=Math.PI*(x.bore**2-x.rod**2)/4,e=pct(x.eff);
  const fe=(x.pressure*ae-x.back*ar)*e/10000,fr=(x.pressure*ar-x.back*ae)*e/10000,required=x.load*x.sf;
  add('Net extension force',fe,'kN');add('Net retraction force',fr,'kN');add('Required factored force',required,'kN');add('Extension load margin',required?fe/required:'Not applicable','×');add('Pressure needed: extension',(required*10000/e+x.back*ar)/ae,'bar');add('Pressure needed: retraction',(required*10000/e+x.back*ae)/ar,'bar');
  notes.push(`Piston area ${ae.toPrecision(5)} mm²; annular area ${ar.toPrecision(5)} mm². Efficiency is applied to the net pressure force. Buckling, side load and breakaway friction are excluded.`);if(fe<0||fr<0)warnings.push('Backpressure overcomes the driving force in at least one direction.');pressureWarn(x.pressure);break;
 }
 case 'pump-sizing':{
  const ev=pct(x.ve),em=pct(x.me),D=1000*x.flow/(x.speed*ev),power=hydraulic(x.flow,x.pressure)/(ev*em),torque=power*60000/(2*Math.PI*x.speed);
  add('Required displacement',D,'cm³/rev');add('Shaft power required',power,'kW');add('Motor shaft rating with allowance',power*x.service,'kW');add('Pump drive torque',torque,'N·m');add('Hydraulic output',hydraulic(x.flow,x.pressure),'kW');add('Overall pump efficiency',ev*em*100,'%');pressureWarn(x.pressure);notes.push('Choose an available motor rating above the calculated shaft requirement. Starting torque, drive losses, inlet conditions and vendor pump limits require separate checks.');break;
 }
 case 'motor-speed':{
  const rpm=1000*x.flow*pct(x.ve)/x.disp,T=x.pressure*x.disp*pct(x.me)/(20*Math.PI);
  add('Motor speed',rpm,'rpm');add('Output speed after gearbox',rpm/x.ratio,'rpm');add('Motor shaft torque',T,'N·m');add('Gearbox output torque',T*x.ratio*pct(x.gear_eff),'N·m');add('Flow required at target output speed',x.target*x.ratio*x.disp/(1000*pct(x.ve)),'L/min');add('Motor shaft output',shaft(T,rpm),'kW');pressureWarn(x.pressure);break;
 }
 case 'power':{
  const ph=hydraulic(x.flow,x.pressure),ps=ph/pct(x.hyd_eff),pe=ps/pct(x.motor_eff),I=pe*1000/((x.phase===3?Math.sqrt(3):1)*x.voltage*x.pf);
  add('Hydraulic output power',ph,'kW');add('Required shaft power',ps,'kW');add('Electrical input power',pe,'kW');add('Running current estimate',I,'A');add('Shaft torque',ps*60000/(2*Math.PI*x.speed),'N·m');add('Hydraulic-system losses',ps-ph,'kW');add('Electric motor losses',pe-ps,'kW');pressureWarn(x.pressure);notes.push('AC running current at the entered load, efficiency and power factor. Three-phase voltage is line-to-line. Starting current and conductor/protection sizing are excluded. Motor heat is not automatically heat entering the fluid.');break;
 }
 case 'hydraulic-efficiency':{
  const qt=x.disp*x.speed/1000,tt=x.pressure*x.disp/(20*Math.PI),ph=hydraulic(x.flow,x.pressure),ps=shaft(x.torque,x.speed);
  const ev=x.mode==='pump'?x.flow/qt:qt/x.flow,em=x.mode==='pump'?tt/x.torque:x.torque/tt,eo=x.mode==='pump'?ph/ps:ps/ph;
  add('Volumetric efficiency',ev*100,'%');add('Mechanical / hydraulic efficiency',em*100,'%');add('Overall efficiency',eo*100,'%');add('Hydraulic power',ph,'kW');add('Shaft power',ps,'kW');add('Theoretical torque',tt,'N·m');
  if([ev,em,eo].some(v=>v>1.000001))warnings.push('An efficiency exceeds 100%. Check pump/motor mode, displacement, pressure difference and simultaneous measured flow, speed and torque. Results are shown without clamping.');pressureWarn(x.pressure);break;
 }
 case 'pipe-velocity':{
  const qs=x.flow/60000,v=qs/(Math.PI*(x.diam/1000)**2/4),d=Math.sqrt(4*qs/(Math.PI*x.target))*1000,design=d*(1+pct(x.factor));
  add('Velocity in entered pipe',v,'m/s');add('Minimum internal diameter',d,'mm');add('Diameter with allowance',design,'mm');add('Velocity head',v*v/(2*G),'m');add('Dynamic pressure',x.density*v*v/2/1e5,'bar');
  notes.push('Allowance increases diameter, not flow. Use the actual internal bore, not nominal pipe size. The velocity target is your design criterion; it is not a universal safe limit.');if(v>x.target)warnings.push('Velocity exceeds your entered target.');break;
 }
 case 'flow-rate':{
  const Q=x.velocity*Math.PI*(x.diam/1000)**2/4*60000,Qt=x.volume/x.time*60;
  add('Flow from mean velocity',Q,'L/min');add('Flow from timed collection',Qt,'L/min');add('Mass flow from velocity method',x.density*Q/60000,'kg/s');add('Difference: velocity minus collection',Q-Qt,'L/min');add('Difference relative to collection',Qt?(Q-Qt)/Qt*100:'Not applicable','%');notes.push('Velocity must be the cross-sectional mean. Both methods are independent measurements; no efficiency multiplier is applied to continuity.');break;
 }
 case 'orifice':{
  const v=Math.sqrt(2*x.pressure*1e5/x.density),A=Math.PI*(x.diam/1000)**2/4,Q=x.cd*x.holes*A*v*60000,d=Math.sqrt(4*x.target/60000/(x.cd*x.holes*v*Math.PI))*1000;
  add('Combined flow through all holes',Q,'L/min');add('Ideal velocity from pressure drop',v,'m/s');add('Hole diameter for target total flow',d,'mm');add('Hydraulic power across orifices',hydraulic(Q,x.pressure),'kW');notes.push('Incompressible flow through equal holes with an entered discharge coefficient. Ideal velocity differs from mean bore velocity. Cavitation, flashing, pipe-area correction and choking are excluded.');pressureWarn(x.pressure);break;
 }
 case 'pressure-drop':{
  const z=x.density*G*x.elev/1e5,loss=x.pipe+x.valve+x.filter+x.hex,dirty=x.pipe+x.valve+x.filter*x.filter_mult+x.hex,total=dirty*(1+pct(x.margin))+z;
  add('Clean component losses',loss,'bar');add('Static elevation contribution',z,'bar');add('Clean differential including elevation',loss+z,'bar');add('Design differential',total,'bar');add('Hydraulic power required',Math.max(0,hydraulic(x.flow,total)),'kW');notes.push('Margin is applied to dissipative losses, not static elevation. Enter net elevation between endpoints; use zero for a closed recirculating loop. Component losses must all correspond to the entered flow.');if(total<0)warnings.push('Net elevation provides more pressure than the estimated losses. Available head requires a system-control review; negative pump power is not reported.');break;
 }
 case 'water-hammer':{
  const a=Math.sqrt(x.bulk*1e9/x.density/(1+x.bulk*x.diam/(x.modulus*x.wall))),dv=x.velocity-x.final,dp=x.density*a*Math.abs(dv)/1e5,tc=2*x.length/a*1000;
  add('Rapid-change pressure amplitude',dp,'bar');add('Initial pressure plus amplitude',x.base+dp,'bar(g)');add('Initial pressure minus amplitude',x.base-dp,'bar(g)');add('Wave speed estimate',a,'m/s');add('Round-trip wave time',tc,'ms');add('Closure time / wave time',x.closure/tc,'×');
  notes.push('Joukowsky rapid-change screening with a thin-wall elastic pipe and restraint factor 1. Reflections, valve motion, gas, cavitation and network effects are excluded. The displayed amplitude is not reduced for slow closure.');if(x.closure>tc)warnings.push('Closure is slower than the round-trip wave time. This rapid-change result is a reference scenario, not the predicted slow-closure peak. Use a transient model.');if(x.base-dp<0)warnings.push('The ideal lower excursion is below atmospheric pressure. Check vapour pressure and column separation with a transient analysis.');if(x.wall/x.diam>0.1)warnings.push('Wall thickness is large relative to bore. The thin-wall wave-speed approximation needs review.');pressureWarn(x.base+dp);break;
 }
 case 'accumulator':{
  const p0=x.pre+x.atm,p1=x.pmin+x.atm,p2=x.pmax+x.atm,n=x.poly,a=(p0/p1)**(1/n),b=(p0/p2)**(1/n),fraction=a-b,V=x.volume/fraction,Vr=V*(1+pct(x.reserve)),v1=V*a,v2=V*b;
  const work=n===1?p1*v1*Math.log(v1/v2):p1*v1*Math.expm1((n-1)*Math.log(v1/v2))/(n-1),net=(work-x.atm*x.volume)*0.1;
  add('Nominal gas volume before allowance',V,'L');add('Nominal gas volume with allowance',Vr,'L');add('Deliverable volume with allowance',x.volume*(1+pct(x.reserve)),'L');add('Ideal delivered energy before allowance',net,'kJ');add('Usable fraction',fraction*100,'%');
  notes.push('Gauge pressures are converted to absolute using the entered atmosphere. The same ideal-gas exponent applies from precharge through operation. Energy integrates gauge pressure over the specified delivery volume. Temperature changes, real-gas effects and manufacturer usable-volume limits are excluded.');pressureWarn(x.pmax);break;
 }
 case 'energy-savings':{
  const dp=x.base-x.new,E=dp*x.hours*pct(x.load),energy=E*x.rate,demand=x.peak*x.demand*x.months,total=energy+demand;
  let cumulative=0;for(let y=0;y<x.life;y++)cumulative+=total*(1+pct(x.escalation))**y;
  add('Annual electricity reduction',E,'kWh/yr');add('Annual energy-charge saving',energy,'currency/yr');add('Annual demand-charge saving',demand,'currency/yr');add('First-year total saving',total,'currency/yr');add('Undiscounted study-period saving',cumulative,'currency');add('Average operating power reduction',dp*pct(x.load),'kW');notes.push('Both power values are electrical input at comparable duty. Load factor applies to operating energy; peak demand reduction is a separate tariff assumption. Escalation applies to both rates; use lifecycle costing for discounted value. Negative savings are increases in cost.');break;
 }
 case 'roi':{
  const I=x.capex-x.grant,cf=x.annual*pct(x.risk)-x.opex,r=pct(x.discount);let npv=-I;for(let t=1;t<=x.life;t++)npv+=cf/(1+r)**t;npv+=x.residual/(1+r)**x.life;
  add('Net initial investment',I,'currency');add('Adjusted annual net benefit',cf,'currency/yr');add('Simple payback',I===0?'No initial outlay':cf>0?I/cf:'No payback','years');add('Net present value',npv,'currency');add('Annual simple return',I>0?cf/I*100:'Not defined','%');
  notes.push('Benefit confidence reduces gross savings only; recurring costs remain payable. Annual cash flows occur at year end; residual value occurs at the end of the study. Simple payback excludes discounting and residual value. Tax, financing and inflation are excluded.');if(cf>0&&I/cf>x.life)warnings.push('Simple payback is longer than the study period.');break;
 }
 case 'life-cycle-cost':{
  const r=pct(x.discount),pv=k=>{let v=x['capex_'+k];for(let t=1;t<=x.life;t++)v+=(x['annual_'+k]+x['risk_'+k])/(1+r)**t;if(x['replace_'+k]>0)v+=x['replace_'+k]/(1+r)**x['year_'+k];v-=x['residual_'+k]/(1+r)**x.life;return v;};const a=pv('a'),b=pv('b');
  add('Option A present cost',a,'currency');add('Option B present cost',b,'currency');add('A saving relative to B',b-a,'currency');add('Lower-cost option',a===b?'Equal':a<b?'Option A':'Option B');notes.push('One entered replacement event per option. Annual costs and expected risk costs occur at year end. Residual value is credited in the final year. Use constant money with a real discount rate, or nominal cash flows with a consistent nominal rate. Positive savings favour A; negative savings favour B.');break;
 }
 case 'carbon-savings':{
  const energy=x.energy*x.grid,oil=x.oil*x.oilfactor,mat=x.materials,annual=energy+oil+mat;let total=0;for(let y=0;y<x.life;y++)total+=energy*(1-pct(x.degrade))**y+oil+mat;
  add('First-year electricity emissions change',energy/1000,'t CO₂e/yr');add('First-year oil lifecycle change',oil/1000,'t CO₂e/yr');add('Other annual emissions change',mat/1000,'t CO₂e/yr');add('Total first-year avoided emissions',annual/1000,'t CO₂e/yr');add('Study-period avoided emissions',total/1000,'t CO₂e');notes.push('Positive means avoided emissions; negative means additional emissions. Grid decarbonization affects electricity only. Oil factors require a stated lifecycle boundary; do not substitute combustion factors for unburned oil. Prevent double counting between categories.');break;
 }
 case 'oil-spill-cost':{
  const cleanup=x.volume*x.cleanup,down=x.downtime*x.hourly,gross=cleanup+down+x.reg+x.env+x.reputation,net=gross-x.insurance,expected=net*pct(x.prob);
  add('Cleanup scenario cost',cleanup,'currency');add('Downtime scenario cost',down,'currency');add('Gross event cost',gross,'currency');add('Net event cost after recovery',net,'currency');add('Expected annual cost',expected,'currency/yr');add('Undiscounted expected study cost',expected*x.life,'currency');notes.push('User-supplied scenario costs, not legal penalties or an insurance quote. Insurance recovery is a confirmed amount after exclusions, limits and deductibles. The annual model assumes at most one event per year at constant probability and severity.');break;
 }
 case 'seal-compression':{
  const stretch=(x.groove/x.id-1)*100;
  // Constant torus volume: c² (groove ID + c) = original c² (original ID + c).
  const volume=x.cs*x.cs*(x.id+x.cs);let lo=0,hi=x.cs;
  for(let i=0;i<70;i++){const mid=(lo+hi)/2;if(mid*mid*(x.groove+mid)>volume)hi=mid;else lo=mid;}
  const c=(lo+hi)/2,squeeze=(c-x.depth)/c*100,ov=Math.PI*Math.PI*x.cs*x.cs*(x.id+x.cs)/4,gv=Math.PI*((x.groove+2*x.depth)**2-x.groove**2)/4*x.width,fill=ov/gv*100;
  add('Estimated installed cross-section',c,'mm');add('Radial squeeze after stretch',squeeze,'%');add('Groove volume filled',fill,'%');add('Inside-diameter stretch',stretch,'%');
  notes.push('External radial O-ring gland only, rectangular groove, nominal dimensions and constant elastomer volume. No thermal swelling or tolerance stack. Suitability depends on compound, motion, surface finish, extrusion clearance and pressure; this geometry does not rate the seal.');if(squeeze<=0)warnings.push('No positive radial squeeze with these dimensions.');if(fill>=100)warnings.push('O-ring volume equals or exceeds available groove volume.');if(stretch>5)warnings.push('Stretch exceeds 5%. Confirm the permitted stretch for the selected compound and application.');break;
 }
 case 'surface-finish':{
  add('Measured Ra',x.ra,'µm');add('Assumed Rz estimate',x.ra*x.factor,'µm');add('Difference from entered Ra limit',x.ra-x.limit,'µm');notes.push('Only the µm ↔ µin conversion is exact. Rz/Ra is an assumed ratio, not a conversion between equivalent parameters. Ra alone cannot establish sealing suitability or bearing area. Compare measured profiles, filtering, evaluation length and lay with the supplier drawing.');if(x.ra>x.limit)warnings.push('Entered Ra is above your specified limit.');break;
 }
 default:throw new Error('Unknown calculator');
 }
 if(rows.some(r=>typeof r.value==='number'&&!Number.isFinite(r.value)))throw new Error('The inputs produce a value outside the supported numerical range.');
 return {rows,notes,warnings};
}
