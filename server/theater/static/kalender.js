/* ---------------------------------------------------------------------
   The availability calendar: other calendars of one's own, shown in
   the day panel - behind a PIN - and saving every entry at once.

   The addresses of the other calendars (ICS feeds) and what they
   contained are kept in this browser only, encrypted with a key made
   from a four-digit PIN (PBKDF2, AES-GCM), one vault per person. So a
   colleague who borrows the phone and switches to their own name sees
   nothing of it, and neither does anybody who looks at the storage.
   Nothing of it is stored on the server: the server merely fetches a
   feed when asked, because most calendar services refuse to hand their
   feed to a browser on another site (CORS), and forgets it at once.

   Parsing is done by ical.js (Mozilla, MPL), which knows recurring
   events. Unlocked, the key lives in sessionStorage: gone when the tab
   closes, back after a reload.
   --------------------------------------------------------------------- */
import ICAL from '/theater/vendor/ical.min.js';
(function () {
  var root = document.getElementById('kalender-quellen');
  if (!root) return;
  var W = JSON.parse(root.dataset.worte || '{}');
  var who = root.dataset.person || '';
  var VAULT = 'ics-tresor:' + who, SESSION = 'ics-schluessel:' + who;
  var days = [].map.call(document.querySelectorAll('.month td.day[data-iso]'), function (td) { return td.dataset.iso; });
  var von = days[0] || '', bis = days[days.length - 1] || '';

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var read = function (k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  var write = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var b64 = function (buf) { return btoa(String.fromCharCode.apply(null, new Uint8Array(buf))); };
  var unb64 = function (s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); };

  /* ---- the vault: {sources, cache} encrypted under the PIN ---- */
  var key = null;                 // CryptoKey while unlocked
  var vault = { sources: [], cache: {} };
  var status = {};

  function deriveKey(pin, salt) {
    return crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveKey']).then(function (base) {
      return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: 150000, hash: 'SHA-256' }, base,
        { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    });
  }
  function save() {
    if (!key) return Promise.resolve();
    var stored = read(VAULT, null) || {};
    var iv = crypto.getRandomValues(new Uint8Array(12));
    return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, new TextEncoder().encode(JSON.stringify(vault))).then(function (ct) {
      write(VAULT, { salt: stored.salt, iv: b64(iv), data: b64(ct) });
    });
  }
  function open(k) {
    var stored = read(VAULT, null);
    if (!stored || !stored.data) { vault = { sources: [], cache: {} }; return Promise.resolve(true); }
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(stored.iv) }, k, unb64(stored.data)).then(function (pt) {
      vault = JSON.parse(new TextDecoder().decode(pt)); return true;
    }).catch(function () { return false; });
  }
  function rememberKey(k) {
    crypto.subtle.exportKey('raw', k).then(function (raw) { try { sessionStorage.setItem(SESSION, b64(raw)); } catch (e) {} });
  }
  function recallKey() {
    var raw; try { raw = sessionStorage.getItem(SESSION); } catch (e) {}
    if (!raw) return Promise.resolve(null);
    return crypto.subtle.importKey('raw', unb64(raw), { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']).catch(function () { return null; });
  }
  function lock() { key = null; vault = { sources: [], cache: {} }; try { sessionStorage.removeItem(SESSION); } catch (e) {} paint(); paintDots(); }

  /* ---- ICS to events within the calendar's range ---- */
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var isoOf = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var hmOf = function (d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  function eventsOf(text) {
    var out = [];
    var comp = new ICAL.Component(ICAL.parse(text));
    var rangeStart = ICAL.Time.fromDateString(von), rangeEnd = ICAL.Time.fromDateString(bis); rangeEnd.adjust(1, 0, 0, 0);
    comp.getAllSubcomponents('vevent').forEach(function (ve) {
      var ev;
      try { ev = new ICAL.Event(ve); } catch (e) { return; }
      if (!ev.startDate) return;
      var push = function (start, end) {
        var s = start.toJSDate(), e = end ? end.toJSDate() : null;
        var iso = isoOf(s);
        if (iso < von || iso > bis) return;
        out.push({ iso: iso, allday: !!start.isDate, von: start.isDate ? '' : hmOf(s), bis: (!e || end.isDate) ? '' : hmOf(e), text: ev.summary || '' });
      };
      if (ev.isRecurring()) {
        var it = ev.iterator(), next, n = 0;
        while ((next = it.next()) && n++ < 500) {
          if (next.compare(rangeEnd) > 0) break;
          if (next.compare(rangeStart) < 0) continue;
          var d = ev.getOccurrenceDetails(next);
          push(d.startDate, d.endDate);
        }
      } else push(ev.startDate, ev.endDate);
    });
    return out;
  }

  /* ---- fetching through the server, which forgets it at once ---- */
  function loadUrl(src) {
    var cached = vault.cache[src.id];
    if (cached && Date.now() - cached.when < 30 * 60 * 1000 && cached.von === von && cached.bis === bis) return Promise.resolve();
    return fetch('/theater/mit/kalender-abruf', { method: 'POST', credentials: 'same-origin',
        headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ url: src.url }).toString() })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(function (text) {
        vault.cache[src.id] = { when: Date.now(), von: von, bis: bis, events: eventsOf(text) }; status[src.id] = '';
      }).catch(function () { status[src.id] = W.unreachable; });
  }
  function loadAll() {
    return Promise.all(vault.sources.map(function (src) { return src.url ? loadUrl(src) : Promise.resolve(); }))
      .then(save).then(paint).then(paintDots);
  }
  function forDay(iso) {
    var all = [];
    vault.sources.forEach(function (src) { ((vault.cache[src.id] || {}).events || []).forEach(function (e) { if (e.iso === iso) all.push(e); }); });
    return all.sort(function (a, b) { return (a.von || '').localeCompare(b.von || ''); });
  }

  /* ---- the box ---- */
  var stored = function () { return read(VAULT, null); };
  function paint() {
    var list = root.querySelector('.quellen'), form = root.querySelector('.hinzu'), pinBox = root.querySelector('.pin');
    var locked = !key && !!stored();
    pinBox.innerHTML = '';
    if (locked) {
      pinBox.innerHTML = '<p class="muted">' + esc(W.pin_enter) + '</p>' +
        '<div class="row"><div><input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" id="pin-in" autocomplete="off"></div>' +
        '<div><button type="button" class="quiet" id="pin-unlock" style="margin-top:0">' + esc(W.pin_unlock) + '</button></div></div>' +
        '<p class="small"><button type="button" class="quiet mini" id="pin-forget">' + esc(W.pin_forget) + '</button> <span class="muted">' + esc(W.pin_forget_what) + '</span></p>';
      list.innerHTML = ''; form.hidden = true;
      return;
    }
    form.hidden = false;
    // the list names the sources; the addresses stay inside the vault
    list.innerHTML = vault.sources.length ? vault.sources.map(function (src) {
      var n = ((vault.cache[src.id] || {}).events || []).length;
      return '<div class="quelle"><b>' + esc(src.name) + '</b> <span class="muted">' + (status[src.id] ? esc(status[src.id]) : W.n_events.replace('#', n)) + '</span> ' +
        '<button type="button" class="quiet mini" data-remove="' + esc(src.id) + '">' + esc(W.remove) + '</button></div>';
    }).join('') + '<p class="small"><button type="button" class="quiet mini" id="pin-lock">' + esc(W.pin_lock) + '</button></p>'
      : '<p class="muted small">' + esc(W.none) + '</p>';
  }
  function paintDots() {
    document.querySelectorAll('.month td.day[data-iso]').forEach(function (td) {
      var old = td.querySelector('.ics-dot'); if (old) old.parentNode.removeChild(old);
      if (!key) return;
      var n = forDay(td.dataset.iso).length;
      if (!n) return;
      var s = document.createElement('span'); s.className = 'ics-dot'; s.title = W.n_events.replace('#', n); s.textContent = n;
      td.appendChild(s);
    });
  }

  /* Setting the PIN the first time a calendar is added. Returns the key. */
  function askPin() {
    return new Promise(function (resolve) {
      var box = root.querySelector('.pin');
      box.innerHTML = '<p><b>' + esc(W.pin_set_title) + '</b><br><span class="muted">' + esc(W.pin_set_what) + '</span></p>' +
        '<div class="row"><div><label>' + esc(W.pin) + '</label><input type="password" inputmode="numeric" maxlength="4" id="pin-a" autocomplete="new-password"></div>' +
        '<div><label>' + esc(W.pin_repeat) + '</label><input type="password" inputmode="numeric" maxlength="4" id="pin-b" autocomplete="new-password"></div>' +
        '<div><button type="button" id="pin-ok" style="margin-top:0">' + esc(W.pin_ok) + '</button></div></div>' +
        '<p class="small muted" id="pin-msg"></p>';
      box.querySelector('#pin-a').focus();
      box.querySelector('#pin-ok').onclick = function () {
        var a = box.querySelector('#pin-a').value, b = box.querySelector('#pin-b').value;
        if (!/^\d{4}$/.test(a)) { box.querySelector('#pin-msg').textContent = W.pin_format; return; }
        if (a !== b) { box.querySelector('#pin-msg').textContent = W.pin_mismatch; return; }
        var salt = crypto.getRandomValues(new Uint8Array(16));
        deriveKey(a, salt).then(function (k) {
          write(VAULT, { salt: b64(salt), iv: '', data: '' });
          key = k; rememberKey(k); vault = { sources: [], cache: {} };
          box.innerHTML = ''; resolve(k);
        });
      };
    });
  }
  function ensureKey() {
    if (key) return Promise.resolve(key);
    return askPin();
  }

  root.addEventListener('click', function (e) {
    var t = e.target;
    var b = t.closest('button[data-remove]');
    if (b) {
      vault.sources = vault.sources.filter(function (s) { return s.id !== b.dataset.remove; });
      delete vault.cache[b.dataset.remove];
      save().then(paint).then(paintDots);
    }
    if (t.id === 'pin-lock') lock();
    if (t.id === 'pin-forget') { if (confirm(W.pin_forget_confirm)) { try { localStorage.removeItem(VAULT); } catch (x) {} lock(); } }
    if (t.id === 'pin-unlock') {
      var pin = root.querySelector('#pin-in').value, st = stored();
      if (!/^\d{4}$/.test(pin) || !st) return;
      deriveKey(pin, unb64(st.salt)).then(function (k) {
        return open(k).then(function (ok) {
          if (!ok) { root.querySelector('#pin-in').value = ''; alert(W.pin_wrong); return; }
          key = k; rememberKey(k); loadAll();
        });
      });
    }
  });
  root.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.id === 'pin-in') { e.preventDefault(); root.querySelector('#pin-unlock').click(); }
    if (e.key === 'Enter' && (e.target.id === 'pin-a' || e.target.id === 'pin-b')) { e.preventDefault(); root.querySelector('#pin-ok').click(); }
  });
  root.querySelector('#quelle-add').addEventListener('click', function () {
    var url = root.querySelector('#quelle-url').value.trim(), name = root.querySelector('#quelle-name').value.trim();
    if (!/^https?:\/\//.test(url)) { alert(W.bad_url); return; }
    ensureKey().then(function () {
      vault.sources.push({ id: 'q' + Date.now().toString(36), name: name || url.replace(/^https?:\/\//, '').slice(0, 40), url: url });
      root.querySelector('#quelle-url').value = ''; root.querySelector('#quelle-name').value = '';
      return loadAll();
    });
  });
  root.querySelector('#quelle-file').addEventListener('change', function (e) {
    var f = e.target.files[0]; if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      var events;
      try { events = eventsOf(String(reader.result)); } catch (x) { alert(W.bad_file); return; }
      ensureKey().then(function () {
        var id = 'q' + Date.now().toString(36);
        vault.sources.push({ id: id, name: f.name.replace(/\.ics$/i, '') });
        vault.cache[id] = { when: Date.now(), von: von, bis: bis, events: events };
        return save().then(paint).then(paintDots);
      });
    };
    reader.readAsText(f);
    e.target.value = '';
  });

  /* ---- the day panel ---- */
  document.addEventListener('tag-geoeffnet', function (e) {
    var box = document.getElementById('tafel-ics'); if (!box) return;
    if (!stored()) { box.hidden = true; return; }
    box.hidden = false;
    if (!key) { box.innerHTML = '<div class="muted">' + esc(W.pin_enter) + '</div>'; return; }
    var list = forDay(e.detail);
    box.innerHTML = '<div class="muted">' + esc(W.day_title) + '</div>' + (list.length
      ? list.map(function (x) { return '<div class="ics-ev">' + (x.allday ? '<b>' + esc(W.allday) + '</b>' : '<b>' + esc(x.von + (x.bis ? '–' + x.bis : '')) + '</b>') + ' ' + esc(x.text) + '</div>'; }).join('')
      : '<div class="muted">' + esc(W.day_free) + '</div>');
  });

  /* ---- start: unlocked from the session, else locked ---- */
  recallKey().then(function (k) {
    if (!k || !stored()) { paint(); return; }
    return open(k).then(function (ok) { if (ok) { key = k; return loadAll(); } paint(); });
  });
})();
