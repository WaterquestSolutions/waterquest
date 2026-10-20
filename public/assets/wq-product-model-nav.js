(() => {
 const bar=document.querySelector('.wq-model-nav'); if(!bar)return;
 const track=bar.querySelector('.wq-model-links'), prev=bar.querySelector('.wq-model-prev'),next=bar.querySelector('.wq-model-next');
 const links=[...track.querySelectorAll('a')];
 const localAnchors=links.some(a=>{const u=new URL(a.href);return u.pathname===location.pathname&&u.hash;});
 if(links.length>10)bar.dataset.manyLinks='true';
 function controls(){const overflow=track.scrollWidth>track.clientWidth+2;prev.hidden=next.hidden=!overflow;prev.disabled=track.scrollLeft<2;next.disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-2;}
 function size(){const header=document.querySelector('.wq-site-header');document.documentElement.style.setProperty('--wq-section-header-height',(header?.getBoundingClientRect().height||72)+'px');document.documentElement.style.setProperty('--wq-section-nav-height',bar.getBoundingClientRect().height+'px');controls();}
 function current(){links.forEach(a=>{const u=new URL(a.href);const same=u.pathname===location.pathname;const active=same&&(u.hash?u.hash===location.hash:(!localAnchors||!location.hash));if(active)a.setAttribute('aria-current',u.hash?'location':'page');else a.removeAttribute('aria-current');});}
 prev.addEventListener('click',()=>track.scrollBy({left:-Math.max(180,track.clientWidth*.75)}));next.addEventListener('click',()=>track.scrollBy({left:Math.max(180,track.clientWidth*.75)}));
 track.addEventListener('scroll',controls,{passive:true});window.addEventListener('hashchange',current);window.addEventListener('resize',size,{passive:true});
 const observer=new ResizeObserver(size);observer.observe(bar);const header=document.querySelector('.wq-site-header');if(header)observer.observe(header);
 current();size();document.fonts?.ready.then(size);
 requestAnimationFrame(()=>{const active=track.querySelector('[aria-current]');if(active&&track.scrollWidth>track.clientWidth)track.scrollLeft=active.offsetLeft-track.offsetLeft-(track.clientWidth-active.offsetWidth)/2;controls();});
})();
