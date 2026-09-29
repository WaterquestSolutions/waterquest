(() => {
 const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
 const menu=$('.wq-menu-toggle'), panel=$('#wq-mobile-menu');
 function closeMenu(){panel?.classList.remove('open');menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Open menu')}
 menu?.addEventListener('click',()=>{const open=panel.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu')});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
 document.addEventListener('click',e=>{if(!e.target.closest('#wq-mobile-menu,.wq-menu-toggle'))closeMenu()});
 panel?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
 window.addEventListener('scroll',()=>$('#wq-nav')?.classList.toggle('wq-scrolled',scrollY>20),{passive:true});
 const select=$('#visual-select'), download=$('#visual-download');
 select?.addEventListener('change',()=>{$$('.v-drawing').forEach(f=>f.hidden=f.id!==select.value);const link=$(`#${select.value} a`);download.href=link.href});
 const dialog=$('#image-viewer');let imageTrigger;
 $$('[data-enlarge]').forEach(link=>link.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey)return;e.preventDefault();imageTrigger=link;$('#viewer-image').src=link.href;$('#viewer-image').alt=link.dataset.title;$('#viewer-title').textContent=link.dataset.title;dialog.showModal()}));
 $('.v-close')?.addEventListener('click',()=>dialog.close());dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});dialog?.addEventListener('close',()=>imageTrigger?.focus());
 const config=$('#configuration-select');
 if(config){const data=JSON.parse($('#ordering-data').textContent);function update(){const row=data.rows[Number(config.value)];$('#selection-title').textContent=row[0];const dest=$('#selection-values');dest.replaceChildren();row.slice(1).forEach((v,i)=>{const span=document.createElement('small');span.textContent=data.columns[i+1]+': '+v;dest.append(span)});const a=$('#configuration-enquiry');a.href='mailto:bruce@waterquestsolutions.com?subject='+encodeURIComponent('Valve enquiry — '+data.title)+'&body='+encodeURIComponent('I would like to discuss '+data.title+'.\n\nSelected option: '+row.map((v,i)=>data.columns[i]+': '+v).join('; ')+'\n\nRequired flow:\nOperating pressure:\nFluid and temperature:\nQuantity:\nApplication:\n');}config.addEventListener('change',update);update()}
 const search=$('#valve-search'),filter=$('#valve-category'),cards=$$('[data-valve-card]');
 if(search&&filter){function apply(){const q=search.value.trim().toLowerCase(),group=filter.value;let count=0;cards.forEach(c=>{const show=(!group||c.dataset.category===group)&&(!q||c.dataset.search.includes(q));c.hidden=!show;if(show)count++});$('#result-count').textContent=count+' of '+cards.length+' products and guides';$('#no-results').hidden=count!==0;}search.addEventListener('input',apply);filter.addEventListener('change',apply);$('#clear-filters').addEventListener('click',()=>{search.value='';filter.value='';apply();search.focus()});apply()}
 const decoder=$('#decode-select');
 if(decoder){const data=JSON.parse($('#decoder-data').textContent);function show(){const entry=data[decoder.value];$$('[data-token]').forEach((el,i)=>el.textContent=entry.tokens[i]);$$('[data-meaning]').forEach((el,i)=>el.textContent=entry.meanings[i]);$('#decode-product').href=entry.href;}decoder.addEventListener('change',show);show()}
 const sections=$$('.v-nav a').map(a=>[a,$(a.getAttribute('href'))]).filter(x=>x[1]);
 if(sections.length){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){sections.forEach(([a,s])=>{a.classList.toggle('is-active',s===entry.target);if(s===entry.target)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}})},{rootMargin:'-145px 0px -55% 0px',threshold:0});sections.forEach(([,s])=>observer.observe(s))}
})();
