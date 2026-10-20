(function () {
  'use strict';
  const nav = document.getElementById('nav');
  if (!nav) return;
  const update = () => {
    document.documentElement.style.setProperty('--wq-header-height', Math.ceil(nav.getBoundingClientRect().height) + 'px');
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  update();
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(update).observe(nav);
  window.addEventListener('resize', update, {passive: true});
  window.addEventListener('scroll', update, {passive: true});
})();
