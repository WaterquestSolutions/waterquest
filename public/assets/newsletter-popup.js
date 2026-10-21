(() => {
  'use strict';
  if (window.WQ_NEWSLETTER_ACTIVE) return;
  window.WQ_NEWSLETTER_ACTIVE = true;
  const seenKey = 'wq.newsletter.seen.v1';
  const subscribedKey = 'wq.newsletter.subscribed.v1';
  const readFlag = key => {
    try { if (localStorage.getItem(key) === '1') return true; } catch {}
    return document.cookie.split('; ').includes(key + '=1');
  };
  const saveFlag = key => {
    try { localStorage.setItem(key, '1'); } catch {}
    document.cookie = key + '=1; Path=/; Max-Age=31536000; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
  };
  document.addEventListener('wq:newsletter-subscribed', () => saveFlag(subscribedKey));
  const productPage = /^\/(?:products(?:\/|$)|wqs-stainless(?:\/|$)|p1-pump(?:\/|$)|r2-modular-desalination-packages(?:\/|$)|t-p|tcheck-)/.test(location.pathname);
  if (!productPage || !HTMLDialogElement.prototype.showModal) return;
  const section = document.querySelector('section[aria-labelledby="newsletter-heading"]');
  if (section) section.hidden = true;
  const dialog = document.createElement('dialog');
  dialog.id = 'wq-newsletter-popup';
  dialog.setAttribute('aria-labelledby', 'wq-newsletter-title');
  dialog.innerHTML = `<button type="button" class="wq-newsletter-close" aria-label="Close newsletter invitation" autofocus>×</button>
    <div class="wq-newsletter-brand"><img src="/assets/waterquest-logo-square.png" alt="" width="44" height="44"><span>WaterQuest Solutions</span></div><p class="wq-newsletter-eyebrow">The Fluid Truth · Newsletter</p>
    <h2 id="wq-newsletter-title">Good engineering.<br><span>Without the oil.</span></h2>
    <p>Get occasional water hydraulics insights, equipment updates and practical application ideas from WaterQuest Solutions. Clear answers for people who design, specify and operate equipment.</p>
    <form class="wq-popup-form">
      <label for="wq-newsletter-email">Email address</label>
      <input id="wq-newsletter-email" name="email" type="email" autocomplete="email" maxlength="100" required placeholder="Enter your email address">
      <div hidden aria-hidden="true"><label>Leave this empty<input name="website" tabindex="-1" autocomplete="off"></label></div>
      <label class="wq-popup-consent"><input name="consent" type="checkbox" required><span>I would like to receive the WaterQuest Solutions water hydraulics newsletter. I can unsubscribe at any time.</span></label>
      <button type="submit">Send me The Fluid Truth</button>
      <p class="wq-popup-status" role="status" aria-live="polite"></p>
    </form>
    <p class="wq-newsletter-privacy">Fresh thinking. No inbox pollution. We’ll never share your info. <a href="mailto:bruce@waterquestsolutions.com?subject=Unsubscribe%20from%20WaterQuest%20Solutions%20newsletter">Unsubscribe any time</a>.</p>
    <button type="button" class="wq-newsletter-dismiss">Not today / already subscribed</button>`;
  document.body.appendChild(dialog);
  const form = dialog.querySelector('form');
  const status = dialog.querySelector('.wq-popup-status');
  const submitButton = form.querySelector('[type="submit"]');
  let previousFocus;
  const open = () => {
    if (dialog.open || readFlag(subscribedKey)) return;
    previousFocus = document.activeElement;
    dialog.showModal();
    saveFlag(seenKey);
  };
  const close = () => dialog.close();
  dialog.querySelector('.wq-newsletter-close').addEventListener('click', close);
  dialog.querySelector('.wq-newsletter-dismiss').addEventListener('click', close);
  dialog.addEventListener('close', () => previousFocus?.focus());
  window.addEventListener('storage', event => {
    if ((event.key === seenKey || event.key === subscribedKey) && event.newValue === '1' && dialog.open) close();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity() || submitButton.disabled) return;
    const fields = {email: form.elements.email.value.trim(), consent: form.elements.consent.checked, website: form.elements.website.value, consentText: form.querySelector('.wq-popup-consent span').textContent, formVersion: 'waterquest-hydraulics-20261021'};
    submitButton.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Sending…';
    try {
      const response = await fetch('/api/zoho/intake', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({source: 'newsletter', fields, page: {url: location.origin + location.pathname, title: document.title}}),
        signal: AbortSignal.timeout(25000),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true || !result.reference) throw new Error('delivery_not_confirmed');
      saveFlag(subscribedKey);
      status.textContent = 'Your newsletter signup has been received. Thank you. Reference: ' + result.reference;
      form.elements.email.value = '';
      form.elements.consent.checked = false;
      dialog.querySelector('.wq-newsletter-dismiss').textContent = 'Done';
    } catch {
      status.textContent = 'We could not confirm your signup. Your details are still here. Please try again or email bruce@waterquestsolutions.com.';
      submitButton.disabled = false;
    } finally {
      form.removeAttribute('aria-busy');
    }
  });
  const company = [...document.querySelectorAll('footer h2')].find(heading => heading.textContent.trim().toLowerCase() === 'company');
  if (company && !readFlag(subscribedKey)) {
    const item = document.createElement('li');
    const invitation = document.createElement('a');
    invitation.href = '#newsletter';
    invitation.textContent = 'Newsletter';
    invitation.addEventListener('click', event => { event.preventDefault(); open(); });
    item.appendChild(invitation);
    company.nextElementSibling.appendChild(item);
  }
  if (!readFlag(seenKey) && !readFlag(subscribedKey)) open();
})();
