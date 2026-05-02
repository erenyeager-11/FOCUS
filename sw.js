/* ============================================================
   Focus Lab — Service Worker v3
   HOW UPDATES WORK:
   - Change CACHE_VERSION number (e.g. v3 → v4) every time you
     deploy changes. The old cache is deleted automatically and
     users get fresh files on their next visit.
   ============================================================ */

const CACHE_VERSION = 'focuslab-v3';

const ASSETS = [
  './index.html',
  './manifest.json',
];

/* Install: cache core assets */
self.addEventListener('install', event => {
  self.skipWaiting(); // activate immediately, don't wait
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(ASSETS))
  );
});

/* Activate: delete ALL old caches so stale files are gone */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim()) // take control of all open tabs
  );
});

/* Fetch strategy: Network-first for HTML (always fresh),
   Cache-first for everything else (fonts, icons) */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isHTML = event.request.destination === 'document' || url.pathname.endsWith('.html');

  if (isHTML) {
    /* Network-first: always try to get the latest HTML.
       Fall back to cache only if completely offline. */
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
  } else {
    /* Cache-first for static assets (fonts, icons, etc.) */
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
  }
});
