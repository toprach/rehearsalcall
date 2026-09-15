/* ---------------------------------------------------------------------
   The views. Plain HTML, set on the server - no build step, no
   scaffolding, nothing that will stop building in two years.

   Every view hangs on a language. Rather than pass it into each function
   one by one - and touch twenty call sites doing so - there is a
   factory: views(code) returns the same set of functions, wired to one
   language. The call in the router stays as it was.
   --------------------------------------------------------------------- */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { language, LANGUAGES } from './texts.mjs';
import { summary as summaryOf } from './learn.mjs';
import { STYLE } from './style.mjs';

export const h = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* What this installation is, for the footer and the About page.

   The version stands in package.json and nowhere else. The contact
   address is the operator's, not ours: it comes from THEATER_KONTAKT,
   and without it the entry page says something neutral. */
const HERE = path.dirname(fileURLToPath(import.meta.url));
function readVersion() {
  try {
    const p = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'package.json'), 'utf8'));
    return String(p.version || '');
  } catch { return ''; }
}
/* The book script is cached for an hour; its address changes with the file. */
const fileV = (name) => {
  try { return String(Math.round(fs.statSync(new URL('./static/' + name, import.meta.url)).mtimeMs)); }
  catch { return '0'; }
};
const HEFT_V = fileV('heft.js');
const KAL_V = fileV('kalender.js');

export const ABOUT = {
  version: readVersion(),
  repository: 'https://github.com/toprach/rehearsalcall',
  author: 'Johannes Behr-Kutsam',
  licence: 'MIT',
  contact: String(process.env.THEATER_KONTAKT || '').trim(),
};

/* ---------------------------------------------------------------------
   The factory. L is the language from texts.mjs; L.t() gives text,
   L.number()/L.percent()/L.date() the figures as that language writes
   them.
   --------------------------------------------------------------------- */
/* ctx: what the router knows about the visitor that the pages need -
   directorProject: the project the director's cookie opens, if any. */
