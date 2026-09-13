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
import { language } from './texts.mjs';
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
export function views(code, pfad = '/theater') {
  const L = language(code);
  const t = L.t;



function page({ title, body, nav = '', narrow = false }) {
  const name = t('app.name');
  return `<!doctype html><html lang="${L.code}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${h(title === name ? name : title + ' \u2013 ' + name)}</title><style>${STYLE}</style></head><body>
<header class="head"><div class="inner">
  <a class="brand" href="/theater">${h(name.toUpperCase())}</a>${nav}${L.picker(pfad)}
</div></header>
<div class="frame${narrow ? ' narrow' : ''}">${body}</div>
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

const entryPage = (m) => page({
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
    <p class="small muted">${t('entry.more')}</p>
    <p class="small muted">${t('entry.open_source')}</p>`
});

/* ---------- Regie ---------- */

const navDirector = `<nav>
  <a href="/theater/projekt">${t('nav.overview')}</a>
  <a href="/theater/leute">${t('nav.company')}</a>
  <a href="/theater/skript">${t('nav.script')}</a>
  <a href="/theater/besetzung">${t('nav.casting')}</a>
  <a href="/theater/plan">${t('nav.rehearsals')}</a>
  <a href="/theater/termine">${t('nav.dates')}</a>
  <a href="/theater/drucken">${t('nav.print')}</a>
  <a href="/theater/hoerbuch">${t('nav.audiobook')}</a>
  <a href="/theater/abmelden">${t('nav.signout')}</a></nav>`;

