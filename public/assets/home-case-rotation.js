(() => {
  const root = document.querySelector('.wq-case-feature');
  if (!root) return;
  const cases = [...root.querySelectorAll('.wq-case-slide')];
  if (!cases.length) return;
  // Lead consistently with the documented Iona installation.
  const featured = root.querySelector('[data-case="iona-hpu"]') || cases[0];
  cases.forEach((item) => { item.hidden = item !== featured; });
})();