export function views(code, pfad = '/theater', ctx = {}) {
  const L = language(code);
  const t = L.t;



const ICONS = {
  share: '<path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
  person: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  book: '<path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/>',
  note: '<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4M8 12h8M8 16h6"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
};
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

function page({ title, body, nav = '', narrow = false, tabbar = '' }) {
  const name = t('app.name');
  /* The name in the head leads home - and home is where the visitor
     is: a member's start page, the director's overview, else the
     entry. The navigation says which. */
  const home = /href="\/theater\/mit\/zeiten"/.test(nav) ? '/theater/mit'
             : /href="\/theater\/leute"/.test(nav) ? '/theater/projekt' : '/theater';
  return `<!doctype html><html lang="${L.code}"${ctx.theme === 'dunkel' ? ' data-theme="dark"' : ''}${
    ctx.font && ctx.font !== 'normal' ? ` data-font="${h(ctx.font)}"` : ''}><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<link rel="manifest" href="${ctx.app ? `/theater/app/${h(ctx.app.token)}/manifest.webmanifest` : '/theater/manifest.webmanifest'}">
<meta name="theme-color" content="#b3272d">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="${h(ctx.app ? ctx.app.short : t('pwa.short'))}">
<link rel="apple-touch-icon" href="${ctx.app ? `/theater/app/${h(ctx.app.token)}/icon-192.png` : '/theater/icon-192.png'}">
<title>${h(title === name ? name : title + ' \u2013 ' + name)}</title><style>${STYLE}</style></head><body>
<header class="head${tabbar ? ' member' : ''}"><div class="inner">
  <a class="brand" href="${home}">${h(name.toUpperCase())}</a>${nav}${L.picker(pfad)}
  <form method="post" action="/theater/thema" class="themepick">
    <input type="hidden" name="back" value="${h(pfad)}">
    <input type="hidden" name="thema" value="${ctx.theme === 'dunkel' ? 'hell' : 'dunkel'}">
    <button class="quiet" type="submit" title="${h(t(ctx.theme === 'dunkel' ? 'nav.light' : 'nav.dark'))}"
            aria-label="${h(t(ctx.theme === 'dunkel' ? 'nav.light' : 'nav.dark'))}">${ctx.theme === 'dunkel' ? '\u2600' : '\u263d'}</button>
  </form>
  <a class="settings" href="/theater/einstellungen?z=${encodeURIComponent(pfad)}" title="${h(t('nav.settings'))}"
     aria-label="${h(t('nav.settings'))}">\u2699</a>
  ${ctx.share ? `<button type="button" class="share" data-url="${h(ctx.share)}" data-title="${h(t('book.title'))}"
     data-copied="${h(t('nav.copied'))}" title="${h(t('nav.share'))}" aria-label="${h(t('nav.share'))}">${icon('share')}</button>` : ''}
</div></header>
${ctx.share ? `<script>
(function () {
  var b = document.querySelector('.head button.share'); if (!b) return;
  b.addEventListener('click', function () {
    var url = b.dataset.url;
    if (navigator.share) { navigator.share({ title: b.dataset.title, url: url }).catch(function () {}); return; }
    var done = function () {
      var m = document.createElement('div'); m.className = 'toast'; m.textContent = b.dataset.copied;
      document.body.appendChild(m); setTimeout(function () { m.parentNode && m.parentNode.removeChild(m); }, 2200);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { window.prompt(b.dataset.title, url); });
    else window.prompt(b.dataset.title, url);
  });
})();
<\/script>` : ''}
<div class="frame${narrow ? ' narrow' : ''}${tabbar ? ' hastabs' : ''}">${tabbar ? installBanner() : ''}${ctx.demo
  ? `<div class="notice demo">${t('demo.banner', { when: h(L.date(ctx.demo.until,
      { weekday: 'short', hour: '2-digit', minute: '2-digit' })) })}</div>` : ''}${body}</div>
${tabbar}
<script>
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/theater/sw.js').catch(function () {});
</script>
<footer class="foot"><div class="inner small muted">
  <a href="/theater/ueber">${h(name)}${ABOUT.version ? ' ' + h(ABOUT.version) : ''}</a>
  · <a href="${h(ABOUT.repository)}" rel="noopener">${t('about.source')}</a>
  · <a href="/theater/ueber">${t('about.title')}</a>
</div></footer>
</body></html>`;
}

/* ---------- About: what this is, which version, whose ---------- */

const aboutPage = () => page({
  title: t('about.title'), narrow: true,
  body: `
    <p class="eyebrow">${t('app.name')}</p>
    <h1>${t('about.title')}</h1>
    <p class="muted">${t('about.what')}</p>
    <table>
      <tr><th>${t('about.version')}</th><td>${h(ABOUT.version || '—')}</td></tr>
      <tr><th>${t('about.source_code')}</th><td><a href="${h(ABOUT.repository)}"
        rel="noopener">${h(ABOUT.repository.replace(/^https?:\/\//, ''))}</a></td></tr>
      <tr><th>${t('about.author')}</th><td>${h(ABOUT.author)}</td></tr>
      <tr><th>${t('about.licence')}</th><td>${t('about.licence_text', {
        licence: h(ABOUT.licence), url: h(ABOUT.repository + '/blob/main/LICENSE') })}</td></tr>
      ${ABOUT.contact ? `<tr><th>${t('about.contact')}</th><td><a href="mailto:${
        h(ABOUT.contact)}">${h(ABOUT.contact)}</a></td></tr>` : ''}
    </table>
    <p class="small muted">${t('about.format')}</p>
    <p><a class="btn quiet" href="/theater">${h(t('common.back'))}</a></p>` });

/* A notice.

   It arrives either already set (text) or as a key with values - then it
   is translated here. The places that produce notices sit deep in the
   application and know nothing of the visitor's language; they only pass
   on WHAT is to be said.                                            */
const notice = (m) => !m ? ''
  : `<div class="notice ${m.kind}">${
      m.key ? t(m.key, m.values) : h(m.text)}</div>`;

const durationText = (min) => {
  const st = Math.floor(min / 60), rest = Math.round(min % 60);
  return st ? t('common.hours', { h: st, m: String(rest).padStart(2, '0') })
            : t('common.minutes', { n: rest });
};



/* Why does no date come about? Without this the director searches in
   the fog - with it they know whether somebody is missing, whether the
   rehearsal is too long, or whether every evening is taken.          */
/* A form on one line.

   Nearly every action in the application is the same thing: a POST to a
   page, with "action" and a few hidden fields. That stood there five
   times nearly alike; now once.

   hidden   { name: value } - only values that are set are sent along
   confirm  a question before submitting; without it, it goes at once */
function actionForm(target, action, hidden, body, { confirm, cssClass } = {}) {
  const fields = Object.entries(hidden || {})
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `<input type="hidden" name="${h(k)}" value="${h(v)}">`).join('');
  return `<form method="post" action="${h(target)}" class="inline${cssClass ? ' ' + cssClass : ''}"${
    confirm ? ` onsubmit="return confirm('${h(confirm).replace(/'/g, '&#39;')}')"` : ''}>
    <input type="hidden" name="action" value="${h(action)}">${fields}${body}</form>`;
}

/* Where is the rehearsal? The program sends nothing - whoever enters
   the place has to tell people as well. That is what it says beside
   the field. */
const placeField = (target, rehearsalId, place) =>
  actionForm(target, 'place', { rehearsal: rehearsalId },
    `<input type="text" name="place" value="${h(place || '')}"
            placeholder="${h(t('common.place_hint'))}">
     <button class="quiet mini" type="submit">${h(t('common.save'))}</button>`,
    { cssClass: 'placefield' });

function whyNot(pr) {
  if (pr.withoutEntry?.length)
    return t('why.waiting', { folks: pr.withoutEntry.map(h).join(', ') });
  if (!pr.possible?.length && pr.tooShort)
    return t('why.too_long', { needs: durationText(pr.needs),
                                window: durationText(pr.longestWindow) });
  if (!pr.possible?.length && pr.oftenUnavailable?.length)
    return t('why.no_evening',
             { folks: pr.oftenUnavailable.map(([b]) => h(b)).join(', ') });
  if (pr.possible?.length)
    return t('why.taken', { n: pr.possible.length });
  return t('why.nothing');
}

/* A link to look at and to copy. Without clipboard permission in the
   browser the text stays selectable - the button is then only a
   convenience. */
let copyCounter = 0;
const copyLink = (url) => {
  const nr = ++copyCounter;
  return `<span class="copyable">
  <code id="lnk${nr}">${h(url)}</code>
  <button type="button" class="quiet mini copybtn" data-target="lnk${nr}"
          data-link="${h(url)}">${h(t('common.copy'))}</button></span>
<script>
(function () {
  var k = document.querySelector('.copybtn[data-target="lnk${nr}"]');
  if (!k) return;
  k.addEventListener('click', function () {
    var text = k.dataset.link, fertig = function () {
      k.textContent = ${JSON.stringify(t('common.copied'))};
      setTimeout(function () { k.textContent = ${JSON.stringify(t('common.copy'))}; }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText)
      navigator.clipboard.writeText(text).then(fertig, waehle);
    else waehle();
    function waehle() {
      // Zwischenablage verweigert - dann wenigstens markieren
      var el = document.getElementById(k.dataset.target), b = document.createRange();
      b.selectNodeContents(el);
      var a = window.getSelection(); a.removeAllRanges(); a.addRange(b);
      k.textContent = ${JSON.stringify(t('common.selected'))};
      setTimeout(function () { k.textContent = ${JSON.stringify(t('common.copy'))}; }, 2500);
    }
  });
})();
<\/script>`;
};

/* ---------- Einstieg ---------- */

const entryPage = (m, demos = []) => page({
  title: t('app.name'), narrow: true,
  body: `
    <p class="eyebrow">${t('app.for')}</p>
    <h1>${t('app.name')}</h1>
    <p class="muted">${t('entry.what')}</p>
    ${notice(m)}
    <div class="box">
      <form method="post" action="/theater/zugang">
        <label for="code">${t('entry.code')}</label>
        <input type="text" id="code" name="code" autocomplete="off"
               placeholder="${h(t('entry.code_hint'))}" required autofocus>
        <button type="submit">${t('entry.continue')}</button>
      </form>
    </div>
    <div class="box important">
      <p><b>${t('entry.no_access')}</b></p>
      <p class="small muted">${ABOUT.contact
        ? t('entry.request', { mail: h(ABOUT.contact),
                               subject: encodeURIComponent(t('entry.request_subject')) })
        : t('entry.request_none')}</p>
      <p class="small muted" style="margin:0">${t('entry.by_hand')}</p>
    </div>
    ${demos.length ? `<h2>${t('entry.demo_title')}</h2>
    <p class="small muted">${t('entry.demo_what')}</p>
    <div class="box demos">${demos.map(d => `<p>
      <b>${h(d.title)}</b><br>
      <a class="btn quiet mini" href="/theater/demo/${h(d.key)}">${t('entry.demo_director')}</a>
      <a class="btn quiet mini" href="/theater/demo/${h(d.key)}/ensemble">${t('entry.demo_member')}</a></p>`).join('')}
    </div>` : ''}
    <p class="small muted">${t('entry.more')}</p>
    <p class="small muted">${t('entry.open_source')}</p>`
});

/* ---------- Regie ---------- */

/* The director's navigation. At the end a list of the company: pick a
   name and you are in that person's calendar - the director enters
   times for people who phone them, and their own. */
/* The director's links in four groups: the project, the road from the
   script to the plan, what runs during rehearsals, the output. The
   page being shown is marked. */
const navDirector = (p) => {
  const a = (href, key) => `<a href="${href}"${pfad === href || pfad.startsWith(href + '/') ? ' class="on"' : ''}>${t(key)}</a>`;
  const grp = (...links) => `<span class="grp">${links.join('')}</span>`;
  return `<nav>
  ${grp(a('/theater/projekt', 'nav.overview'), a('/theater/leute', 'nav.company'))}
  ${grp(a('/theater/skript', 'nav.script'), a('/theater/besetzung', 'nav.casting'), a('/theater/plan', 'nav.rehearsals'))}
  ${grp(a('/theater/termine', 'nav.dates'), a('/theater/kommentare', 'nav.comments'))}
  ${grp(a('/theater/drucken', 'nav.print'), a('/theater/hoerbuch', 'nav.audiobook'))}
  ${(p?.personen || []).length ? `<form method="post" action="/theater/als" class="whopick">
    <select name="person" onchange="this.form.submit()" autocomplete="off" aria-label="${h(t('nav.calendar_for'))}">
      <option value="">${h(t('nav.calendar_for'))}</option>
      ${[...p.personen].sort((a, b) => (a.name || a.b).localeCompare(b.name || b.b, L.locale))
        .map(x => `<option value="${h(x.id)}">${h(x.name || x.b)}</option>`).join('')}
    </select></form>` : ''}
  <a href="/theater/abmelden">${t('nav.signout')}</a></nav>`;
};

function printPage(p, m) {
  const d = p.drehbuch;
  if (!d) return page({ title: t('print.print'), nav: navDirector(p), body: `
    <p class="eyebrow">${t('print.output')}</p><h1>${t('print.title')}</h1>
    <div class="notice error">${t('print.no_script')}</div>` });

  const base = p.drucklink || '';
  const folks = (p.personen || []).filter(x => x.b);
  const hasPlan = !!p.plan?.proben?.length;
  /* Open in the browser (the print link, valid for the company too), or
     take it away as a file. */
  const auf = (weg, datei) => `<p><a class="btn" href="${h(base)}${weg}" target="_blank"
    rel="noopener">${h(t('print.open'))}</a>
    <a class="btn quiet" href="/theater/datei/${datei}">${h(t('print.download_file'))}</a></p>`;

  return page({ title: t('print.print'), nav: navDirector(p), body: `
    <p class="eyebrow">${t('print.output')}</p><h1>${t('print.title')}</h1>
    ${notice(m)}
    <p class="muted">${t('print.what')}</p>
    <div class="box important">
      <p class="small" style="margin:0">${t('print.addresses')}</p>
    </div>

    <h2>${t('print.full')}</h2>
    <p class="small muted">${t('print.full_what')}</p>
    ${copyLink(base + '/gesamt')}${auf('/gesamt', 'gesamt')}

    <h2>${t('print.plan')}</h2>
    <p class="small muted">${t('print.plan_what')}</p>
    ${hasPlan ? copyLink(base + '/probenplan') + auf('/probenplan', 'probenplan')
      : `<div class="notice error">${t('print.plan_missing')}</div>`}

    <h2>${t('print.booklets')}</h2>
    <p class="small muted">${t('print.booklets_what')}</p>
    ${folks.length ? `<table><tr><th>${t('print.col_person')}</th>
        <th>${t('print.col_address')}</th><th></th></tr>
      ${folks.map(x => `<tr>
        <td><span class="chip">${h(x.b)}</span> ${h(x.name || '')}</td>
        <td class="small"><code>${h(base)}/rolle/${h(encodeURIComponent(x.b))}</code></td>
        <td><a class="btn quiet mini" target="_blank" rel="noopener"
               href="${h(base)}/rolle/${h(encodeURIComponent(x.b))}">${
               h(t('print.open_small'))}</a></td>
      </tr>`).join('')}</table>
      <p class="small muted">${t('print.context')}</p>` : ''}

    <h2>${t('print.original')}</h2>
    <p class="small muted">${t('print.original_what')}</p>
    ${d.original
      ? `<p><code>${h(d.original.name)}</code> \u00b7 ${
         L.number(Math.round(d.original.bytes / 1024))} KB
         <a class="btn quiet mini" href="${h(base)}/original">${
         h(t('print.download'))}</a></p>`
      : `<p class="small muted">${t('print.original_none')}</p>`}

    <p class="small muted" style="margin-top:2.5rem">${t('print.takes_time')}</p>` });
}

function docsPage(project, base) {
  const folks = (project.personen || []).filter(x => x.b);
  const hasPlan = !!project.plan?.proben?.length;
  return page({ title: t('docs.title'), narrow: true, body: `
    <p class="eyebrow">${h(project.titel)}</p>
    <h1>${t('docs.title')}</h1>
    <p class="muted">${t('docs.what')}</p>
    <div class="box">
      <p><a href="${h(base)}/gesamt">${t('docs.full')}</a></p>
      ${hasPlan ? `<p><a href="${h(base)}/probenplan">${t('docs.plan')}</a></p>` : ''}
      ${project.drehbuch?.original
        ? `<p><a href="${h(base)}/original">${t('docs.original',
            { name: h(project.drehbuch.original.name) })}</a></p>` : ''}
    </div>
    ${folks.length ? `<h2>${t('docs.booklets')}</h2><div class="box">
      ${folks.map(x => `<p style="margin:.3rem 0">
        <a href="${h(base)}/rolle/${h(encodeURIComponent(x.b))}">
        <span class="chip">${h(x.b)}</span> ${h(x.name || '')}</a></p>`).join('')}
    </div>` : ''}` });
}

function projectPage(p, m) {
  const rehearsalCount = p.plan?.proben?.length || 0;
  // The director needs no entries: they count as free except on struck days.
  const cast = (p.personen || []).filter(x => !x.regie);
  const withEntry = cast.filter(x => {
    const v = p.verfuegbar?.[x.id];
    return v && (Object.keys(v.tage || {}).length || (v.wochentage || []).length);
  }).length;
  const folks = cast.length;
  const hasScript = !!p.drehbuch;
  const takenOver = !!p.skript_ueberblick;
  const u = p.skript_ueberblick;

  const unresolved = (text, target, goto) =>
    `<span class="open">${text}</span> \u2013 <a href="${goto}">${target}</a>`;
  const ids = new Set((p.plan?.proben || []).map(x => x.id));
  const fixedCount = (p.termine || []).filter(x => ids.has(x.probe_id)).length;

  /* The road as a strip: one card per step, ticked when done. The
     detail below each says where it stands and, when open, what to do. */
  const step = (n, state, href, title, detail) => `<a class="step ${state}" href="${href}">
      <span class="num">${state === 'done' ? '\u2713' : n}</span>
      <span class="name">${h(title)}</span>
      <span class="small detail">${detail}</span></a>`;
  const steps = [
    step(1, hasScript ? 'done' : 'open', '/theater/skript', t('proj.script'), hasScript
      ? t('proj.script_yes', { source: h(p.drehbuch.quelle), n: (p.drehbuch.sprecher || []).length })
      : t('proj.script_no')),
    step(2, takenOver ? 'done' : (hasScript ? 'open' : 'waits'), '/theater/besetzung', t('proj.casting'), takenOver
      ? t('proj.cast_yes', { speeches: u.repliken, people: u.personen, roles: u.rollen })
      : (hasScript ? t('proj.cast_open') : t('proj.cast_waits'))),
    step(3, rehearsalCount ? 'done' : (takenOver ? 'open' : 'waits'), '/theater/plan', t('proj.rehearsals'), rehearsalCount
      ? t('proj.plan_yes', { n: rehearsalCount, substitution: L.percent(p.plan.ersatzanteil || 0),
                             coverage: L.percent(p.plan.abdeckung || 0) })
      : (takenOver ? t('proj.plan_no') : t('proj.plan_waits'))),
    step(4, folks && withEntry === folks ? 'done' : (folks ? 'open' : 'waits'), '/theater/leute', t('proj.availability'),
      folks ? t('proj.avail_n', { m: withEntry, n: folks }) : t('proj.people_no')),
    step(5, rehearsalCount && fixedCount === rehearsalCount ? 'done' : (rehearsalCount ? 'open' : 'waits'), '/theater/termine', t('proj.dates'),
      rehearsalCount ? t('proj.dates_n', { n: fixedCount, m: rehearsalCount }) : t('proj.dates_waits')),
  ];

  return page({ title: p.titel, nav: navDirector(p), body: `
    <p class="eyebrow">${t('proj.project')}</p><h1>${h(p.titel)}</h1>
    ${notice(m)}
    <div class="steps">${steps.join('')}</div>
    <p class="small muted">${t('proj.steps_what')}</p>

    <h2>${t('proj.language')}</h2>
    <p class="small muted">${t('proj.language_what')}</p>
    <form method="post" action="/theater/projekt" class="inline">
      <input type="hidden" name="action" value="sprache">
      <select name="language" style="max-width:16rem">
        <option value=""${!p.einstellungen?.sprache ? ' selected' : ''}>${t('proj.language_browser')}</option>
        ${LANGUAGES.map(x => `<option value="${x.code}"${
          p.einstellungen?.sprache === x.code ? ' selected' : ''}>${h(x.name)}</option>`).join('')}
      </select>
      <button type="submit" class="quiet mini">${h(t('common.save'))}</button>
    </form>

    <h2>${t('proj.period')}</h2>
    <p class="small muted">${t('proj.period_what')}</p>
    <form method="post" action="/theater/projekt">
      <input type="hidden" name="action" value="zeitraum">
      <div class="row">
        <div><label for="von">${t('proj.period_from')}</label>
          <input type="date" id="von" name="von" value="${h(p.einstellungen?.von || '')}"></div>
        <div><label for="bis">${t('proj.period_to')}</label>
          <input type="date" id="bis" name="bis" value="${h(p.einstellungen?.bis || '')}"></div>
        <div><button type="submit" class="quiet" style="margin-top:0">${h(t('common.save'))}</button></div>
      </div>
    </form>

    ${folks ? `<h2>${t('proj.link_company')}</h2>
      <p class="small muted">${t('proj.link_company_what')}</p>
      <div class="box">${copyLink(p.gruppenlink || '')}</div>` : ''}

    ${p.regielink ? `<h2>${t('proj.link_director')}</h2>
      <p class="small muted">${t('proj.link_director_what')}</p>
      <div class="box">${copyLink(p.regielink)}
        ${actionForm('/theater/leute', 'neuerregielink', {},
          '<button class="quiet mini" type="submit">' + h(t('proj.link_new')) + '</button>',
          { confirm: t('proj.link_new_confirm') })}
      </div>` : ''}` });
}

function uploadPage(p, m) {
  const d = p.drehbuch;
  const u = p.skript_ueberblick;
  return page({ title: t('proj.script'), nav: navDirector(p), body: `
    <p class="eyebrow">${t('upl.step')}</p><h1>${t('upl.title')}</h1>
    ${notice(m)}
    <p class="muted">${t('upl.what')}</p>
    ${d ? `<div class="box">
      <b>${h(d.quelle)}</b>
      <table>
        <tr><th>${t('upl.doc_title')}</th><td>${
          h((d.titel || []).slice(0, 2).join(' \u00b7 ') || '\u2014')}</td></tr>
        <tr><th>${t('upl.blocks')}</th><td>${d.bloecke}</td></tr>
        ${d.sprecherstil ? `<tr><th>${t('upl.style')}</th><td>${
          t(d.sprecherstil === 'dot' ? 'upl.style_dot' : 'upl.style_colon')}</td></tr>` : ''}
        <tr><th>${t('upl.speakers')}</th><td>${
          t('upl.speakers_n', { n: (d.sprecher || []).length })}</td></tr>
        ${u ? `<tr><th>${t('upl.speeches')}</th><td>${u.repliken}</td></tr>
               <tr><th>${t('upl.people')}</th><td>${u.personen}</td></tr>` : ''}
      </table>
      <a class="btn quiet" href="/theater/besetzung">${t('upl.to_casting')}</a>
      ${p.drucklink ? `<a class="btn quiet" href="${h(p.drucklink)}/gesamt" target="_blank"
        rel="noopener">${t('upl.read_full')}</a>` : ''}
      ${p.drucklink && p.plan?.proben?.length ? `<a class="btn quiet"
        href="${h(p.drucklink)}/probenplan" target="_blank" rel="noopener">${
        t('upl.read_plan')}</a>` : ''}
    </div>` : ''}
    <form method="post" action="/theater/skript" enctype="multipart/form-data">
      <label for="file">${t('upl.field')}</label>
      <input type="file" id="file" name="file" accept=".docx,.md,.markdown,.txt" required>
      <label for="style">${t('upl.style')}</label>
      <select id="style" name="style">
        <option value="auto"${m?.key === 'r.style_unknown' ? '' : ' selected'}>${
          t('upl.style_auto')}</option>
        <option value="colon">${t('upl.style_colon')}</option>
        <option value="dot">${t('upl.style_dot')}</option>
      </select>
      <div class="small muted">${t('upl.style_what')}</div>
      <button type="submit">${t('upl.upload')}</button>
      <span class="small muted">${t('upl.replaces')}</span>
    </form>
    ${versionList(p)}
    <p class="small muted" style="margin-top:2rem">${t('upl.format')}</p>` });
}

/* ---------------------------------------------------------------------
   The versions of the script, and what the last upload did to the plan.
   --------------------------------------------------------------------- */
const speechCount = (v) => v.repliken ?? (v.sprecher || []).reduce((a, s) => a + (s.n || 0), 0);
const changesText = (a) => a ? t('upl.changes', { changed: a.geaendert, added: a.neu, removed: a.gestrichen })
                             : t('upl.first');

function versionNotices(p) {
  const d = p.drehbuch, g = p.plan?.abgleich;
  let out = '';
  if (d?.neue_sprecher?.length)
    out += `<div class="notice error">${t('upl.new_names', { names: d.neue_sprecher.map(h).join(', ') })}</div>`;
  if (g?.unsicher?.length)
    out += `<div class="notice error">${t('upl.plan_unsure', { ids: g.unsicher.map(h).join(', ') })}</div>`;
  else if (g?.umgebaut?.length)
    out += `<div class="notice good">${t('upl.plan_rebuilt', { ids: g.umgebaut.map(h).join(', ') })}</div>`;
  return out;
}

function versionList(p) {
  const d = p.drehbuch;
  if (!d) return '';
  const older = [...(p.fassungen || [])].sort((a, b) => b.nr - a.nr);
  const all = [{ ...d, current: true }, ...older];
  if (all.length < 2) return '';
  const when = (iso) => iso ? h(L.date(iso, { dateStyle: 'medium', timeStyle: 'short' })) : '\u2014';
  const row = (v) => `<tr${v.current ? ' class="isfixed"' : ''}>
      <td><b>${h(String(v.nr || 1))}</b>${v.current ? ` <span class="chip">${t('upl.current')}</span>` : ''}</td>
      <td class="small">${when(v.hochgeladen)}</td>
      <td class="small">${h(v.quelle || '')}${v.wiederhergestellt ? `<div class="muted">${
        t('upl.restored_from', { nr: v.wiederhergestellt })}</div>` : ''}</td>
      <td class="small">${speechCount(v)}</td>
      <td class="small">${(v.nr || 1) > 1
        ? `<a href="/theater/skript/fassung/${v.nr}">${changesText(v.aenderungen)}</a>`
        : changesText(null)}</td>
      <td>${v.current ? '' : actionForm('/theater/skript', 'zurueck', { fassung: v.nr },
        '<button class="quiet mini" type="submit">' + h(t('upl.restore')) + '</button>',
        { confirm: t('upl.restore_confirm', { nr: v.nr }) })}</td>
    </tr>`;
  return `
    <h2>${t('upl.versions')}</h2>
    ${versionNotices(p)}
    <p class="small muted">${t('upl.versions_what')}</p>
    <table><tr><th>${t('upl.col_version')}</th><th>${t('upl.col_uploaded')}</th>
      <th>${t('upl.col_file')}</th><th>${t('upl.col_speeches')}</th>
      <th>${t('upl.col_changes')}</th><th></th></tr>
      ${all.map(row).join('')}</table>`;
}

/* One version against the one before it: the speeches that changed,
   came in or were cut, with cue numbers old and new and the rehearsals
   they fall into. Printable as the change sheet for the company. */
function versionPage(p, v, before, diff, byCue) {
  const cue = (s) => s && s.nr != null ? String(s.nr) : '';
  const rehearsals = (s) => s && s.nr != null && byCue.has(s.nr)
    ? [...byCue.get(s.nr)].map(id => `<span class="chip">${h(id)}</span>`).join('') : '';
  const row = (it) => `<tr class="${it.kind}">
      <td class="kind small">${t('ver.' + it.kind)}</td>
      <td class="small">${cue(it.old)}${it.old && it.new && cue(it.old) !== cue(it.new)
        ? ' \u2192 ' + cue(it.new) : (!it.old ? cue(it.new) : '')}</td>
      <td><b>${h((it.new || it.old).who)}</b></td>
      <td>${it.old ? `<del>${h(it.old.text)}</del>` : ''}</td>
      <td>${it.new ? `<ins>${h(it.new.text)}</ins>` : ''}</td>
      <td>${rehearsals(it.new || it.old)}</td>
    </tr>`;
  const hunks = diff.hunks.map(hk => hk.items.map(row).join('')).join(
    `<tr class="gap"><td colspan="6"></td></tr>`);
  return page({ title: t('ver.title', { nr: v.nr, before: before.nr }), nav: navDirector(p), body: `
    <p class="eyebrow"><a href="/theater/skript">${t('ver.back')}</a></p>
    <h1>${t('ver.title', { nr: v.nr, before: before.nr })}</h1>
    <p class="muted">${t('ver.files', { before: h(before.quelle || ''), now: h(v.quelle || '') })}</p>
    <p>${t('ver.summary', { changed: diff.changed, added: diff.added, removed: diff.removed,
                             equal: diff.equal })}</p>
    ${diff.hunks.length ? `<table class="diff"><tr><th></th><th>${t('ver.col_cue')}</th>
        <th>${t('ver.col_who')}</th><th>${t('ver.col_old')}</th><th>${t('ver.col_new')}</th>
        <th>${t('ver.col_rehearsal')}</th></tr>${hunks}</table>`
      : `<p class="muted">${t('ver.none')}</p>`}
    <p class="small muted">${t('ver.print')}</p>` });
}


function castPage(p, m, unresolved = []) {
  const unresolvedSet = new Set(unresolved);
  const d = p.drehbuch;
  if (!d) return page({ title: t('cast.title'), nav: navDirector(p), body: `
    <p class="eyebrow">${t('cast.step')}</p><h1>${t('cast.title')}</h1>
    <div class="notice error">${t('cast.no_script')}</div>` });

  const ARTEN = [
    ['person',     t('cast.kind_person')],
    ['rolle',      t('cast.kind_role')],
    ['alias',      t('cast.kind_alias')],
    ['gruppe',    t('cast.kind_group')],
    ['ignorieren', t('cast.kind_ignore')],
    ['auto',       t('cast.kind_auto')],
  ];

  const z = p.zuordnung || {};
  const people = (d.sprecher || []).map(x => x.token)
    .filter(k => (z[k]?.art || 'person') === 'person');
  // The actor's name is kept on the company page; here it is only shown.
  const personName = (token) => (p.personen || []).find(x => x.b === token)?.name || '';
  const targets = (d.sprecher || []).map(x => x.token);

  const row = (x) => {
    const e = z[x.token] || { art: 'person' };
    const isPerson = (e.art || 'person') === 'person';
    const stuck = unresolvedSet.has(x.token);
    return `<tr${stuck ? ' class="stuck"' : ''}>
      <td><span class="chip">${h(x.token)}</span>
          <div class="small muted">${t('cast.times', { n: x.n })}</div>
          ${stuck ? '<div class="small open">' + h(t('cast.stuck')) + '</div>' : ''}</td>
      <td><select name="art_${h(x.token)}" class="kindsel">${ARTEN.map(([w, txt]) =>
            `<option value="${w}"${e.art === w ? ' selected' : ''}>${txt}</option>`
            ).join('')}</select></td>
      <td><select name="ziel_${h(x.token)}" class="targetsel"${isPerson ? ' hidden' : ''}>
            <option value="">\u2014</option>
            ${targets.filter(y => y !== x.token).map(y =>
              `<option value="${h(y)}"${y === e.ziel ? ' selected' : ''}>${h(y)}</option>`
              ).join('')}
          </select></td>
      <td class="small muted">${isPerson ? h(personName(x.token)) : ''}</td>
    </tr>`;
  };

  return page({ title: t('cast.title'), nav: navDirector(p), body: `
    <p class="eyebrow">${t('cast.step')}</p><h1>${t('cast.title_long')}</h1>
    ${notice(m)}
    ${unresolved.length ? `<div class="notice error">
      <b>${t('cast.open_title')}</b> ${unresolved.map(h).join(', ')} ${t('cast.open_where')}
      <div class="small" style="margin-top:.4rem">${t('cast.open_what')}</div>
    </div>` : ''}
    <p class="muted">${t('cast.what')}</p>
    <div class="box small">
      ${t('cast.help_person')}<br>
      ${t('cast.help_role')}<br>
      ${t('cast.help_alias')}<br>
      ${t('cast.help_group')}<br>
      ${t('cast.help_none')}<br>
      ${t('cast.help_auto')}
    </div>
    <form method="post" action="/theater/besetzung" id="bes">
      <table>
        <tr><th>${t('cast.col_name')}</th><th>${t('cast.col_is')}</th>
            <th>${t('cast.col_of')}</th><th>${t('cast.col_actor')}</th></tr>
        ${(d.sprecher || []).map(row).join('')}
      </table>
      <button type="submit">${t('cast.take_over')}</button>
    </form>
    ${people.length ? `<p class="small muted">${t('cast.results_in',
      { n: people.length, folks: people.map(h).join(', ') })} ${t('cast.names_where')}</p>` : ''}
    <script>
    // The target field belongs to role and spelling. What does not fit
    // is hidden, not merely ignored.
    [].forEach.call(document.querySelectorAll('#bes tr'), function (tr) {
      var art = tr.querySelector('select.kindsel');
      if (!art) return;
      var target = tr.querySelector('select.targetsel');
      function richte() {
        var a = art.value;
        if (target) target.hidden = (a !== 'rolle' && a !== 'alias');
      }
      art.addEventListener('change', richte);
      richte();
    });
    <\/script>` });
}

function planPage(p, m, acts = []) {
  const rehearsals = p.plan?.proben || [];
  const hasStructure = !!p.skript_ueberblick;
  const substitution = Math.round((p.plan?.ersatzanteil ?? 0.2) * 100);
  const maxG = p.plan?.max_gruppe ?? 5;
  const all = (p.personen || []).map(x => x.b);

  const choose = (name, werte, current) => `<select id="${name}" name="${name}">` +
    werte.map(([w, txt]) => `<option value="${w}"${Number(w) === Number(current)
      ? ' selected' : ''}>${txt}</option>`).join('') + '</select>';

  const row = (pr) => {
    const absent = all.filter(x => !pr.gruppe.includes(x));
    const act = (action, body, confirm) =>
      actionForm('/theater/plan', action, { rehearsal: pr.id }, body, { confirm });

    const rebuilt = (pr.szenen || []).some(s => s.umgebaut);
    const ov = 'ov-' + pr.id.replace(/[^A-Za-z0-9_-]/g, '_');
    return `<tr class="${pr.unsicher ? 'unsure' : (pr.nachlese ? 'gleaning' : '')}">
      <td><a href="/theater/plan/${encodeURIComponent(pr.id)}"><b>${h(pr.id)}</b></a>
        ${pr.nachlese ? '<div class="small muted">' + h(t('plan.the_rest')) + '</div>' : ''}
        ${pr.unsicher ? '<div class="small open">' + h(t('plan.unsure_row')) + '</div>' : ''}
        ${!pr.unsicher && rebuilt ? '<div class="small muted">' + h(t('plan.rebuilt_row')) + '</div>' : ''}</td>
      <td>${pr.gruppe.map(x => `<span class="chip">${h(x)}</span>`).join('')}
        <div class="small muted">${t('plan.scenes_min', {
          scenes: (pr.szenen || []).length,
          min: Math.round(pr.minuten || 0),
          substitution: L.percent(pr.ersatz_anteil || 0) })}</div>
        ${pr.notiz ? `<div class="small"><i>${h(pr.notiz)}</i></div>` : ''}</td>
      <td class="actions"><button type="button" class="quiet mini edit" data-for="${ov}"
          title="${h(t('plan.edit', { id: pr.id }))}" aria-label="${h(t('plan.edit', { id: pr.id }))}">\u270e</button></td>
    </tr>
    <tr class="editor" hidden><td colspan="3">
      <div class="overlay" id="${ov}" hidden><div class="box">
        <p class="eyebrow" style="margin-top:0">${h(t('plan.edit_title', { id: pr.id }))}</p>
        <p>${pr.gruppe.map(x => `<span class="chip">${h(x)}</span>`).join('')}</p>
        ${act('dazu', `<select name="person"><option value="">${
            h(t('plan.add'))}</option>
          ${absent.map(x => `<option value="${h(x)}">${h(x)}</option>`).join('')}</select>
          <button class="quiet mini">+</button>`)}
        ${pr.gruppe.length > 1 ? act('weg', `<select name="person">
          <option value="">${h(t('plan.remove'))}</option>
          ${pr.gruppe.map(x => `<option value="${h(x)}">${h(x)}</option>`).join('')}</select>
          <button class="quiet mini">\u2212</button>`) : ''}
        ${act('zusammen', `<select name="others"><option value="">${
            h(t('plan.merge'))}</option>
          ${rehearsals.filter(x => x.id !== pr.id).map(x =>
            `<option value="${h(x.id)}">${h(x.id)} (${h(x.gruppe.join(','))})</option>`
            ).join('')}</select>
          <button class="quiet mini">\u21d2</button>`)}
        ${act('notiz', `<input type="text" name="notiz" value="${h(pr.notiz || '')}"
            placeholder="${h(t('plan.note'))}"><button class="quiet mini">${
            h(t('common.save'))}</button>`)}
        ${act('streichen', '<button class="quiet mini">' + h(t('plan.drop')) +
          '</button>', t('plan.drop_confirm', { id: pr.id }))}
        <p style="margin:.8rem 0 0"><button type="button" class="quiet mini close">${h(t('common.close'))}</button></p>
      </div></div>
    </td></tr>`;
  };

  return page({ title: t('plan.title'), nav: navDirector(p), body: `
    <p class="eyebrow">${t('plan.step')}</p><h1>${t('plan.title')}</h1>
    ${notice(m)}
    ${p.plan?.abgleich?.unsicher?.length ? `<div class="notice error">${
      t('plan.unsure_notice', { ids: p.plan.abgleich.unsicher.map(h).join(', ') })}</div>` : ''}
    ${!hasStructure ? `<div class="notice error">${t('plan.no_cast')}</div>` : `
    <p class="muted">${t('plan.what')}</p>
    <form method="post" action="/theater/plan" id="ableiten">
      <input type="hidden" name="action" value="ableiten">
      ${acts.length ? `<input type="hidden" name="akte" value="1"><label>${t('plan.acts')}</label>
      <div class="acts">${acts.map(a => `<label class="inline"><input type="checkbox"
        name="akt_${a.nr}" value="1" checked> ${h(a.name)}</label>`).join('')}</div>` : ''}
      <div class="row">
        <div><label for="substitution">${t('plan.substitution')}</label>
          ${choose('substitution', [[0, t('plan.sub_0')], [5, L.percent(0.05)],
                            [10, t('plan.sub_10')], [15, L.percent(0.15)],
                            [20, t('plan.sub_20')], [25, L.percent(0.25)],
                            [30, L.percent(0.30)]], substitution)}</div>
        <div><label for="maxgruppe">${t('plan.max_group')}</label>
          ${choose('maxgruppe', [[2, t('plan.people_n', { n: 2 })], [3, '3'], [4, '4'],
                               [5, '5'], [6, '6'], [7, '7']], maxG)}</div>
      </div>
      <p class="small muted" style="margin-top:.8rem">${t('plan.sub_what')}</p>
      ${rehearsals.length ? `
      <button type="submit" name="modus" value="ergaenzen">${t('plan.derive_add')}</button>
      <button type="submit" name="modus" value="ersetzen" class="quiet"
        onclick="return confirm(${JSON.stringify(t('plan.replace_confirm')).replace(/"/g, '&quot;')})">${
        t('plan.derive_replace')}</button>
      <p class="small muted">${t('plan.modes_what')}</p>`
      : `<button type="submit" name="modus" value="ersetzen">${t('plan.derive')}</button>`}
    </form>
    ${rehearsals.length ? actionForm('/theater/plan', 'zuruecksetzen', {},
      '<button class="quiet mini" type="submit">' + h(t('plan.reset')) + '</button>',
      { confirm: t('plan.reset_confirm') }) : ''}`}

    ${rehearsals.length ? `
      <h2>${t('plan.n_rehearsals', { n: rehearsals.length })}</h2>
      <p class="small muted">${t('plan.figures', {
        substitution: L.percent(p.plan.ersatzanteil || 0),
        max: p.plan.max_gruppe,
        coverage: L.percent(p.plan.abdeckung || 0, 1) })}
      ${p.plan.bearbeitet ? t('plan.revised',
        { when: h(L.date(p.plan.bearbeitet)) }) : ''}</p>
      <table class="plan"><tr><th>${t('plan.col_rehearsal')}</th>
        <th>${t('plan.col_cast')}</th><th></th></tr>
      ${rehearsals.map(row).join('')}</table>
      <script>
      (function () {
        var open = null;
        function show(id) { var o = document.getElementById(id); if (!o) return; o.closest('tr.editor').hidden = false; o.hidden = false; open = o; }
        function hide() { if (!open) return; open.hidden = true; open.closest('tr.editor').hidden = true; open = null; }
        document.addEventListener('click', function (e) {
          var b = e.target.closest('button.edit'); if (b) { hide(); show(b.dataset.for); return; }
          if (e.target.closest('button.close') || e.target.classList.contains('overlay')) hide();
        });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
      })();
      <\/script>
      ${rehearsals.some(pr => pr.nachlese)
        ? `<p class="small muted">${t('plan.gleaning_what')}</p>` : ''}
      <div class="box small">
        <b>${t('plan.help_title')}</b><br>
        ${t('plan.help_add')}<br>
        ${t('plan.help_remove')}<br>
        ${t('plan.help_merge')}<br>
        ${t('plan.help_drop')}<br>
        ${t('plan.help_rest')}<br>
        ${t('plan.help_click')}
      </div>` : ''}` });
}

/* ---------------------------------------------------------------------
   What actually comes up in this rehearsal?

   The plan page names the cast and the minutes; whether the cut is any
   good shows only in the text. In colour is whoever is present - all the
   pale parts are read out by the director.
   --------------------------------------------------------------------- */
function passagesPage(p, d, m, opt = {}) {
  const pr = d.rehearsal;
  const nav = opt.member ? navMember(p, opt.member) : navDirector(p);
  const tabbar = opt.member ? memberTabbar(p, opt.member) : '';
  const back = opt.member ? '/theater/mit/termine' : '/theater/plan';

  const speech = (b) => {
    const classes = ['line'];
    if (b.chorus) classes.push('chorus');
    else if (b.own) classes.push('own');
    else classes.push('readout');
    if (b.cut) classes.push('cut');
    return `<div class="${classes.join(' ')}">
      ${b.continuation ? '' : `<span class="speaker">${
        h(b.role) || h(b.who) || 'ALLE'}${
        b.role && b.who && b.who !== b.role ? ' · ' + h(b.who) : ''}${
        b.carriesOn ? ' ' + h(t('text.carries_on')) : ''}${
        b.own || b.chorus ? '' : ' ' + h(t('text.director_reads'))}</span>`}
      <span class="words">${h(b.text)}</span></div>`;
  };

  const block = (b) => {
    if (b.kind === 'speech') return speech(b);
    if (b.kind === 'chapter') return `<h4>${h(b.text)}</h4>`;
    if (b.kind === 'table') return `<table class="twocol">
      <tr><th>${t('text.backstage')}</th><th>${t('text.onstage')}</th></tr>
      ${b.rows.map(r => `<tr><td>${r.backstage.map(block).join('')}</td>
          <td>${r.onstage.map(block).join('')}</td></tr>`).join('')}</table>`;
    return `<div class="direction">${h(b.text)}</div>`;
  };

  const scene = (sc) => `
    <div class="scenehead">
      <h3>${t('text.scene', { n: sc.szene })}</h3>
      <span class="small muted">${t('text.scene_head', {
        act: h(sc.act), from: sc.nr_von, to: sc.nr_bis,
        min: Math.round(sc.minuten || 0),
        substitution: L.percent(sc.ersatz_anteil || 0) })}</span>
    </div>
    ${sc.missing.length ? `<p class="small muted">${t('text.reads_for',
      { folks: sc.missing.map(h).join(', ') })}</p>` : ''}
    ${sc.silent.length ? `<p class="small muted">${t('text.silent_scene',
      { folks: sc.silent.map(h).join(', ') })}</p>` : ''}
    ${sc.parts.length ? sc.parts.map(block).join('')
      : `<p class="muted">${t('text.no_text')}</p>`}`;

  return page({ title: t('text.title', { id: pr.id }), nav, tabbar, body: `
    <p class="eyebrow"><a href="${back}">${opt.member ? t('text.back_member') : t('text.back')}</a></p>
    <h1>${t('text.title', { id: h(pr.id) })}</h1>
    ${notice(m)}
    <p>${pr.gruppe.map(x => `<span class="chip">${h(x)}</span>`).join('')}</p>
    ${opt.member && pr.gruppe.includes(opt.member.b) ? `<p><a class="btn" href="/theater/mit/heft?probe=${encodeURIComponent(pr.id)}">${h(t('text.learn_this'))}</a>
      <span class="small muted">${t('text.learn_this_what')}</span></p>` : ''}
    <p class="small muted">${t('text.figures', {
        scenes: (pr.szenen || []).length,
        min: Math.round(pr.minuten || 0),
        substitution: L.percent(pr.ersatz_anteil || 0) })}<br>
      ${t('text.counted', { own: d.sum.own })}${
      d.sum.foreign ? t('text.counted_read', { n: d.sum.foreign }) : ''}${
      d.sum.chorus ? t('text.counted_chorus', { n: d.sum.chorus }) : ''}.
      ${d.silent.length ? t('text.silent', { folks: d.silent.map(h).join(', ') }) : ''}
      ${pr.nachlese ? t('text.gleaning') : ''}</p>
    ${pr.notiz ? `<div class="box small"><b>${t('text.note')}</b><br>${
      h(pr.notiz)}</div>` : ''}
    <p class="small muted">${t('text.legend')}</p>
    ${d.scenes.map(scene).join('')}
    <p class="eyebrow" style="margin-top:2rem"><a href="${back}">${
      opt.member ? t('text.back_member') : t('text.back_long')}</a></p>` });
}

/* ---------------------------------------------------------------------
   The audiobook: having the play spoken.

   For the director only - it spends credit in somebody's account. The
   key is kept with the project; the page says so, and offers a button to
   remove it.
   --------------------------------------------------------------------- */
function audiobookPage(p, { voices, people, jobState, rehearsals, models, acts }, m) {
  const ab = p.hoerbuch || {};
  const hasKey = !!ab.schluessel;
  const chosen = ab.stimmen || {};

  const voicePick = (person) => `<select name="stimme_${h(person.id)}">
    <option value="">${h(t('ab.no_voice'))}</option>
    ${voices.map(x => `<option value="${h(x.id)}"${
      chosen[person.id] === x.id ? ' selected' : ''}>${h(x.name)}${
      x.description ? ' \u2013 ' + h(x.description) : ''}</option>`).join('')}
  </select>`;

  const progress = jobState ? `
    <div class="box">
      <b>${t(jobState.what.key, jobState.what.values)}</b> \u2013 ${t('ab.progress',
        { done: jobState.done, total: jobState.total })}
      ${jobState.skipped
        ? t('ab.skipped', { n: jobState.skipped }) : ''}
      <div class="bar"><i style="width:${
        Math.round(jobState.done / (jobState.total || 1) * 100)}%"></i></div>
      <div class="small muted" id="hbzuletzt">${h(jobState.lastLine || '')}</div>
      <div class="small muted">${t('ab.generated',
        { mb: L.number(jobState.bytes / 1048576, 1) })}
        ${jobState.running ? t('ab.running')
                       : jobState.error ? t('ab.cancelled') : t('ab.done')}</div>
      ${jobState.error ? `<div class="notice error">${h(jobState.error)}</div>` : ''}
      ${jobState.running ? actionForm('/theater/hoerbuch', 'abbrechen', {},
        '<button class="quiet mini">' + h(t('ab.cancel')) + '</button>') : ''}
      ${jobState.bytes ? `<p><a href="/theater/hoerbuch/datei/${h(jobState.file)}">${
        t('ab.listen', { file: h(jobState.file) })}</a></p>` : ''}
    </div>
    ${jobState.running ? `<script>
      setInterval(function () {
        fetch('/theater/hoerbuch/stand').then(function (r) { return r.json(); })
          .then(function (d) { if (!d || !d.running) location.reload();
            else { var b = document.querySelector('.bar i');
                   if (b) b.style.width = Math.round(d.done / (d.total || 1) * 100) + '%';
                   var z = document.getElementById('hbzuletzt');
                   if (z) z.textContent = d.lastLine || ''; } });
      }, 4000);
    <\/script>` : ''}` : '';

  return page({ title: t('ab.title'), nav: navDirector(p), body: `
    <h1>${t('ab.title')}</h1>
    ${notice(m)}
    <p class="muted">${t('ab.what')}</p>

    ${progress}

    <h2>${t('ab.step_key')}</h2>
    <p class="small muted">${t('ab.key_what')}</p>
    <form method="post" action="/theater/hoerbuch">
      <input type="hidden" name="action" value="schluessel">
      <label for="schluessel">${t('ab.key')}</label>
      <input type="password" id="schluessel" name="schluessel" autocomplete="off"
             class="keyfield" placeholder="${hasKey
               ? h(t('ab.key_stored')) : 'sk_\u2026'}">
      <button type="submit">${hasKey
        ? t('ab.change') : t('common.save')}</button>
    </form>
    ${hasKey ? actionForm('/theater/hoerbuch', 'schluessel_weg', {},
      '<button class="quiet mini">' + h(t('ab.remove_key')) + '</button>',
      { confirm: t('ab.remove_key_confirm') }) : ''}

    ${!hasKey ? '' : `
    <h2>${t('ab.step_voices')}</h2>
    ${!voices.length ? `<div class="notice error">${t('ab.no_voices')}</div>` : `
    <p class="small muted">${t('ab.voices_what')}</p>
    <form method="post" action="/theater/hoerbuch">
      <input type="hidden" name="action" value="voices">
      <table class="voices">
        ${people.map(x => `<tr>
          <td><b>${x.isNarrator ? t('ab.narrator') : h(x.name)}</b>${x.roles.length
            ? `<div class="small muted">${t('ab.plays',
                { roles: x.roles.map(h).join(', ') })}</div>` : ''}
            ${x.isNarrator ? `<div class="small muted">${t('ab.narrator_what')}</div>` : ''}</td>
          <td>${voicePick(x)}</td></tr>`).join('')}
      </table>
      <label for="modell">${t('ab.model')}</label>
      <select id="modell" name="modell">
        ${models.map(([w, txt]) => `<option value="${h(w)}"${
          (ab.modell || 'eleven_v3') === w ? ' selected' : ''}>${h(txt)}</option>`
          ).join('')}
      </select>
      <button type="submit">${t('ab.save_voices')}</button>
    </form>

    <h2>${t('ab.step_generate')}</h2>
    <p class="small muted">${t('ab.generate_what')}</p>
    <form method="post" action="/theater/hoerbuch"${jobState?.running
      ? ' onsubmit="return false"' : ''}>
      <input type="hidden" name="action" value="erzeugen">
      <select name="umfang">
        ${(rehearsals || []).map(x => `<option value="rehearsal:${h(x.id)}">${
          h(t('ab.pick_rehearsal', { id: x.id, group: x.gruppe.join(', '),
                                 min: Math.round(x.minuten || 0) }))}</option>`).join('')}
        ${(acts || []).map(n => `<option value="akt:${n}">${
          t('ab.act_n', { n })}</option>`).join('')}
        <option value="alles">${t('ab.everything')}</option>
      </select>
      <button type="submit"${jobState?.running ? ' disabled' : ''}>${
        t('ab.speak_it')}</button>
    </form>`}`}` });
}

function companyPage(p, m, base) {
  const fromPlan = new Set();
  for (const pr of p.plan?.proben || []) for (const b of pr.gruppe) fromPlan.add(b);
  const known = new Set((p.personen || []).map(x => x.b));
  const missing = [...fromPlan].filter(b => !known.has(b)).sort();
  const link = p.gruppenlink || '';

  const row = (x) => {
    const v = p.verfuegbar?.[x.id];
    const evenings = Object.values(v?.tage || {}).filter(x => x && x.von).length;
    const wochentags = (v?.wochentage || []).length;
    return `<tr>
      <td><span class="chip">${h(x.b)}</span>
        ${x.funktion ? `<div class="small muted">${h(x.funktion)}</div>` : ''}</td>
      <td>${actionForm('/theater/leute', 'aendern', { id: x.id },
        `<input type="text" name="name" value="${h(x.name || '')}"
               placeholder="${h(t('comp.name_hint'))}">
        <span class="role">
        <label class="inline"><input type="checkbox" name="regie" value="1"${
          x.regie ? ' checked' : ''}> ${h(t('comp.director'))}</label>
        <label class="inline"><input type="checkbox" name="assistenz" value="1"${
          x.assistenz ? ' checked' : ''}> ${h(t('comp.assistant'))}</label>
        </span>
        <button class="quiet mini" type="submit">${h(t('common.save'))}</button>`, { cssClass: 'person' })}
        ${(x.regie || x.assistenz) && x.token ? `<details class="small personal">
          <summary>${h(t('comp.show_link'))}</summary>
          ${t('comp.personal_link', { who: h(x.name || x.b) })}
          ${copyLink((base || '') + '/theater/ich/' + x.token)}</details>` : ''}</td>
      <td class="small">${x.regie
        ? `<span class="muted">${t('comp.director_always')}</span>`
        : evenings
        ? `<span style="color:var(--good)">${t('comp.evenings', { n: evenings })}</span>`
        : (wochentags
            ? `<span style="color:var(--good)">${t('comp.entered')}</span>`
            : `<span class="open">${t('comp.still_missing')}</span>`)}</td>
      <td>${actionForm('/theater/leute', 'loeschen', { id: x.id },
        '<button class="quiet mini" type="submit">' + h(t('comp.remove')) + '</button>',
        { confirm: t('comp.remove_confirm', { who: x.b }) })}</td>
    </tr>`;
  };

  return page({ title: t('comp.title'), nav: navDirector(p), body: `
    <p class="eyebrow">${t('comp.who')}</p><h1>${t('comp.title')}</h1>
    ${notice(m)}
    ${link ? `<div class="box important">
      <b>${t('comp.link_title')}</b>
      <p class="small muted" style="margin:.4rem 0 .6rem">${t('comp.link_what')}</p>
      ${copyLink(link)}
      ${actionForm('/theater/leute', 'neuerlink', {},
        '<button class="quiet mini" type="submit">' + h(t('comp.link_new')) + '</button>',
        { confirm: t('comp.link_new_confirm') })}
    </div>` : ''}
    ${missing.length ? `<div class="notice error">${t('comp.missing',
      { folks: missing.map(h).join(', ') })}</div>` : ''}
    ${(p.personen || []).length ? `
      <table class="company"><tr><th>${t('comp.col_short')}</th><th>${t('comp.col_name')} \u00b7 ${t('comp.col_role')}</th>
        <th>${t('comp.col_available')}</th><th></th></tr>
      ${p.personen.map(row).join('')}</table>
      <p class="small muted">${t('comp.comes_from')} ${t('comp.director_what')}</p>`
      : `<p class="muted">${t('comp.nobody')}</p>`}

    <h2>${t('comp.add')}</h2>
    <form method="post" action="/theater/leute">
      <input type="hidden" name="action" value="neu">
      <div class="row">
        <div><label for="b">${t('comp.col_short')}</label>
          <input type="text" id="b" name="b" required
                 placeholder="${h(missing[0] || t('comp.as_in_script'))}"></div>
        <div><label for="name">${t('comp.col_name')}</label>
          <input type="text" id="name" name="name"
                 placeholder="${h(t('comp.full_name'))}"></div>
      </div>
      <button type="submit">${t('comp.create')}</button>
    </form>` });
}

/* ---------- company member: coming in through the group link ---------- */

function pickNamePage(project, token, m) {
  const folks = (project.personen || []).slice()
    .sort((a, b) => (a.name || a.b).localeCompare(b.name || b.b, L.locale));
  return page({ title: project.titel, narrow: true, body: `
    <p class="eyebrow">${h(project.titel)}</p>
    <h1>${t('pick.title')}</h1>
    <p class="muted">${t('pick.what')}</p>
    ${notice(m)}
    ${folks.length ? `<div class="box">
      ${folks.map(x => `<form method="post" action="/theater/gruppe/${
        h(token)}" class="choice">
        <input type="hidden" name="person" value="${h(x.id)}">
        <button type="submit" class="quiet wide">
          <span class="chip">${h(x.b)}</span> ${h(x.name || '')}
        </button></form>`).join('')}
    </div>` : `<p class="muted">${t('pick.nobody')}</p>`}` });
}

/* The member's navigation. The first entry is the person one is
   working for - as a list of everyone in the company, so that two
   people sitting together can switch without a word of explanation. */
const navMember = (project, person) => {
  const folks = [...(project.personen || [])]
    .sort((a, b) => (a.name || a.b).localeCompare(b.name || b.b, L.locale));
  const picker = folks.length > 1 ? `<form method="post" action="/theater/mit" class="whopick">
    <input type="hidden" name="action" value="wechseln">
    <select name="person" onchange="this.form.submit()" autocomplete="off" aria-label="${h(t('mem.switch_who'))}">
      ${folks.map(x => `<option value="${h(x.id)}"${x.id === person.id ? ' selected' : ''}>${
        h(x.name || x.b)}</option>`).join('')}
    </select>
    <noscript><button class="quiet mini">${h(t('mem.switch_go'))}</button></noscript>
  </form>` : `<a href="/theater/mit">${h(person.name || person.b)}</a>`;
  return `<nav>
  ${picker}
  <a href="/theater/mit/zeiten">${t('navm.times')}</a>
  <a href="/theater/mit/termine">${t('navm.dates')}</a>
  ${project.druck_token ? `<a href="/theater/druck/${h(project.druck_token)}">${t('navm.scripts')}</a>` : ''}
  <a href="/theater/mit/kommentare">${t('nav.comments')}</a>
  ${ctx.regieProject === project.id || ctx.directorProject === project.id
    ? `<a href="/theater/projekt">${t('nav.project')}</a>` : ''}
  <a href="/theater/mit/abmelden">${t('nav.signout')}</a></nav>`;
};

/* The bar at the bottom of a phone screen: the four places a member
   goes. On a desk the links in the head do the same, and the bar is
   hidden. The current page is marked. */
const memberTabbar = (project, person) => {
  const items = [
    ['/theater/mit/zeiten', t('navm.tab_avail'), 'person'],
    ['/theater/mit/termine', t('navm.tab_dates'), 'calendar'],
    ['/theater/mit/heft', t('navm.tab_book'), 'book'],
    ['/theater/mit/kommentare', t('navm.tab_notes'), 'note'],
    ['/theater/einstellungen?z=' + encodeURIComponent(pfad), '', 'gear', t('nav.settings')],
  ];
  return `<nav class="tabbar">${items.map(([href, label, ico, aria]) =>
    `<a href="${href}"${pfad === href || pfad.startsWith(href.split('?')[0]) ? ' class="on"' : ''}${
      aria ? ` aria-label="${h(aria)}" title="${h(aria)}"` : ''}>
      ${icon(ico)}${label ? `<span>${h(label)}</span>` : ''}</a>`).join('')}</nav>`;
};

/* The invitation to put the pages on the phone as an app. Shown on a
   member's pages while they run in a browser tab, not once installed;
   "later" keeps it away for two weeks. Chrome and friends can prompt;
   Safari on the iPhone needs to be told the way. */
const installBanner = () => `<div class="pwasheet" id="pwabanner" hidden><div class="inner">
    <b>${ctx.app ? t('pwa.install_title_play', { title: h(ctx.app.title) }) : t('pwa.install_title')}</b>
    <p class="small muted">${t('pwa.install_what')}</p>
    <p class="small how" hidden></p>
    <button type="button" class="big" id="pwa-install">${h(t('pwa.install'))}</button>
    <button type="button" class="quiet mini" id="pwa-later">${h(t('pwa.later'))}</button>
  </div></div>
  <script>
  (function () {
    var box = document.getElementById('pwabanner'); if (!box) return;
    var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    var later = 0; try { later = Number(localStorage.getItem('pwa-later') || 0); } catch (e) {}
    if (standalone || Date.now() - later < 14 * 86400000) return;
    var deferred = null;
    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; });
    box.hidden = false;
    document.getElementById('pwa-install').addEventListener('click', function () {
      if (deferred) { deferred.prompt(); deferred.userChoice.then(function () { box.hidden = true; deferred = null; }); return; }
      var how = box.querySelector('.how');
      how.textContent = ios ? ${JSON.stringify(t('pwa.ios'))} : ${JSON.stringify(t('pwa.android'))};
      how.hidden = false;
    });
    document.getElementById('pwa-later').addEventListener('click', function () {
      try { localStorage.setItem('pwa-later', String(Date.now())); } catch (e) {}
      box.hidden = true;
    });
  })();
  </script>`;

/* Shown by the service worker when the network is gone. */
const offlinePage = () => page({ title: t('pwa.offline_t'), narrow: true, body: `
    <p class="eyebrow">${t('app.name')}</p>
    <h1>${t('pwa.offline_t')}</h1>
    <p class="muted">${t('pwa.offline')}</p>
    <p><a class="btn quiet" href="/theater/mit">${t('pwa.retry')}</a></p>` });

function memberPage(project, person, m, realSelf) {
  const v = project.verfuegbar?.[person.id] || {};
  const evenings = Object.values(v.tage || {}).filter(x => x && x.von).length;
  const rehearsals = (project.plan?.proben || []).filter(pr => pr.gruppe.includes(person.b));
  const fixed = (project.termine || []).filter(x => x.bestaetigt &&
    rehearsals.some(pr => pr.id === x.probe_id)).length;
  const who = person.name || person.b;

  return page({ title: who, nav: navMember(project, person), tabbar: memberTabbar(project, person), narrow: true, body: `
    <p class="eyebrow">${h(project.titel)}</p>
    <h1>${t('mem.hello', { name: h(who) })}</h1>
    ${notice(m)}
    ${realSelf ? `<div class="notice foreign">${t('mem.for_other', { name: h(who) })}
      ${actionForm('/theater/mit', 'wechseln', { person: realSelf.id },
        '<button class="quiet mini">' +
        t('mem.back_to', { name: h(realSelf.name || realSelf.b) }) + '</button>')}
      </div>` : ''}
    ${person.regie ? `<div class="box">
      <p class="small muted" style="margin:0 0 .6rem">${t('mem.director_note')}</p>
      <a class="btn quiet" href="/theater/mit/zeiten">${t('mem.director_go')}</a>
    </div>` : !evenings ? `<div class="box important callout">
      <p><b>${t('mem.call_title')}</b></p>
      <p class="small muted">${t('mem.call_what')}</p>
      <a class="btn big" href="/theater/mit/zeiten">${t('mem.call_go')}</a>
    </div>` : ''}
    <table>
      <tr><th>${t('mem.my_times')}</th><td>${person.regie
        ? t('mem.director_always')
        : evenings
        ? t('mem.evenings_yes', { n: evenings })
        : t('mem.evenings_no')}</td></tr>
      <tr><th>${t('mem.my_rehearsals')}</th><td>${rehearsals.length
        ? t('mem.rehearsals_yes', { n: rehearsals.length, fixed })
        : t('mem.rehearsals_no')}</td></tr>
      <tr><th>${t('mem.part_book')}</th><td>${project.drehbuch
        ? t('mem.book_open') : t('mem.no_script')}</td></tr>
      <tr><th>${t('mem.play')}</th><td>${project.skript
        ? t('mem.play_open') : '<span class="muted">\u2014</span>'}</td></tr>
      <tr><th>${t('mem.full_script')}</th><td>${project.drehbuch
        ? t('mem.full_open') : '<span class="muted">\u2014</span>'}</td></tr>
      ${project.drehbuch && project.plan?.proben?.length && project.druck_token
        ? `<tr><th>${t('mem.plan_book')}</th><td>${t('mem.plan_open',
            { url: '/theater/druck/' + h(project.druck_token) + '/probenplan' })}</td></tr>` : ''}
    </table>
    ${project.druck_token ? `<p class="small muted">${t('mem.docs',
      { url: '/theater/druck/' + h(project.druck_token) })}</p>` : ''}
