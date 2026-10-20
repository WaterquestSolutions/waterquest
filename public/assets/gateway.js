(function () {
  'use strict';
  const main = document.getElementById('waterquest-main');
  const nav = document.getElementById('nav');
  // Restore the original aqua bubbles behind every homepage section.
  if (main) {
    main.querySelectorAll(':scope > section').forEach((section, sectionIndex) => {
      if (section.querySelector(':scope > .wqg-bubbles')) return;
      const layer = document.createElement('div');
      layer.className = 'bubble-layer wqg-bubbles';
      layer.setAttribute('aria-hidden', 'true');
      const count = section.id === 'hero' ? 18 : 10;
      for (let i = 0; i < count; i++) {
        const bubble = document.createElement('span');
        bubble.className = 'bubble';
        // Stable variation makes the retained template reproducible.
        const seed = i + sectionIndex * 19;
        const size = 4 + (seed * 7 % 10);
        const duration = 16 + (seed * 3 % 13);
        bubble.style.cssText = `width:${size}px;height:${size}px;left:${3 + seed * 37 % 94}%;bottom:${seed * 23 % 80}%;--drift:${seed * 17 % 81 - 40}px;animation-duration:${duration}s;animation-delay:-${2 + seed * 7 % duration}s;`;
        layer.appendChild(bubble);
      }
      section.prepend(layer);
    });
  }
  // Preserve the original fixed navigation and account for its actual height.
  if (nav && main) {
    const syncHeader = () => main.style.setProperty('--wqg-nav-height', `${Math.ceil(nav.getBoundingClientRect().height)}px`);
    syncHeader();
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(syncHeader).observe(nav);
    else window.addEventListener('resize', syncHeader, {passive:true});
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  }
  const matchesResource = (query, text) => query.trim().toLowerCase().split(/\s+/).filter(Boolean).every(word => text.toLowerCase().includes(word));
  const search=document.getElementById('wqg-search');
  if (search) {
    const controls=document.querySelector('.wqg-library-controls');
    const cards=[...document.querySelectorAll('[data-resource]')];
    const buttons=[...document.querySelectorAll('.wqg-filter-row button')];
    const status=document.getElementById('wqg-resource-status');
    const more=document.querySelector('[data-more-resources]');
    const empty=document.querySelector('.wqg-library-empty');
    let category='All';
    let limit=6;
    function filter(focusNew=false) {
      const matches=cards.filter(card=>(category==='All'||category===card.dataset.category)&&matchesResource(search.value,card.dataset.search));
      const visible=matches.slice(0,limit);
      const previouslyVisible=new Set(cards.filter(card=>!card.hidden));
      cards.forEach(card=>{card.hidden=!visible.includes(card);});
      buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category===category)));
      status.textContent=`Showing ${visible.length} of ${matches.length} ${category==='All'?'resources':category.toLowerCase()}${search.value.trim()?' matching your search':''}.`;
      more.hidden=matches.length<=limit;
      more.textContent=`Show ${Math.min(6,Math.max(0,matches.length-limit))} more resources`;
      empty.hidden=matches.length>0;
      if (focusNew) {const first=visible.find(card=>!previouslyVisible.has(card));if(first)first.querySelector('a').focus();}
    }
    controls.hidden=false;
    search.addEventListener('input',()=>{limit=6;filter();});
    document.getElementById('wqg-search-form').addEventListener('submit',event=>{event.preventDefault();limit=6;filter();});
    buttons.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.category;limit=6;filter();}));
    more.addEventListener('click',()=>{limit+=6;filter(true);});
    document.querySelector('[data-reset-search]').addEventListener('click',()=>{search.value='';category='All';limit=6;filter();search.focus();});
    filter();
  }
})();
