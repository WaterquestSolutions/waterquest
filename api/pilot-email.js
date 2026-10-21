import { createHash } from 'node:crypto';

export const config = { maxDuration: 30 };
const recipient = 'bruce@waterquestsolutions.com';
const emailPattern = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
const provinces = new Set(['BC','AB','SK','MB','ON','QC','NB','NS','PE','NL','YT','NT','NU','Other']);
const applicants = new Set(['Business / technology developer','Municipality / public utility','First Nation / Indigenous organisation','Research / academic partner','Other']);
const stages = new Set(['Exploring feasibility','Planning a pilot','Ready for a site trial','Expanding a tested system']);
const timelines = new Set(['Not yet decided','Within 3 months','3–6 months','6–12 months','More than 12 months']);
const fieldsSpec = {name:100,company:160,email:254,phone:40,province:5,applicant:70,application:240,stage:40,timeline:30,message:4000};
const labels = {name:'Name',company:'Organisation',email:'Reply email',phone:'Phone',province:'Province / territory',applicant:'Applicant / host',application:'Application and site',stage:'Project stage',timeline:'Target timing',message:'Pilot brief'};

export function preparePilot(payload) {
  if (!payload || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.requestId || '')) throw new Error('invalid_submission');
  const source = payload.fields;
  if (!source || typeof source !== 'object' || Array.isArray(source) || source.website || source.consent !== true) throw new Error('invalid_submission');
  const fields = {};
  for (const [key,max] of Object.entries(fieldsSpec)) {
    const value = source[key] ?? '';
    if (typeof value !== 'string' || value.length > max || /\0/.test(value)) throw new Error('invalid_submission');
    fields[key] = value.trim();
  }
  if (!fields.name || !fields.company || !emailPattern.test(fields.email) || /[\r\n]/.test(fields.email) || !provinces.has(fields.province) || !applicants.has(fields.applicant) || fields.message.length < 20) throw new Error('invalid_submission');
  if (fields.stage && !stages.has(fields.stage) || fields.timeline && !timelines.has(fields.timeline)) throw new Error('invalid_submission');
  const reference = 'WQP-' + payload.requestId.toLowerCase();
  const text = ['New WaterQuest pilot enquiry', `Reference: ${reference}`, 'Contact consent: yes. No newsletter subscription requested.', '', ...Object.entries(fields).map(([key,value]) => `${labels[key]}: ${value || '(not supplied)'}`), '', 'Submitted from the WaterQuest Pilot page. This is an enquiry, not a funding application.'].join('\n');
  const key = createHash('sha256').update(reference + '\n' + text).digest('hex');
  return {reference,text,email:fields.email,key};
}
function reply(res,status,body) {
  res.statusCode = status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.end(JSON.stringify(body));
}
async function readPayload(req) {
  const limit = 24000;
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    if (Buffer.byteLength(JSON.stringify(req.body)) > limit) throw new Error('too_large');
    return req.body;
  }
  let raw = typeof req.body === 'string' ? req.body : Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';
  if (!raw) for await (const chunk of req) {
    raw += chunk.toString();
    if (Buffer.byteLength(raw) > limit) throw new Error('too_large');
  }
  if (Buffer.byteLength(raw) > limit) throw new Error('too_large');
  return JSON.parse(raw);
}
export function createPilotHandler({env=process.env, fetchImpl=globalThis.fetch}={}) {
  return async function handler(req,res) {
    if (req.method !== 'POST') {res.setHeader('Allow','POST');return reply(res,405,{ok:false,error:'method_not_allowed'});}
    const origins = new Set(['https://temporary-turbo-nickel-8xnl9g7.vercel.app','https://waterquest-palette-20261016.vercel.app','https://waterquestsolutions.com','https://www.waterquestsolutions.com']);
    if (env.VERCEL_URL) origins.add('https://' + env.VERCEL_URL);
    if (!req.headers.origin || !origins.has(req.headers.origin)) return reply(res,403,{ok:false,error:'origin_not_allowed'});
    if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return reply(res,415,{ok:false,error:'json_required'});
    if (Number(req.headers['content-length']) > 24000) return reply(res,413,{ok:false,error:'too_large'});
    let submission;
    try { submission = preparePilot(await readPayload(req)); }
    catch(error) { return reply(res,error.message==='too_large'?413:400,{ok:false,error:'invalid_submission'}); }
    // Only an explicitly configured sending identity is used. No CRM response is treated as email delivery.
    if (!env.RESEND_API_KEY || !env.PILOT_EMAIL_FROM || /[\r\n]/.test(env.PILOT_EMAIL_FROM)) return reply(res,503,{ok:false,error:'service_not_configured'});
    try {
      const response = await fetchImpl('https://api.resend.com/emails',{
        method:'POST', signal:AbortSignal.timeout(15000),
        headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':'pilot/'+submission.key},
        body:JSON.stringify({from:env.PILOT_EMAIL_FROM,to:[recipient],reply_to:submission.email,subject:`WaterQuest pilot enquiry ${submission.reference}`,text:submission.text}),
      });
      const data = await response.json();
      if (!response.ok || typeof data.id !== 'string' || !data.id) throw new Error('provider_not_accepted');
      // Provider acceptance is not a guarantee that the recipient inbox has delivered the message.
      return reply(res,202,{ok:true,reference:submission.reference,status:'accepted'});
    } catch {
      console.error('Pilot email acceptance could not be confirmed',submission.reference);
      return reply(res,502,{ok:false,error:'delivery_not_confirmed',reference:submission.reference});
    }
  };
}
export default createPilotHandler();