` });
}

/* ---------------------------------------------------------------------
   The part book for the screen, with a learning mode.

   One passage after another: the cue by somebody else, the directions,
   then the own lines. In learning mode the own lines are hidden and
   a button reveals them; the bar below steps to the next passage. What
   sits and what does not is remembered in the browser only.
   --------------------------------------------------------------------- */
function bookPage(project, person, passages, words, state = {}, today = '', comments = [], remind = null, filter = null) {
  const who = person.name || person.b;
  const nameOf = (b) => (project.personen || []).find(x => x.b === b)?.name || b;
  const others = (project.personen || []).filter(x => x.b !== person.b)
    .sort((a, b) => (a.name || a.b).localeCompare(b.name || b.b, L.locale));
  const adhocBox = others.length ? `<details class="box small" id="adhoc"${filter?.mit ? ' open' : ''}>
      <summary><b>${t('book.adhoc_title')}</b></summary>
      <p class="muted">${t('book.adhoc_what')}</p>
      <form method="get" action="/theater/mit/heft#heft-filter" class="adhoc">
        <div class="choices">${others.map(x => `<label class="inline choice"><input type="checkbox" name="mit" value="${h(x.b)}"${
          filter?.mit?.includes(x.b) ? ' checked' : ''}> ${h(x.name || x.b)}</label>`).join('')}</div>
        <button type="submit" class="mini">${h(t('book.adhoc_go'))}</button>
      </form>
    </details>` : '';
  const chunks = passages.flatMap(p => p.chunks);
  const fig = summaryOf(state, chunks, today);
  const line = (l) => l.dir
    ? `<p class="dir">${h(l.text)}</p>`
    : `<p class="say ctxline">${l.cont ? '' : `<b>${h(l.who)}:</b> `}${h(l.text)}</p>`;
  /* The private note "what do I want here?": a small icon after the
     last character of the chunk opens it. It belongs to the person
     alone and never appears anywhere else. */
  const noteButton = (key, note) => `<button type="button" class="notebtn${note ? ' has' : ''}" data-key="${h(key)}"
      title="${h(t('book.intent'))}" aria-label="${h(t('book.intent'))}">${icon('note')}</button>`;
  const noteBox = (key, note) => `<div class="notebox" data-key="${h(key)}" hidden>
      <label class="small">${t('book.intent')} <span class="muted">${t('book.intent_hint')}</span></label>
      <input type="text" maxlength="200" value="${h(note)}" placeholder="${h(t('book.intent_private'))}"></div>`;
  const card = (p) => {
    return `<section class="pass cmt${p.cut ? ' cut' : ''}" id="pass-${p.i}"${p.nr != null ? ` data-nr="${p.nr}"` : ''}>
      <div class="passhead small muted"><span class="pno">${h(t('book.entry_n', { n: p.i }))}</span>
        ${p.chapter ? h(p.chapter) : ''}${p.nr != null ? ' \u00b7 ' + t('book.cue_nr', { nr: p.nr }) : ''}
        ${p.role ? ' \u00b7 ' + h(p.role) : ''}</div>
      ${p.ctxBefore.length ? `<div class="ctxwrap"><button type="button" class="quiet mini ctx-more before">${h(t('book.more_before'))}</button>
        <div class="ctx before">${[...p.ctxBefore].reverse().map(l => `<div hidden>${line(l)}</div>`).join('')}</div></div>` : ''}
      ${p.cue ? `<p class="cue"><b>${h(p.cue.who)}:</b> ${h(p.cue.text)}</p>` : `<p class="cue muted">${t('book.no_cue')}</p>`}
      ${p.before.map(d => `<p class="dir">${h(d)}</p>`).join('')}
      <div class="mine">
        ${p.chunks.map(c => {
          const last = c.lines.map((l, i) => l.text ? i : -1).filter(i => i >= 0).pop();
          const note = state[c.key]?.a || '';
          return c.lines.map((l, i) => l.direction
            ? `<p class="dir">${h(l.direction)}</p>`
            : `<p class="say${l.cut ? ' cut' : ''}">${l.cont ? '' : `<b>${h(l.who)}:</b> `}${h(l.text)}${
                i === last ? noteButton(c.key, note) : ''}</p>`).join('') + noteBox(c.key, note);
        }).join('')}
      </div>
      ${p.after.map(d => `<p class="dir after">${h(d)}</p>`).join('')}
      ${p.ctxAfter.length ? `<div class="ctxwrap"><div class="ctx after">${p.ctxAfter.map(l => `<div hidden>${line(l)}</div>`).join('')}</div>
        <button type="button" class="quiet mini ctx-more after">${h(t('book.more_after'))}</button></div>` : ''}
    </section>`;
  };

  const data = {
    filter,
    today,
    state,
    token: project.druck_token || '',
    me: person.b,
    locale: L.locale,
    comments,
    push: remind ? { key: remind.key, zeit: remind.zeit || '19:00', zone: remind.zone || '',
                     endpoints: (remind.abos || []).map(a => a.endpoint) } : null,
    passages: passages.map(p => ({ i: p.i, chapter: p.chapter, nr: p.nr, ctxBefore: p.ctxBefore, ctxAfter: p.ctxAfter,
      chunks: p.chunks.map(c => ({ key: c.key, cue: c.cue, lines: c.lines, before: c.before, after: c.after,
                                   teil: c.teil, words: c.words })) })),
    t: {
      due: t('book.due'), fresh: t('book.fresh'), sitting: t('book.sitting'), steps: t('book.steps'),
      step: t('book.step'), step_short: t('book.step_short'), new_: t('book.new'), part: t('book.part'),
      progress: t('book.progress'), no_cue: t('book.no_cue'), own_before: t('book.own_before'),
      first_time: t('book.first_time'), next: t('book.next'), say_aloud: t('book.say_aloud'),
      hint: t('book.hint'), reveal: t('book.reveal'), intent: t('book.intent'), intent_hint: t('book.intent_hint'),
      again: t('book.again'), with_help: t('book.with_help'), knew: t('book.knew'),
      done_title: t('book.done_title'), done_text: t('book.done_text'), once_more: t('book.once_more'),
      nothing_hard: t('book.nothing_hard'), nothing_hard_what: t('book.nothing_hard_what'),
      nothing_learnt: t('book.nothing_learnt'), nothing_learnt_what: t('book.nothing_learnt_what'),
      back: t('book.back'), back_what: t('book.back_what'), applause_title: t('book.applause_title'),
      applause_text: t('book.applause_text'), continue_: t('book.continue'), tomorrow_: t('book.tomorrow'),
      c_new: t('kd.new'), c_text: t('kd.text'), c_question: t('kd.question'), c_save: t('kd.save'),
      c_cancel: t('kd.cancel'), c_comments: t('kd.comments'), c_answer: t('kd.answer'), c_del: t('kd.delete'),
      c_done: t('kd.done'), c_failed: t('kd.failed'), c_hint: t('book.dbl_hint'),
      intent_private: t('book.intent_private'), note_icon: icon('note'),
      entry_n: t('book.entry_n'), resume: t('book.resume'), resume_read: t('book.resume_read'),
      resume_restart: t('book.resume_restart'), resume_all: t('book.resume_all'),
      filter_probe: t('book.filter_probe'), filter_adhoc: t('book.filter_adhoc_short'), filter_all: t('book.filter_all_label'),
      more_before: t('book.more_before'), more_after: t('book.more_after'),
      remind_active: t('book.remind_active'), remind_elsewhere: t('book.remind_elsewhere'), remind_inactive: t('book.remind_inactive'),
      remind_unsupported: t('book.remind_unsupported'), remind_ios: t('book.remind_ios'), remind_denied: t('book.remind_denied'),
      remind_failed: t('book.remind_failed'), remind_sent: t('book.remind_sent'), remind_on: t('book.remind_on'), remind_off: t('book.remind_off'),
    },
  };
  const json = JSON.stringify(data).replace(/</g, '\\u003c');

  return page({ title: t('book.title'), nav: navMember(project, person),
                tabbar: memberTabbar(project, person), narrow: true, body: `
    <p class="eyebrow">${h(project.titel)}</p>
    <h1>${t('book.title_for', { name: h(who) })}</h1>
    <p class="small muted">${t('book.figures', { passages: passages.length, words })}
      ${project.druck_token ? `\u00b7 <a href="/theater/druck/${h(project.druck_token)}/rolle/${
        encodeURIComponent(person.b)}" target="_blank" rel="noopener">${t('book.print')}</a>` : ''}
      \u00b7 <a href="/theater/mit/stueck">${t('book.play_link')}</a></p>
    ${filter ? `<div class="notice" id="heft-filter">${filter.mit
        ? t('book.filter_adhoc', { who: filter.mit.map(b => h(nameOf(b))).join(', ') })
        : t('book.filter_note', { id: h(filter.id) })}
      <a href="/theater/mit/heft">${t('book.filter_all')}</a>${filter.id
        ? ` \u00b7 <a href="/theater/mit/plan/${encodeURIComponent(filter.id)}">${t('book.filter_back')}</a>` : ''}</div>` : ''}
    <div class="heft-modes">
      <button type="button" data-mode="lesen" class="on">${h(t('book.mode_read'))}</button>
      <button type="button" data-mode="lernen">${h(t('book.mode_learn'))}</button>
      <button type="button" data-mode="intensiv">${h(t('book.mode_hard'))} <span id="heft-hardcount">${fig.hard ? '(' + fig.hard + ')' : ''}</span></button>
      <button type="button" data-mode="wiederholen">${h(t('book.mode_review'))}</button>
    </div>
    ${remind ? `<details class="remind" id="heft-remind">
      <summary>${icon('bell')} ${h(t('book.remind'))} <span class="muted small" id="remind-state"></span></summary>
      <p class="small muted">${t('book.remind_what')}</p>
      <div class="row">
        <div><label for="remind-time">${h(t('book.remind_time'))}</label>
          <input type="time" id="remind-time" value="${h(remind.zeit || '19:00')}" step="900"></div>
        <div><button type="button" class="mini" id="remind-toggle" hidden>${h(t('book.remind_on'))}</button>
          <button type="button" class="quiet mini" id="remind-test" hidden>${h(t('book.remind_test'))}</button></div>
      </div>
      <p class="small muted" id="remind-note"></p>
    </details>` : ''}
    ${adhocBox}
    <div id="heft-lesen">
      <p class="small muted">${t('book.read_what')} ${t('book.dbl_hint')}</p>
      <div id="book">${passages.map(card).join('')}</div>
      ${passages.length ? '' : `<p class="muted">${t('book.none')}</p>`}
    </div>
    <div id="heft-lernen" hidden><p class="small muted">${t('book.learn_what')}</p></div>
    <div id="heft-intensiv" hidden><p class="small muted">${t('book.hard_what')}</p></div>
    <div id="heft-wiederholen" hidden><p class="small muted">${t('book.review_what')}</p></div>
    <script id="heft-data" type="application/json">${json}</script>
    <script src="/theater/heft.js?v=${HEFT_V}"></script>` });
}

/* ---------------------------------------------------------------------
   The whole play on the screen: every line, the own ones marked, the
   own name in the directions too; the bar hops between them, a double
   tap opens the comments. The rehearsal that begins at a line is noted.
   --------------------------------------------------------------------- */
function playPage(project, person, blocks, starts, comments) {
  const me = person.b;
  const markName = (text) => {
    // the own name in a direction, whole word only
    const parts = [];
    let i = 0, idx;
    const isWord = c => !!c && /[\p{L}\p{N}]/u.test(c);
    while ((idx = text.indexOf(me, i)) >= 0) {
      const ok = !isWord(text.charAt(idx - 1)) && !isWord(text.charAt(idx + me.length));
      parts.push(h(text.slice(i, idx)), ok ? `<mark class="me">${h(me)}</mark>` : h(me));
      i = idx + me.length;
    }
    parts.push(h(text.slice(i)));
    return parts.join('');
  };
  const block = (b) => {
    if (b.kind === 'chapter') return b.act ? `<h2>${h(b.text)}</h2>` : `<h3>${h(b.text)}</h3>`;
    if (b.kind === 'dir') return `<p class="dir">${markName(b.text)}</p>`;
    const from = b.nr != null && starts[b.nr] ? `<div class="rehearsal-from small">${
      starts[b.nr].map(id => `<a class="chip" href="/theater/mit/plan/${encodeURIComponent(id)}">${h(t('play.rehearsal_from', { id: h(id) }))}</a>`).join('')}</div>` : '';
    return from + `<p class="say cmt${b.own ? ' mine' : ''}${b.cut ? ' cut' : ''}"${b.nr != null ? ` data-nr="${b.nr}"` : ''}>${
      b.cont ? '' : `<b>${h(b.who)}:</b> `}${h(b.text)}</p>`;
  };
  const own = blocks.filter(b => b.kind === 'speech' && b.own && !b.cont).length;
  const data = { token: project.druck_token || '', me, locale: L.locale, comments, play: true,
    t: { c_new: t('kd.new'), c_text: t('kd.text'), c_question: t('kd.question'), c_save: t('kd.save'),
         c_cancel: t('kd.cancel'), c_comments: t('kd.comments'), c_answer: t('kd.answer'), c_del: t('kd.delete'),
         c_failed: t('kd.failed'), prev_mine: t('kd.prev_mine'), next_mine: t('kd.next_mine') } };
  const json = JSON.stringify(data).replace(/</g, '\u003c');
  return page({ title: t('play.title'), nav: navMember(project, person), tabbar: memberTabbar(project, person), narrow: true, body: `
    <p class="eyebrow">${h(project.titel)}</p>
    <h1>${t('play.title')}</h1>
    <p class="small muted">${t('play.what', { n: own })}
      <a href="/theater/mit/heft">${t('play.to_book')}</a></p>
    <div class="play" id="play">${blocks.map(block).join('')}</div>
    <div class="playbar" id="playbar">
      <button type="button" class="quiet" id="play-prev" title="${h(t('kd.prev_mine'))}">\u25c0 ${h(me)}</button>
      <span class="small muted" id="play-pos"></span>
      <button type="button" class="quiet" id="play-next" title="${h(t('kd.next_mine'))}">${h(me)} \u25b6</button>
    </div>
    <script id="play-data" type="application/json">${json}</script>
    <script src="/theater/heft.js?v=${HEFT_V}"></script>` });
}

/* ---------------------------------------------------------------------
   Settings for this device: language, light or dark, type size. Kept
   in cookies, so each phone and each computer has its own.
   --------------------------------------------------------------------- */
function settingsPage(current, back, m, who) {
  const radio = (name, value, label, checked) => `<label class="inline choice">
      <input type="radio" name="${name}" value="${h(value)}"${checked ? ' checked' : ''}> ${h(label)}</label>`;
  const nav = who ? navMember(who.project, who.person) : '';
  const tabbar = who ? memberTabbar(who.project, who.person) : '';
  const folks = who ? (who.project.personen || []).filter(x => x.id !== who.person.id)
    .sort((a, b) => (a.name || a.b).localeCompare(b.name || b.b, L.locale)) : [];
  return page({ title: t('set.title'), nav, tabbar, narrow: true, body: `
    <p class="eyebrow">${t('set.eyebrow')}</p>
    <h1>${t('set.title')}</h1>
    ${notice(m)}
    ${who && folks.length ? `<h2>${t('set.person')}</h2>
    <p class="small muted">${t('set.person_what', { name: h(who.person.name || who.person.b) })}</p>
    <form method="post" action="/theater/mit" class="inline">
      <input type="hidden" name="action" value="wechseln">
      <select name="person" style="max-width:16rem">
        ${folks.map(x => `<option value="${h(x.id)}">${h(x.name || x.b)}</option>`).join('')}
      </select>
      <button type="submit" class="quiet mini">${h(t('set.switch'))}</button>
    </form>` : ''}
    <h2>${t('set.device')}</h2>
    <p class="muted">${t('set.what')}</p>
    <form method="post" action="/theater/einstellungen" class="settings">
      <input type="hidden" name="back" value="${h(back)}">
      <label>${t('set.language')}</label>
      <div class="choices">
        ${radio('language', '', t('set.language_auto'), !current.language)}
        ${LANGUAGES.map(x => radio('language', x.code, x.name, current.language === x.code)).join('')}
      </div>
      <label>${t('set.theme')}</label>
      <div class="choices">
        ${radio('thema', 'hell', t('set.theme_light'), current.theme !== 'dunkel')}
        ${radio('thema', 'dunkel', t('set.theme_dark'), current.theme === 'dunkel')}
      </div>
      <label>${t('set.font')}</label>
      <div class="choices">
        ${radio('schrift', 'klein', t('set.font_small'), current.font === 'klein')}
        ${radio('schrift', 'normal', t('set.font_normal'), !current.font || current.font === 'normal')}
        ${radio('schrift', 'gross', t('set.font_large'), current.font === 'gross')}
        ${radio('schrift', 'sehrgross', t('set.font_xlarge'), current.font === 'sehrgross')}
      </div>
      <button type="submit">${t('common.save')}</button>
      <a class="btn quiet" href="${h(back)}">${t('common.back')}</a>
    </form>` });
}

/* ---------------------------------------------------------------------
   Asking once before working as somebody else.

   In the member area a confirm() on the form is enough. Not here: the
   way in comes from a printed part book, as a plain link, and a link
   cannot ask. So a page asks.
   --------------------------------------------------------------------- */
function switchPage(project, current, target, backPath, goto) {
  const n = h(current.name || current.b), z = h(target.name || target.b);
  return page({ title: t('switch.title'), narrow: true, body: `
    <p class="eyebrow">${h(project.titel)}</p>
    <h1>${t('switch.title')}</h1>
    <p>${t('switch.question', { current: n, target: z })}</p>
    <p class="small muted">${t('switch.what', { current: n, target: z })}</p>
    <form method="post" action="${h(backPath)}">
      <input type="hidden" name="goto" value="${h(goto)}">
      <button type="submit">${t('switch.yes', { target: z })}</button>
    </form>
    <p><a class="btn quiet" href="/theater/mit">${
      t('switch.no', { current: n })}</a></p>` });
}

/* ---------------------------------------------------------------------
   The bar in the printed document.

   A part book is a sheet of paper - but as long as it stands in the
   browser it is also a way back into the application. When printing, the
   bar disappears; it has no business in the booklet.
   --------------------------------------------------------------------- */
function backBar(printToken, personShort, hasPlan) {
  const zu = '/theater/druck/' + encodeURIComponent(printToken) +
             '/mit/' + encodeURIComponent(personShort);
  /* Styles of its own, because the document brings its own and knows
     nothing of the application's classes. When printing, the bar
     disappears - it has no business in the booklet.                  */
  return `<style>
  .backbar { display:flex; flex-wrap:wrap; gap:.6rem; align-items:center;
              margin:0 0 1.2rem; padding:.7rem .9rem; border:1px solid #d8d3cc;
              border-radius:.4rem; background:#f6f4f1;
              font:14px/1.5 -apple-system,"Segoe UI",Roboto,Arial,sans-serif }
  .backbar a { display:inline-block; padding:.3rem .7rem; border-radius:.3rem;
                border:1px solid #b3272d; color:#b3272d; text-decoration:none;
                font-weight:600 }
  .backbar a:hover { background:#b3272d; color:#fff }
  .backbar .hint { color:#6b655c; font-size:.82rem }
  @media print { .backbar { display:none !important } }
  </style>
  <div class="backbar">
    <a href="${zu}?goto=zeiten">${h(t('bar.times'))}</a>
    ${hasPlan ? `<a href="${zu}?goto=termine">${h(t('bar.dates'))}</a>` : ''}
    <a href="/theater/druck/${encodeURIComponent(printToken)}/gesamt?ich=${
      encodeURIComponent(personShort)}">${h(t('bar.full'))}</a>
    <span class="hint">${h(t('bar.hint'))}</span>
  </div>`;
}
function myDatesPage(project, person, result, m, opt = {}) {
  const showAll = !!opt.all;
  const directors = result.directors || [];
  const isDirector = directors.includes(person.b);
  const mine = (showAll || isDirector) ? result.rehearsals
             : result.rehearsals.filter(pr => pr.group.includes(person.b));

  const row = (pr) => {
    const who = pr.group.filter(b => showAll || b !== person.b).map(b => {
      const x = (project.personen || []).find(y => y.b === b);
      return `<span class="chip" title="${h(x?.name || '')}">${h(b)}</span>`;
    }).join('') + directors.filter(b => !pr.group.includes(b) && (showAll || b !== person.b)).map(b =>
      `<span class="chip muted" title="${h(t('date.director'))}">${h(b)}</span>`).join('')
      || `<span class="small muted">${t('mdate.alone')}</span>`;

    let date, button = '';
    if (pr.proposal && pr.fixed) {
      const e = (project.termine || []).find(x => x.probe_id === pr.id) || {};
      date = `<span class="date fixed">\u2713 ${h(L.weekday(pr.proposal.weekday))}, ${
          h(L.date(pr.proposal.date, { day: '2-digit', month: '2-digit', year: 'numeric' }))}</span>
        <div class="small muted">${t('date.clock', { from: h(pr.proposal.from),
          to: h(pr.proposal.to) })} \u00b7 ${t('date.fixed')}</div>
        ${placeField('/theater/mit/termine', pr.id, e.ort)}`;
    } else if (pr.proposal) {
      date = `<span class="date">${h(L.weekday(pr.proposal.weekday))}, ${h(L.date(pr.proposal.date, { day: '2-digit', month: '2-digit', year: 'numeric' }))}</span>
        <div class="small muted">${t('date.clock', { from: h(pr.proposal.from),
          to: h(pr.proposal.to) })} \u00b7 ${t('date.proposal')}</div>`;
      button = actionForm('/theater/mit/termine', 'halten',
        { rehearsal: pr.id, iso: pr.proposal.iso,
          from: pr.proposal.from, to: pr.proposal.to },
        `<input type="text" name="place" placeholder="${h(t('common.place_hint'))}"
                style="max-width:12rem"><button class="mini">` +
        h(t('date.confirm')) + '</button>');
    } else {
      date = `<span class="open">${t('date.none_yet')}</span>
        <div class="small muted">${whyNot(pr)}</div>`;
    }
    return `<tr${pr.fixed ? ' class="isfixed"' : ''}>
      <td><a href="/theater/mit/plan/${encodeURIComponent(pr.id)}"><b>${h(pr.id)}</b></a>
        <div class="small muted">${t('common.minutes', { n: Math.round(pr.minutes) })}</div></td>
      <td>${showAll ? who : t('mdate.with', { who })}</td>
      <td>${date}${button}</td></tr>`;
  };

  const header = `<tr><th>${t('date.col_rehearsal')}</th><th>${
    showAll ? t('date.col_cast') : t('mdate.col_with')}</th>
    <th>${t('date.col_date')}</th></tr>`;
  const fixed = mine.filter(x => x.fixed);
  const unresolved = mine.filter(x => !x.fixed);

  return page({ title: t('date.title'), nav: navMember(project, person), tabbar: memberTabbar(project, person), body: `
    <p class="eyebrow">${h(project.titel)}</p><h1>${showAll ? t('mdate.all') : t('mdate.title')}</h1>
    <p class="tabs"><a href="/theater/mit/termine"${showAll ? '' : ' class="on"'}>${t('mdate.mine')}</a>
      <a href="/theater/mit/termine?alle=1"${showAll ? ' class="on"' : ''}>${t('mdate.all')}</a>
      <a href="/theater/mit/heft#adhoc" class="btn quiet mini" style="margin-left:.5rem">${h(t('mdate.adhoc'))}</a></p>
    ${notice(m)}
    ${showAll ? `<p class="small muted">${t('mdate.all_what')}</p>` : ''}
    ${!mine.length ? `<p class="muted">${t('mdate.none')}</p>` : `
      <h2>${t('mdate.fixed')}${fixed.length ? ` (${fixed.length})` : ''}</h2>
      ${fixed.length ? `<p class="small muted">${t('mdate.fixed_place')}</p>` : ''}
      ${fixed.length
        ? `<table>${header}${fixed.map(row).join('')}</table>`
        : `<p class="small muted">${t('mdate.nothing_fixed')}</p>`}
      <h2>${t('mdate.proposals')}${unresolved.length ? ` (${unresolved.length})` : ''}</h2>
      <p class="small muted">${t('mdate.proposal_what')}</p>
      ${unresolved.length
        ? `<table>${header}${unresolved.map(row).join('')}</table>`
        : `<p class="small muted">${t('mdate.all_arranged')}</p>`}`}` });
}

/* ---------- Termine ---------- */

function datesPage(p, result, m) {
  const directors = result.directors || [];
  const rows = result.rehearsals.map(pr => {
    const who = pr.group.map(b => {
      const x = (p.personen || []).find(y => y.b === b);
      return `<span class="chip" title="${h(x?.name || '')}">${h(b)}</span>`;
    }).join('') + directors.filter(b => !pr.group.includes(b)).map(b =>
      `<span class="chip muted" title="${h(t('date.director'))}">${h(b)}</span>`).join('');

    let date, button = '';
    if (pr.proposal && pr.fixed) {
      const e = (p.termine || []).find(x => x.probe_id === pr.id) || {};
      date = `<span class="date fixed">\u2713 ${h(L.weekday(pr.proposal.weekday))}, ${
          h(L.date(pr.proposal.date, { day: '2-digit', month: '2-digit', year: 'numeric' }))}</span>
        <span class="small muted"><br>${t('date.clock', { from: h(pr.proposal.from),
          to: h(pr.proposal.to) })} \u00b7 ${t('date.fixed')}</span>
        ${placeField('/theater/termine', pr.id, e.ort)}`;
      button = actionForm('/theater/termine', 'loesen', { rehearsal: pr.id },
        '<button class="quiet small" style="margin:.4rem 0 0; padding:.25rem .7rem">' +
        h(t('date.release')) + '</button>');
    } else if (pr.proposal) {
      date = `<span class="date">${h(L.weekday(pr.proposal.weekday))}, ${h(L.date(pr.proposal.date, { day: '2-digit', month: '2-digit', year: 'numeric' }))}</span>
        <span class="small muted"><br>${t('date.clock', { from: h(pr.proposal.from),
          to: h(pr.proposal.to) })}</span>`;
      button = actionForm('/theater/termine', 'halten',
        { rehearsal: pr.id, iso: pr.proposal.iso,
          from: pr.proposal.from, to: pr.proposal.to },
        `<input type="text" name="place" placeholder="${h(t('common.place_hint'))}"
                style="max-width:12rem"><button class="small" style="padding:.25rem .7rem">` +
        h(t('date.fix')) + '</button>');
    } else {
      date = `<span class="open">${t('date.none_possible')}</span>`;
    }

    const reason = pr.proposal ? '' : `<div class="small muted">${whyNot(pr)}</div>`;
    const alternatives = (!pr.fixed && pr.alternatives?.length)
      ? `<div class="small muted alts"><span>${t('date.also_short')}</span> ${pr.alternatives.map(x =>
          `<span class="chip muted">${h(L.weekday(x.weekday, 'short'))} ${
          h(L.date(x.date, { day: '2-digit', month: '2-digit' }))}</span>`).join('')}</div>` : '';

    return `<tr${pr.fixed ? ' class="isfixed"' : ''}>
      <td>${h(pr.id)}</td>
      <td>${who}<div class="small muted">${t('date.scenes_min', {
          scenes: (pr.scenes || []).length, min: Math.round(pr.minutes) })}</div></td>
      <td title="${h(t('date.possible_n', { n: pr.possible.length }))}">${date}${reason}${alternatives}</td>
      <td>${button}</td>
    </tr>`;
  }).join('');

  const fixedCount = result.rehearsals.filter(x => x.fixed).length;
  return page({ title: t('date.title'), nav: navDirector(p), body: `
    <p class="eyebrow">${t('date.step')}</p><h1>${t('date.title_long')}</h1>
    ${notice(m)}
    <p class="muted">${t('date.until', { date: h(result.until
      ? L.date(result.until, { year: 'numeric', month: 'long', day: 'numeric' }) : '') })}</p>
    <p class="small muted">${t('date.what')}${fixedCount
      ? t('date.fixed_n', { n: fixedCount, m: result.rehearsals.length }) : ''}.</p>
    ${result.hint ? notice({ kind: 'error', ...result.hint }) : ''}
    ${result.rehearsals.length
      ? `<table><tr><th>${t('date.col_rehearsal')}</th><th>${t('date.col_cast')}</th>
         <th>${t('date.col_date')}</th><th></th></tr>
         ${rows}</table>`
      : `<p>${t('date.no_plan')}</p>`}` });
}

/* ---------- Ensemble-Mitglied ---------- */

function myTimesPage(project, person, m, days, states, ics = '') {
  const v = project.verfuegbar?.[person.id] || {};
  const entered = v.tage || {};
  const rehearsals = (project.plan?.proben || []).filter(pr => pr.gruppe.includes(person.b));

  /* Month and weekday names come from Intl. There used to be a German
     list here; it would have been missing in every further language. */
  const monatsName = new Intl.DateTimeFormat(L.locale, { month: 'long' });
  const wochenName = new Intl.DateTimeFormat(L.locale, { weekday: 'short' });
  // 1 January 2024 was a Monday - a dependable starting point.
  const WOCHE = Array.from({ length: 7 },
    (_, k) => wochenName.format(new Date(Date.UTC(2024, 0, 1 + k))));

  const names = new Map((project.personen || []).map(x => [x.b, x.name || x.b]));

  /* Build the months and pad each with empty cells to whole weeks, so
     that the columns Monday to Sunday line up. */
  const months = [];
  for (const tg of days) {
    const schl = tg.year + '-' + tg.month;
    let mm = months.find(x => x.schl === schl);
    if (!mm) {
      mm = { schl, days: [],
             title: monatsName.format(new Date(Date.UTC(tg.year, tg.month, 1)))
                    + ' ' + tg.year };
      months.push(mm);
    }
    mm.days.push(tg);
  }
  const mondayIndex = wtag => (wtag + 6) % 7;      // So=0 -> 6

  // Director and assistant director strike days for everyone.
  const director = ctx.regieProject === project.id || ctx.directorProject === project.id;
  const cell = (tg) => {
    const e = entered[tg.iso];
    const l = states?.[tg.iso] || { level: 0, canCome: [], fixed: [] };
    const classes = ['day', 'level' + l.level];
    if (e?.von) classes.push('me');
    if (e?.nein) classes.push('nein');
    if (l.fixed?.length) classes.push('fixed');
    if (l.blocked) classes.push('blocked');
    const hinweis = l.best
      ? t('my.best', { rehearsal: l.best.rehearsal, here: l.best.here, total: l.best.total })
      : (l.canCome.length ? t('my.can_n', { n: l.canCome.length })
                          : t('my.nobody'));
    return `<td class="${classes.join(' ')}" data-iso="${tg.iso}"
        data-koennen="${h((l.canCome || []).join(','))}"
        data-missing="${h((l.best?.missing || []).join(','))}"
        data-rehearsal="${h(l.best?.rehearsal || '')}"
        data-da="${l.best?.here ?? 0}" data-gesamt="${l.best?.total ?? 0}"
        data-fixed="${h((l.fixed || []).map(f => f.rehearsal + ' ' + f.from + '-' + f.to +
                       (f.place ? ' @ ' + f.place : '')).join(' | '))}"
        title="${h(hinweis)}">
      <span class="num">${tg.day}</span>
      <span class="time">${e?.von ? h(e.von + '\u2013' + e.bis) : ''}</span>
      <input type="hidden" name="t_${tg.iso}" value="${e?.von ? '1' : ''}">
      <input type="hidden" name="n_${tg.iso}" value="${e?.nein ? '1' : ''}">
      <input type="hidden" name="v_${tg.iso}" value="${h(e?.von || '')}">
      <input type="hidden" name="b_${tg.iso}" value="${h(e?.bis || '')}">
      ${director ? `<input type="hidden" name="g_${tg.iso}" value="${l.blocked ? '1' : ''}">` : ''}
    </td>`;
  };

  const monthTable = (mm, i) => {
    const cells = [];
    const firstColumn = mondayIndex(mm.days[0].weekday);
    for (let k = 0; k < firstColumn; k++) cells.push('<td class="empty"></td>');
    mm.days.forEach(tg => cells.push(cell(tg)));
    while (cells.length % 7) cells.push('<td class="empty"></td>');
    const rows = [];
    for (let k = 0; k < cells.length; k += 7)
      rows.push('<tr>' + cells.slice(k, k + 7).join('') + '</tr>');
    return `<div class="month" data-nr="${i}"${i ? ' hidden' : ''}>
      <table class="cal">
        <tr>${WOCHE.map(w => `<th>${h(w)}</th>`).join('')}</tr>
        ${rows.join('')}
      </table></div>`;
  };

  const count = Object.values(entered).filter(x => x && x.von).length;
  const shortDate = new Intl.DateTimeFormat(L.locale, { day: '2-digit', month: '2-digit' });
  const myDays = Object.entries(entered).sort()
    .map(([iso, z]) => {
      const d = new Date(iso + 'T00:00:00');
      return WOCHE[mondayIndex(d.getDay())] + ' ' + shortDate.format(d) +
             ' ' + z.von + '\u2013' + z.bis;
    });
  const preset = Object.values(entered)[0] || { von: '19:00', bis: '22:00' };
  const js = (schluessel, werte) => JSON.stringify(t(schluessel, werte));

  return page({ title: t('my.title'), nav: navMember(project, person), tabbar: memberTabbar(project, person), body: `
    <p class="eyebrow">${h(project.titel)}</p>
    <h1>${t('my.title')}</h1>
    ${notice(m)}

    ${person.regie ? `<div class="notice">${t('my.director_note')}</div>` : count ? '' : `<p class="muted">${t('my.nothing')}</p>`}

    <form method="post" action="/theater/mit/zeiten" id="formular">
      <div class="pref small" id="zeitfenster">
        <b>${t('my.pref_title')}</b>
        <label class="inline">${t('my.from')} <input type="time" id="pref-von" step="900" value="${h(preset.von)}"></label>
        <label class="inline">${t('my.to')} <input type="time" id="pref-bis" step="900" value="${h(preset.bis)}"></label>
        <span class="muted">${t('my.pref_what')}</span>
      </div>
      <div class="calhead">
        <button type="button" id="zurueck" class="quiet mini">&lsaquo;</button>
        <b id="monatsname">${h(months[0]?.title || '')}</b>
        <button type="button" id="vor" class="quiet mini">&rsaquo;</button>
        <span class="small muted" id="zaehler">${
          h(t('my.evenings_n', { n: count }))}</span>
      </div>

      <div class="legend small">
        <span class="dot fixed"></span> ${t('my.fixed_with_me')}
        <span class="dot level3 me"></span> ${t('my.all_with_me')}
        <span class="dot level3"></span> ${t('my.all_others')}
        <span class="dot level2"></span> ${t('my.half')}
        <span class="dot level1"></span> ${t('my.one')}
        <span class="dot me"></span> ${t('my.me')}
        <span class="dot blocked"></span> ${t('my.legend_blocked')}
        <span class="dot nein"></span> ${t('my.legend_nein')}
      </div>

      ${months.map(monthTable).join('')}
      <div id="schleier" class="overlay" hidden><div id="tafel" class="box"></div></div>

      <button type="submit" id="speichern">${t('my.save')}</button>
      <span class="small muted" id="autosave">${t('my.only_after')}</span>
    </form>

    ${count ? `<details class="box small" style="margin-top:1.2rem">
      <summary><b>${count === 1 ? t('my.holds_1') : t('my.holds', { n: count })}</b></summary>
      <div class="muted" style="margin-top:.4rem; line-height:1.9">
        ${myDays.map(x => `<span class="chip">${h(x)}</span>`).join('')}
      </div>
      ${v.stand ? `<p class="muted" style="margin:.6rem 0 0">${
        t('my.last_saved', { when: h(L.date(v.stand)) })}</p>` : ''}
    </details>` : ''}
    ${rehearsals.length ? `<p class="small muted">${t('my.needed_for',
      { n: rehearsals.length })}${rehearsals.map(pr => `<span class="chip"
      title="${h(t('my.with', { who: pr.gruppe.filter(b => b !== person.b).join(', ') }))}"
      >${h(pr.id)}</span>`).join('')}</p>` : ''}

    <div class="box small" id="kalender-quellen" data-worte="${h(JSON.stringify({
      remove: t('my.source_remove'), none: t('my.source_none'), unreachable: t('my.source_unreachable'),
      n_events: t('my.source_n', { n: '#' }), day_title: t('my.day_title'), day_free: t('my.day_free'), allday: t('my.allday'),
      bad_url: t('my.bad_url'), bad_file: t('my.bad_file'), day_full: t('my.day_full'),
      pin: t('my.pin'), pin_repeat: t('my.pin_repeat'), pin_ok: t('my.pin_ok'), pin_set_title: t('my.pin_set_title'),
      pin_set_what: t('my.pin_set_what'), pin_enter: t('my.pin_enter'), pin_unlock: t('my.pin_unlock'), pin_wrong: t('my.pin_wrong'),
      pin_lock: t('my.pin_lock'), pin_mismatch: t('my.pin_mismatch'), pin_format: t('my.pin_format'),
      pin_forget: t('my.pin_forget'), pin_forget_what: t('my.pin_forget_what'), pin_forget_confirm: t('my.pin_forget_confirm') }))}"
      data-person="${h(person.id)}">
      <b>${t('my.sources_title')}</b>
      <p class="muted">${t('my.sources_what')}</p>
      <div class="pin"></div>
      <div class="quellen"></div>
      <div class="hinzu">
        <div class="row">
          <div><label for="quelle-name">${t('my.source_name')}</label><input type="text" id="quelle-name" maxlength="40"></div>
          <div style="flex:2"><label for="quelle-url">${t('my.source_url')}</label><input type="url" id="quelle-url" placeholder="https://\u2026/basic.ics"></div>
          <div><button type="button" class="quiet" id="quelle-add" style="margin-top:0">${h(t('my.source_add'))}</button></div>
        </div>
        <p style="margin:.6rem 0 0"><label class="btn quiet mini" style="cursor:pointer">${h(t('my.source_file'))}
          <input type="file" id="quelle-file" accept=".ics,text/calendar" hidden></label></p>
      </div>
    </div>
    ${ics ? `<div class="box small">
      <b>${t('my.ics_title')}</b>
      <p class="muted">${t('my.ics_what')}</p>
      ${copyLink(ics)}
    </div>` : ''}
    <script type="module" src="/theater/kalender.js?v=${KAL_V}"></script>

    <script>
    (function () {
      var months = [].slice.call(document.querySelectorAll('.month'));
      var names = ${JSON.stringify(Object.fromEntries(names))};
      var preset = ${JSON.stringify(preset)};
      var personId = ${JSON.stringify(person.id)};
      try { var zf = JSON.parse(localStorage.getItem('zeitfenster:' + personId) || 'null'); if (zf && zf.von && zf.bis) { preset = zf;
        document.getElementById('pref-von').value = zf.von; document.getElementById('pref-bis').value = zf.bis; } } catch (e) {}
      [].forEach.call(document.querySelectorAll('#zeitfenster input'), function (inp) {
        inp.addEventListener('change', function () {
          var a = document.getElementById('pref-von').value, b = document.getElementById('pref-bis').value;
          if (a && b && b > a) { preset = { von: a, bis: b }; try { localStorage.setItem('zeitfenster:' + personId, JSON.stringify(preset)); } catch (e) {}
            document.dispatchEvent(new CustomEvent('zeitfenster-geaendert')); }
        });
      });
      var place = ${JSON.stringify(L.locale)};
      var regie = ${director ? 'true' : 'false'};
      var W = { evenings: ${js('my.evenings_n', { n: '#' })},
                blocked: ${js('my.blocked')}, block: ${js('my.block')}, unblock: ${js('my.unblock')},
                fixed: ${js('my.fixed_on')},
                absent: ${js('my.still_missing')},
                nurSie: ${js('my.only_you')},
                keine: ${js('my.no_rehearsal')},
                zeit: ${js('my.free_then')},
                von: ${js('my.from')}, bis: ${js('my.to')},
                ja: ${js('my.can')}, nein: ${js('my.cannot')}, offen: ${js('my.open')},
                falsch: ${js('my.time_wrong')},
                autosave: ${js('my.autosave')}, saving: ${js('my.saving')},
                saved: ${js('my.saved', { when: '#' })}, save_failed: ${js('my.save_failed')},
                von_n: ${JSON.stringify(t('my.best', { rehearsal: '', here: '#DA#',
                  total: '#GESAMT#' }).replace(/^:\s*/, ''))} };
      var current = 0;

      function zeigeMonat(i) {
        current = Math.max(0, Math.min(months.length - 1, i));
        months.forEach(function (mm, k) { mm.hidden = k !== current; });
        document.getElementById('monatsname').textContent =
          ${JSON.stringify(months.map(x => x.title))}[current];
        document.getElementById('zurueck').disabled = current === 0;
        document.getElementById('vor').disabled = current === months.length - 1;
      }
      document.getElementById('zurueck').onclick = function () { zeigeMonat(current - 1); };
      document.getElementById('vor').onclick = function () { zeigeMonat(current + 1); };
      zeigeMonat(0);

      function zaehle() {
        var n = document.querySelectorAll('.month td.me').length;
        document.getElementById('zaehler').textContent = W.evenings.replace('#', n);
      }
      /* Every entry goes to the server at once; the button stays for
         browsers without script. */
      var formular = document.getElementById('formular'), stand = document.getElementById('autosave');
      document.getElementById('speichern').hidden = true;
      stand.textContent = W.autosave;
      var pending = null;
      function speichere() {
        stand.textContent = W.saving;
        var body = new URLSearchParams(new FormData(formular)).toString();
        pending = fetch(formular.action, { method: 'POST', credentials: 'same-origin',
          headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: body })
          .then(function (r) {
            stand.textContent = r.ok ? W.saved.replace('#', new Date().toLocaleTimeString(place, { hour: '2-digit', minute: '2-digit' })) : W.save_failed;
          }).catch(function () { stand.textContent = W.save_failed; });
      }
      function liste(s) {
        if (!s) return '\u2014';
        return s.split(',').filter(Boolean)
          .map(function (b) { return names[b] || b; }).join(', ');
      }
      var tafel = document.getElementById('tafel');
      var schleier = document.getElementById('schleier');
      schleier.addEventListener('click', function (e) { if (e.target === schleier) schleier.hidden = true; });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') schleier.hidden = true; });

      function oeffne(td) {
        var iso = td.dataset.iso;
        var d = new Date(iso + 'T00:00:00');
        var vI = td.querySelector('input[name^="v_"]');
        var bI = td.querySelector('input[name^="b_"]');
        var tI = td.querySelector('input[name^="t_"]');
        // "yes" opens with the preferred window
        var pv = document.getElementById('pref-von'), pb = document.getElementById('pref-bis');
        if (pv && pb && pv.value && pb.value) preset = { von: pv.value, bis: pb.value };
        var da = td.dataset.da, gesamt = td.dataset.gesamt;
        var gI = td.querySelector('input[name^="g_"]');
        var blocked = td.classList.contains('blocked');
        schleier.hidden = false;
        tafel.innerHTML =
          '<b>' + d.toLocaleDateString(place, { weekday: 'long', day: '2-digit',
              month: '2-digit', year: 'numeric' }) + '</b>' +
          '<div id="tafel-ics" class="small" style="margin:.4rem 0" hidden></div>' +
          (blocked ? '<div class="notice error small" style="margin:.5rem 0">' + W.blocked + '</div>' : '') +
          (td.dataset.fixed ? '<div class="notice good small" style="margin:.5rem 0">' +
              W.fixed + td.dataset.fixed + '</div>' : '') +
          '<div class="small muted" style="margin:.5rem 0">' +
            (td.dataset.rehearsal
              ? '<b>' + td.dataset.rehearsal + '</b>: ' +
                W.von_n.replace('#DA#', da).replace('#GESAMT#', gesamt) +
                (td.dataset.missing ? W.absent + liste(td.dataset.missing) : W.nurSie)
              : W.keine) +
            '<br>' + W.zeit + liste(td.dataset.koennen) +
          '</div>' +
          '<div class="row">' +
            '<div><label for="tv">' + W.von + '</label>' +
              '<input type="time" id="tv" step="900" value="' +
              (vI.value || preset.von) + '"></div>' +
            '<div><label for="tb">' + W.bis + '</label>' +
              '<input type="time" id="tb" step="900" value="' +
              (bI.value || preset.bis) + '"></div>' +
          '</div>' +
          '<button type="button" id="jat">' + W.ja + '</button> ' +
          '<button type="button" id="neint" class="quiet">' + W.nein + '</button> ' +
          '<button type="button" id="offen" class="quiet">' + W.offen + '</button>' +
          (regie && gI ? ' <button type="button" id="sperrt" class="quiet">' +
             (blocked ? W.unblock : W.block) + '</button>' : '');

        document.dispatchEvent(new CustomEvent('tag-geoeffnet', { detail: iso }));

        if (regie && gI) document.getElementById('sperrt').onclick = function () {
          gI.value = blocked ? '' : '1';
          td.classList.toggle('blocked', !blocked);
          schleier.hidden = true; speichere();
        };

        document.getElementById('jat').onclick = function () {
          var a = document.getElementById('tv').value, b = document.getElementById('tb').value;
          if (!a || !b || b <= a) { alert(W.falsch); return; }
          tI.value = '1'; vI.value = a; bI.value = b;
          td.classList.add('me');
          td.querySelector('.time').textContent = a + '\u2013' + b;
          preset = { von: a, bis: b };
          schleier.hidden = true; zaehle(); speichere();
        };
        var nI = td.querySelector('input[name^="n_"]');
        document.getElementById('neint').onclick = function () {
          tI.value = ''; vI.value = ''; bI.value = ''; if (nI) nI.value = '1';
          td.classList.remove('me'); td.classList.add('nein');
          td.querySelector('.time').textContent = '';
          schleier.hidden = true; zaehle(); speichere();
        };
        document.getElementById('offen').onclick = function () {
          tI.value = ''; vI.value = ''; bI.value = ''; if (nI) nI.value = '';
          td.classList.remove('me'); td.classList.remove('nein');
          td.querySelector('.time').textContent = '';
          schleier.hidden = true; zaehle(); speichere();
        };
      }

      document.querySelectorAll('.month td.day').forEach(function (td) {
        td.addEventListener('click', function () { oeffne(td); });
      });
      zaehle();
    })();
    <\/script>` });
}

/* ---------------------------------------------------------------------
   Administration: the projects of this installation.

   For whoever runs the server, not for a director. Creating a project
   needs the director's address - the code is sent by hand, and the
   address is what makes sending it again possible.
   --------------------------------------------------------------------- */
const navAdmin = `<nav><a href="/theater/admin/abmelden">${t('nav.signout')}</a></nav>`;

const adminLoginPage = (m) => page({
  title: t('admin.title'), narrow: true,
  body: `
    <p class="eyebrow">${t('app.name')}</p>
    <h1>${t('admin.title')}</h1>
    <p class="muted">${t('admin.login_what')}</p>
    ${notice(m)}
    <div class="box">
      <form method="post" action="/theater/admin">
        <label for="key">${t('admin.key')}</label>
        <input type="password" id="key" name="key" autocomplete="off" required autofocus>
        <button type="submit">${t('entry.continue')}</button>
      </form>
    </div>` });

function adminPage(projects, m, fresh, entry) {
  const mailto = (f) => 'mailto:' + encodeURIComponent(f.email) +
    '?subject=' + encodeURIComponent(t('admin.mail_subject', { title: f.titel })) +
    '&body=' + encodeURIComponent(t('admin.mail_body',
      { title: f.titel, code: f.code, url: entry }));

  const freshBox = !fresh ? '' : `
    <div class="box important">
      <p class="eyebrow">${t('admin.fresh_title', { title: h(fresh.titel) })}</p>
      <p><b>${t('admin.fresh_code')}</b> <code id="freshcode">${h(fresh.code)}</code></p>
      <p class="small">${t('admin.fresh_what')}</p>
      ${fresh.email ? `<p><b>${t('admin.fresh_email')}</b> ${h(fresh.email)}
        \u2013 <a class="btn quiet mini" href="${h(mailto(fresh))}">${t('admin.send_mail')}</a></p>` : ''}
    </div>`;

  const row = (p) => `<tr>
      <td><b>${h(p.titel)}</b><div class="small muted"><code>${h(p.id)}</code></div></td>
      <td class="small">${p.angelegt ? h(L.date(p.angelegt, { dateStyle: 'medium' })) : '\u2014'}</td>
      <td class="small">${p.email ? `<a href="mailto:${h(p.email)}">${h(p.email)}</a>` : '\u2014'}</td>
      <td class="small">${t('admin.figures', { people: p.people, rehearsals: p.rehearsals,
        entered: p.withEntry })}</td>
      <td>
        ${actionForm('/theater/admin', 'code', { id: p.id },
          '<button class="quiet mini" type="submit">' + h(t('admin.new_code')) + '</button>',
          { confirm: t('admin.new_code_confirm') })}
        ${actionForm('/theater/admin', 'loeschen', { id: p.id },
          `<input type="text" name="bestaetigung" placeholder="${h(t('admin.delete_what'))}"
                  aria-label="${h(t('admin.delete_what'))}">
           <button class="quiet mini" type="submit">${h(t('admin.delete'))}</button>`,
          { confirm: t('admin.delete_confirm', { title: p.titel }) })}
      </td>
    </tr>`;

  return page({ title: t('admin.title'), nav: navAdmin, body: `
    <p class="eyebrow">${t('app.name')}</p>
    <h1>${t('admin.title')}</h1>
    ${notice(m)}
    ${freshBox}
    <h2>${t('admin.projects')} (${projects.length})</h2>
    ${projects.length ? `<table class="plan"><tr>
        <th>${t('admin.col_title')}</th><th>${t('admin.col_created')}</th>
        <th>${t('admin.col_email')}</th><th>${t('admin.col_state')}</th><th></th></tr>
      ${projects.map(row).join('')}</table>`
      : `<p class="muted">${t('admin.none')}</p>`}
    <p class="small muted">${t('admin.delete_note')}</p>

    <h2>${t('admin.new')}</h2>
    <form method="post" action="/theater/admin">
      <input type="hidden" name="action" value="neu">
      <div class="row">
        <div><label for="titel">${t('admin.field_title')}</label>
          <input type="text" id="titel" name="titel" required maxlength="120"></div>
        <div><label for="email">${t('admin.field_email')}</label>
          <input type="email" id="email" name="email" required maxlength="200"></div>
      </div>
      <p class="small muted" style="margin-top:.6rem">${t('admin.email_what')}</p>
      <button type="submit">${t('admin.create')}</button>
    </form>` });
}


/* ---------------------------------------------------------------------
   Comments in the documents, and the overlays that go with them.

   The tool sets the documents and knows nothing of people. What is
   added here after <body>: the comments the viewer may see, a script
   that shows them beside the lines and takes new ones on a double
   click, and - in the rehearsal plan - a way to jump between the
   scenes of a rehearsal. Nothing of it prints.
   --------------------------------------------------------------------- */
function docExtras(token, doc, me, comments, canSeeAll, people = []) {
  const data = {
    token, doc, all: !!canSeeAll,
    me: me ? { b: me.b, name: me.name || me.b } : null,
    people,
    comments: comments.map(c => ({ id: c.id, nr: c.nr, text: c.text, wer: c.wer,
      name: c.name || c.wer, datum: c.datum, frage: !!c.frage, antwort: c.antwort || null,
      erledigt: !!c.erledigt })),
    locale: L.locale,
    t: {
      new_: t('kd.new'), text: t('kd.text'), question: t('kd.question'), save: t('kd.save'),
      cancel: t('kd.cancel'), comments: t('kd.comments'), answer: t('kd.answer'),
      del: t('kd.delete'), signin: t('kd.signin'), hint: t('kd.hint'), scenes: t('kd.scenes'),
      rehearsals: t('kd.all_rehearsals'), close: t('kd.close'), question_mark: t('kd.question_mark'),
      done: t('kd.done'), failed: t('kd.failed'),
      rehearsal: t('kd.rehearsal'), scene: t('kd.scene'), prev: t('kd.prev_comment'),
      next: t('kd.next_comment'), none: t('kd.no_comments'),
      prev_mine: t('kd.prev_mine'), next_mine: t('kd.next_mine'),
      person: t('kd.person'), zoom_in: t('kd.zoom_in'), zoom_out: t('kd.zoom_out'), scene_of: t('kd.scene_of'),
    },
  };
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<style>
  .kmt-badge { display:inline-block; margin-left:.4em; padding:0 .45em; border-radius:1em;
    border:1px solid #b3272d; color:#b3272d; font:600 11px/1.6 -apple-system,"Segoe UI",Roboto,Arial,sans-serif;
    cursor:pointer; vertical-align:middle; user-select:none }
  .kmt-badge.q { background:#b3272d; color:#fff }
  .kmt-hint { position:fixed; right:12px; bottom:12px; background:#f6f4f1; border:1px solid #d8d3cc;
    border-radius:.4rem; padding:.4rem .7rem; font:13px/1.4 -apple-system,"Segoe UI",Roboto,Arial,sans-serif;
    color:#6b655c; z-index:40 }
  .kmt-veil { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,.45); z-index:60;
    display:flex; align-items:center; justify-content:center; padding:1rem }
  .kmt-box { background:#fff; color:#1c1a18; border-radius:.4rem; padding:1rem 1.2rem; width:100%;
    max-width:36rem; max-height:88vh; overflow:auto; box-shadow:0 12px 40px rgba(0,0,0,.35);
    font:15px/1.5 -apple-system,"Segoe UI",Roboto,Arial,sans-serif }
  .kmt-box h3 { margin:0 0 .5rem; font-size:1.05rem }
  .kmt-box .snip { color:#6b655c; font-style:italic; margin-bottom:.6rem }
  .kmt-box textarea { width:100%; min-height:5rem; font:inherit; padding:.4rem; box-sizing:border-box }
  .kmt-box label { display:block; margin:.5rem 0 }
  .kmt-box button { font:inherit; font-weight:600; padding:.4rem .9rem; border-radius:.3rem; border:1px solid #b3272d;
    background:#b3272d; color:#fff; cursor:pointer; margin:.6rem .4rem 0 0 }
  .kmt-box button.q { background:#fff; color:#1c1a18; border-color:#a9a29a }
  .kmt-item { border-top:1px solid #e6e1da; padding:.5rem 0 }
  .kmt-item .who { font-size:.85em; color:#6b655c }
  .kmt-item .q { color:#b3272d; font-weight:600; font-size:.85em }
  .kmt-item .ans { margin:.3rem 0 0 1rem; padding-left:.6rem; border-left:3px solid #166b34 }
  .kmt-item .del { float:right; font-size:.8em; color:#b3272d; background:none; border:0; padding:0; margin:0; cursor:pointer }
  .kmt-nav a { display:block; padding:.25rem 0; color:#b3272d; text-decoration:none }
  .kmt-nav a.on { font-weight:700 }
  .kmt-nav .grp { margin-top:.8rem; font-weight:600; color:#6b655c; font-size:.85em; text-transform:uppercase; letter-spacing:.05em }
  main.plan .szkopf, main.plan p.szende { cursor:pointer }
  p.speech.kmt-mine { border-left:3px solid #b3272d; padding-left:.5em; margin-left:-.5em; background:rgba(179,39,45,.05) }
  mark.kmt-me { background:#ffe58a; color:inherit; font-weight:700; padding:0 .1em }
  @media print { p.speech.kmt-mine { background:transparent } }
  .kmt-bar { position:fixed; top:0; left:0; right:0; z-index:45; display:flex; flex-wrap:wrap; gap:.4rem;
    align-items:center; padding:.35rem .8rem; background:#f6f4f1; border-bottom:1px solid #d8d3cc;
    font:13px/1.4 -apple-system,"Segoe UI",Roboto,Arial,sans-serif; color:#1c1a18 }
  .kmt-bar select { font:inherit; padding:.15rem .3rem; max-width:14rem }
  .kmt-bar button { font:inherit; padding:.15rem .6rem; border:1px solid #a9a29a; border-radius:.3rem;
    background:#fff; color:#1c1a18; cursor:pointer }
  .kmt-bar .cnt { color:#6b655c }
  body.kmt-has-bar { padding-top:3.2rem }
  body { zoom:var(--kmt-zoom, 1) }
  @media print { body { zoom:1 } }
  .kmt-cur { outline:2px solid #b3272d; outline-offset:3px; border-radius:3px }
  @media (max-width:700px) {
    .kmt-bar { top:auto; bottom:0; border-bottom:0; border-top:1px solid #d8d3cc }
    body.kmt-has-bar { padding-top:0; padding-bottom:4rem }
    .kmt-hint { bottom:4.2rem }
  }
  @media print { .kmt-badge, .kmt-hint, .kmt-veil, .kmt-bar { display:none !important }
    body.kmt-has-bar { padding:0 } }
  </style>
  <script id="kmt-data" type="application/json">${json}</script>
  <script>
  // The script sits right after <body>; the document below it is not
  // parsed yet, so everything waits for the DOM.
  document.addEventListener('DOMContentLoaded', function () {
    var D = JSON.parse(document.getElementById('kmt-data').textContent);
    var T = D.t, byNr = {};
    D.comments.forEach(function (c) { (byNr[c.nr] = byNr[c.nr] || []).push(c); });
    var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var when = function (iso) { try { return new Date(iso).toLocaleString(D.locale, { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return iso; } };
    var veil = null;
    function close() { if (veil) { veil.parentNode.removeChild(veil); veil = null; } }
    function open(html) {
      close();
      veil = document.createElement('div'); veil.className = 'kmt-veil';
      veil.innerHTML = '<div class="kmt-box">' + html + '</div>';
      veil.addEventListener('click', function (e) { if (e.target === veil) close(); });
      document.body.appendChild(veil);
      return veil.firstChild;
    }
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    /* ---- anchors on every cue, so a link can point at a line ---- */
    var paras = [].slice.call(document.querySelectorAll('main p[data-nr]'));
    paras.forEach(function (p) { if (p.dataset.nr) p.id = 'nr-' + p.dataset.nr; });
    if (/^#nr-\d+$/.test(location.hash)) { var tgt = document.getElementById(location.hash.slice(1)); if (tgt) tgt.scrollIntoView({ block: 'center' }); }

    /* ---- badges ---- */
    function badge(nr) {
      var p = document.getElementById('nr-' + nr); if (!p) return;
      var old = p.querySelector('.kmt-badge'); if (old) old.parentNode.removeChild(old);
      var list = byNr[nr] || []; if (!list.length) return;
      var b = document.createElement('span'); b.className = 'kmt-badge' + (list.some(function (c) { return c.frage && !c.erledigt; }) ? ' q' : '');
      b.textContent = '\u270e ' + list.length; b.title = T.comments;
      b.addEventListener('click', function (e) { e.stopPropagation(); showList(nr); });
      p.appendChild(b);
    }
    Object.keys(byNr).forEach(badge);

    function item(c) {
      return '<div class="kmt-item">' +
        ((D.all || (D.me && c.wer === D.me.b)) ? '<button class="del" data-id="' + esc(c.id) + '">' + esc(T.del) + '</button>' : '') +
        '<div class="who">' + esc(c.name) + ' \u00b7 ' + esc(when(c.datum)) +
        (c.frage ? ' \u00b7 <span class="q">' + esc(T.question_mark) + (c.erledigt ? ' \u2713 ' + esc(T.done) : '') + '</span>' : '') + '</div>' +
        '<div>' + esc(c.text).replace(/\\n/g, '<br>') + '</div>' +
        (c.antwort ? '<div class="ans"><div class="who">' + esc(T.answer) + ' \u00b7 ' + esc(c.antwort.wer || '') + ' \u00b7 ' + esc(when(c.antwort.datum)) + '</div>' +
          esc(c.antwort.text).replace(/\\n/g, '<br>') + '</div>' : '') + '</div>';
    }
    function showList(nr) {
      var list = byNr[nr] || [];
      var box = open('<h3>' + esc(T.comments) + ' \u2013 ' + nr + '</h3>' + list.map(item).join('') +
        (D.me ? '<button class="q" id="kmt-add">' + esc(T.new_).replace('{nr}', nr) + '</button>' : '') +
        '<button class="q" id="kmt-close">' + esc(T.close) + '</button>');
      box.querySelector('#kmt-close').onclick = close;
      var add = box.querySelector('#kmt-add'); if (add) add.onclick = function () { showNew(nr); };
      [].forEach.call(box.querySelectorAll('.del'), function (b) { b.onclick = function () { remove(b.dataset.id, nr); }; });
    }
    function post(fields) {
      var body = Object.keys(fields).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(fields[k]); }).join('&');
      return fetch('/theater/druck/' + D.token + '/kommentar', { method: 'POST', credentials: 'same-origin',
        headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: body }).then(function (r) { return r.json(); });
    }
    function showNew(nr) {
      var p = document.getElementById('nr-' + nr);
      var snip = p ? p.textContent.replace(/\s+/g, ' ').trim().slice(0, 140) : '';
      if (!D.me) { open('<p>' + esc(T.signin) + '</p><button class="q" id="kmt-close">' + esc(T.close) + '</button>').querySelector('#kmt-close').onclick = close; return; }
      var box = open('<h3>' + esc(T.new_).replace('{nr}', nr) + '</h3><div class="snip">' + esc(snip) + '</div>' +
        '<textarea id="kmt-text"></textarea>' +
        '<label><input type="checkbox" id="kmt-q"> ' + esc(T.question) + '</label>' +
        '<button id="kmt-save">' + esc(T.save) + '</button><button class="q" id="kmt-cancel">' + esc(T.cancel) + '</button>');
      box.querySelector('#kmt-cancel').onclick = close;
      box.querySelector('#kmt-text').focus();
      box.querySelector('#kmt-save').onclick = function () {
        var text = box.querySelector('#kmt-text').value.trim(); if (!text) return;
        post({ action: 'neu', doc: D.doc, nr: nr, auszug: snip, text: text, frage: box.querySelector('#kmt-q').checked ? '1' : '', wer: D.me.b })
          .then(function (r) { if (!r.ok) { alert(T.failed); return; } (byNr[nr] = byNr[nr] || []).push(r.comment); badge(nr); showList(nr); })
          .catch(function () { alert(T.failed); });
      };
    }
    function remove(id, nr) {
      post({ action: 'loeschen', id: id, wer: D.me ? D.me.b : '' }).then(function (r) {
        if (!r.ok) { alert(T.failed); return; }
        byNr[nr] = (byNr[nr] || []).filter(function (c) { return c.id !== id; }); badge(nr); showList(nr);
      });
    }
    /* double click on a line: comment on it (or on the last cue before it) */
    document.addEventListener('dblclick', function (e) {
      var p = e.target.closest ? e.target.closest('main p, main td p') : null;
      if (!p || p.classList.contains('szende') || p.closest('.szkopf')) return;
      var nr = p.dataset.nr;
      if (!nr) { var q = p; while (q && !nr) { q = q.previousElementSibling; if (q && q.dataset && q.dataset.nr) nr = q.dataset.nr; } }
      if (!nr) return;
      var sel = window.getSelection && window.getSelection(); if (sel && sel.removeAllRanges) sel.removeAllRanges();
      showNew(nr);
    });
    if (D.me) { var h = document.createElement('div'); h.className = 'kmt-hint'; h.textContent = T.hint; document.body.appendChild(h); }

    /* ---- the rehearsal plan: jump between the scenes of a rehearsal ---- */
    var scenes = [];
    if (D.doc === 'probenplan') {
      var heads = [].slice.call(document.querySelectorAll('main .szkopf'));
      scenes = heads.map(function (el, i) {
        var probe = (el.querySelector('.szn') ? el.querySelector('.szn').firstChild.textContent : '').trim();
        var sz = (el.querySelector('.szp') ? el.querySelector('.szp').textContent : '').trim();
        el.id = 'szk-' + i;
        return { i: i, probe: probe, scene: sz, who: (el.querySelector('.szwer') || {}).textContent || '', where: (el.querySelector('.szwo') || {}).textContent || '' };
      });
      var nav = function (cur) {
        var same = scenes.filter(function (s) { return s.probe === cur.probe; });
        var probes = []; scenes.forEach(function (s) { if (probes.indexOf(s.probe) < 0) probes.push(s.probe); });
        var box = open('<h3>' + esc(cur.probe) + ' \u2013 ' + esc(cur.who) + '</h3><div class="kmt-nav">' +
          '<div class="grp">' + esc(T.scenes) + '</div>' +
          same.map(function (s) { return '<a href="#szk-' + s.i + '"' + (s.i === cur.i ? ' class="on"' : '') + '>' + esc(s.scene) + ' \u00b7 ' + esc(s.where) + '</a>'; }).join('') +
          '<div class="grp">' + esc(T.rehearsals) + '</div>' +
          probes.map(function (pn) { var first = scenes.filter(function (s) { return s.probe === pn; })[0];
            return '<a href="#szk-' + first.i + '"' + (pn === cur.probe ? ' class="on"' : '') + '>' + esc(pn) + ' \u00b7 ' + esc(first.who) + '</a>'; }).join('') +
          '</div><button class="q" id="kmt-close">' + esc(T.close) + '</button>');
        box.querySelector('#kmt-close').onclick = close;
        [].forEach.call(box.querySelectorAll('a'), function (a) { a.onclick = function () { close(); }; });
      };
      heads.forEach(function (el, i) { el.addEventListener('click', function () { nav(scenes[i]); }); });
      [].forEach.call(document.querySelectorAll('main p.szende'), function (el) {
        el.addEventListener('click', function () {
          var m = /Ende (Probe \d+), Szene (\d+)/.exec(el.textContent) || [];
          var cur = scenes.filter(function (s) { return s.probe === m[1] && s.scene === 'Szene ' + m[2]; })[0] || scenes.filter(function (s) { return s.probe === m[1]; })[0];
          if (cur) nav(cur);
        });
      });
    }

    /* ---- the fixed bar: rehearsals and scenes, previous and next comment.
       Top of the screen on a desk, bottom on a phone; never printed. ---- */
    var bar = document.createElement('div'); bar.className = 'kmt-bar';
    var inner = '';
    /* whose lines are marked: the signed-in person to begin with, any
       person by choice - the director works with the view that way */
    var personB = D.me ? D.me.b : (D.people[0] ? D.people[0].b : '');
    if (D.people.length) inner += '<label>' + esc(T.person) + ' <select id="kmt-person">' +
      D.people.map(function (x) { return '<option value="' + esc(x.b) + '"' + (x.b === personB ? ' selected' : '') + '>' + esc(x.b) + '</option>'; }).join('') +
      '</select></label>';
    if (scenes.length) {
      // rehearsals in their order 1..N, scenes all of them
      var probeNr = function (pn) { var m = /(\d+)/.exec(pn); return m ? Number(m[1]) : 0; };
      var probes = []; scenes.forEach(function (s) { if (probes.indexOf(s.probe) < 0) probes.push(s.probe); });
      probes.sort(function (a, b) { return probeNr(a) - probeNr(b) || a.localeCompare(b); });
      inner += '<label>' + esc(T.rehearsal) + ' <select id="kmt-probe">' +
        probes.map(function (pn) { return '<option value="' + esc(pn) + '">' + esc(pn) + '</option>'; }).join('') + '</select></label>' +
        '<label>' + esc(T.scene) + ' <select id="kmt-scene">' +
        scenes.map(function (s) { return '<option value="' + s.i + '">' + esc(T.scene_of.replace('{k}', s.i + 1).replace('{n}', scenes.length)) + ' \u00b7 ' + esc(s.probe) + '</option>'; }).join('') +
        '</select></label>';
    }
    inner += '<span class="grp"><button type="button" id="kmt-me-prev" title="' + esc(T.prev_mine) + '">\u25c0 <span class="who"></span></button>' +
             '<button type="button" id="kmt-me-next" title="' + esc(T.next_mine) + '"><span class="who"></span> \u25b6</button></span>' +
             '<span class="grp"><button type="button" id="kmt-prev" title="' + esc(T.prev) + '">\u25c0 \u270e</button>' +
             '<button type="button" id="kmt-next" title="' + esc(T.next) + '">\u270e \u25b6</button>' +
             '<span class="cnt" id="kmt-cnt"></span></span>' +
             '<span class="grp zoom"><button type="button" id="kmt-zoom-out" title="' + esc(T.zoom_out) + '">A\u2212</button>' +
             '<button type="button" id="kmt-zoom-in" title="' + esc(T.zoom_in) + '">A+</button></span>';
    bar.innerHTML = inner;
    document.body.appendChild(bar); document.body.classList.add('kmt-has-bar');
    var jump = function (el) { if (el) { el.scrollIntoView({ block: 'start' }); if (window.innerWidth > 700) window.scrollBy(0, -bar.offsetHeight - 8); } };
    if (scenes.length) {
      var selP = bar.querySelector('#kmt-probe'), selS = bar.querySelector('#kmt-scene');
      var firstOf = function (pn) { return scenes.filter(function (s) { return s.probe === pn; })[0]; };
      selP.onchange = function () { var f = firstOf(selP.value); if (f) { selS.value = String(f.i); jump(document.getElementById('szk-' + f.i)); } };
      selS.onchange = function () { var s = scenes[Number(selS.value)]; if (s) { selP.value = s.probe; jump(document.getElementById('szk-' + s.i)); } };
      var syncing = false;
      window.addEventListener('scroll', function () {
        if (syncing) return; syncing = true;
        setTimeout(function () {
          syncing = false;
          var cur = null;
          scenes.forEach(function (s) { var el = document.getElementById('szk-' + s.i); if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) cur = s; });
          if (cur && (selP.value !== cur.probe || String(selS.value) !== String(cur.i))) { selP.value = cur.probe; selS.value = String(cur.i); }
        }, 150);
      });
    }
    var count = function () {
      var n = document.querySelectorAll('.kmt-badge').length;
      bar.querySelector('#kmt-cnt').textContent = n ? '\u270e ' + n : T.none;
    };
    count();

    /* ---- stepping: a cursor per kind, one step at a time, the target framed.
       The first press starts from what is on screen. ---- */
    var cursors = {};
    var step = function (dir, selector) {
      selector = selector || '.kmt-badge';
      var list = [].slice.call(document.querySelectorAll(selector)).map(function (el) { return el.closest('p') || el; });
      if (!list.length) return;
      var c = cursors[selector];
      if (!c || c.length !== list.length || list.indexOf(c.el) < 0) {
        var mid = window.innerHeight * 0.4, at = -1;
        list.forEach(function (el, i) { if (at < 0 && el.getBoundingClientRect().top > mid) at = i; });
        if (at < 0) at = list.length;
        c = cursors[selector] = { length: list.length, idx: dir > 0 ? at - 1 : at, el: null };
      }
      c.idx = Math.max(0, Math.min(list.length - 1, c.idx + dir));
      c.el = list[c.idx];
      [].forEach.call(document.querySelectorAll('.kmt-cur'), function (x) { x.classList.remove('kmt-cur'); });
      c.el.classList.add('kmt-cur');
      c.el.scrollIntoView({ block: 'center' });
    };
    bar.querySelector('#kmt-prev').onclick = function () { step(-1); };
    bar.querySelector('#kmt-next').onclick = function () { step(1); };

    /* ---- the type size of this view, remembered on the device ---- */
    var ZOOMS = [0.8, 0.9, 1, 1.15, 1.3, 1.5];
    var zi = 2; try { zi = Math.max(0, Math.min(ZOOMS.length - 1, Number(localStorage.getItem('kmt-zoom') || 2))); } catch (e) {}
    var applyZoom = function () { document.documentElement.style.setProperty('--kmt-zoom', ZOOMS[zi]); try { localStorage.setItem('kmt-zoom', String(zi)); } catch (e) {} };
    applyZoom();
    bar.querySelector('#kmt-zoom-in').onclick = function () { if (zi < ZOOMS.length - 1) { zi++; applyZoom(); } };
    bar.querySelector('#kmt-zoom-out').onclick = function () { if (zi > 0) { zi--; applyZoom(); } };

    /* ---- reading as oneself: own lines marked, the own name in the
       directions too, and two buttons that hop from one to the next ---- */
    var isWord = function (c) { return !!c && /[A-Za-z0-9\u00c0-\u024f]/.test(c); };
    var markPerson = function (name) {
      // undo the previous person's marks
      [].forEach.call(document.querySelectorAll('main p.speech.kmt-mine'), function (p) { p.classList.remove('kmt-mine'); });
      [].forEach.call(document.querySelectorAll('main span.kmt-wrap'), function (sp) { sp.replaceWith(document.createTextNode(sp.textContent)); });
      cursors = {};
      [].forEach.call(document.querySelectorAll('.kmt-cur'), function (x) { x.classList.remove('kmt-cur'); });
      [].forEach.call(bar.querySelectorAll('.who'), function (w) { w.textContent = name; });
      if (!name) return;
      [].forEach.call(document.querySelectorAll('main p.speech[data-ensemble]'), function (p) {
        if (p.dataset.ensemble === name) p.classList.add('kmt-mine');
      });
      var markName = function (text) {
        var out = '', i = 0, idx;
        while ((idx = text.indexOf(name, i)) >= 0) {
          var ok = !isWord(text.charAt(idx - 1)) && !isWord(text.charAt(idx + name.length));
          out += esc(text.slice(i, idx)) + (ok ? '<mark class="kmt-me">' + esc(name) + '</mark>' : esc(name));
          i = idx + name.length;
        }
        return out + esc(text.slice(i));
      };
      [].forEach.call(document.querySelectorAll('main [data-sem="regieanweisung"], main .dir'), function (d) {
        var walker = document.createTreeWalker(d, NodeFilter.SHOW_TEXT), nodes = [], n;
        while ((n = walker.nextNode())) if (n.nodeValue.indexOf(name) >= 0) nodes.push(n);
        nodes.forEach(function (tn) {
          var html = markName(tn.nodeValue);
          if (html.indexOf('<mark') < 0) return;
          var span = document.createElement('span'); span.className = 'kmt-wrap'; span.innerHTML = html;
          tn.parentNode.replaceChild(span, tn);
        });
      });
    };
    markPerson(personB);
    var selPerson = bar.querySelector('#kmt-person');
    if (selPerson) selPerson.onchange = function () { markPerson(selPerson.value); };
    bar.querySelector('#kmt-me-prev').onclick = function () { step(-1, 'p.speech.kmt-mine'); };
    bar.querySelector('#kmt-me-next').onclick = function () { step(1, 'p.speech.kmt-mine'); };
    var oldBadge = badge;
    badge = function (nr) { oldBadge(nr); count(); };
  });
  </script>`;
}

