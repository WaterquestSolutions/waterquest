const nav = document.getElementById('wq-nav');
const toggle = document.querySelector('.wq-menu-toggle');
const menu = document.getElementById('wq-mobile-menu');

addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('wq-scrolled', scrollY > 10);
});

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

const bubbles = document.getElementById('wq-global-bubbles');
if (bubbles) {
  for (let i = 0; i < 16; i += 1) {
    const bubble = document.createElement('span');
    bubble.className = 'wq-bubble';
    const size = 8 + Math.random() * 26;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.bottom = `${-20 - Math.random() * 80}px`;
    bubble.style.setProperty('--drift', `${Math.random() * 80 - 40}px`);
    bubble.style.animationDuration = `${16 + Math.random() * 18}s`;
    bubble.style.animationDelay = `${Math.random() * 14}s`;
    bubbles.appendChild(bubble);
  }
}
