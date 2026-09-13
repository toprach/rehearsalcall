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
  var dataEl = document.getElementById('heft-data') || document.getElementById('play-data');
  if (!dataEl) return;
  var D = JSON.parse(dataEl.textContent);
  var T = D.t, state = D.state || {}, today = D.today;
  var INTERVALS = [0, 1, 3, 7, 14, 30], BATCH = 6;

  var items = [];
  (D.passages || []).forEach(function (p) {
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

  /* ---- comments: a double tap on a passage, as in the documents ---- */
  var comments = D.comments || [];
  var byNr = function (nr) { return comments.filter(function (c) { return c.nr === nr; }); };
  var when = function (iso) { try { return new Date(iso).toLocaleString(D.locale, { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return iso; } };
  function cpost(fields, cb) {
    fetch('/theater/druck/' + encodeURIComponent(D.token) + '/kommentar', { method: 'POST', credentials: 'same-origin',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(fields).toString() })
      .then(function (r) { return r.json(); }).then(cb).catch(function () { cb(null); });
  }
  function badgeHtml(nr) {
    var list = byNr(nr); if (!list.length) return '';
    var q = list.some(function (c) { return c.frage && !c.erledigt; });
    return '<span class="cbadge' + (q ? ' q' : '') + '" data-nr="' + nr + '" title="' + esc(T.c_comments) + '">\u270e ' + list.length + '</span>';
  }
  function paintBadges() {
    [].forEach.call(document.querySelectorAll('.cmt[data-nr]'), function (sec) {
      var old = sec.querySelector('.cbadge'); if (old) old.parentNode.removeChild(old);
      var html = badgeHtml(Number(sec.dataset.nr)); if (!html) return;
      var span = document.createElement('span'); span.innerHTML = html;
      var head = sec.querySelector('.passhead .pno');
      if (head) head.parentNode.insertBefore(span.firstChild, head.nextSibling);
      else sec.appendChild(span.firstChild);
    });
  }
  var veil = null;
  function closeVeil() { if (veil) { veil.parentNode.removeChild(veil); veil = null; } }
  function openComments(nr, snippet) {
    closeVeil();
    var list = byNr(nr);
    var items = list.map(function (c) {
      return '<div class="cmt-item">' +
        (c.wer === D.me ? '<button type="button" class="del" data-id="' + esc(c.id) + '">' + esc(T.c_del) + '</button>' : '') +
        '<div class="who">' + esc(c.name) + ' \u00b7 ' + esc(when(c.datum)) + (c.frage ? ' \u00b7 <span class="q">' + esc(T.c_question) + '</span>' : '') + '</div>' +
        '<div>' + esc(c.text) + '</div>' +
        (c.antwort ? '<div class="ans"><div class="who">' + esc(T.c_answer) + ' \u00b7 ' + esc(when(c.antwort.datum)) + '</div>' + esc(c.antwort.text) + '</div>' : '') +
        '</div>';
    }).join('');
    veil = document.createElement('div'); veil.className = 'overlay';
    veil.innerHTML = '<div class="box">' +
      '<p class="eyebrow" style="margin-top:0">' + esc(T.c_comments) + ' \u00b7 ' + nr + '</p>' +
      (snippet ? '<p class="small muted"><i>' + esc(snippet) + '</i></p>' : '') +
      items +
      '<label class="small" style="margin-top:.8rem">' + esc(fmt(T.c_new, { nr: nr })) + '</label>' +
      '<textarea id="cmt-text" placeholder="' + esc(T.c_text) + '"></textarea>' +
      '<label class="inline"><input type="checkbox" id="cmt-q"> ' + esc(T.c_question) + '</label>' +
      '<p style="margin:.8rem 0 0"><button type="button" id="cmt-save">' + esc(T.c_save) + '</button> ' +
      '<button type="button" class="quiet" id="cmt-cancel">' + esc(T.c_cancel) + '</button></p></div>';
    veil.addEventListener('click', function (e) {
      if (e.target === veil) return closeVeil();
      var del = e.target.closest('button.del');
      if (del) {
        cpost({ action: 'loeschen', id: del.dataset.id, wer: D.me }, function (res) {
          if (res && res.ok) { comments = comments.filter(function (c) { return c.id !== del.dataset.id; }); paintBadges(); openComments(nr, snippet); }
        });
      }
    });
    veil.querySelector('#cmt-cancel').onclick = closeVeil;
    veil.querySelector('#cmt-save').onclick = function () {
      var text = veil.querySelector('#cmt-text').value.trim(); if (!text) return;
      var b = veil.querySelector('#cmt-save'); b.disabled = true;
      cpost({ action: 'neu', doc: 'rolle', nr: nr, auszug: (snippet || '').slice(0, 160), text: text,
              frage: veil.querySelector('#cmt-q').checked ? '1' : '', wer: D.me }, function (res) {
        if (res && res.ok) { comments.push(res.comment); paintBadges(); closeVeil(); }
        else { b.disabled = false; alert(T.c_failed); }
      });
    };
    document.body.appendChild(veil);
    veil.querySelector('#cmt-text').focus();
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeVeil(); });
  var snippetOf = function (sec) {
    var say = sec.classList.contains('say') ? sec : sec.querySelector('.mine .say, .say');
    return say ? say.textContent.trim().slice(0, 120) : '';
  };
  document.addEventListener('dblclick', function (e) {
    var sec = e.target.closest('.cmt[data-nr]'); if (!sec) return;
    if (e.target.closest('button, input, textarea, a')) return;
    e.preventDefault();
    openComments(Number(sec.dataset.nr), snippetOf(sec));
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.cbadge'); if (!b) return;
    var sec = b.closest('.cmt');
    openComments(Number(b.dataset.nr), sec ? snippetOf(sec) : '');
  });

  /* ---- the whole play: hop between the own lines ---- */
  if (D.play) {
    var mine = [].slice.call(document.querySelectorAll('.play .say.mine'));
    var pos = document.getElementById('play-pos');
    var hop = function (dir) {
      var mid = window.innerHeight * 0.4, pick = null, idx = -1;
      mine.forEach(function (el, i) {
        var top = el.getBoundingClientRect().top;
        if (dir > 0 && top > mid + 30 && !pick) { pick = el; idx = i; }
        if (dir < 0 && top < mid - 30) { pick = el; idx = i; }
      });
      if (pick) { pick.scrollIntoView({ block: 'center' }); pos.textContent = (idx + 1) + ' / ' + mine.length; }
    };
    document.getElementById('play-prev').onclick = function () { hop(-1); };
    document.getElementById('play-next').onclick = function () { hop(1); };
    pos.textContent = mine.length ? '0 / ' + mine.length : '';
    paintBadges();
    return;
  }

  /* ---- modes ---- */
  var panels = { lesen: document.getElementById('heft-lesen'), lernen: document.getElementById('heft-lernen'), intensiv: document.getElementById('heft-intensiv') };
  function mode(name) {
    Object.keys(panels).forEach(function (k) { if (panels[k]) panels[k].hidden = k !== name; });
    [].forEach.call(document.querySelectorAll('.heft-modes button'), function (b) { b.classList.toggle('on', b.dataset.mode === name); });
    try { localStorage.setItem('heft-mode', name); } catch (e) {}
    if (name === 'lernen' || name === 'intensiv') startSession(name);
    else dropActsBar();
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
  function noteButton(key, note) {
    return '<button type="button" class="notebtn' + (note ? ' has' : '') + '" data-key="' + esc(key) + '" title="' + esc(T.intent) + '" aria-label="' + esc(T.intent) + '">' + T.note_icon + '</button>';
  }
  function noteBox(key, note) {
    return '<div class="notebox" data-key="' + esc(key) + '" hidden><label class="small">' + esc(T.intent) + ' <span class="muted">' + esc(T.intent_hint) + '</span></label>' +
      '<input type="text" maxlength="200" value="' + esc(note) + '" placeholder="' + esc(T.intent_private) + '"></div>';
  }
  function ownHtml(c, hint, withNote) {
    var firstLineDone = false, last = -1;
    c.lines.forEach(function (l, i) { if (l.text) last = i; });
    var note = rec(c.key) && rec(c.key).a || '';
    return c.lines.map(function (l, i) {
      if (l.direction) return '<p class="dir">' + esc(l.direction) + '</p>';
      var text = l.text;
      if (hint === 1) text = firstLetters(text);
      else if (hint === 2) { if (firstLineDone) text = firstLetters(text); firstLineDone = true; }
      return '<p class="say' + (l.cut ? ' cut' : '') + '">' + (l.cont ? '' : '<b>' + esc(l.who) + ':</b> ') + esc(text) +
        (withNote && i === last ? noteButton(c.key, note) : '') + '</p>';
    }).join('') + (withNote ? noteBox(c.key, note) : '');
  }
  /* The icon opens the box; leaving the box saves the note. */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('button.notebtn'); if (!b) return;
    var box = b.closest('.pass').querySelector('.notebox[data-key="' + b.dataset.key + '"]'); if (!box) return;
    box.hidden = !box.hidden;
    if (!box.hidden) box.querySelector('input').focus();
  });
  document.addEventListener('change', function (e) {
    var input = e.target; var box = input.closest('.notebox'); if (!box) return;
    var key = box.dataset.key, note = input.value.trim().slice(0, 200);
    var r = rec(key) || { s: 0, f: today, l: [] }; r.a = note; if (!note) delete r.a; state[key] = r;
    var b = box.closest('.pass').querySelector('.notebtn[data-key="' + key + '"]'); if (b) b.classList.toggle('has', !!note);
    post({ key: key, absicht: note }, function (res) { if (res && res.rec) state[key] = res.rec; });
  });
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
  /* What comes before and after a chunk: the other chunks of the same
     passage, then the lines around the passage. Nearest first for
     "before", as the reading cards have it. */
  function contextOf(c) {
    var p = c.p, k = p.chunks.indexOf(c);
    var line = function (l) { return l.direction ? { text: l.direction, dir: true } : { who: l.who, text: l.text, cont: l.cont }; };
    var before = [], after = [];
    for (var i = k - 1; i >= 0; i--) before = before.concat(p.chunks[i].lines.slice().reverse().map(line));
    before = before.concat(p.ctxBefore || []);
    for (var j = k + 1; j < p.chunks.length; j++) after = after.concat(p.chunks[j].lines.map(line));
    after = after.concat(p.ctxAfter || []);
    return { before: before.slice(0, 10), after: after.slice(0, 10) };
  }
  var ctxLine = function (l) {
    return l.dir ? '<p class="dir">' + esc(l.text) + '</p>'
      : '<p class="say ctxline">' + (l.cont ? '' : '<b>' + esc(l.who) + ':</b> ') + esc(l.text) + '</p>';
  };
  function ctxBeforeHtml(list) {
    if (!list.length) return '';
    return '<div class="ctxwrap"><button type="button" class="quiet mini ctx-more before">' + esc(T.more_before) + '</button>' +
      '<div class="ctx before">' + list.slice().reverse().map(function (l) { return '<div hidden>' + ctxLine(l) + '</div>'; }).join('') + '</div></div>';
  }
  function ctxAfterHtml(list) {
    if (!list.length) return '';
    return '<div class="ctxwrap"><div class="ctx after">' + list.map(function (l) { return '<div hidden>' + ctxLine(l) + '</div>'; }).join('') + '</div>' +
      '<button type="button" class="quiet mini ctx-more after">' + esc(T.more_after) + '</button></div>';
  }

  /* The buttons live in a bar fixed above the phone's navigation, so
     they are always in the same place. */
  function actsBar() {
    var bar = document.getElementById('heft-acts');
    if (!bar) { bar = document.createElement('div'); bar.className = 'learnbar'; bar.id = 'heft-acts'; document.body.appendChild(bar); }
    document.body.classList.add('learning');
    return bar;
  }
  function dropActsBar() {
    var bar = document.getElementById('heft-acts'); if (bar) bar.parentNode.removeChild(bar);
    document.body.classList.remove('learning');
  }

  function render(panel, e, open) {
    var c = e.item, r = rec(c.key);
    var nr = c.p.nr, ctx = contextOf(c);
    var html = '<section class="pass learn cmt" id="heft-card"' + (nr != null ? ' data-nr="' + nr + '"' : '') + '>' + head(e) +
      ctxBeforeHtml(ctx.before) + cueHtml(c) +
      c.before.map(function (d) { return '<p class="dir">' + esc(d) + '</p>'; }).join('');
    var bar = actsBar();
    if (open) {
      html += '<div class="mine">' + ownHtml(c, 0, true) + '</div>' +
        '<p class="small muted">' + esc(T.first_time) + '</p>';
      bar.innerHTML = '<button type="button" data-act="weiter">' + esc(T.next) + '</button>';
    } else {
      html += '<p class="small muted speak">' + esc(T.say_aloud) + '</p>' +
        '<div class="mine hidden-lines" id="heft-own" hidden>' + ownHtml(c, 0, true) + '</div>' +
        '<div class="hinted" id="heft-hint" hidden></div>';
      bar.innerHTML = '<button type="button" class="quiet" data-act="hinweis">' + esc(T.hint) + '</button>' +
          '<button type="button" data-act="anzeigen">' + esc(T.reveal) + '</button>';
    }
    html += c.after.map(function (d) { return '<p class="dir after">' + esc(d) + '</p>'; }).join('') +
      ctxAfterHtml(ctx.after) + '</section>';
    panel.innerHTML = '<div id="heft-figures" class="small muted figures"></div>' + html;
    paintFigures(); paintBadges();
    panel.querySelector('#heft-card').scrollIntoView({ block: 'start' });
    window.scrollBy(0, -8);
  }
  function reveal(panel, e) {
    var own = panel.querySelector('#heft-own'); own.hidden = false;
    var h = panel.querySelector('#heft-hint'); if (h) h.hidden = true;
    actsBar().innerHTML =
        '<button type="button" class="rate-again" data-act="nochmal">' + esc(T.again) + '</button>' +
        '<button type="button" class="rate-help" data-act="hilfe">' + esc(T.with_help) + '</button>' +
        '<button type="button" class="rate-knew" data-act="kann">' + esc(T.knew) + '</button>';
  }
  function rate(e, rating) {
    var c = e.item;
    if (session.hint && rating === 'kann') rating = 'hilfe';
    var box = document.querySelector('#heft-card .notebox input');
    var note = box ? box.value.trim().slice(0, 200) : null;
    var local = answerLocal(rec(c.key), rating);
    if (note != null) { local.a = note; if (!note) delete local.a; }
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
    dropActsBar();
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
  paintFigures(); paintBadges();
})();