/* ---------- the comments page for the director ---------- */
const docName = (d) => t(d === 'rolle' ? 'cmt.doc_rolle' : d === 'probenplan' ? 'cmt.doc_probenplan' : 'cmt.doc_gesamt');
const commentLink = (p, c) => p.druck_token
  ? `/theater/druck/${h(p.druck_token)}/gesamt?ich=${encodeURIComponent(c.wer)}#nr-${encodeURIComponent(c.nr)}` : '#';

function commentsPage(p, m) {
  const all = [...(p.kommentare || [])].sort((a, b) => String(b.datum).localeCompare(String(a.datum)));
  const nameOf = (b) => (p.personen || []).find(x => x.b === b)?.name || b;
  const item = (c) => `<div class="box cmt${c.frage && !c.erledigt ? ' important' : ''}">
      <div class="small muted">${h(nameOf(c.wer))} \u00b7 ${h(L.date(c.datum, { dateStyle: 'medium', timeStyle: 'short' }))}
        \u00b7 ${docName(c.dokument)} \u00b7 <a href="${commentLink(p, c)}" target="_blank" rel="noopener">${
        t('cmt.at', { nr: h(String(c.nr)) })}</a>
        ${c.frage ? `\u00b7 <span class="open">${t('cmt.question')}</span>` : ''}
        ${c.erledigt ? `\u00b7 <span style="color:var(--good)">${t('cmt.done')}</span>` : ''}</div>
      ${c.auszug ? `<div class="small muted"><i>${h(c.auszug)}</i></div>` : ''}
      <p style="margin:.4rem 0">${h(c.text).replace(/\n/g, '<br>')}</p>
      ${c.antwort ? `<div class="answer"><div class="small muted">${t('cmt.answer')} \u00b7 ${h(c.antwort.wer || '')} \u00b7 ${
        h(L.date(c.antwort.datum, { dateStyle: 'medium', timeStyle: 'short' }))}</div>${h(c.antwort.text).replace(/\n/g, '<br>')}</div>` : ''}
      ${actionForm('/theater/kommentare', 'antwort', { id: c.id },
        `<input type="text" name="text" value="${h(c.antwort?.text || '')}" placeholder="${h(t('cmt.answer_hint'))}">
         <button class="quiet mini" type="submit">${h(t('cmt.answer_save'))}</button>`)}
      <div style="margin-top:.3rem">
        ${actionForm('/theater/kommentare', 'erledigt', { id: c.id },
          '<button class="quiet mini" type="submit">' + h(t(c.erledigt ? 'cmt.reopen' : 'cmt.done_mark')) + '</button>')}
        ${actionForm('/theater/kommentare', 'loeschen', { id: c.id },
          '<button class="quiet mini" type="submit">' + h(t('cmt.delete')) + '</button>',
          { confirm: t('cmt.delete_confirm') })}
      </div>
    </div>`;
  const questions = all.filter(c => c.frage && !c.erledigt);
  const rest = all.filter(c => !(c.frage && !c.erledigt));
  return page({ title: t('cmt.title'), nav: navDirector(p), body: `
    <p class="eyebrow">${h(p.titel)}</p><h1>${t('cmt.title')}</h1>
    ${notice(m)}
    <p class="muted">${t('cmt.what')}</p>
    <h2>${t('cmt.questions')} (${questions.length})</h2>
    ${questions.length ? questions.map(item).join('') : `<p class="small muted">${t('cmt.no_questions')}</p>`}
    <h2>${t('cmt.all')} (${rest.length})</h2>
    ${rest.length ? rest.map(item).join('') : `<p class="small muted">${t('cmt.none')}</p>`}` });
}

