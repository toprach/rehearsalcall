/* ---------------------------------------------------------------------
   The service worker: what makes the pages installable as an app, and
   what keeps the member's own pages readable without a network.

   Pages: the dates, the availability, the part book and the play - the
   ones a member opens in a cellar or on a train - are fetched from the
   network as always; each good answer is kept as a copy on the device.
   When the network is gone (or does not answer within a few seconds)
   the copy is shown, and the page itself says that it is one. Every
   other page goes to the network, with the copy or the offline page as
   the fallback. The copies are dropped when somebody signs out or
   changes who they are.

   Files: the stylesheet and the scripts carry their version in the
   address, so they are kept for good once fetched.
   --------------------------------------------------------------------- */
var SHELL = 'theater-v2';
var PAGES = 'theater-seiten';
var FILES = 'theater-dateien';
var OFFLINE = '/theater/offline';
var WAIT = 6000;

var KEEP = /^\/theater\/(mit(\/(zeiten|termine|heft|stueck|kommentare))?\/?|druck\/[a-z0-9]+\/gesamt)$/;
var FILE = /^\/theater\/(stil\.css|heft\.js|kalender\.js|vendor\/[\w.-]+|icon-\d+\.png)$/;
var FORGET = /^\/theater\/(mit\/abmelden|ich\/|gruppe\/|als\/?$)/;

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(SHELL).then(function (c) { return c.add(OFFLINE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return [SHELL, PAGES, FILES].indexOf(k) < 0; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

/* The network, but not forever: a phone with one bar of signal would
   otherwise show nothing for a minute. */
var soon = function (request) {
  return new Promise(function (resolve, reject) {
    var t = setTimeout(function () { reject(new Error('slow')); }, WAIT);
    fetch(request).then(function (r) { clearTimeout(t); resolve(r); }, function (x) { clearTimeout(t); reject(x); });
  });
};
var keep = function (request, response) {
  if (!response || response.status !== 200 || response.redirected || response.type !== 'basic') return;
  var copy = response.clone();
  caches.open(PAGES).then(function (c) { return c.put(request.url, copy); });
};
var copyOf = function (url) {
  return caches.open(PAGES).then(function (c) {
    return c.match(url).then(function (r) { return r || c.match(url, { ignoreSearch: true }); });
  });
};
var forget = function () { return caches.delete(PAGES); };

self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.method === 'GET' && FILE.test(url.pathname)) {
    e.respondWith(caches.open(FILES).then(function (c) {
      return c.match(req).then(function (hit) {
        return hit || soon(req).then(function (r) { if (r.ok && (url.search || url.pathname.indexOf('/vendor/') > 0)) c.put(req, r.clone()); return r; });
      });
    }));
    return;
  }
  if (req.mode !== 'navigate') return;

  if (FORGET.test(url.pathname) || (req.method !== 'GET' && /^\/theater\/mit\/?$/.test(url.pathname))) {
    e.respondWith(forget().then(function () { return fetch(req); }));
    return;
  }
  if (req.method !== 'GET') return;

  if (KEEP.test(url.pathname)) {
    e.respondWith(soon(req).then(function (r) { keep(req, r); return r; }, function () {
      return copyOf(req.url).then(function (hit) {
        return hit || caches.match(OFFLINE);
      });
    }));
    return;
  }
  e.respondWith(soon(req).catch(function () {
    return copyOf(req.url).then(function (hit) { return hit || caches.match(OFFLINE); });
  }));
});

/* A member page asks, now and then, for the other pages to be fetched
   ahead - so that the play is there offline without having been opened. */
self.addEventListener('message', function (e) {
  var d = e.data || {};
  if (d.warm && d.warm.length) {
    e.waitUntil(Promise.all(d.warm.filter(function (u) { return KEEP.test(new URL(u, location.origin).pathname); })
      .map(function (u) {
        var req = new Request(new URL(u, location.origin).href, { credentials: 'same-origin' });
        return fetch(req).then(function (r) { keep(req, r); }).catch(function () {});
      })));
  }
  if (d.files && d.files.length) {
    e.waitUntil(caches.open(FILES).then(function (c) {
      return Promise.all(d.files.filter(function (u) { return FILE.test(new URL(u, location.origin).pathname); })
        .map(function (u) {
          return c.match(u).then(function (hit) {
            return hit || fetch(u).then(function (r) { if (r.ok) return c.put(u, r); }).catch(function () {});
          });
        }));
    }));
  }
  if (d.forget) e.waitUntil(forget());
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
