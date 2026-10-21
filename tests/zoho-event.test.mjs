import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { makeEventHandler } from '../api/zoho/event.js';
async function run({ env = { ZOHO_FLOW_EVENT_WEBHOOK_URL: 'https://example.invalid/qa' }, result, throws = false, method = 'POST' } = {}) {
  let calls = 0;
  const req = Readable.from([JSON.stringify({ event: 'internal_qa' })]);
  req.method = method;
  const res = { setHeader() {}, end(v) { this.body = JSON.parse(v); } };
  await makeEventHandler({ env, send: async () => { calls++; if (throws) throw Error('timeout'); return result; } })(req, res);
  return { ...res, calls };
}
test('Missing Flow configuration cannot report successful routing', async () => {
  const r = await run({ env: {} }); assert.equal(r.statusCode, 503); assert.equal(r.body.ok, false); assert.equal(r.calls, 0);
});
test('Skipped, rejected and failed Flow requests never report success', async () => {
  for (const args of [{ result: { configured: false } }, { result: { configured: true, ok: false, status: 500 } }, { throws: true }]) {
    const r = await run(args); assert.equal(r.statusCode, 502); assert.equal(r.body.ok, false);
  }
});
test('Success requires an accepted upstream response', async () => {
  const r = await run({ result: { configured: true, ok: true, status: 202 } }); assert.equal(r.statusCode, 202); assert.equal(r.body.ok, true);
});
test('Unsupported method does not forward events', async () => {
  const r = await run({ method: 'GET' }); assert.equal(r.statusCode, 405); assert.equal(r.calls, 0);
});
