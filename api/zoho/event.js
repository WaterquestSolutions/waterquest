import { handleOptions, readBody, sendFlowWebhook, sendJson } from './_shared.js';

export function makeEventHandler({ env = process.env, send = sendFlowWebhook } = {}) {
  return async function handler(req, res) {
    if (handleOptions(req, res)) return;
    if (req.method !== 'POST') {
      sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
      return;
    }
    if (!env.ZOHO_FLOW_EVENT_WEBHOOK_URL) {
      sendJson(res, 503, { ok: false, error: 'service_not_configured' });
      return;
    }
    const payload = await readBody(req);
    try {
      const flowResult = await send(env.ZOHO_FLOW_EVENT_WEBHOOK_URL, {
        type: 'waterquest.website.event',
        receivedAt: new Date().toISOString(),
        ...payload,
      });
      if (flowResult.configured !== true || flowResult.ok !== true) {
        sendJson(res, 502, { ok: false, error: 'zoho_event_routing_failed' });
        return;
      }
      sendJson(res, 202, { ok: true, routed: { flow: flowResult } });
    } catch {
      sendJson(res, 502, { ok: false, error: 'zoho_event_routing_failed' });
    }
  };
}
export default makeEventHandler();
