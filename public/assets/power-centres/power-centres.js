(() => {
  const selector = document.querySelector('#curve-select');
  const figures = Array.from(document.querySelectorAll('.pc-curve'));
  selector?.addEventListener('change', () => {
    figures.forEach(figure => { figure.hidden = figure.id !== `curve-${selector.value}`; });
  });
  const recovery = document.querySelector('#recovery-select');
  const updateRecovery = () => {
    const option = recovery.selectedOptions[0];
    const code = option.value;
    const percentage = option.dataset.recovery;
    document.querySelector('#order-code').textContent = code;
    document.querySelector('#order-note').textContent = code === 'Confirm'
      ? `${percentage}% recovery · No ordering code is supplied. Confirm availability with WaterQuest Solutions.`
      : `${percentage}% recovery · Confirm the complete configuration with WaterQuest Solutions.`;
    document.querySelector('#configuration-link').href = `/contact/?product=${encodeURIComponent(document.body.dataset.model)}&recovery=${percentage}`;
  };
  if (recovery) {
    const firstAvailable = Array.from(recovery.options).find(option => option.value !== 'Confirm');
    if (firstAvailable) recovery.selectedIndex = firstAvailable.index;
    recovery.addEventListener('change', updateRecovery);
    updateRecovery();
  }
  const toggle = document.querySelector('.wq-menu-toggle');
  const mobile = document.querySelector('#wq-mobile-menu');
  const setMenu = open => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobile.classList.toggle('open', open);
  };
  if (toggle && mobile) {
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    mobile.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false); toggle.focus();
      }
    });
    window.matchMedia('(min-width: 1151px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
  }
  const links = Array.from(document.querySelectorAll('.pc-section-nav a'));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) links.forEach(link => link.classList.toggle('is-active', link.hash === `#${entry.target.id}`));
      });
    }, {rootMargin: '-145px 0px -65% 0px', threshold: 0});
    links.forEach(link => {
      const section = document.querySelector(link.hash);
      if (section) observer.observe(section);
    });
  }
})();
