(() => {
  const root = document.querySelector('.wq-case-feature');
  if (!root) return;
  const cases = [...root.querySelectorAll('.wq-case-slide')];
  if (!cases.length) return;
  // Select once per page load. The selected case stays fixed while browsing.
  const selected = Math.floor(Math.random() * cases.length);
  cases.forEach((item, index) => { item.hidden = index !== selected; });
})();