/* ---------- a member's own comments, with the director's answers ---------- */
function myCommentsPage(project, person, m) {
  const mine = [...(project.kommentare || [])].filter(c => c.wer === person.b)
    .sort((a, b) => String(b.datum).localeCompare(String(a.datum)));
  const item = (c) => `<div class="box cmt">
      <div class="small muted">${h(L.date(c.datum, { dateStyle: 'medium', timeStyle: 'short' }))}
        \u00b7 ${docName(c.dokument)} \u00b7 <a href="${commentLink(project, c)}" target="_blank" rel="noopener">${
        t('cmt.at', { nr: h(String(c.nr)) })}</a>
        ${c.frage ? `\u00b7 <span class="open">${t('cmt.question')}</span>` : ''}
        ${c.erledigt ? `\u00b7 <span style="color:var(--good)">${t('cmt.done')}</span>` : ''}</div>
      ${c.auszug ? `<div class="small muted"><i>${h(c.auszug)}</i></div>` : ''}
      <p style="margin:.4rem 0">${h(c.text).replace(/\n/g, '<br>')}</p>
      ${c.antwort ? `<div class="answer"><div class="small muted">${t('cmt.answer')} \u00b7 ${h(c.antwort.wer || '')} \u00b7 ${
        h(L.date(c.antwort.datum, { dateStyle: 'medium', timeStyle: 'short' }))}</div>${h(c.antwort.text).replace(/\n/g, '<br>')}</div>` : ''}
    </div>`;
  return page({ title: t('mcmt.title'), nav: navMember(project, person), tabbar: memberTabbar(project, person), narrow: true, body: `
    <p class="eyebrow">${h(project.titel)}</p><h1>${t('mcmt.title')}</h1>
    ${notice(m)}
    <p class="muted">${t('mcmt.what')}</p>
    ${mine.length ? mine.map(item).join('') : `<p class="small muted">${t('mcmt.none')}</p>`}` });
}

/* The error page is given keys, not sentences - it is called from
   everywhere, including places that know no language. */
const errorPage = (titelSchluessel, textSchluessel, werte) => page({
  title: t(titelSchluessel), narrow: true,
  body: `<p class="eyebrow">${t('common.error')}</p>
           <h1>${t(titelSchluessel)}</h1>
           <p class="muted">${t(textSchluessel, werte)}</p>
           <a class="btn quiet" href="/theater">${h(t('common.back'))}</a>` });

  return { backBar, switchPage, castPage, printPage, docsPage, errorPage, audiobookPage,
           myTimesPage, companyPage, myDatesPage, memberPage, pickNamePage, planPage,
           passagesPage, projectPage, uploadPage, entryPage, datesPage, aboutPage,
           adminLoginPage, adminPage, versionPage, docExtras, commentsPage, myCommentsPage, bookPage,
           settingsPage, playPage, offlinePage };
}
