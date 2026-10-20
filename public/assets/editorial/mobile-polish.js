/* Compact section chooser retains every product/industry destination on phones. */
(() => {
 document.querySelectorAll('.wq-model-nav').forEach(bar => {
  const links=[...bar.querySelectorAll('.wq-model-links a')]; if(!links.length)return;
  const select=document.createElement('select');select.className='wq-mobile-family';
  select.setAttribute('aria-label',bar.classList.contains('wq-industry-nav')?'Choose an industry':'Choose a product or section');
  const prompt=new Option(bar.classList.contains('wq-industry-nav')?'Choose an industry':'Choose a model or section','');prompt.disabled=true;select.add(prompt);
  links.forEach(a=>select.add(new Option(a.textContent.trim(),a.getAttribute('href'))));
  const sync=()=>{const current=links.find(a=>a.getAttribute('aria-current'))||links.find(a=>new URL(a.href).pathname===location.pathname);if(current)select.value=current.getAttribute('href');else{select.selectedIndex=0;}};
  select.addEventListener('change',()=>{if(select.value)location.assign(select.value)});
  bar.querySelector('.wq-model-nav-inner').append(select);sync();window.addEventListener('hashchange',sync);
 });
 document.querySelectorAll('.wq-site-header .wq-nav-toggle').forEach(toggle=>{
  const header=toggle.closest('.wq-site-header');
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&header.classList.contains('wq-menu-open')){toggle.click();toggle.focus()}});
 });
})();
