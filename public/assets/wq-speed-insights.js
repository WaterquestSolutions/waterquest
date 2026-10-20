import { injectSpeedInsights } from './vendor/vercel-speed-insights/index.mjs';

// Local previews have no Vercel collection endpoint and must not record visits.
const { protocol, hostname, pathname } = window.location;
const isLocal = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(hostname)
  || hostname.endsWith('.localhost');
if ((protocol === 'https:' || protocol === 'http:') && !isLocal) {
  injectSpeedInsights({ route: pathname });
}
