/* Studyverse - Service Worker */
const CACHE_VERSION = 'studyverse-v1';
const CORE_ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-512-maskable.png', './apple-touch-icon.png', './favicon.png'];
/* third-party static files worth keeping for offline (fonts + Firebase SDK) */
const CDN_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'www.gstatic.com'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_VERSION).then(c => Promise.allSettled(CORE_ASSETS.map(a => c.add(a)))));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => (k.startsWith('studyverse-') || k.startsWith('focuslab-')) && k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!['http:', 'https:'].includes(url.protocol)) return;

  const sameOrigin = url.origin === self.location.origin;
  if (sameOrigin && url.pathname.startsWith('/api/')) return;

  const isHTML = req.mode === 'navigate' || req.destination === 'document' || url.pathname.endsWith('.html');
  if (sameOrigin && isHTML) { event.respondWith(networkFirstHTML(req)); return; }
  if (sameOrigin) { event.respondWith(staleWhileRevalidate(req)); return; }
  if (CDN_HOSTS.includes(url.hostname)) { event.respondWith(staleWhileRevalidate(req)); }
});

async function networkFirstHTML(request) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const res = await fetch(request);
    if (res && res.ok) { cache.put(request, res.clone()); cache.put('./index.html', res.clone()); }
    return res;
  } catch (e) {
    return (await cache.match(request)) || (await cache.match('./index.html')) || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  const fresh = fetch(request).then(res => { if (res && (res.ok || res.type === 'opaque')) cache.put(request, res.clone()); return res; }).catch(() => cached);
  return cached || fresh;
}
