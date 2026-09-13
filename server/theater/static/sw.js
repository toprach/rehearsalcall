/* ---------------------------------------------------------------------
   The service worker: what makes the pages installable as an app.

   It does not cache the pages - they change with every visit, and a
   stale plan would be worse than none. It keeps one page for the case
   that the network is gone, and answers a navigation with it when the
   fetch fails. Everything else passes straight through.
   --------------------------------------------------------------------- */
var CACHE = 'theater-v1';
var OFFLINE = '/theater/offline';

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.add(OFFLINE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(function () { return caches.match(OFFLINE); }));
});
