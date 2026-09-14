/* ---------------------------------------------------------------------
   The availability calendar: other calendars of one's own, shown in
   the day panel - and saving every entry at once.

   The addresses of the other calendars (ICS feeds) and what they
   contained live in this browser only: localStorage, nothing of it is
   ever sent to the server. Parsing is done by ical.js (Mozilla, MPL),
   which knows recurring events.

   Many calendar services do not allow a browser on another site to
   read their feed (no CORS headers); then the feed cannot be fetched
   from here, and the page says so. A downloaded .ics file can be loaded
   instead - a snapshot, but it works everywhere.
   --------------------------------------------------------------------- */
import ICAL from '/theater/vendor/ical.min.js';
(function () {
  var root = document.getElementById('kalender-quellen');
  if (!root) return;
  var W = JSON.parse(root.dataset.worte || '{}');
  var KEY = 'ics-quellen', CACHE = 'ics-cache:';
  var days = [].map.call(document.querySelectorAll('.month td.day[data-iso]'), function (td) { return td.dataset.iso; });
  var von = days[0] || '', bis = days[days.length - 1] || '';

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var read = function (k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  var write = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var sources = read(KEY, []);
  var events = {};            // source id -> [{iso, von, bis, allday, text}]
  var status = {};            // source id -> '' | error text

  /* ---- ICS to events within the calendar's range ---- */
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var isoOf = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var hmOf = function (d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  function eventsOf(text) {
    var out = [];
    var jcal = ICAL.parse(text);
    var comp = new ICAL.Component(jcal);
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

  /* ---- loading ---- */
  function loadUrl(src) {
    var cached = read(CACHE + src.id, null);
    if (cached && Date.now() - cached.when < 30 * 60 * 1000 && cached.von === von && cached.bis === bis) { events[src.id] = cached.events; return Promise.resolve(); }
    return fetch(src.url, { mode: 'cors', credentials: 'omit' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }).then(function (text) {
      events[src.id] = eventsOf(text); status[src.id] = '';
      write(CACHE + src.id, { when: Date.now(), von: von, bis: bis, events: events[src.id] });
    }).catch(function () {
      status[src.id] = W.unreachable;
      if (cached) events[src.id] = cached.events;
    });
  }
  function loadAll() {
    return Promise.all(sources.map(function (src) {
      if (src.url) return loadUrl(src);
      events[src.id] = (read(CACHE + src.id, null) || {}).events || [];
      return Promise.resolve();
    })).then(paintList).then(paintDots);
  }

  /* ---- the list of sources ---- */
  function paintList() {
    var list = root.querySelector('.quellen');
    list.innerHTML = sources.length ? sources.map(function (src) {
      var n = (events[src.id] || []).length;
      return '<div class="quelle"><b>' + esc(src.name) + '</b> <span class="muted">' + (status[src.id] ? esc(status[src.id]) : W.n_events.replace('#', n)) + '</span> ' +
        '<button type="button" class="quiet mini" data-remove="' + esc(src.id) + '">' + esc(W.remove) + '</button></div>';
    }).join('') : '<p class="muted small">' + esc(W.none) + '</p>';
  }
  function paintDots() {
    document.querySelectorAll('.month td.day[data-iso]').forEach(function (td) {
      var old = td.querySelector('.ics-dot'); if (old) old.parentNode.removeChild(old);
      var n = forDay(td.dataset.iso).length;
      if (!n) return;
      var s = document.createElement('span'); s.className = 'ics-dot'; s.title = W.n_events.replace('#', n); s.textContent = n;
      td.appendChild(s);
    });
  }
  function forDay(iso) {
    var all = [];
    sources.forEach(function (src) { (events[src.id] || []).forEach(function (e) { if (e.iso === iso) all.push(e); }); });
    return all.sort(function (a, b) { return (a.von || '').localeCompare(b.von || ''); });
  }

  root.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-remove]');
    if (b) {
      sources = sources.filter(function (s) { return s.id !== b.dataset.remove; });
      write(KEY, sources); try { localStorage.removeItem(CACHE + b.dataset.remove); } catch (x) {}
      delete events[b.dataset.remove]; paintList(); paintDots();
    }
  });
  root.querySelector('#quelle-add').addEventListener('click', function () {
    var url = root.querySelector('#quelle-url').value.trim(), name = root.querySelector('#quelle-name').value.trim();
    if (!/^https?:\/\//.test(url)) { alert(W.bad_url); return; }
    var src = { id: 'q' + Date.now().toString(36), name: name || url.replace(/^https?:\/\//, '').slice(0, 40), url: url };
    sources.push(src); write(KEY, sources);
    root.querySelector('#quelle-url').value = ''; root.querySelector('#quelle-name').value = '';
    loadAll();
  });
  root.querySelector('#quelle-file').addEventListener('change', function (e) {
    var f = e.target.files[0]; if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      var src = { id: 'q' + Date.now().toString(36), name: f.name.replace(/\.ics$/i, '') };
      try { events[src.id] = eventsOf(String(reader.result)); }
      catch (x) { alert(W.bad_file); return; }
      sources.push(src); write(KEY, sources);
      write(CACHE + src.id, { when: Date.now(), von: von, bis: bis, events: events[src.id] });
      paintList(); paintDots();
    };
    reader.readAsText(f);
    e.target.value = '';
  });

  /* ---- the day panel ---- */
  document.addEventListener('tag-geoeffnet', function (e) {
    var box = document.getElementById('tafel-ics'); if (!box) return;
    if (!sources.length) { box.hidden = true; return; }
    var list = forDay(e.detail);
    box.hidden = false;
    box.innerHTML = '<div class="muted">' + esc(W.day_title) + '</div>' + (list.length
      ? list.map(function (x) { return '<div class="ics-ev">' + (x.allday ? '<b>' + esc(W.allday) + '</b>' : '<b>' + esc(x.von + (x.bis ? '–' + x.bis : '')) + '</b>') + ' ' + esc(x.text) + '</div>'; }).join('')
      : '<div class="muted">' + esc(W.day_free) + '</div>');
  });

  loadAll();
})();
