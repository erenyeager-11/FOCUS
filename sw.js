/* ============================================================
   Focus Lab - Service Worker
============================================================ */

const CACHE_VERSION = 'focuslab-v5-install-fix';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './focuslab-icon-192-v2.png',
  './focuslab-icon-512-v2.png',
  './focuslab-icon-512-maskable-v2.png',
  './apple-touch-icon.png',
  './favicon.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_VERSION).then(async cache => {
      const results = await Promise.allSettled(
        CORE_ASSETS.map(asset => cache.add(asset))
      );

      results
        .filter(result => result.status === 'rejected')
        .forEach(result => console.warn('[Focus Lab SW] Cache skipped:', result.reason));
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('focuslab-') && key !== CACHE_VERSION)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (!['http:', 'https:'].includes(url.protocol)) return;

  const sameOrigin = url.origin === self.location.origin;
  const isNavigation = event.request.mode === 'navigate';
  const isHTML =
    isNavigation ||
    event.request.destination === 'document' ||
    url.pathname.endsWith('.html');

  if (isHTML) {
    event.respondWith(networkFirstHTML(event.request));
    return;
  }

  if (sameOrigin) {
    event.respondWith(cacheFirst(event.request));
  }
});

async function networkFirstHTML(request) {
  const cache = await caches.open(CACHE_VERSION);

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      await cache.put(request, response.clone());
      await cache.put('./index.html', response.clone());
    }
    return response;
  } catch (error) {
    return (
      await cache.match(request) ||
      await cache.match('./index.html') ||
      Response.error()
    );
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(CACHE_VERSION);
    await cache.put(request, response.clone());
  }
  return response;
}

