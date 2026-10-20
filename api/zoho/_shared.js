const ZOHO_ACCOUNTS_DOMAIN = process.env.ZOHO_ACCOUNTS_DOMAIN || 'https://accounts.zoho.com';
const ZOHO_API_DOMAIN = process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com';

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': process.env.ZOHO_ALLOWED_ORIGIN || '*',
  'access-control-allow-methods': 'POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
};

export function sendJson(res, status, payload) {
  res.statusCode = status;
  for (const [key, value] of Object.entries(jsonHeaders)) {
    res.setHeader(key, value);
  }
  res.end(JSON.stringify(payload));
}

export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return true;
  }
  return false;
}

export async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = chunks.map((chunk) => Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk)).join('');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return {};
  }
}

function clean(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/\s+/g, ' ').trim().slice(0, 5000);
}

export function normaliseFields(fields = {}) {
  const out = {};
  for (const [key, value] of Object.entries(fields)) {
    out[key] = typeof value === 'boolean' ? value : clean(value);
  }
  return out;
}

export function pageSummary(page = {}) {
  return [
    page.title ? `Page: ${page.title}` : '',
    page.url ? `URL: ${page.url}` : '',
    page.referrer ? `Referrer: ${page.referrer}` : '',
    page.section ? `Site section: ${page.section}` : '',
    page.utm && Object.keys(page.utm).length ? `UTM: ${JSON.stringify(page.utm)}` : '',
  ].filter(Boolean).join('\n');
}

export function crmLeadFromPayload(payload) {
  const fields = normaliseFields(payload.fields || {});
  const page = payload.page || {};
  const firstName = fields.firstName || fields.first_name || fields.First_Name || '';
  const lastName = fields.lastName || fields.last_name || fields.Last_Name || 'Website Visitor';
  const company = fields.company || fields.Company || 'Unknown Company';
  const descriptionParts = [
    fields.message || fields.projectNotes || fields.notes || '',
    fields.projectType ? `Project type: ${fields.projectType}` : '',
    fields.industry ? `Industry: ${fields.industry}` : '',
    fields.application ? `Application: ${fields.application}` : '',
    fields.productInterest ? `Product interest: ${fields.productInterest}` : '',
    fields.operatingPressure ? `Operating pressure: ${fields.operatingPressure}` : '',
    fields.flowRate ? `Flow rate: ${fields.flowRate}` : '',
    fields.fluidSource ? `Fluid source: ${fields.fluidSource}` : '',
    fields.timeline ? `Timeline: ${fields.timeline}` : '',
    fields.ndaRequested ? 'NDA requested: yes' : '',
    pageSummary(page),
  ].filter(Boolean);

  return {
    First_Name: firstName,
    Last_Name: lastName,
    Email: fields.email || fields.Email || '',
    Phone: fields.phone || fields.Phone || '',
    Company: company,
    Designation: fields.role || fields.title || fields.Designation || '',
    Lead_Source: 'WaterQuest Website',
    Lead_Status: process.env.ZOHO_DEFAULT_LEAD_STATUS || 'Not Contacted',
    Description: descriptionParts.join('\n\n').slice(0, 32000),
  };
}

async function accessToken() {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
  });

  const response = await fetch(`${ZOHO_ACCOUNTS_DOMAIN}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new Error(`Zoho token refresh failed: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function createCrmLead(record) {
  const token = await accessToken();
  if (!token) return { configured: false, skipped: 'missing_oauth_credentials' };

  const response = await fetch(`${ZOHO_API_DOMAIN}/crm/v8/Leads`, {
    method: 'POST',
    headers: {
      authorization: `Zoho-oauthtoken ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ data: [record], trigger: ['approval', 'workflow', 'blueprint'] }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Zoho CRM Lead create failed: ${response.status} ${JSON.stringify(data)}`);
  }
  return { configured: true, crm: data };
}

export async function sendFlowWebhook(url, payload) {
  if (!url) return { configured: false, skipped: 'missing_flow_webhook' };
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return { configured: true, status: response.status, ok: response.ok };
}
