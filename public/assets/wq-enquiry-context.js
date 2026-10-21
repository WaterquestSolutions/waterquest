/* Carry the page and requested action into the existing verified Zoho review form. */
(function(){
 'use strict';
 const form=document.getElementById('engineering-review');
 if(!form)return;
 const q=new URLSearchParams(location.search),interest=q.get('interest'),from=q.get('from'),source=q.get('source');
 const message=document.getElementById('er-message');
 if(interest&&message&&!message.value){
  const clean=s=>String(s||'').replace(/[\r\n]/g,' ').slice(0,300);
  message.value='Enquiry: '+clean(interest)+'\n'+(from?'Source page: '+clean(from)+'\n':'')+(source?'Section: '+clean(source)+'\n':'')+'\nOperating requirements: ';
  message.dispatchEvent(new Event('input',{bubbles:true}));
 }
})();

// Shared section decoration, independent of the enquiry form and page template.
(function () {
 'use strict';
 document.querySelectorAll('[data-wqr-hero], .wqr-closing-panel').forEach(function (section, sectionIndex) {
  if (section.querySelector(':scope > .wqr-bubbles')) return;
  const layer = document.createElement('div');
  layer.className = 'wqr-bubbles';
  layer.setAttribute('aria-hidden', 'true');
  const count = section.hasAttribute('data-wqr-hero') ? 22 : 16;
  for (let i = 0; i < count; i++) {
   const bubble = document.createElement('span');
   const seed = i + sectionIndex * 23;
   const size = 7 + seed * 7 % 19;
   bubble.style.cssText = `width:${size}px;height:${size}px;left:${2 + seed * 37 % 96}%;top:${seed * 29 % 100}%;--wqr-drift:${seed * 17 % 81 - 40}px;animation-duration:${18 + seed * 3 % 15}s;animation-delay:-${seed * 7 % 30}s;`;
   layer.appendChild(bubble);
  }
  section.prepend(layer);
 });
})();
