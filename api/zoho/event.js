import { handleOptions, readBody, sendFlowWebhook, sendJson } from './_shared.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
    return;
  }

  const payload = await readBody(req);

  try {
    const flowResult = await sendFlowWebhook(process.env.ZOHO_FLOW_EVENT_WEBHOOK_URL, {
      type: 'waterquest.website.event',
      receivedAt: new Date().toISOString(),
      ...payload,
    });

    sendJson(res, 202, { ok: true, routed: { flow: flowResult } });
  } catch (error) {
    console.error(error);
    sendJson(res, 502, { ok: false, error: 'zoho_event_routing_failed' });
  }
}
