import {industries,fieldDefinitions,validateReview} from './schema.js';
const form=document.querySelector('#engineering-review');
const el=id=>document.getElementById('er-'+id);
const drafts=new Map();let activeIndustry='',lastPayload='',reference='',received=false,verifiedFields;
const text=(tag,value)=>{const node=document.createElement(tag);node.textContent=value;return node;};
const collect=()=>Object.fromEntries([...new FormData(form)].map(([k,v])=>[k,v]));
function values(){if(received)return verifiedFields;const fields=collect();fields.consent=el('consent').checked;fields.ndaRequested=el('ndaRequested').checked;return fields;}
function rows(fields){return fieldDefinitions(fields.industry).filter(([key])=>fields[key]&& !['pressureUnit','flowUnit'].includes(key)).map(([key,label])=>[label,key==='industry'?industries[fields.industry]?.label:fields[key]+(key==='pressure'?' '+fields.pressureUnit:key==='flow'?' '+fields.flowUnit:'')]).concat([['NDA requested',fields.ndaRequested?'Yes':'No'],['Contact permission',fields.consent?'Yes':'Not yet confirmed'],['Marketing signup','No']]);}
function summary(){const list=el('summary-list');list.replaceChildren();for(const [label,value] of rows(values()))list.append(text('dt',label),text('dd',value));const p=Number(el('pressure').value),unit=el('pressureUnit').value;el('pressure-note').hidden=!(p*(unit==='psi'?0.0689475729:unit==='MPa'?10:1)>160);}
function changeIndustry(){
 if(activeIndustry)drafts.set(activeIndustry,Object.fromEntries([...el('sector-fields').querySelectorAll('textarea')].map(n=>[n.name,n.value])));
 activeIndustry=el('industry').value;const sector=industries[activeIndustry];el('application').replaceChildren(new Option(sector?'Choose…':'Choose an industry first',''));el('application').disabled=!sector;document.getElementById('application-help').textContent=sector?'Choose the closest application, or select Other / not sure.':'Choose your industry first.';
 el('sector').hidden=!sector;el('sector-fields').replaceChildren();
 if(sector){for(const label of sector.applications)el('application').add(new Option(label,label));el('sector-title').textContent=sector.label+' context';for(const [key,label,hint] of sector.questions){const id='sector_'+key,wrap=text('div','');wrap.className='er-field';const lab=text('label',label+' (optional)');lab.htmlFor='er-'+id;const input=text('textarea','');input.id='er-'+id;input.name=id;input.maxLength=1000;input.rows=3;input.value=drafts.get(activeIndustry)?.[id]||'';input.setAttribute('aria-describedby',id+'-help '+id+'-error');const help=text('small',hint);help.id=id+'-help';const error=text('small','');error.id=id+'-error';error.className='er-error';wrap.append(lab,input,help,error);el('sector-fields').append(wrap);}}
 el('industry-link').href=sector?.slug?'/industries/'+sector.slug+'/':'/industries/';clearErrors();summary();
}
function clearErrors(){el('errors').hidden=true;el('errors').replaceChildren();for(const n of form.querySelectorAll('.er-error'))n.textContent='';for(const n of form.querySelectorAll('[aria-invalid]'))n.removeAttribute('aria-invalid');}
function showErrors(errors){clearErrors();el('errors').append(text('strong','Please check these details:'));const list=document.createElement('ul');for(const [key,message]of Object.entries(errors)){const input=el(key);const error=document.getElementById(key+'-error');if(error)error.textContent=message;if(input){input.setAttribute('aria-invalid','true');input.closest('details')?.setAttribute('open','');}const li=document.createElement('li'),link=text('a',message);link.href='#er-'+key;link.addEventListener('click',()=>input?.focus());li.append(link);list.append(li);}el('errors').append(list);el('errors').hidden=false;el('errors').focus();}
function status(message,type){el('status').textContent=message;el('status').dataset.state=type;el('status').focus();}
el('industry').addEventListener('change',changeIndustry);
form.addEventListener('input',()=>{summary();if(!received)el('status').textContent='';});
form.addEventListener('change',summary);
el('download').addEventListener('click',()=>{
 const lines=['WaterQuest Solutions — engineering review',received?'Verified receipt: '+reference:'Draft / receipt not confirmed'+(reference?' — reference '+reference:''),'Prepared: '+new Date().toLocaleString(),'',...rows(values()).map(([label,value])=>label+': '+value)];
 let area=el('copy-text');if(!area){const wrap=document.createElement('div');wrap.className='er-request-copy';const label=text('label','Your request copy — select the text to copy and save it.');label.htmlFor='er-copy-text';area=document.createElement('textarea');area.id='er-copy-text';area.readOnly=true;area.rows=10;wrap.append(label,area);el('download').closest('.er-actions').after(wrap);}
 area.value=lines.join('\n\n');area.focus();area.select();
});
form.addEventListener('submit',async event=>{
 event.preventDefault();if(received||form.getAttribute('aria-busy')==='true')return;
 const checked=validateReview(values());if(Object.keys(checked.errors).length){showErrors(checked.errors);return;}clearErrors();
 const serial=JSON.stringify(checked.fields);if(serial!==lastPayload){reference='WQ-'+crypto.randomUUID();lastPayload=serial;}
 const controls=[...form.elements].filter(n=>!n.disabled);controls.forEach(n=>n.disabled=true);form.setAttribute('aria-busy','true');el('submit').textContent='Verifying receipt…';status('Saving your request and checking receipt. Please keep this page open.','pending');
 try{const response=await fetch(form.action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({source:'engineering-review',reference,fields:checked.fields}),signal:AbortSignal.timeout(30000)});const result=await response.json();
 if(!response.ok||result.ok!==true||result.delivery!=='crm_verified'||result.reference!==reference||!/^\d+$/.test(result.recordId||'')){if(result.error==='invalid_submission'){if(result.fields)showErrors(result.fields);throw new Error('rejected');}if(result.error==='service_not_configured')throw new Error('unavailable');throw new Error('unconfirmed');}
 verifiedFields=checked.fields;received=true;status('Request received. Reference: '+reference+'. Your engineering review is saved in WaterQuest’s CRM. Use “View request copy” to keep the details for your records.','success');el('submit').textContent='Request received';
 }catch(error){const definite=error.message==='unavailable';status((error.message==='rejected'?'Your request was not sent. Check the highlighted details before retrying.':definite?'Your request was not sent: the submission service is not configured.':'We could not confirm receipt. Your request may have arrived; retry without changing the details to keep the same reference.')+' Your entries are still here. You can copy your request and contact bruce@waterquestsolutions.com. Reference: '+reference,'error');el('submit').textContent='Retry review request';}
 finally{form.removeAttribute('aria-busy');controls.forEach(n=>n.disabled=false);if(received){for(const n of form.querySelectorAll('input,select,textarea'))n.readOnly=true;for(const n of form.querySelectorAll('select,input[type=checkbox]'))n.disabled=true;el('submit').disabled=true;}el('download').disabled=false;}
});
const queryIndustry=new URLSearchParams(location.search).get('industry');if(Object.hasOwn(industries,queryIndustry))el('industry').value=queryIndustry;
changeIndustry();el('submit').disabled=false;el('download').disabled=false;
el('preview-note').hidden=!['localhost','127.0.0.1'].includes(location.hostname);
window.addEventListener('beforeunload',event=>{if(!received&&el('message').value){event.preventDefault();event.returnValue='';}});
