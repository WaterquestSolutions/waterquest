import { randomUUID } from 'node:crypto';
import { webforms } from './_webforms.js';

const origins = new Set(['https://temporary-turbo-nickel-8xnl9g7.vercel.app','https://waterquest-palette-20261016.vercel.app', 'https://waterquestsolutions.com', 'https://www.waterquestsolutions.com']);
const sources = new Set(['engineering-review', 'pilot-application', 'product-quote', 'newsletter']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function reply(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function readPayload(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    if (Buffer.byteLength(JSON.stringify(req.body)) > 32000) throw new Error('too_large');
    return req.body;
  }
  let raw = typeof req.body === 'string' ? req.body : '';
  if (!raw) for await (const chunk of req) {
    raw += chunk.toString();
    if (Buffer.byteLength(raw) > 32000) throw new Error('too_large');
  }
  if (Buffer.byteLength(raw) > 32000) throw new Error('too_large');
  return JSON.parse(raw);
}

export function prepareSubmission(payload) {
  if (!payload || !sources.has(payload.source) || !payload.fields || typeof payload.fields !== 'object' || Array.isArray(payload.fields)) throw new Error('invalid_form');
  const fields = {};
  for (const [key, value] of Object.entries(payload.fields)) {
    if (typeof value === 'string') fields[key] = value.trim().slice(0, 5000);
    else if (typeof value === 'boolean') fields[key] = value;
  }
  if (fields.website) throw new Error('invalid_form');
  if (!emailPattern.test(fields.email || '') || fields.email.length > 100) throw new Error('invalid_email');
  if (fields.consent !== true) throw new Error('consent_required');
  const newsletter = payload.source === 'newsletter';
  const names = (fields.name || '').split(/\s+/);
  const firstName = fields.firstName || fields.fname || (fields.name ? names.shift() : '') || '';
  const lastName = fields.lastName || fields.lname || names.join(' ') || (newsletter ? 'Newsletter subscriber' : firstName);
  if (!newsletter && !firstName) throw new Error('name_required');
  if (payload.source === 'engineering-review' && (!fields.lastName || !fields.message)) throw new Error('details_required');
  if (payload.source === 'pilot-application' && !fields.company) throw new Error('company_required');
  if (payload.source === 'product-quote' && !fields.config) throw new Error('configuration_required');
  const reference = 'WQ-' + randomUUID();
  const config = newsletter ? webforms.newsletter : webforms.engineering;
  const description = [
    'Website submission: ' + payload.source,
    'Reference: ' + reference,
    'Received: ' + new Date().toISOString(),
    'Contact consent: yes',
    'Newsletter consent: ' + (newsletter ? 'yes' : 'not requested'),
    ...Object.entries(fields).filter(([k]) => !['website', 'consent'].includes(k)).map(([k, v]) => k + ': ' + (typeof v === 'boolean' ? (v ? 'yes' : 'no') : v)),
    'Page: ' + String(payload.page?.url || '').slice(0, 2000),
    'Title: ' + String(payload.page?.title || '').slice(0, 300),
  ].join('\n');
  const data = new URLSearchParams({ ...config, 'First Name': firstName.slice(0, 40), 'Last Name': lastName.slice(0, 80), Email: fields.email, Phone: (fields.phone || '').slice(0, 30), Description: description.slice(0, 30000), LEADCF14: payload.source, LEADCF13: reference });
  if (newsletter) data.set('LEADCF51', 'on');
  return { data, reference, returnURL: config.returnURL, newsletter };
}

export function acceptedResponse(response, text, returnURL) {
  if ([301, 302, 303].includes(response.status)) return response.headers.get('location') === returnURL;
  // A generic HTTP 200, including a validation/error page, is not confirmation.
  const match = text.match(/window\.location\.assign\("([^"\r\n]+)"\)/);
  return response.ok && Boolean(match) && match[1].replace(/\\(.)/g, '$1') === returnURL;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return reply(res, 405, { ok: false, error: 'method_not_allowed' });
  const origin = req.headers.origin;
  if (origin && !origins.has(origin)) return reply(res, 403, { ok: false, error: 'origin_not_allowed' });
  if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return reply(res, 415, { ok: false, error: 'json_required' });
  let submission;
  try {
    const payload = await readPayload(req);
    if (payload?.source === 'engineering-review') return reply(res, 409, { ok: false, error: 'form_updated', message: 'Open /contact/ to use the updated engineering review form.' });
    submission = prepareSubmission(payload);
  }
  catch (error) { return reply(res, error.message === 'too_large' ? 413 : 400, { ok: false, error: 'invalid_submission' }); }
  try {
    const response = await fetch('https://crm.zoho.com/crm/WebToLeadForm', {
      method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Referer: 'https://temporary-turbo-nickel-8xnl9g7.vercel.app/' },
      body: submission.data,
    });
    const text = await response.text();
    if (!acceptedResponse(response, text, submission.returnURL)) throw new Error('delivery_not_confirmed');
    return reply(res, 202, { ok: true, reference: submission.reference, kind: submission.newsletter ? 'newsletter' : 'enquiry' });
  } catch {
    console.error('Website intake delivery could not be confirmed', submission.reference);
    return reply(res, 502, { ok: false, error: 'delivery_not_confirmed', reference: submission.reference });
  }
}
