(function () {
  'use strict';
  if (window.WQ_ZOHO_SUITE_ACTIVE) return;
  window.WQ_ZOHO_SUITE_ACTIVE = true;
  var config = window.WQ_ZOHO_SUITE || {};

  function pageContext() {
    return { url: window.location.href, title: document.title };
  }
  function collect(root) {
    var fields = {};
    root.querySelectorAll('input,select,textarea').forEach(function (field) {
      if (field.disabled || field.type === 'password' || !field.name && !field.id) return;
      var name = field.name || field.id;
      if (field.type === 'radio' && !field.checked) return;
      fields[name] = field.type === 'checkbox' ? field.checked : field.value;
    });
    return fields;
  }
  function statusFor(root) {
    var status = root.querySelector('.wq-form-status');
    if (!status) {
      status = document.createElement('p');
      status.className = 'wq-form-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      root.appendChild(status);
    }
    return status;
  }
  async function postLead(source, fields) {
    var response = await fetch('/api/zoho/intake', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: source, fields: fields, page: pageContext() }),
      signal: AbortSignal.timeout(25000),
    });
    var result = await response.json();
    if (!response.ok || result.ok !== true || !result.reference) throw new Error('delivery_not_confirmed');
    return result;
  }
  async function submit(root, button, source, fields) {
    if (root.dataset.wqSending === 'true' || root.dataset.wqSent === 'true') return;
    var status = statusFor(root);
    root.dataset.wqSending = 'true';
    root.setAttribute('aria-busy', 'true');
    if (button) button.disabled = true;
    status.textContent = 'Sending…';
    try {
      var result = await postLead(source, fields);
      root.dataset.wqSent = 'true';
      if (source === 'newsletter') document.dispatchEvent(new Event('wq:newsletter-subscribed'));
      status.textContent = (source === 'newsletter' ? 'Your newsletter signup has been received. Thank you.' : 'Received. WaterQuest will follow up about your request.') + ' Reference: ' + result.reference;
      if (source === 'pilot-application') {
        root.hidden = true;
        var success = document.getElementById('form-success');
        if (success) { success.classList.add('visible'); success.appendChild(status); success.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      }
      if (source === 'product-quote') {
        root.style.display = 'none';
        var quoteSuccess = document.getElementById('quoteSuccess');
        if (quoteSuccess) { quoteSuccess.classList.add('show'); quoteSuccess.appendChild(status); }
      }
    } catch (_error) {
      status.textContent = 'We could not confirm delivery. Your details are still here. Please try again or email bruce@waterquestsolutions.com. No confirmation has been issued.';
      if (button) button.disabled = false;
    } finally {
      delete root.dataset.wqSending;
      root.removeAttribute('aria-busy');
    }
  }
  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form || !form.matches('form[data-zoho-form]')) return;
    event.preventDefault();
    if (!form.reportValidity()) return;
    submit(form, form.querySelector('[type="submit"]'), form.dataset.zohoForm, collect(form));
  });
  var quoteButton = document.getElementById('submitQuote');
  if (quoteButton) quoteButton.addEventListener('click', function () {
    var root = document.getElementById('quoteForm');
    var required = ['fname', 'email', 'config'];
    for (var i = 0; i < required.length; i++) {
      var field = root.querySelector('#' + required[i]);
      if (field) { field.required = true; if (!field.reportValidity()) return; }
    }
    var fields = collect(root);
    fields.consent = true; // The quote form states the purpose beside its submit button.
    submit(root, quoteButton, 'product-quote', fields);
  });
  window.WQZoho = {
    page: pageContext,
    lead: postLead,
    event: function (name, detail) {
      if (!config.eventTrackingEnabled) return Promise.resolve({ enabled: false });
      return fetch('/api/zoho/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: name, detail: detail, page: pageContext() }) });
    },
  };
})();
