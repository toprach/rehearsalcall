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

/* ---- the daily reminder: show what the server sent, open the book on a tap ---- */
self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Rehearsal Planner', {
    body: d.body || '', icon: '/theater/icon-192.png', badge: '/theater/icon-192.png',
    tag: 'heft', renotify: true, data: { url: d.url || '/theater/mit/heft' } }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/theater/mit/heft';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      if ('focus' in list[i]) { list[i].navigate(url); return list[i].focus(); }
    }
    return self.clients.openWindow(url);
  }));
});
