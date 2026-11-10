(() => {
 'use strict';
 // Search is progressive enhancement: every link stays available without JavaScript.
 for (const input of document.querySelectorAll('[data-wqx-filter]')) {
  const target=document.querySelector(input.dataset.wqxFilter);
  if(!target)continue;
  const items=[...target.querySelectorAll('[data-wqx-search]')];
  const status=document.getElementById(input.getAttribute('aria-describedby'));
  input.addEventListener('input',()=>{const terms=input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);let count=0;
   for(const item of items){const match=terms.every(term=>(item.dataset.wqxSearch+' '+item.textContent).toLowerCase().includes(term));item.hidden=!match;if(match)count++;}
   if(status)status.textContent=count+' matching '+(count===1?'item':'items')+'.';
  });
 }
})();
