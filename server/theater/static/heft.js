/* ---------------------------------------------------------------------
   The part book on the screen: reading, learning, the hard ones.

   Served as a file so that nothing has to be escaped inside a template.
   The page carries its data in #heft-data: the passages with their
   chunks, the learning state of this person, today's date and the
   words of the interface.

   Learning is retrieval: the cue is shown, the own lines are hidden;
   speak, reveal, judge. A batch of up to six chunks is repeated in
   random order until each has been known twice (a chunk seen for the
   first time is shown open once before). Chunks due from earlier days
   come first, then new ones in the order of the play. The steps and
   the due dates are computed by the server and mirrored here so the
   figures move at once.
   --------------------------------------------------------------------- */
(function () {
  var dataEl = document.getElementById('heft-data');
  if (!dataEl) return;
  var D = JSON.parse(dataEl.textContent);
  var T = D.t, state = D.state || {}, today = D.today;
  var INTERVALS = [0, 1, 3, 7, 14, 30], BATCH = 6;

  var items = [];
  D.passages.forEach(function (p) {
    p.chunks.forEach(function (c) { c.p = p; items.push(c); });
  });
  var byKey = {};
  items.forEach(function (c) { byKey[c.key] = c; });

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fmt = function (s, v) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; }); };
  function addDays(iso, n) { var d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var rec = function (key) { return state[key] || null; };
  var failCount = function (r) { return (r && r.l || []).filter(function (x) { return x === 0; }).length; };
  var failRate = function (r) { var l = r && r.l || []; return l.length ? failCount(r) / l.length : 0; };

  /* The same arithmetic as learn.mjs on the server; the server's
     answer replaces it when it arrives. */
  function answerLocal(r, rating) {
    var code = { nochmal: 0, hilfe: 1, kann: 2 }[rating];
    var n = { s: r ? r.s : 0, f: r ? r.f : today, l: (r && r.l || []).concat([code]).slice(-10), a: r && r.a || '' };
    if (code === 2) n.s = Math.min(INTERVALS.length - 1, n.s + 1);
    else if (code === 1) n.s = Math.max(1, n.s);
    else n.s = 0;
    n.f = addDays(today, INTERVALS[n.s]);
    return n;
  }
  function post(fields, cb) {
    var body = new URLSearchParams(fields).toString();
    fetch('/theater/mit/heft', { method: 'POST', credentials: 'same-origin',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: body })
      .then(function (r) { return r.ok ? r.json() : null; }).then(cb).catch(function () { cb(null); });
  }

  /* ---- the figures ---- */
  function figures() {
    var due = 0, fresh = 0, words = 0, sitting = 0, hard = 0, per = INTERVALS.map(function () { return 0; });
    items.forEach(function (c) {
      var r = rec(c.key); words += c.words || 0;
      if (!r) { fresh++; return; }
      per[Math.min(r.s, per.length - 1)]++;
      if (r.f <= today) due++;
      if (r.s >= 3) sitting += c.words || 0;
      if (failCount(r) >= 2) hard++;
    });
    return { due: due, fresh: fresh, per: per, hard: hard, sitting: words ? Math.round(100 * sitting / words) : 0, total: items.length };
  }
  function paintFigures() {
    var f = figures();
    var el = document.getElementById('heft-figures'); if (!el) return;
    el.innerHTML = '<span>' + esc(fmt(T.due, { n: f.due })) + '</span> · <span>' + esc(fmt(T.fresh, { n: f.fresh })) + '</span> · ' +
      '<span>' + esc(fmt(T.sitting, { p: f.sitting })) + '</span>' +
      '<span class="steps" title="' + esc(T.steps) + '">' + f.per.map(function (n, i) {
        return '<i class="s' + i + '" style="flex:' + Math.max(n, 0) + '" title="' + esc(fmt(T.step, { i: i, n: n })) + '"></i>'; }).join('') +
      '<i class="s-" style="flex:' + f.fresh + '" title="' + esc(fmt(T.fresh, { n: f.fresh })) + '"></i></span>';
    var hard = document.getElementById('heft-hardcount'); if (hard) hard.textContent = f.hard ? '(' + f.hard + ')' : '';
  }

  /* ---- modes ---- */
  var panels = { lesen: document.getElementById('heft-lesen'), lernen: document.getElementById('heft-lernen'), intensiv: document.getElementById('heft-intensiv') };
  function mode(name) {
    Object.keys(panels).forEach(function (k) { if (panels[k]) panels[k].hidden = k !== name; });
    [].forEach.call(document.querySelectorAll('.heft-modes button'), function (b) { b.classList.toggle('on', b.dataset.mode === name); });
    try { localStorage.setItem('heft-mode', name); } catch (e) {}
    if (name === 'lernen' || name === 'intensiv') startSession(name);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.heft-modes button'); if (b) mode(b.dataset.mode);
  });

  /* ---- reading: more context above and below ---- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('button.ctx-more'); if (!b) return;
    var box = b.parentNode.querySelector('.ctx'); var hidden = [].slice.call(box.querySelectorAll('[hidden]'));
    if (b.classList.contains('before')) hidden.reverse();
    hidden.slice(0, 2).forEach(function (x) { x.hidden = false; });
    if (hidden.length <= 2) b.hidden = true;
  });

  /* ---- learning ---- */
  var session = null;
  function startSession(kind) {
    var queue;
    if (kind === 'lernen') {
      var due = shuffle(items.filter(function (c) { var r = rec(c.key); return r && r.f <= today; }));
      var fresh = items.filter(function (c) { return !rec(c.key); });
      queue = due.map(function (c) { return { item: c, fresh: false }; })
        .concat(fresh.map(function (c) { return { item: c, fresh: true }; }));
    } else {
      var hard = items.filter(function (c) { return failCount(rec(c.key)) >= 2; })
        .sort(function (a, b) { return failRate(rec(b.key)) - failRate(rec(a.key)); });
      queue = hard.map(function (c) { return { item: c, fresh: false }; });
    }
    session = { kind: kind, queue: queue, batch: [], last: null, done: 0, total: queue.length, hint: 0 };
    next();
  }
  function fill() {
    while (session.batch.length < BATCH && session.queue.length) {
      var q = session.queue.shift();
      session.batch.push({ item: q.item, fresh: q.fresh, hits: 0, need: q.fresh ? 2 : 1, shown: false });
    }
  }
  function pick() {
    if (session.testNext && session.batch.indexOf(session.testNext) >= 0) {
      var tn = session.testNext; session.testNext = null; return tn;
    }
    var cands = session.batch.filter(function (e) { return e !== session.last; });
    if (!cands.length) cands = session.batch;
    var unseen = cands.filter(function (e) { return e.fresh && !e.shown; });
    if (unseen.length) return unseen[0];
    return cands[Math.floor(Math.random() * cands.length)];
  }
  function next() {
    fill();
    var panel = panels[session.kind];
    if (!session.batch.length) return finish(panel);
    var e = pick(); session.last = e; session.hint = 0;
    render(panel, e, e.fresh && !e.shown);
  }

  function firstLetters(text) {
    return text.replace(/[\p{L}\p{N}’']+/gu, function (w) { return w.charAt(0) + '·'.repeat(Math.min(w.length - 1, 6)); });
  }
  function ownHtml(c, hint) {
    var firstLineDone = false;
    return c.lines.map(function (l) {
      if (l.direction) return '<p class="dir">' + esc(l.direction) + '</p>';
      var text = l.text;
      if (hint === 1) text = firstLetters(text);
      else if (hint === 2) { if (firstLineDone) text = firstLetters(text); firstLineDone = true; }
      return '<p class="say' + (l.cut ? ' cut' : '') + '">' + (l.cont ? '' : '<b>' + esc(l.who) + ':</b> ') + esc(text) + '</p>';
    }).join('');
  }
  function cueHtml(c) {
    if (!c.cue) return '<p class="cue muted">' + esc(T.no_cue) + '</p>';
    return '<p class="cue' + (c.cue.own ? ' own' : '') + '"><b>' + esc(c.cue.who) + (c.cue.own ? ' ' + esc(T.own_before) : '') + ':</b> ' + esc(c.cue.text) + '</p>';
  }
  function head(e) {
    var c = e.item, p = c.p, r = rec(c.key);
    return '<div class="passhead small muted"><span class="pno">' + p.i + '</span> ' + esc(p.chapter) +
      (c.teil ? ' · ' + esc(fmt(T.part, { k: c.teil[0], n: c.teil[1] })) : '') +
      (r ? ' · ' + esc(fmt(T.step_short, { i: r.s })) : ' · ' + esc(T.new_)) +
      '<span class="batch">' + esc(fmt(T.progress, { done: session.done, total: session.total })) + '</span></div>';
  }
  function render(panel, e, open) {
    var c = e.item, r = rec(c.key);
    var html = '<section class="pass learn" id="heft-card">' + head(e) + cueHtml(c) +
      c.before.map(function (d) { return '<p class="dir">' + esc(d) + '</p>'; }).join('');
    if (open) {
      html += '<div class="mine">' + ownHtml(c, 0) + '</div>' +
        (r && r.a ? '<p class="intent small"><b>' + esc(T.intent) + ':</b> ' + esc(r.a) + '</p>' : '') +
        '<p class="small muted">' + esc(T.first_time) + '</p>' +
        '<div class="acts"><button type="button" data-act="weiter">' + esc(T.next) + '</button></div>';
    } else {
      html += '<p class="small muted speak">' + esc(T.say_aloud) + '</p>' +
        '<div class="mine hidden-lines" id="heft-own" hidden>' + ownHtml(c, 0) + '</div>' +
        '<div class="hinted" id="heft-hint" hidden></div>' +
        '<div class="acts" id="heft-acts">' +
          '<button type="button" class="quiet" data-act="hinweis">' + esc(T.hint) + '</button> ' +
          '<button type="button" data-act="anzeigen">' + esc(T.reveal) + '</button></div>';
    }
    html += c.after.map(function (d) { return '<p class="dir after">' + esc(d) + '</p>'; }).join('') + '</section>';
    panel.innerHTML = '<div id="heft-figures" class="small muted figures"></div>' + html;
    paintFigures();
    panel.querySelector('#heft-card').scrollIntoView({ block: 'start' });
    window.scrollBy(0, -8);
  }
  function reveal(panel, e) {
    var c = e.item, r = rec(c.key);
    var own = panel.querySelector('#heft-own'); own.hidden = false;
    var h = panel.querySelector('#heft-hint'); if (h) h.hidden = true;
    var acts = panel.querySelector('#heft-acts');
    acts.innerHTML = '<div class="intentbox"><label class="small">' + esc(T.intent) +
        ' <span class="muted">' + esc(T.intent_hint) + '</span></label>' +
        '<input type="text" id="heft-intent" maxlength="200" value="' + esc(r && r.a || '') + '"></div>' +
      '<div class="rate">' +
        '<button type="button" class="quiet" data-act="nochmal">' + esc(T.again) + '</button>' +
        '<button type="button" class="quiet" data-act="hilfe">' + esc(T.with_help) + '</button>' +
        '<button type="button" data-act="kann">' + esc(T.knew) + '</button></div>';
  }
  function rate(e, rating) {
    var c = e.item;
    if (session.hint && rating === 'kann') rating = 'hilfe';
    var intent = document.getElementById('heft-intent');
    var note = intent ? intent.value.trim().slice(0, 200) : null;
    var local = answerLocal(rec(c.key), rating);
    if (note != null) local.a = note;
    state[c.key] = local;
    var fields = { key: c.key, antwort: rating };
    if (note != null) fields.absicht = note;
    post(fields, function (res) { if (res && res.rec) state[c.key] = res.rec; });
    if (rating === 'kann') e.hits++;
    else if (rating === 'nochmal') e.hits = 0;
    if (e.hits >= e.need) {
      session.batch = session.batch.filter(function (x) { return x !== e; });
      session.done++;
    }
    next();
  }
  function finish(panel) {
    var f = figures();
    var tomorrow = items.filter(function (c) { var r = rec(c.key); return r && r.f <= addDays(today, 1) && r.f > today; }).length;
    panel.innerHTML = '<div id="heft-figures" class="small muted figures"></div>' +
      '<div class="box"><b>' + esc(session.kind === 'intensiv' && !session.total ? T.nothing_hard : T.done_title) + '</b>' +
      '<p class="small muted">' + esc(session.kind === 'intensiv' && !session.total ? T.nothing_hard_what
        : fmt(T.done_text, { n: session.done, tomorrow: tomorrow })) + '</p>' +
      '<button type="button" class="quiet mini" data-act="again-session">' + esc(T.once_more) + '</button></div>';
    paintFigures();
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-act]'); if (!b || !session) return;
    var panel = panels[session.kind], e = session.last;
    var act = b.dataset.act;
    if (act === 'weiter') { e.shown = true; session.testNext = e; next(); }
    else if (act === 'hinweis') {
      session.hint = Math.min(2, session.hint + 1);
      var h = panel.querySelector('#heft-hint'); h.hidden = false; h.innerHTML = ownHtml(e.item, session.hint);
      if (session.hint === 2) b.disabled = true;
    }
    else if (act === 'anzeigen') reveal(panel, e);
    else if (act === 'nochmal' || act === 'hilfe' || act === 'kann') rate(e, act);
    else if (act === 'again-session') startSession(session.kind);
  });

  /* ---- start ---- */
  var start = 'lesen';
  try { start = localStorage.getItem('heft-mode') || 'lesen'; } catch (e) {}
  if (!panels[start]) start = 'lesen';
  if (start === 'lesen') { mode('lesen'); }
  else mode(start);
  paintFigures();
})();
