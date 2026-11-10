// Catalogue screening is preliminary; a quoted duty point establishes the selection.
const product=(label,path,why)=>({label,url:'/products/'+path+'/',why});
const hpu=product('Water hydraulic power units','water-hydraulics-hpu','Turn the required duty into a complete pump, drive, filtration and control package.');
const pumps=product('Compare axial piston pumps','axial-piston-pumps','Compare delivered-flow curves, displacement, inlet arrangement and drive power.');
const motors=product('Compare water hydraulic motors','water-hydraulic-motors','Match shaft speed, starting torque, continuous torque and available flow.');
const cylinders=product('Water hydraulic cylinders','water-hydraulic-cylinders','Match force in both directions, stroke, mounting and load holding.');
const valves=product('Water hydraulic valves','water-hydraulic-valves','Select the required flow, pressure and control function for the circuit.');
const flow=product('Flow control valves','water-hydraulic-valves/flow-control-valve','Review metering capacity and pressure drop at the calculated flow.');
const pressure=product('Electronic pressure control','water-hydraulic-valves/electronic-pressure-control-valve','Review controlled pressure changes, response and circuit protection.');
const fittings={label:'WQS Stainless connection hardware',url:'/products/#connection-hardware',why:'Select actual internal bore, connection standard, material and pressure rating for the pipework.'};
export const equipmentRoutes={
 'pump-sizing':[hpu,pumps,valves], 'motor-speed':[motors,hpu,flow], 'cylinder-force':[cylinders,hpu,valves],
 'power':[hpu,pumps,motors], 'hydraulic-efficiency':[hpu,pumps,motors],
 'flow-rate':[pumps,flow,hpu], 'pipe-velocity':[fittings,valves,hpu],
 'pressure-loss':[fittings,valves,hpu], 'reynolds-number':[fittings,flow,hpu],
 'pressure-drop':[hpu,pumps,valves], 'orifice':[flow,valves,hpu],
 'water-hammer':[pressure,valves,hpu], 'accumulator':[hpu,pressure,valves],
 'seal-compression':[cylinders,valves,hpu], 'surface-finish':[cylinders,motors,hpu],
 'roi':[hpu,pumps,cylinders], 'energy-savings':[hpu,pumps,flow],
 'carbon-savings':[hpu,cylinders,motors], 'life-cycle-cost':[hpu,pumps,valves],
 'oil-spill-cost':[hpu,cylinders,motors]
};
const context={
 'pump-sizing':'Use the calculated displacement and shaft power to start a pump or complete power-unit quotation.',
 'motor-speed':'Use the calculated speed, torque and target-speed flow to specify the motor, supply and controls.',
 'cylinder-force':'Start with the force-screened cylinder links below, then complete the circuit with a power unit and valves.',
 'power':'Use hydraulic output and required shaft power to define the drive package.',
 'hydraulic-efficiency':'Use the measured efficiency to compare equipment and control options at the same duty.',
 'flow-rate':'Use the calculated flow as the starting point for pump and valve selection. Confirm which measurement represents the project duty.',
 'pipe-velocity':'Use the calculated internal diameter to select pipework and connection hardware; nominal thread size alone does not establish bore.',
 'pressure-loss':'Use the calculated losses to review pipe bore, valve capacity and the pressure needed from the power unit.',
 'reynolds-number':'Use the flow regime and friction estimate to refine pipework and valve selection; this result alone does not size a pump.',
 'pressure-drop':'Use the design differential and required flow to define the pump and complete power-unit duty.',
 'orifice':'Use the calculated flow and pressure drop to compare metering valves and the supply package. Confirm cavitation limits.',
 'water-hammer':'Use the pressure excursion to review valve closure and circuit design. The linked products require a transient review before selection.',
 'accumulator':'Request an integrated water-compatible accumulator arrangement sized around the calculated volume and pressure range. No standalone accumulator model is selected here.',
 'seal-compression':'Use the calculated squeeze, stretch and fill to brief a seal or service-parts enquiry for the selected component. Geometry alone cannot identify a seal compound or part number.',
 'surface-finish':'Use the measured finish and specified limit to define cylinder, motor or service requirements. A finish result alone cannot select a component.',
 'roi':'Turn the investment assumptions into a priced WQS equipment proposal, then compare the quoted costs with your model.',
 'energy-savings':'Request a pump and control package for the same useful duty, then validate the assumed electricity reduction.',
 'carbon-savings':'Explore oil-free equipment for the project, then replace assumptions with measured energy and documented lifecycle data.',
 'life-cycle-cost':'Request comparable equipment, maintenance and spare-parts pricing for each option in your cost model.',
 'oil-spill-cost':'Explore a water hydraulic circuit for the application and request a quotation to compare with the entered spill-cost scenario.'
};
// Published ordering options; P1 is deliberately kept out of automatic screening
// because its pressure rating differs between configurations.
const pumpData=[
 ['P3',[3],1.75,6],['P6',[4.6,6],3.8,12],['P15',[12,15,19],11,37.2],
 ['P30',[23,30,35],19.5,66],['P60',[51,63,70.3],42,140.6],['P180',[180,225],114,430]
];
export function screenPumps(v){
 if(!['flow','pressure','speed','ve','me'].every(k=>Number.isFinite(v[k])&&v[k]>0)||v.pressure>160||v.ve>100||v.me>100||v.speed>2000)return [];
 return pumpData.flatMap(([model,options,maxPower,maxFlow])=>options.map(d=>{
  const q=d*v.speed*v.ve/100000,shaft=q*v.pressure/(600*v.ve/100*v.me/100);
  return {model,displacement:d,flow:q,power:shaft,boosted:model==='P180'||v.speed>1800,url:`/products/axial-piston-pumps/${model.toLowerCase()}/`};
 }).filter(c=>c.flow>=v.flow&&c.flow<=maxFlow&&c.power<=maxPower)).sort((a,b)=>a.flow-b.flow).slice(0,3);
}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function equipmentHTML(id){
 const cards=equipmentRoutes[id];if(!cards)throw new Error('Missing equipment route: '+id);
 return `<section class="wqc-equipment" id="equipment-options" aria-labelledby="equipment-title"><p class="wqc-equipment-kicker">Calculate · Select · Request a quotation</p><h3 id="equipment-title">Put this result to work</h3><p>${escape(context[id])}</p><div id="equipment-duty"></div><div class="wqc-equipment-grid">${cards.map(c=>`<article><h4><a href="${escape(c.url)}">${escape(c.label)} →</a></h4><p>${escape(c.why)}</p></article>`).join('')}</div><p class="wqc-equipment-basis">These links identify equipment to review. Final selection depends on the complete operating duty, working water and the selected configuration. Financial and carbon results describe your assumptions, not guaranteed equipment performance.</p></section>`;
}
export function renderEquipment(id,v,result,{us,format,convert,label}){
 const box=document.getElementById('equipment-options');if(!box)return;
 const duty=box.querySelector('#equipment-duty');duty.replaceChildren();
 const paragraph=text=>{const p=document.createElement('p');p.textContent=text;duty.append(p);};
 if(id==='pump-sizing'){
  const candidates=screenPumps(v);
  paragraph('Preliminary pump screen using your entered speed and efficiencies. Delivered flow and shaft power below are calculated estimates; confirm both against the selected manufacturer curve. Boosted inlet requirements apply above 1,800 rpm and to P180.');
  if(!candidates.length){paragraph('No automatic pump candidate meets this entered duty within the screened limits. Request a configured system quotation; do not select a smaller pump from the range links.');return;}
  const list=document.createElement('ul');for(const c of candidates){const li=document.createElement('li'),a=document.createElement('a');a.href=c.url;a.textContent=`Review ${c.model} · ${format(c.displacement)} cm³/rev (${format(c.displacement/16.387064)} in³/rev) · estimated ${format(convert(c.flow,'L/min',us))} ${label('L/min')} at ${format(v.speed)} rpm · ${format(convert(c.power,'kW',us))} ${label('kW')} shaft input${c.boosted?' · boosted configuration':''}`;li.append(a);list.append(li);}duty.append(list);
 }else if(id==='motor-speed'){
  const match=[[3,'m3-water-hydraulic-motor'],[6,'m6-water-hydraulic-motor'],[15,'m15-water-hydraulic-motor'],[30,'m30-water-hydraulic-motor'],[63,'m60-axial-piston-water-hydraulic-motor'],[70.3,'m60-axial-piston-water-hydraulic-motor'],[180,'m180-axial-piston-water-hydraulic-motor'],[225,'m180-axial-piston-water-hydraulic-motor']].find(([d])=>Math.abs(v.disp-d)<0.001);
  if(match&&v.pressure<=160){const a=document.createElement('a');a.href='/products/water-hydraulic-motors/'+match[1]+'/';a.textContent='Review the motor family with your entered displacement →';duty.append(a);paragraph('Displacement reference only: confirm calculated speed, starting and running torque, flow, return pressure and case-drain arrangement against its curves.');}
  else paragraph('The entered displacement or pressure needs configuration review. Use the motor range and request a complete duty-point selection.');
 }else if(id==='water-hammer'&&result.rows.some(r=>r.label==='Initial pressure plus amplitude'&&r.value>160)){
  paragraph('Your calculated peak exceeds 160 bar (2,321 psi). No WQS component is offered as a match for that peak; request a transient and protection review before equipment selection.');
 }
}
