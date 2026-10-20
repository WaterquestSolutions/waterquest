import {definitions,defaults,validate} from './definitions.js';
import {calculate,convert,unconvert,unitLabel,conversions} from './engine.js';
import {displayMeasurements,displayHint} from './display.js';
import {createReport,reportHTML,createPDF} from './report.js?v=20261015-print-brand';
const root=document.getElementById('calculator-app');
const format=n=>typeof n==='number'?new Intl.NumberFormat('en-CA',{maximumSignificantDigits:5}).format(Object.is(n,-0)?0:n):n;
const $=id=>document.getElementById(id);
if(root){
 const id=root.dataset.calculator,definition=definitions[id];
 let values=defaults(id),us=false,currency='CAD',example=true;
 const fields=definition.fields;
 const physical=fields.some(f=>conversions[f.unit]);
 $('btn-metric').hidden=!physical;$('btn-imperial').hidden=!physical;
 const label=u=>unitLabel(u,us,currency);
 const pressureLimit=$('calculator-operating-limit')?.querySelector('strong');
 const pressureLimitSI=pressureLimit?.textContent;
 const waterTable=[...root.querySelectorAll('table')].find(t=>t.caption?.textContent.includes('implemented MIT correlation'));
 const waterRows=waterTable?[...waterTable.tBodies[0].rows].map(tr=>[...tr.cells].map(c=>c.textContent)):[];
 function updateLabels(){
  for(const f of fields){if(f.options)continue;const el=$(f.id);const display=values[f.id]==null?'':Number(convert(values[f.id],f.unit,us).toPrecision(12));el.value=display;
   $(f.id+'-unit').textContent=label(f.unit);
   const hint=$(f.id+'-hint');if(hint)hint.textContent=displayHint(f.hint,us);
   el.removeAttribute('min');el.removeAttribute('max');
   if(f.min!=null)el.min=convert(f.min,f.unit,us);if(f.max!=null)el.max=convert(f.max,f.unit,us);
   el.step=f.integer?'1':'any';
  }
  $('btn-metric').setAttribute('aria-pressed',String(!us));$('btn-imperial').setAttribute('aria-pressed',String(us));
  if(waterTable){
   const cols=['°C',null,'kg/m³','mPa·s','mm²/s'];
   waterTable.tHead.rows[0].cells[2].textContent='Density, '+label('kg/m³');
   waterTable.tHead.rows[0].cells[3].textContent='Dynamic viscosity, '+label('mPa·s');
   waterTable.tHead.rows[0].cells[4].textContent='Kinematic viscosity, '+label('mm²/s');
   [...waterTable.tBodies[0].rows].forEach((tr,i)=>cols.forEach((unit,j)=>{if(unit)tr.cells[j].textContent=us?format(convert(parseFloat(waterRows[i][j]),unit,true))+(j===0?' °F':''):waterRows[i][j];}));
  }
  if(pressureLimit)pressureLimit.textContent=displayMeasurements(pressureLimitSI,us);
  const sample=createReport(id,defaults(id),{us,currency,example:true});
  document.querySelectorAll('.wqc-example-grid table').forEach((table,i)=>{
   const rows=i===0?sample.inputs:sample.results,body=document.createElement('tbody');
   table.querySelector('caption').textContent=`Example ${i===0?'inputs':'results'} (${sample.mode})`;
   for(const row of rows){const tr=document.createElement('tr'),th=document.createElement('th'),td=document.createElement('td');th.scope='row';th.textContent=row.label;td.textContent=row.value;tr.append(th,td);body.append(tr);}
   table.querySelector('tbody').replaceWith(body);
  });
  $('unit-note').textContent=!physical?'Use one currency and a consistent price-year basis for all cash flows.':us?'US customary units. Values have been converted; this is the same physical scenario.':'SI units. Pressure is shown in bar; 10 bar = 1 MPa.';
 }
 function render(){
  const errors=Object.fromEntries(Object.entries(validate(id,values)).map(([key,msg])=>[key,displayMeasurements(msg,us).replace(' (SI basis)','')]));
  for(const f of fields){const msg=errors[f.id]||'';$(f.id).setAttribute('aria-invalid',String(Boolean(msg)));$(f.id+'-error').textContent=msg;}
  $('input-errors').replaceChildren();
  if(Object.keys(errors).length){
   $('input-errors').hidden=false;const p=document.createElement('p');p.textContent='Check the highlighted inputs. Results are cleared until the values are valid.';$('input-errors').append(p);
   const ul=document.createElement('ul');for(const [key,msg] of Object.entries(errors)){const li=document.createElement('li'),a=document.createElement('a');a.href='#'+key;a.textContent=fields.find(f=>f.id===key).label+': '+msg;li.append(a);ul.append(li);}$('input-errors').append(ul);
   $('result-grid').replaceChildren();$('result-status').textContent='Waiting for valid inputs';$('calc-notes').replaceChildren();$('calc-warnings').replaceChildren();return;
  }
  $('input-errors').hidden=true;
  let result;try{result=calculate(id,values);}catch(e){$('result-grid').replaceChildren();$('calc-notes').replaceChildren();$('calc-warnings').replaceChildren();$('result-status').textContent='Calculation unavailable';$('input-errors').hidden=false;$('input-errors').textContent=e.message;return;}
  $('result-status').textContent=example?'Example results — replace the inputs for your project':'Results updated from your inputs';
  $('result-grid').replaceChildren();
  for(const r of result.rows){const cell=document.createElement('div');cell.className='wqc-result';const title=document.createElement('dt');title.textContent=r.label;const value=document.createElement('dd');value.className='wqc-value';
   const numeric=typeof r.value==='number';value.textContent=format(numeric?convert(r.value,r.unit,us):r.value);if(numeric&&r.unit){const unit=document.createElement('span');unit.textContent=' '+label(r.unit);value.append(unit);}cell.append(title,value);
   $('result-grid').append(cell);
  }
  for(const [target,list] of [['calc-notes',result.notes],['calc-warnings',result.warnings]]){$(target).replaceChildren();for(const text of list){const p=document.createElement('p');p.textContent=displayMeasurements(text,us);$(target).append(p);}}
 }
 for(const f of fields){const el=$(f.id);el.addEventListener('input',()=>{example=false;values[f.id]=f.options?f.options.find(o=>String(o[0])===el.value)?.[0]:(el.value.trim()===''?null:unconvert(Number(el.value),f.unit,us));render();});}
 for(const [button,newUS] of [['btn-metric',false],['btn-imperial',true]])$(button).addEventListener('click',()=>{us=newUS;updateLabels();render();});
 $('currency')?.addEventListener('change',e=>{currency=e.target.value;updateLabels();render();});
 $('calc-form').addEventListener('submit',e=>{e.preventDefault();render();const invalid=fields.find(f=>$(f.id).getAttribute('aria-invalid')==='true');if(invalid)$(invalid.id).focus();else $('results').focus();});
 $('reset-example').addEventListener('click',()=>{values=defaults(id);example=true;for(const f of fields)if(f.options)$(f.id).value=f.value;updateLabels();render();});
 $('clear-inputs').addEventListener('click',()=>{for(const f of fields)if(!f.options)values[f.id]=null;example=false;updateLabels();render();$(fields.find(f=>!f.options).id).focus();});
 const exportStatus=$('export-status');
 const report=()=>createReport(id,values,{us,currency,example});
 function checkedReport(){render();try{return report();}catch(e){exportStatus.textContent=e.message;const invalid=fields.find(f=>$(f.id).getAttribute('aria-invalid')==='true');if(invalid)$(invalid.id).focus();return null;}}
 const printArea=document.createElement('article');printArea.id='wqc-print-report';document.body.append(printArea);
 function preparePrint(){try{printArea.innerHTML=reportHTML(report());}catch{printArea.innerHTML='<h1>Calculation not ready</h1><p>Correct the highlighted inputs before printing a calculation report. No valid results are available.</p>';}}
 window.addEventListener('beforeprint',preparePrint);
 $('print-results').addEventListener('click',async()=>{if(!checkedReport())return;preparePrint();try{await Promise.all([...printArea.querySelectorAll('img')].map(img=>img.decode()));}catch{exportStatus.textContent='The report logo could not load. Please reload and try again.';return;}exportStatus.textContent='Print dialog requested. Choose Save as PDF there, or use Save PDF for a direct download.';window.print();});
 let pdfAssets,downloadURL;
 function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>{s.remove();reject(new Error('PDF support could not load. Check your connection and try again.'));};document.head.append(s);});}
 function assets(){return pdfAssets??=(async()=>{if(!window.PDFLib)await loadScript('/assets/calculators-v2/vendor/pdf-lib.min.js');if(!window.fontkit)await loadScript('/assets/calculators-v2/vendor/fontkit.umd.min.js');const response=await fetch('/assets/calculators-v2/vendor/DejaVuSans.ttf');if(!response.ok)throw new Error('PDF font could not load. Please try again.');return response.arrayBuffer();})().catch(e=>{pdfAssets=null;throw e;});}
 $('save-pdf').addEventListener('click',async()=>{
  const snapshot=checkedReport();if(!snapshot)return;const button=$('save-pdf');button.disabled=true;exportStatus.textContent='Preparing PDF…';
  try{const font=await assets(),bytes=await createPDF(snapshot,window.PDFLib,window.fontkit,font),a=document.createElement('a');if(downloadURL)URL.revokeObjectURL(downloadURL);downloadURL=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));a.href=downloadURL;a.download=`WaterQuest-${id}-${snapshot.date.slice(0,10)}.pdf`;a.textContent='Download prepared PDF';exportStatus.replaceChildren(document.createTextNode('PDF prepared from the inputs at the time you selected Save PDF. If the download does not start, use this link: '),a);a.click();}catch(e){exportStatus.textContent=e.message||'PDF could not be saved. Please try Print report.';}finally{button.disabled=false;}
 });
 updateLabels();render();
}
const search=$('calculator-search');
if(search){const category=$('calculator-category');const apply=()=>{let count=0;for(const card of document.querySelectorAll('.wqc-tool-card')){const show=(!category.value||card.dataset.category===category.value)&&card.textContent.toLowerCase().includes(search.value.toLowerCase().trim());card.hidden=!show;if(show)count++;}$('calculator-count').textContent=`${count} of 20 calculators`;$('no-matches').hidden=count>0;};search.addEventListener('input',apply);category.addEventListener('change',apply);}
