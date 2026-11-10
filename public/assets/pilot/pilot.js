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
