(() => {
 function cleanNavigation() {
  // Keep keyboard skip actions without presenting them as page links.
  document.querySelectorAll('[data-skip-target]').forEach(button => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.skipTarget);
      if (!target) return;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus();
      target.scrollIntoView({block: 'start'});
    });
  });
  // Shared menus are rendered after the HTML. The current destination is a label.
  document.querySelectorAll('a[href]').forEach(link => {
    if (link.hasAttribute('data-keep-anchor')) return;
    const destination = new URL(link.href, location.href);
    const path = value => value.replace(/\/index\.html$/, '/').replace(/\/$/, '');
    if (destination.origin !== location.origin || path(destination.pathname) !== path(location.pathname) || destination.search !== location.search) return;
    if (destination.hash) {
      const item = link.closest('li');
      if (item && item.querySelectorAll('a').length === 1) item.remove();
      else link.remove();
    } else {
      link.removeAttribute('href');
      link.setAttribute('aria-current', 'page');
      if (link.classList.contains('wq-nav-menu-toggle')) {
        link.setAttribute('role', 'button');
        link.tabIndex = 0;
        link.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); link.click(); }
        });
      }
    }
  });
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cleanNavigation, {once:true});
 else cleanNavigation();
})();