function printPage(p, m) {
  const d = p.drehbuch;
  if (!d) return page({ title: t('print.print'), nav: navDirector, body: `
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

  return page({ title: t('print.print'), nav: navDirector, body: `
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
  const withEntry = Object.values(p.verfuegbar || {})
    .filter(v => Object.keys(v.tage || {}).length || (v.wochentage || []).length).length;
  const folks = (p.personen || []).length;
  const hasScript = !!p.drehbuch;
  const takenOver = !!p.skript_ueberblick;
  const u = p.skript_ueberblick;

  const row = (action, body) => `<tr><th>${action}</th><td>${body}</td></tr>`;
  const unresolved = (text, target, goto) =>
    `<span class="open">${text}</span> \u2013 <a href="${goto}">${target}</a>`;

  return page({ title: p.titel, nav: navDirector, body: `
    <p class="eyebrow">${t('proj.project')}</p><h1>${h(p.titel)}</h1>
    ${notice(m)}
    <table>
      ${row(t('proj.company'), folks
        ? t('proj.people_yes', { n: folks, m: withEntry })
        : t('proj.people_no'))}
      ${row(t('proj.script'), hasScript
        ? t('proj.script_yes', { source: h(p.drehbuch.quelle),
                             n: (p.drehbuch.sprecher || []).length })
        : unresolved(t('proj.script_no'), t('proj.script_upload'), '/theater/skript'))}
      ${row(t('proj.casting'), takenOver
        ? t('proj.cast_yes', { speeches: u.repliken, people: u.personen, roles: u.rollen })
        : (hasScript
            ? unresolved(t('proj.cast_open'), t('proj.cast_assign'), '/theater/besetzung')
            : t('proj.cast_waits')))}
      ${row(t('proj.rehearsals'), rehearsalCount
        ? t('proj.plan_yes', { n: rehearsalCount,
                             substitution: L.percent(p.plan.ersatzanteil || 0),
                             coverage: L.percent(p.plan.abdeckung || 0) })
        : (takenOver
            ? unresolved(t('proj.plan_no'), t('proj.plan_derive'), '/theater/plan')
            : t('proj.plan_waits')))}
      ${row(t('proj.dates'), rehearsalCount
        ? t('proj.dates_yes') : t('proj.dates_waits'))}
    </table>

    ${folks ? `<h2>${t('proj.link_company')}</h2>
      <p class="small muted">${t('proj.link_company_what')}</p>
      <div class="box">${copyLink(p.gruppenlink || '')}</div>` : ''}

    ${p.regielink ? `<h2>${t('proj.link_director')}</h2>
      <p class="small muted">${t('proj.link_director_what')}</p>
      <div class="box">${copyLink(p.regielink)}
        ${actionForm('/theater/leute', 'neuerregielink', {},
          '<button class="quiet mini" type="submit">' + h(t('proj.link_new')) + '</button>',
          { confirm: t('proj.link_new_confirm') })}
      </div>` : ''}

    <h2>${t('proj.road')}</h2>
    <ol class="small muted">
      <li>${t('proj.road_1')}</li>
      <li>${t('proj.road_2')}</li>
      <li>${t('proj.road_3')}</li>
      <li>${t('proj.road_4')}</li>
      <li>${t('proj.road_5')}</li>
    </ol>` });
}

function uploadPage(p, m) {
  const d = p.drehbuch;
  const u = p.skript_ueberblick;
  return page({ title: t('proj.script'), nav: navDirector, body: `
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
  return page({ title: t('ver.title', { nr: v.nr, before: before.nr }), nav: navDirector, body: `
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
  if (!d) return page({ title: t('cast.title'), nav: navDirector, body: `
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
      <td><input type="text" name="name_${h(x.token)}" value="${h(e.name || '')}"
                 class="whosel" placeholder="${h(t('cast.who_plays'))}"${
                 isPerson ? '' : ' hidden'}></td>
    </tr>`;
  };

  return page({ title: t('cast.title'), nav: navDirector, body: `
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
      { n: people.length, folks: people.map(h).join(', ') })}</p>` : ''}
    <script>
    // The target field belongs to role and spelling, the name to the
    // person. What does not fit is hidden, not merely ignored.
    [].forEach.call(document.querySelectorAll('#bes tr'), function (tr) {
      var art = tr.querySelector('select.kindsel');
      if (!art) return;
      var target = tr.querySelector('select.targetsel'), who = tr.querySelector('input.whosel');
      function richte() {
        var a = art.value;
        if (target) target.hidden = (a !== 'rolle' && a !== 'alias');
        if (who) who.hidden = (a !== 'person');
      }
      art.addEventListener('change', richte);
      richte();
    });
    <\/script>` });
}

function planPage(p, m) {
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
      <td class="actions">
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
      </td>
    </tr>`;
  };

  return page({ title: t('plan.title'), nav: navDirector, body: `
    <p class="eyebrow">${t('plan.step')}</p><h1>${t('plan.title')}</h1>
    ${notice(m)}
    ${p.plan?.abgleich?.unsicher?.length ? `<div class="notice error">${
      t('plan.unsure_notice', { ids: p.plan.abgleich.unsicher.map(h).join(', ') })}</div>` : ''}
    ${!hasStructure ? `<div class="notice error">${t('plan.no_cast')}</div>` : `
    <p class="muted">${t('plan.what')}</p>
    <form method="post" action="/theater/plan"${rehearsals.length
      ? ' onsubmit="return confirm(' + JSON.stringify(t('plan.rederive_confirm'))
          .replace(/"/g, '&quot;') + ')"'
      : ''}>
      <input type="hidden" name="action" value="ableiten">
      <div class="row">
        <div><label for="substitution">${t('plan.substitution')}</label>
          ${choose('substitution', [[0, t('plan.sub_0')], [5, L.percent(0.05)],
                            [10, t('plan.sub_10')], [15, L.percent(0.15)],
                            [20, t('plan.sub_20')], [25, L.percent(0.25)],
                            [30, L.percent(0.30)]], substitution)}</div>
        <div><label for="until">${t('plan.until')}</label>
          <input type="date" id="until" name="until" value="${h(p.einstellungen?.bis || '')}"></div>
        <div><label for="maxgruppe">${t('plan.max_group')}</label>
          ${choose('maxgruppe', [[2, t('plan.people_n', { n: 2 })], [3, '3'], [4, '4'],
                               [5, '5'], [6, '6'], [7, '7']], maxG)}</div>
      </div>
      <p class="small muted" style="margin-top:.8rem">${t('plan.period_what')}<br>
      ${t('plan.sub_what')}</p>
      <button type="submit">${rehearsals.length
        ? t('plan.rederive') : t('plan.derive')}</button>
    </form>`}

    ${rehearsals.length ? `
      <h2>${t('plan.n_rehearsals', { n: rehearsals.length })}</h2>
      <p class="small muted">${t('plan.figures', {
        substitution: L.percent(p.plan.ersatzanteil || 0),
        max: p.plan.max_gruppe,
        coverage: L.percent(p.plan.abdeckung || 0, 1) })}
      ${p.plan.bearbeitet ? t('plan.revised',
        { when: h(L.date(p.plan.bearbeitet)) }) : ''}</p>
      <table class="plan"><tr><th>${t('plan.col_rehearsal')}</th>
        <th>${t('plan.col_cast')}</th><th>${t('plan.col_revise')}</th></tr>
      ${rehearsals.map(row).join('')}</table>
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
function passagesPage(p, d, m) {
  const pr = d.rehearsal;

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

  return page({ title: t('text.title', { id: pr.id }), nav: navDirector, body: `
    <p class="eyebrow"><a href="/theater/plan">${t('text.back')}</a></p>
    <h1>${t('text.title', { id: h(pr.id) })}</h1>
    ${notice(m)}
    <p>${pr.gruppe.map(x => `<span class="chip">${h(x)}</span>`).join('')}</p>
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
    <p class="eyebrow" style="margin-top:2rem"><a href="/theater/plan">${
      t('text.back_long')}</a></p>` });
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

  return page({ title: t('ab.title'), nav: navDirector, body: `
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
    const evenings = Object.keys(v?.tage || {}).length;
    const wochentags = (v?.wochentage || []).length;
    return `<tr>
      <td><span class="chip">${h(x.b)}</span>
        ${x.funktion ? `<div class="small muted">${h(x.funktion)}</div>` : ''}</td>
      <td>${actionForm('/theater/leute', 'aendern', { id: x.id },
        `<input type="text" name="name" value="${h(x.name || '')}"
               placeholder="${h(t('comp.name_hint'))}">
        <button class="quiet mini" type="submit">${h(t('common.save'))}</button>`)}</td>
      <td class="small">${evenings
        ? `<span style="color:var(--good)">${t('comp.evenings', { n: evenings })}</span>`
        : (wochentags
            ? `<span style="color:var(--good)">${t('comp.entered')}</span>`
            : `<span class="open">${t('comp.still_missing')}</span>`)}</td>
      <td>${actionForm('/theater/leute', 'loeschen', { id: x.id },
        '<button class="quiet mini" type="submit">' + h(t('comp.remove')) + '</button>',
        { confirm: t('comp.remove_confirm', { who: x.b }) })}</td>
    </tr>`;
  };

  return page({ title: t('comp.title'), nav: navDirector, body: `
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
      <table><tr><th>${t('comp.col_short')}</th><th>${t('comp.col_name')}</th>
        <th>${t('comp.col_available')}</th><th></th></tr>
      ${p.personen.map(row).join('')}</table>
      <p class="small muted">${t('comp.comes_from')}</p>`
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

const navMember = (person) => `<nav>
  <a href="/theater/mit">${h(person.name || person.b)}</a>
  <a href="/theater/mit/zeiten">${t('navm.times')}</a>
  <a href="/theater/mit/termine">${t('navm.dates')}</a>
  <a href="/theater/mit/abmelden">${t('nav.signout')}</a></nav>`;

function memberPage(project, person, m, realSelf) {
  const v = project.verfuegbar?.[person.id] || {};
  const evenings = Object.keys(v.tage || {}).length;
  const rehearsals = (project.plan?.proben || []).filter(pr => pr.gruppe.includes(person.b));
  const fixed = (project.termine || []).filter(x => x.bestaetigt &&
    rehearsals.some(pr => pr.id === x.probe_id)).length;
  const who = person.name || person.b;

  /* The others one can switch to. Somebody with a task and no lines still
     enters times - so everyone is listed.                            */
  const others = (project.personen || []).filter(x => x.id !== person.id);

  return page({ title: who, nav: navMember(person), narrow: true, body: `
    <p class="eyebrow">${h(project.titel)}</p>
    <h1>${t('mem.hello', { name: h(who) })}</h1>
    ${notice(m)}
    ${realSelf ? `<div class="notice foreign">${t('mem.for_other', { name: h(who) })}
      ${actionForm('/theater/mit', 'wechseln', { person: realSelf.id },
        '<button class="quiet mini">' +
        t('mem.back_to', { name: h(realSelf.name || realSelf.b) }) + '</button>')}
      </div>` : ''}
    <table>
      <tr><th>${t('mem.my_times')}</th><td>${evenings
        ? t('mem.evenings_yes', { n: evenings })
        : t('mem.evenings_no')}</td></tr>
      <tr><th>${t('mem.my_rehearsals')}</th><td>${rehearsals.length
        ? t('mem.rehearsals_yes', { n: rehearsals.length, fixed })
        : t('mem.rehearsals_no')}</td></tr>
      <tr><th>${t('mem.part_book')}</th><td>${project.drehbuch
        ? t('mem.book_open') : t('mem.no_script')}</td></tr>
      <tr><th>${t('mem.full_script')}</th><td>${project.drehbuch
        ? t('mem.full_open') : '<span class="muted">\u2014</span>'}</td></tr>
    </table>

    ${others.length ? `<div class="box">
      <p><b>${t('mem.switch')}</b></p>
      <p class="small muted">${t('mem.switch_what')}</p>
      ${actionForm('/theater/mit', 'wechseln', {},
        `<select name="person">
          <option value="">${h(t('mem.switch_who'))}</option>
          ${others.map(x => `<option value="${h(x.id)}">${
            h(x.name || x.b)}</option>`).join('')}
        </select>
        <button class="quiet mini">${h(t('mem.switch_go'))}</button>`,
        { confirm: t('mem.switch_confirm', { name: '\u2026' }) })}
      </div>` : ''}` });
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
function myDatesPage(project, person, result, m) {
  const mine = result.rehearsals.filter(pr => pr.group.includes(person.b));

  const row = (pr) => {
    const who = pr.group.filter(b => b !== person.b).map(b => {
      const x = (project.personen || []).find(y => y.b === b);
      return `<span class="chip" title="${h(x?.name || '')}">${h(b)}</span>`;
    }).join('') || `<span class="small muted">${t('mdate.alone')}</span>`;

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
        '<button class="mini" style="margin:.3rem 0 0">' +
        h(t('date.confirm')) + '</button>');
    } else {
      date = `<span class="open">${t('date.none_yet')}</span>
        <div class="small muted">${whyNot(pr)}</div>`;
    }
    return `<tr${pr.fixed ? ' class="isfixed"' : ''}>
      <td>${h(pr.id)}<div class="small muted">${t('common.minutes',
        { n: Math.round(pr.minutes) })}</div></td>
      <td>${t('mdate.with', { who })}</td>
      <td>${date}${button}</td></tr>`;
  };

  const header = `<tr><th>${t('date.col_rehearsal')}</th><th>${t('mdate.col_with')}</th>
    <th>${t('date.col_date')}</th></tr>`;
  const fixed = mine.filter(x => x.fixed);
  const unresolved = mine.filter(x => !x.fixed);

  return page({ title: t('date.title'), nav: navMember(person), body: `
    <p class="eyebrow">${h(project.titel)}</p><h1>${t('mdate.title')}</h1>
    ${notice(m)}
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
  const rows = result.rehearsals.map(pr => {
    const who = pr.group.map(b => {
      const x = (p.personen || []).find(y => y.b === b);
      return `<span class="chip" title="${h(x?.name || '')}">${h(b)}</span>`;
    }).join('');

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
        '<button class="small" style="margin:.4rem 0 0; padding:.25rem .7rem">' +
        h(t('date.fix')) + '</button>');
    } else {
      date = `<span class="open">${t('date.none_possible')}</span>`;
    }

    const reason = pr.proposal ? '' : `<div class="small muted">${whyNot(pr)}</div>`;
    const alternatives = (!pr.fixed && pr.alternatives?.length)
      ? `<div class="small muted">${t('date.also', { days: pr.alternatives.map(x =>
          h(L.weekday(x.weekday, 'short')) + ' ' +
          h(L.date(x.date, { day: '2-digit', month: '2-digit' }))
          ).join(' · ') })}</div>` : '';

    return `<tr${pr.fixed ? ' class="isfixed"' : ''}>
      <td>${h(pr.id)}</td>
      <td>${who}<div class="small muted">${t('date.scenes_min', {
          scenes: (pr.scenes || []).length, min: Math.round(pr.minutes) })}</div></td>
      <td>${date}${reason}${alternatives}</td>
      <td>${button}<div class="small muted">${t('date.possible_n',
          { n: pr.possible.length })}</div></td>
    </tr>`;
  }).join('');

  const fixedCount = result.rehearsals.filter(x => x.fixed).length;
  return page({ title: t('date.title'), nav: navDirector, body: `
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

function myTimesPage(project, person, m, days, states) {
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

  const cell = (tg) => {
    const e = entered[tg.iso];
    const l = states?.[tg.iso] || { level: 0, canCome: [], fixed: [] };
    const classes = ['day', 'level' + l.level];
    if (e) classes.push('me');
    if (l.fixed?.length) classes.push('fixed');
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
      <span class="time">${e ? h(e.von + '\u2013' + e.bis) : ''}</span>
      <input type="hidden" name="t_${tg.iso}" value="${e ? '1' : ''}">
      <input type="hidden" name="v_${tg.iso}" value="${h(e?.von || '')}">
      <input type="hidden" name="b_${tg.iso}" value="${h(e?.bis || '')}">
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

  const count = Object.keys(entered).length;
  const shortDate = new Intl.DateTimeFormat(L.locale, { day: '2-digit', month: '2-digit' });
  const myDays = Object.entries(entered).sort()
    .map(([iso, z]) => {
      const d = new Date(iso + 'T00:00:00');
      return WOCHE[mondayIndex(d.getDay())] + ' ' + shortDate.format(d) +
             ' ' + z.von + '\u2013' + z.bis;
    });
  const preset = Object.values(entered)[0] || { von: '19:00', bis: '22:00' };
  const js = (schluessel, werte) => JSON.stringify(t(schluessel, werte));

  return page({ title: t('my.title'), nav: navMember(person), body: `
    <p class="eyebrow">${h(project.titel)}</p>
    <h1>${t('my.title')}</h1>
    ${notice(m)}

    ${count ? `<div class="box">
      <b>${count === 1 ? t('my.holds_1') : t('my.holds', { n: count })}</b>
      <div class="small muted" style="margin-top:.4rem; line-height:1.9">
        ${myDays.map(x => `<span class="chip">${h(x)}</span>`).join('')}
      </div>
      ${v.stand ? `<p class="small muted" style="margin:.6rem 0 0">${
        t('my.last_saved', { when: h(L.date(v.stand)) })}</p>` : ''}
    </div>` : `<p class="muted">${t('my.nothing')}</p>`}

    ${rehearsals.length ? `<p class="small muted">${t('my.needed_for',
      { n: rehearsals.length })}${rehearsals.map(pr => `<span class="chip"
      title="${h(t('my.with', { who: pr.gruppe.filter(b => b !== person.b).join(', ') }))}"
      >${h(pr.id)}</span>`).join('')}</p>` : ''}

    <form method="post" action="/theater/mit/zeiten" id="formular">
      <div class="calhead">
        <button type="button" id="zurueck" class="quiet mini">&lsaquo;</button>
        <b id="monatsname">${h(months[0]?.title || '')}</b>
        <button type="button" id="vor" class="quiet mini">&rsaquo;</button>
        <span class="small muted" id="zaehler">${
          h(t('my.evenings_n', { n: count }))}</span>
      </div>

      <div class="legend small">
        <span class="dot level3"></span> ${t('my.all_others')}
        <span class="dot level2"></span> ${t('my.half')}
        <span class="dot level1"></span> ${t('my.one')}
        <span class="dot me"></span> ${t('my.me')}
      </div>

      ${months.map(monthTable).join('')}
      <div id="tafel" class="box" hidden></div>

      <button type="submit">${t('my.save')}</button>
      <span class="small muted">${t('my.only_after')}</span>
    </form>

    <script>
    (function () {
      var months = [].slice.call(document.querySelectorAll('.month'));
      var names = ${JSON.stringify(Object.fromEntries(names))};
      var preset = ${JSON.stringify(preset)};
      var place = ${JSON.stringify(L.locale)};
      var W = { evenings: ${js('my.evenings_n', { n: '#' })},
                fixed: ${js('my.fixed_on')},
                absent: ${js('my.still_missing')},
                nurSie: ${js('my.only_you')},
                keine: ${js('my.no_rehearsal')},
                zeit: ${js('my.free_then')},
                von: ${js('my.from')}, bis: ${js('my.to')},
                ja: ${js('my.can')}, nein: ${js('my.cannot')},
                falsch: ${js('my.time_wrong')},
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
      function liste(s) {
        if (!s) return '\u2014';
        return s.split(',').filter(Boolean)
          .map(function (b) { return names[b] || b; }).join(', ');
      }
      var tafel = document.getElementById('tafel');

      function oeffne(td) {
        var iso = td.dataset.iso;
        var d = new Date(iso + 'T00:00:00');
        var vI = td.querySelector('input[name^="v_"]');
        var bI = td.querySelector('input[name^="b_"]');
        var tI = td.querySelector('input[name^="t_"]');
        var da = td.dataset.da, gesamt = td.dataset.gesamt;
        tafel.hidden = false;
        tafel.innerHTML =
          '<b>' + d.toLocaleDateString(place, { weekday: 'long', day: '2-digit',
              month: '2-digit', year: 'numeric' }) + '</b>' +
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
          '<button type="button" id="neint" class="quiet">' + W.nein + '</button>';

        document.getElementById('jat').onclick = function () {
          var a = document.getElementById('tv').value, b = document.getElementById('tb').value;
          if (!a || !b || b <= a) { alert(W.falsch); return; }
          tI.value = '1'; vI.value = a; bI.value = b;
          td.classList.add('me');
          td.querySelector('.time').textContent = a + '\u2013' + b;
          preset = { von: a, bis: b };
          tafel.hidden = true; zaehle();
        };
        document.getElementById('neint').onclick = function () {
          tI.value = ''; vI.value = ''; bI.value = '';
          td.classList.remove('me');
          td.querySelector('.time').textContent = '';
          tafel.hidden = true; zaehle();
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
           adminLoginPage, adminPage, versionPage };
}
