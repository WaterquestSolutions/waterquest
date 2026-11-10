import {matchesFunding} from './pilot-model.js';
const $=s=>document.querySelector(s);
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

filterFunding();
