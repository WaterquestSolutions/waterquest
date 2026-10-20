import {createBriefPDF, pilotBrief, loadBriefAssets} from '../briefs/pdf.js';
import { compareBudget, matchesFunding } from './pilot-model.js';
const $ = selector => document.querySelector(selector);
const money = value => new Intl.NumberFormat('en-CA', {style:'currency',currency:'CAD',currencyDisplay:'code',maximumFractionDigits:2}).format(value);
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bubbleLayer = $('#pilot-bubbles');
for (let i = 0; i < 27; i++) {
  const bubble = document.createElement('span');
  bubble.className = 'p-bubble';
  const size = 5 + ((i * 17) % 20);
  Object.assign(bubble.style,{width:`${size}px`,height:`${size}px`,left:`${(i * 37) % 100}%`,animationDuration:`${22 + i % 19}s`,animationDelay:`-${i * 3}s`});
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) bubble.style.top = `${(i * 13) % 100}%`;
  bubbleLayer.append(bubble);
}
$('#funding-controls').hidden = false;
const cards = [...document.querySelectorAll('.p-fund')];
function filterFunding() {
  let count = 0;
  cards.forEach(card => {
    const show = matchesFunding(card.dataset.region,card.dataset.applicants,$('#funding-region').value,$('#funding-applicant').value);
    card.hidden = !show;
    if (show) count++;
  });
  $('#funding-count').textContent = `${count} funding route${count === 1 ? '' : 's'} shown. National options are included. Check the regional contacts below for additional local routes.`;
}
$('#funding-region').addEventListener('change',filterFunding);
$('#funding-applicant').addEventListener('change',filterFunding);
$('#funding-reset').addEventListener('click',()=>{$('#funding-region').value='all';$('#funding-applicant').value='all';filterFunding();});
for (const element of document.querySelectorAll('[data-deadline]')) {
  if (Date.now() > Date.parse(element.dataset.deadline)) element.textContent = 'Published deadline has passed. Check Innovate BC for the current call status.';
}
const result = $('#budget-results');
const initialResult = result.innerHTML;
const budget = $('#pilot-budget');
const years = value => value === null ? 'No simple payback' : value === 0 ? '0 years' : `${new Intl.NumberFormat('en-CA',{maximumFractionDigits:2}).format(value)} years`;
budget.addEventListener('submit',event=>{
  event.preventDefault();
  try {
    const v = compareBudget(Object.fromEntries(new FormData(budget)));
    result.innerHTML = `<p class="p-label">Your comparison · CAD</p><h3>${v.savings > 0 ? 'Compare the two investment cases.' : 'No positive annual operating saving.'}</h3><dl><div><dt>Annual operating ${v.savings < 0 ? 'cost increase' : 'saving'}</dt><dd class="p-result-large">${money(Math.abs(v.savings))}</dd></div><div><dt>Base investment / simple payback</dt><dd>${money(v.cost)} / ${years(v.basePayback)}</dd></div><div><dt>Investment after confirmed support / simple payback</dt><dd>${money(v.remaining)} / ${years(v.supportedPayback)}</dd></div></dl><p>Annual saving = existing cost − proposed cost.<br>Remaining investment = installed cost − confirmed non-repayable support − net tax benefit.</p><p class="p-note">${v.savings <= 0 ? 'Operating savings do not recover the investment in this scenario. ' : ''}Loans are not deducted. This simple comparison excludes financing, discounting, depreciation, tax effects on operations and residual value.</p>`;
  } catch(error) { result.innerHTML = `<p class="p-label">Check the figures</p><h3>One amount needs attention.</h3><p>${escapeHTML(error.message)}</p>`; }
});
budget.addEventListener('reset',()=>{result.innerHTML=initialResult;});
budget.addEventListener('input',()=>{result.innerHTML='<p class="p-label">Figures changed</p><h3>Recalculate your comparison.</h3><p>Select “Compare costs” to update the results using the current inputs.</p>';});
const form = $('#pilot-form');
const status = $('#delivery-status');
let lastPayload = '', requestId = '';
function briefFields() {
  const fields = Object.fromEntries(new FormData(form));
  fields.consent = form.elements.consent.checked;
  return fields;
}
function showStatus(message,kind='info') { status.textContent=message;status.dataset.kind=kind; }
let briefURL;
$('#save-brief').addEventListener('click',async()=>{
  const fields=briefFields(),button=$('#save-brief');
  const report=pilotBrief(fields);
  const text=[report.title,report.subtitle,'',...report.sections[0].fields.map(f=>`${f.label}: ${f.value===false?'Not agreed':f.value===true?'Agreed':f.value || 'Not provided'}`)].join('\n');
  button.disabled=true;button.textContent='Preparing PDF…';
  $('#brief-copy').value=text;
  $('#brief-copy-panel').hidden=false;
  button.setAttribute('aria-expanded','true');
  const link=$('#brief-download');link.hidden=true;link.removeAttribute('href');
  $('#brief-pdf-status').textContent='Preparing your PDF from the current entries…';
  try {
    const font=await loadBriefAssets();
    const bytes=await createBriefPDF(report,window.PDFLib,window.fontkit,font);
    if(briefURL)URL.revokeObjectURL(briefURL);
    briefURL=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
    link.href=briefURL;link.hidden=false;link.click();
    $('#brief-pdf-status').textContent='PDF prepared. If the download did not start, use Download PDF. This copy does not confirm submission.';
  } catch(error) { $('#brief-pdf-status').textContent=error.message+' Your entries remain available to copy below.'; }
  finally {button.disabled=false;button.textContent='Save brief as PDF';}
});
form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!form.reportValidity()) return;
  const fields=briefFields();
  const payload=JSON.stringify(fields);
  if(payload!==lastPayload) {requestId=crypto.randomUUID();lastPayload=payload;}
  const button=$('#pilot-send');button.disabled=true;button.textContent='Sending…';
  showStatus('Sending your pilot enquiry…');
  try {
    const response=await fetch('/api/pilot-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestId,fields}),signal:AbortSignal.timeout(25000)});
    const data=await response.json();
    if(!response.ok || !data.ok || !data.reference) {
      const message=data.error==='service_not_configured' ? 'Automatic email delivery is temporarily unavailable. Your entries remain here. Save a copy and contact bruce@waterquestsolutions.com, or try again later.' : data.error==='invalid_submission' ? 'Check the required fields, email address and consent. Your entries remain here.' : 'We could not confirm email acceptance. Your entries remain here. Retry with the same details or save a copy and contact bruce@waterquestsolutions.com.';
      throw new Error(message);
    }
    showStatus(`Your enquiry has been accepted by our email service for delivery to WaterQuest. Reference: ${data.reference}. Keep this reference and save a copy of your brief.`, 'success');
  } catch(error) {
    showStatus(error.name==='TimeoutError' || error.name==='TypeError' ? 'We could not confirm delivery because of a connection problem. Your entries remain here. Retry or save a copy of your brief.' : error.message,'error');
  } finally {button.disabled=false;button.textContent='Send pilot enquiry ↗';}
});
