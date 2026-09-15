/* ---------------------------------------------------------------------
   The router of the rehearsal planner.

   Two ways in:
     director  by access code, good for one project
     company   by a personal link, without a code

   This is not access control in the strict sense: whoever has the link
   gets in. For a rehearsal plan that is enough, and the page says so.

   URL paths stay in German. They are in circulation - a printed part
   book carries /theater/druck/<token>/rolle/NAME - and renaming them
   would break every link already handed out. The same goes for the field
   names inside a stored record; see storage.mjs.
   --------------------------------------------------------------------- */

import crypto from 'node:crypto';
import * as S from './storage.mjs';
import { views, h } from './views.mjs';
import { fromHeader, isLanguage, language } from './texts.mjs';
import { proposeDates, calendarDays, dayStates, directorsOf } from './dates.mjs';
import { derivePlan, peopleOf, summaryOf, actsIn, unitsCoveredBy, mergeInto } from './plan.mjs';
import { readForm } from './formdata.mjs';
import * as B from './revise.mjs';
import { passagesOf } from './passages.mjs';
import * as HB from './audiobook.mjs';
import * as Throttle from './throttle.mjs';
import { readScript, readMarkdown, speechesOf, buildStructure, buildCast,
         mappingProposal, buildDocument } from './script.mjs';
import { compareSpeeches, realignPlan, rehearsalsByCue } from './versions.mjs';
import { partBook, wordsOf, wholePlay } from './book.mjs';
import * as Learn from './learn.mjs';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import nodePath from 'node:path';
import * as Demo from './demo.mjs';
import * as PWA from './pwa.mjs';
import { feedFor } from './ics.mjs';
import * as Push from './push.mjs';
import * as Reminders from './reminders.mjs';

const MEMBER = 'mitglied';

const SECRET = process.env.THEATER_GEHEIMNIS || crypto.randomBytes(32).toString('hex');
const COOKIE = 'probenplanung';

/* ---------- Kekse (signiert, damit niemand fremde Projekte oeffnet) ---------- */

function seal(value) {
  return crypto.createHmac('sha256', SECRET).update(value).digest('base64url').slice(0, 32);
}
function setCookie(response, projectId) {
  const value = projectId + '.' + seal(projectId);
  response.setHeader('Set-Cookie',
    `${COOKIE}=${value}; Path=/theater; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}; Secure`);
}
function clearCookie(response) {
  response.setHeader('Set-Cookie', `${COOKIE}=; Path=/theater; HttpOnly; SameSite=Lax; Max-Age=0`);
}
/* Who one REALLY is, while working for somebody else.

   Without this there would be no way back: the first cookie only says
   who is being entered for. This second one is set at the first switch
   and cleared as soon as one is back at oneself.                    */
const REALSELF = 'theater_ich';
/* The director's or assistant director's rights as a member.

   The company link lets anyone pick any name, so a name alone can carry
   no rights. This cookie is set only on the personal link
   (/theater/ich/<token>), which the director keeps to themselves; it
   survives switching to somebody else's calendar.                   */
const REGIE = 'theater_regie';

function setRegieCookie(response, projectId, personId) {
  const value = projectId + ':' + personId;
  addCookie(response, `${REGIE}=${value}.${seal(value)}; Path=/theater; HttpOnly; SameSite=Lax; ` +
    `Max-Age=${60 * 60 * 24 * 180}; Secure`);
}
/* The project the regie cookie opens - only while the person still has
   the flag on the company page. */
async function regieFrom(request, project) {
  const value = sealedCookie(request, REGIE);
  if (!value) return null;
  const [projectId, personId] = value.split(':');
  const p = project && project.id === projectId ? project : await S.read(projectId);
  if (!p) return null;
  const person = (p.personen || []).find(x => x.id === personId);
  return person && (person.regie || person.assistenz) ? { project: p, person } : null;
}
/* The administrator's session - see the admin branch below. */
const ADMIN_COOKIE = 'theater_admin';

function setRealSelfCookie(response, value) {
  addCookie(response, value === null
    ? `${REALSELF}=; Path=/theater; HttpOnly; SameSite=Lax; Max-Age=0`
    : `${REALSELF}=${value}.${seal(value)}; Path=/theater; HttpOnly; SameSite=Lax; ` +
      `Max-Age=${60 * 60 * 24 * 180}`);
}

/* Several cookies in one answer.

   setHeader would overwrite the previous one - but switching sets two,
   and one of them would be lost.                                    */
function addCookie(response, zeile) {
  const da = response.getHeader('Set-Cookie');
  response.setHeader('Set-Cookie',
    da ? (Array.isArray(da) ? [...da, zeile] : [da, zeile]) : zeile);
}

function setMemberCookie(response, projectId, personId) {
  const value = projectId + ':' + personId;
  response.setHeader('Set-Cookie',
    `${MEMBER}=${value}.${seal(value)}; Path=/theater; HttpOnly; SameSite=Lax; ` +
    `Max-Age=${60 * 60 * 24 * 180}; Secure`);
}
/* A cookie without a seal.

   The choice of language is a preference, not a permission - there is
   nothing to forge. It is checked against the list of languages we have
   anyway, and a seal here would be ritual without purpose.          */
function plainCookie(request, name) {
  for (const teil of (request.headers.cookie || '').split(';')) {
    const [k, ...rest] = teil.trim().split('=');
    if (k === name) return rest.join('=');
  }
  return null;
}

function sealedCookie(request, name) {
  for (const teil of (request.headers.cookie || '').split(';')) {
    const [k, ...rest] = teil.trim().split('=');
    if (k !== name) continue;
    const value = rest.join('=');
    const dot = value.lastIndexOf('.');
    if (dot < 1) return null;
    const payload = value.slice(0, dot), sig = value.slice(dot + 1);
    const want = seal(payload);
    if (sig.length === want.length &&
        crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return payload;
  }
  return null;
}
async function memberFrom(request) {
  const value = sealedCookie(request, MEMBER);
  if (!value) return null;
  const [projectId, personId] = value.split(':');
  const project = await S.read(projectId);
  if (!project) return null;
  const person = (project.personen || []).find(x => x.id === personId);
  return person ? { project, person } : null;
}

function projectIdFromCookie(request) {
  const raw = request.headers.cookie || '';
  for (const teil of raw.split(';')) {
    const [k, ...rest] = teil.trim().split('=');
    if (k !== COOKIE) continue;
    const value = rest.join('=');
    const dot = value.lastIndexOf('.');
    if (dot < 1) return null;
    const id = value.slice(0, dot), sig = value.slice(dot + 1);
    const want = seal(id);
    if (sig.length === want.length &&
        crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return id;
  }
  return null;
}

/* ---------- Formulare ---------- */

async function form(request, grenze = 2_000_000) {
  const chunks = [];
  let scope = 0;
  for await (const s of request) {
    scope += s.length;
    if (scope > grenze) throw new Error('Zu viele Daten.');
    chunks.push(s);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  const out = {};
  for (const [k, v] of new URLSearchParams(text)) out[k] = v;
  return out;
}

const html = (response, text, status = 200) => {
  response.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'same-origin',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(text);
};
const redirect = (response, target) => {
  response.writeHead(303, { Location: target, 'Cache-Control': 'no-store' });
  response.end();
};

/* Throw the request body away, but read it to the end.

   Somebody uploading a large file while signed out would otherwise get
   the refusal in the middle of sending. The browser is not finished,
   Apache resets the HTTP/2 stream, and instead of a message anyone can
   understand the browser shows ERR_HTTP2_PROTOCOL_ERROR.            */
/* Serve one audio track.

   With range requests, because otherwise there is no seeking in the
   browser: without a 206 the player loads the whole file before it jumps
   anywhere - at 60 MB that is plain to feel.                        */
async function serveAudio(response, project, name, request) {
  const raw = await S.getBlob(project.id, name);
  if (!raw) { response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
              return response.end('Diese Tonspur gibt es nicht.'); }

  const head = {
    'Content-Type': 'audio/mpeg',
    'Cache-Control': 'no-store',
    'Accept-Ranges': 'bytes',
    'Content-Disposition': 'inline; filename="' + name + '"',
  };
  const area = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range || '');
  if (!area) {
    response.writeHead(200, { ...head, 'Content-Length': raw.length });
    return response.end(raw);
  }
  const from = area[1] ? Number(area[1]) : 0;
  const to = area[2] ? Math.min(Number(area[2]), raw.length - 1) : raw.length - 1;
  if (from >= raw.length || to < from) {
    response.writeHead(416, { 'Content-Range': 'bytes */' + raw.length });
    return response.end();
  }
  response.writeHead(206, { ...head,
    'Content-Range': `bytes ${from}-${to}/${raw.length}`,
    'Content-Length': to - from + 1 });
  return response.end(raw.subarray(from, to + 1));
}

/* Why something failed, as a message.

   Errors from our own modules carry a key and are said in the visitor's
   language; anything else - a bug, a surprise from a library - shows its
   own wording, which is at least honest. */
const failureNotice = (e, fallbackKey) => e && e.key
  ? { kind: 'error', key: e.key, values: e.values }
  : { kind: 'error', key: fallbackKey, values: { reason: (e && e.message) || String(e) } };

/* The same, as a value to put into a sentence. */
const reasonOf = (e) => e && e.key ? { key: e.key, values: e.values }
                                   : ((e && e.message) || String(e));

/* After saving availability. */
const timesSaved = (n) => n
  ? { kind: 'good', key: n === 1 ? 'r.times_saved_1' : 'r.times_saved', values: { n } }
  : { kind: 'error', key: 'r.times_saved_none' };

/* After entering or clearing the place of a fixed date. The place comes
   from a visitor, so it is escaped here - the catalogue puts values in
   as they are. */
const placeNotice = (id, place) => place
  ? { kind: 'good', key: 'r.place_set', values: { id: h(id), place: h(place) } }
  : { kind: 'good', key: 'r.place_cleared', values: { id: h(id) } };

async function drainBody(request) {
  if (request.method !== 'POST' || request.readableEnded) return;
  try { for await (const _ of request) { /* wegwerfen */ } } catch { /* egal */ }
}

const time = s => /^([01]?\d|2[0-3]):[0-5]\d$/.test(String(s || '')) ? s : null;
const date = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')) ? s : null;

/* Eine fertig gesetzte Datei zum Herunterladen schicken. */
function sendFile(response, text, name) {
  const clean = name.replace(/[^\w \u00c0-\u024f.\u2013-]/g, '_');
  response.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Disposition': 'attachment; filename="' +
      clean.replace(/[^\x20-\x7e]/g, '_') + '"; filename*=UTF-8\'\'' +
      encodeURIComponent(clean),
    'Cache-Control': 'no-store',
  });
  response.end(text);
}

/* ---------- the script and its versions ----------

   Every uploaded script stays: the one before goes into
   project.fassungen (markdown only, not the original file), the new
   one becomes project.drehbuch with the next number. The rehearsal
   plan is carried along by content anchors (versions.mjs) rather than
   thrown away.                                                      */

const versionByNumber = (project, nr) => {
  if (!Number.isInteger(nr) || nr < 1) return null;
  if (project.drehbuch && (project.drehbuch.nr || 1) === nr) return project.drehbuch;
  return (project.fassungen || []).find(v => v.nr === nr) || null;
};

/* Build the structure from the cast, create people for it, and carry
   the plan over from the structure that was there before. Throws
   when the tool cannot build it. */
function rebuildStructure(project, cast, tokenMap) {
  const d = project.drehbuch;
  const built = buildStructure(d.markdown, cast, tokenMap, d.quelle, d.sprecherstil);
  const before = project.skript;
  project.skript = built.structure;
  project.skript_ueberblick = summaryOf(built.structure);

  // Create people, keep the ones already there. Do not delete people
  // the script no longer holds - their availability would go with them.
  project.personen = project.personen || [];
  let newlyCreated = 0;
  for (const x of peopleOf(built.structure)) {
    const da = project.personen.find(y => y.b === x.b);
    if (da) { if (!da.name && x.name) da.name = x.name; continue; }
    project.personen.push({ id: S.randomId(6), b: x.b, name: x.name,
                            funktion: x.funktion, token: S.randomId(16) });
    newlyCreated++;
  }
  let realigned = null;
  if (project.plan?.proben?.length) realigned = realignPlan(before, built.structure, project.plan);
  return { built, newlyCreated, realigned };
}

/* Take a script in - a fresh upload or an older version made current.
   Keeps the casting for names it already knows, keeps the plan, and
   returns the notice for the page. */
async function takeInScript(project, script) {
  const previous = project.drehbuch;
  project.fassungen = project.fassungen || [];
  let changes = null;
  if (previous) {
    const nr = previous.nr || 1;
    project.fassungen.push({
      nr, quelle: previous.quelle, hochgeladen: previous.hochgeladen || project.geaendert || null,
      markdown: previous.markdown, sprecherstil: previous.sprecherstil,
      bloecke: previous.bloecke, titel: previous.titel,
      repliken: (previous.sprecher || []).reduce((a, s) => a + (s.n || 0), 0),
      aenderungen: previous.aenderungen || null,
    });
    script.nr = Math.max(nr, ...project.fassungen.map(v => v.nr)) + 1;
    try {
      const cmp = compareSpeeches(
        speechesOf(previous.markdown, previous.quelle, previous.sprecherstil),
        speechesOf(script.markdown, script.quelle, script.sprecherstil));
      changes = { geaendert: cmp.changed, neu: cmp.added, gestrichen: cmp.removed, gleich: cmp.equal };
    } catch (e) { console.error('[Fassung] ' + (e && e.stack || e)); }
  } else script.nr = 1;
  script.hochgeladen = new Date().toISOString();
  script.aenderungen = changes;
  project.drehbuch = script;

  // The casting: proposals for every name, but a name the director has
  // already placed keeps its place.
  const proposal = mappingProposal(script.sprecher);
  const old = project.zuordnung || {};
  const fresh = [];
  for (const t of Object.keys(proposal)) {
    if (old[t]) proposal[t] = old[t];
    else if (previous) fresh.push(t);
  }
  project.zuordnung = proposal;
  script.neue_sprecher = fresh;

  if (!previous) {
    project.skript = null; project.skript_ueberblick = null; project.plan = null;
    return null;
  }

  // Rebuild the structure at once, so the plan can be carried over.
  let realigned = null, unresolved = [];
  const { cast, tokenMap } = buildCast(project.zuordnung, script.sprecher, project.personen);
  if (cast.length) {
    try {
      const r = rebuildStructure(project, cast, tokenMap);
      realigned = r.realigned; unresolved = r.built.unresolved;
    } catch (e) {
      console.error('[Struktur] ' + (e && e.stack || e));
      return { kind: 'error', key: 'r.structure_failed', values: { reason: reasonOf(e) } };
    }
  }
  const values = {
    nr: script.nr,
    changed: changes?.geaendert ?? 0, added: changes?.neu ?? 0, removed: changes?.gestrichen ?? 0,
    fresh: fresh.length, unsure: (realigned?.unsure || []).map(h).join(', '),
    rebuilt: (realigned?.rebuilt || []).map(h).join(', '),
  };
  if (realigned?.unsure?.length) return { kind: 'error', key: 'r.version_unsure', values };
  if (fresh.length || unresolved.length) return { kind: 'error', key: 'r.version_new_names', values };
  if (realigned?.rebuilt?.length) return { kind: 'good', key: 'r.version_rebuilt', values };
  return { kind: 'good', key: project.plan?.proben?.length ? 'r.version_kept' : 'r.version_taken', values };
}

/* What goes into a document after <body>: the comments this viewer may
   see. The director (by code or personal link) sees all, everybody
   else their own. */
function docExtrasFor(A, project, token, doc, me, ctx) {
  const mayAll = ctx.regieProject === project.id || ctx.directorProject === project.id;
  const nameOf = (b) => (project.personen || []).find(x => x.b === b)?.name || b;
  const visible = (project.kommentare || [])
    .filter(c => mayAll || (me && c.wer === me.b))
    .map(c => ({ ...c, name: nameOf(c.wer) }));
  return A.docExtras(token || '', doc, me, visible, mayAll);
}
const t_ = (code, key) => language(code).t(key);

/* The address visitors see.

   Behind the Apache proxy the Host header says 127.0.0.1:3011; the
   links handed out need the outside address, so THEATER_BASIS wins. */
const baseOf = (request) => process.env.THEATER_BASIS ||
  ('https://' + (request.headers['x-forwarded-host'] || request.headers.host || 'joku.tv'));

/* ---------- Wegweiser ---------- */

export async function handle(request, response, path) {
  const parts = path.replace(/^\/theater\/?/, '').replace(/\/$/, '').split('/');
  const first = parts[0] || '';
  const post = request.method === 'POST';

  /* Language: what the visitor chose last, otherwise what their browser
     sends. The views hang on it, so bind it once here - then every call
     below stays exactly as it was.                                  */
  const chosen = plainCookie(request, 'sprache');
  let L = isLanguage(chosen) ? chosen
        : fromHeader(request.headers['accept-language']);
  const regie = await regieFrom(request, null);
  const fontCookie = plainCookie(request, 'schrift');
  const ctx = { directorProject: projectIdFromCookie(request), regieProject: regie?.project.id || null,
                theme: plainCookie(request, 'thema') === 'dunkel' ? 'dunkel' : 'hell',
                font: ['klein', 'normal', 'gross', 'sehrgross'].includes(fontCookie) ? fontCookie : 'normal' };
  /* A demo project says so on every page, with the hour of the next reset. */
  const demoBanner = (project) => {
    if (project?.demo) ctx.demo = { until: new Date(Date.parse(project.demo_reset || 0) + Demo.RESET_MS) };
  };
  let A = views(L, path, ctx);
  /* A project may set the language for its company. It counts as long
     as the visitor has not switched in the page head themselves. */
  const projectLanguage = (project) => {
    const wanted = project?.einstellungen?.sprache;
    if (!isLanguage(chosen) && isLanguage(wanted) && wanted !== L) { L = wanted; A = views(L, path, ctx); }
  };

  /* --- Sprache umschalten: geht ohne Zugang --- */
  if (first === 'sprache' && post) {
    const { fields } = await readForm(request);
    const fresh = String(fields.language || '');
    if (isLanguage(fresh))
      response.setHeader('Set-Cookie', 'sprache=' + fresh +
        '; Path=/theater; Max-Age=31536000; SameSite=Lax; HttpOnly');
    // Only our own paths, so the picker cannot send anyone away.
    const back = String(fields.back || '/theater');
    return redirect(response, /^\/theater(\/|$)/.test(back) ? back : '/theater');
  }

  /* --- light or dark: a cookie, no access needed --- */
  if (first === 'thema' && post) {
    const { fields } = await readForm(request);
    const wanted = String(fields.thema) === 'dunkel' ? 'dunkel' : 'hell';
    response.setHeader('Set-Cookie', 'thema=' + wanted +
      '; Path=/theater; Max-Age=31536000; SameSite=Lax; HttpOnly');
    const back = String(fields.back || '/theater');
    return redirect(response, /^\/theater(\/|$)/.test(back) ? back : '/theater');
  }

  /* --- settings for this device: language, light or dark, type size.
         Three cookies, no access needed; the language one is the same
         the picker in the head sets, and empty means "as the project or
         the browser says". --- */
  if (first === 'einstellungen') {
    const who = await memberFrom(request);
    const query = new URLSearchParams((request.url || '').split('?')[1] || '');
    const own = (x) => /^\/theater(\/|$)/.test(x) && !/^\/theater\/einstellungen/.test(x);
    if (!post) {
      await drainBody(request);
      const back = own(query.get('z') || '') ? query.get('z') : (who ? '/theater/mit' : '/theater');
      return html(response, A.settingsPage({ language: isLanguage(chosen) ? chosen : '', theme: ctx.theme, font: ctx.font },
        back, null, who));
    }
    const { fields } = await readForm(request);
    const lang = String(fields.language || '');
    addCookie(response, isLanguage(lang)
      ? 'sprache=' + lang + '; Path=/theater; Max-Age=31536000; SameSite=Lax; HttpOnly'
      : 'sprache=; Path=/theater; Max-Age=0; SameSite=Lax; HttpOnly');
    const theme = String(fields.thema) === 'dunkel' ? 'dunkel' : 'hell';
    addCookie(response, 'thema=' + theme + '; Path=/theater; Max-Age=31536000; SameSite=Lax; HttpOnly');
    const font = ['klein', 'normal', 'gross', 'sehrgross'].includes(String(fields.schrift)) ? String(fields.schrift) : 'normal';
    addCookie(response, 'schrift=' + font + '; Path=/theater; Max-Age=31536000; SameSite=Lax; HttpOnly');
    const back = String(fields.back || '');
    return redirect(response, own(back) ? back : (who ? '/theater/mit' : '/theater'));
  }

  /* --- the script of the part book: a file, so nothing is escaped --- */
  if (first === 'heft.js' || first === 'sw.js' || first === 'kalender.js') {
    await drainBody(request);
    const file = nodePath.join(nodePath.dirname(fileURLToPath(import.meta.url)), 'static', first);
    response.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': first === 'sw.js' ? 'no-cache' : 'public, max-age=3600' });
    return response.end(fs.readFileSync(file));
  }
  /* A library we ship: ical.js (Mozilla, MPL 2.0) reads calendars in the browser. */
  if (first === 'vendor' && parts[1] === 'ical.min.js') {
    await drainBody(request);
    const file = nodePath.join(nodePath.dirname(fileURLToPath(import.meta.url)), 'static', 'vendor', 'ical.min.js');
    response.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'public, max-age=604800' });
    return response.end(fs.readFileSync(file));
  }

  /* --- the app: manifest, icons, the page for when the network is gone --- */
  if (first === 'manifest.webmanifest') {
    await drainBody(request);
    response.writeHead(200, { 'Content-Type': 'application/manifest+json; charset=utf-8', 'Cache-Control': 'no-cache' });
    return response.end(JSON.stringify(PWA.manifest(t_(L, 'app.name'), t_(L, 'pwa.short'), L)));
  }
  if (first === 'icon-192.png' || first === 'icon-512.png') {
    await drainBody(request);
    response.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=604800' });
    return response.end(PWA.icon(first === 'icon-192.png' ? 192 : 512));
  }
  if (first === 'offline') { await drainBody(request); return html(response, A.offlinePage()); }

  /* --- the app of one play for one person: its manifest and icons --- */
  if (first === 'app') {
    await drainBody(request);
    const hit = await S.findByPersonToken(parts[1] || '');
    if (!hit) return html(response, A.errorPage('f.link_gone_t', 'f.link_gone'), 404);
    const what = parts[2] || '';
    if (what === 'manifest.webmanifest') {
      projectLanguage(hit.project);
      response.writeHead(200, { 'Content-Type': 'application/manifest+json; charset=utf-8', 'Cache-Control': 'no-cache' });
      return response.end(JSON.stringify(PWA.manifest(hit.project.titel,
        PWA.shortNameOf(hit.project.titel, t_(L, 'pwa.short')), L, { token: hit.person.token })));
    }
    if (what === 'icon-192.png' || what === 'icon-512.png') {
      response.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=604800' });
      return response.end(PWA.icon(what === 'icon-192.png' ? 192 : 512, PWA.initialOf(hit.project.titel)));
    }
    return html(response, A.errorPage('f.not_found_t', 'f.not_found'), 404);
  }

  /* --- about this installation: open to everyone --- */
  if (first === 'ueber') { await drainBody(request); return html(response, A.aboutPage()); }

  /* --- administration: projects, access codes, deletion ---

     Guarded by THEATER_ADMIN, a key given at installation. Without it
     the page does not exist. Guessing is braked the same way as for
     the access codes.                                                 */
  if (first === 'admin') {
    const adminKey = String(process.env.THEATER_ADMIN || '').trim();
    if (!adminKey) { await drainBody(request); return html(response,
      A.errorPage('f.no_admin_t', 'f.no_admin'), 404); }
    const second = parts[1] || '';
    if (second === 'abmelden') {
      await drainBody(request);
      addCookie(response, `${ADMIN_COOKIE}=; Path=/theater; HttpOnly; SameSite=Lax; Max-Age=0`);
      return redirect(response, '/theater/admin');
    }
    if (sealedCookie(request, ADMIN_COOKIE) !== 'admin') {
      if (!post) return html(response, A.adminLoginPage(null));
      const origin = Throttle.origin(request) + '#admin';
      const allowance = Throttle.mayTry(origin);
      if (!allowance.allowed) {
        await drainBody(request);
        const min = Math.ceil(allowance.waitSeconds / 60);
        return html(response, A.adminLoginPage({ kind: 'error',
          key: 'r.throttled', values: { p1: min, p2: min === 1 ? '' : 'n' } }), 429);
      }
      const { fields } = await readForm(request);
      const given = crypto.createHash('sha256').update(String(fields.key || '')).digest();
      const want = crypto.createHash('sha256').update(adminKey).digest();
      if (!crypto.timingSafeEqual(given, want)) {
        const n = Throttle.failedAttempt(origin);
        console.log('[Admin] Fehlversuch ' + n + ' from ' + origin);
        return html(response, A.adminLoginPage({ kind: 'error', key: 'r.admin_wrong' }), 401);
      }
      Throttle.succeeded(origin);
      addCookie(response, `${ADMIN_COOKIE}=admin.${seal('admin')}; Path=/theater; HttpOnly; ` +
        `SameSite=Lax; Max-Age=${60 * 60 * 8}; Secure`);
      return redirect(response, '/theater/admin');
    }

    const entry = baseOf(request) + '/theater';
    const overview = async () => (await S.allProjects()).map(p => ({
      id: p.id, titel: p.titel, angelegt: p.angelegt, email: p.regie_email || '',
      people: (p.personen || []).length,
      rehearsals: p.plan?.proben?.length || 0,
      withEntry: Object.values(p.verfuegbar || {})
        .filter(v => Object.keys(v.tage || {}).length || (v.wochentage || []).length).length,
    }));
    if (!post) return html(response, A.adminPage(await overview(), null, null, entry));

    const { fields } = await readForm(request);
    const action = String(fields.action || '');
    let m = null, fresh = null;
    if (action === 'neu') {
      const title = String(fields.titel || '').trim().slice(0, 120);
      const email = String(fields.email || '').trim().slice(0, 200);
      if (!title) m = { kind: 'error', key: 'r.admin_no_title' };
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        m = { kind: 'error', key: 'r.admin_no_email' };
      else {
        const code = S.newCode();
        const p = await S.newProject(title, code, email);
        fresh = { id: p.id, titel: p.titel, email, code };
        m = { kind: 'good', key: 'r.admin_created', values: { p1: h(p.titel) } };
      }
    } else if (action === 'code') {
      const p = await S.read(String(fields.id || ''));
      if (!p) m = { kind: 'error', key: 'r.admin_gone' };
      else {
        const code = S.newCode();
        p.code_streuwert = S.hashOf(code);
        await S.write(p);
        fresh = { id: p.id, titel: p.titel, email: p.regie_email || '', code };
        m = { kind: 'good', key: 'r.admin_code_new', values: { p1: h(p.titel) } };
      }
    } else if (action === 'loeschen') {
      const p = await S.read(String(fields.id || ''));
      if (!p) m = { kind: 'error', key: 'r.admin_gone' };
      else if (String(fields.bestaetigung || '').trim() !== String(p.titel).trim())
        m = { kind: 'error', key: 'r.admin_confirm', values: { p1: h(p.titel) } };
      else {
        await S.deleteProject(p.id);
        HB.cancelJob(p.id);
        m = { kind: 'good', key: 'r.admin_deleted', values: { p1: h(p.titel) } };
      }
    } else m = { kind: 'error', key: 'r.unknown_action' };
    return html(response, A.adminPage(await overview(), m, fresh, entry));
  }

  /* --- personal link: needs no code ---

     The older way in, one link per person. It is kept so that links
     already handed out go on working; it signs the person in exactly as
     the part book does and continues in the member area. The calendar
     used to be served here directly, with a form posting to the member
     area - where nobody was signed in yet, so nothing could be saved. */
  if (first === 'ich') {
    await drainBody(request);
    const hit = await S.findByPersonToken(parts[1]);
    if (!hit) return html(response, A.errorPage('f.link_gone_t', 'f.link_gone'), 404);
    projectLanguage(hit.project);
    /* The calendar feed: no cookie, no page - a calendar app fetches it. */
    if (parts[2] === 'kalender.ics') {
      response.writeHead(200, { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'no-cache',
                               'Content-Disposition': 'inline; filename="proben.ics"' });
      return response.end(feedFor(hit.project, hit.person, baseOf(request)));
    }
    setMemberCookie(response, hit.project.id, hit.person.id);
    setRealSelfCookie(response, null);
    // The personal link is the one way to the director's rights.
    if (hit.person.regie || hit.person.assistenz) setRegieCookie(response, hit.project.id, hit.person.id);
    /* A page may be named after the token - the part book, say, saved
       on a phone - and then that is where the link leads. */
    if (parts[2] === 'plan' && parts[3]) return redirect(response, '/theater/mit/plan/' + encodeURIComponent(parts[3]));
    const target = ['heft', 'zeiten', 'termine', 'kommentare', 'mit'].includes(parts[2]) ? parts[2] : '';
    if (target) return redirect(response, target === 'mit' ? '/theater/mit' : '/theater/mit/' + target);
    return redirect(response, hit.person.regie || hit.person.assistenz ? '/theater/projekt' : '/theater/mit/zeiten');
  }

  /* --- printable documents behind a fixed address ---

     Not as a download but to look at in the browser: printing and saving
     as PDF happen there, and the same link delivers the current state at
     any time. It needs no access code - whoever has it may read the
     play; that is the point.                                        */
  if (first === 'druck') {
    const token = String(parts[1] || '');
    const project = await S.findByPrintToken(token);
    if (!project) { await drainBody(request); return html(response,
      A.errorPage('f.link_gone2_t', 'f.link_gone2'), 404); }
    projectLanguage(project);
    const action = parts[2] || '';

    // 'base' is only built further down, for the director's pages;
    // here we take the address from the request itself.
    const here = 'https://' + (request.headers['x-forwarded-host'] ||
                               request.headers.host || 'joku.tv');
    const myBase = (process.env.THEATER_BASIS || here) + '/theater/druck/' + token;
    if (!action) return html(response, A.docsPage(project, myBase));

    /* From the part book back into the application.

       The print link belongs to the whole project, not to one person -
       which person is meant stands in the path. Whoever has it may enter
       times in the company; that is a decision, not an oversight, and
       the switch says so.                                           */
    if (action === 'mit') {
      const b = decodeURIComponent(parts[3] || '');
      const person = (project.personen || []).find(x => x.b === b);
      if (!person) { await drainBody(request); return html(response,
        A.errorPage('f.person_gone_t', 'f.person_gone'), 404); }

      /* The link carries its destination as a query; the confirmation
         sends it back by POST. Only our own paths are allowed - anything
         else would be an open redirect.                              */
      const ownPathsOnly = (x) => /^\/theater\/mit(\/(zeiten|termine))?$/.test(x || '')
        ? x : '/theater/mit';
      let goto;
      if (post) {
        const { fields } = await readForm(request);
        goto = ownPathsOnly(String(fields.goto || ''));
      } else {
        const query = new URLSearchParams((request.url || '').split('?')[1] || '');
        goto = query.get('goto') === 'termine' ? '/theater/mit/termine'
              : query.get('goto') === 'zeiten'  ? '/theater/mit/zeiten'
              : '/theater/mit';
      }

      /* If somebody else is signed in, ask once - but only on the click.
         The POST IS the answer to that question.                     */
      const current = await memberFrom(request);
      if (!post && current && current.person.id !== person.id)
        return html(response, A.switchPage(project, current.person, person,
          '/theater/druck/' + encodeURIComponent(token) + '/mit/' +
          encodeURIComponent(b), goto));

      setMemberCookie(response, project.id, person.id);
      // Whoever arrives through a part book IS that person - no switch.
      setRealSelfCookie(response, null);
      return redirect(response, goto);
    }

    /* --- a comment on a line, from inside a document ---

       Whoever is signed in as a member of this project comments as
       themselves; a part book opened from its plain link names the
       person in the path, and that is taken on trust, as the link is. */
    if (action === 'kommentar' && post) {
      const { fields } = await readForm(request);
      const who = await memberFrom(request);
      const person = (who && who.project.id === project.id) ? who.person
        : (project.personen || []).find(x => x.b === String(fields.wer || ''));
      const mayAll = ctx.regieProject === project.id || ctx.directorProject === project.id;
      const answer = (obj, status = 200) => {
        response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        response.end(JSON.stringify(obj));
      };
      if (!person) return answer({ ok: false, reason: 'who' }, 401);
      project.kommentare = project.kommentare || [];
      const act = String(fields.action || '');
      if (act === 'neu') {
        const text = String(fields.text || '').trim().slice(0, 2000);
        const nr = Number(fields.nr);
        if (!text || !Number.isInteger(nr)) return answer({ ok: false, reason: 'input' }, 400);
        const c = { id: S.randomId(8), nr, dokument: ['rolle', 'probenplan'].includes(fields.doc) ? fields.doc : 'gesamt',
                    auszug: String(fields.auszug || '').trim().slice(0, 160), text, wer: person.b,
                    datum: new Date().toISOString(), frage: fields.frage === '1', antwort: null, erledigt: false };
        project.kommentare.push(c);
        await S.write(project);
        return answer({ ok: true, comment: { ...c, name: person.name || person.b } });
      }
      if (act === 'loeschen') {
        const c = project.kommentare.find(x => x.id === String(fields.id || ''));
        if (!c) return answer({ ok: false, reason: 'gone' }, 404);
        if (c.wer !== person.b && !mayAll) return answer({ ok: false, reason: 'not yours' }, 403);
        project.kommentare = project.kommentare.filter(x => x !== c);
        await S.write(project);
        return answer({ ok: true });
      }
      return answer({ ok: false, reason: 'action' }, 400);
    }

    if (action === 'original') {
      const o = project.drehbuch?.original;
      if (!o) return html(response,
        A.errorPage('f.no_original_t', 'f.no_original'), 404);
      const raw = Buffer.from(o.daten, 'base64');
      const clean = String(o.name).replace(/[^\w \u00c0-\u024f.-]/g, '_');
      response.writeHead(200, {
        'Content-Type': o.mime,
        'Content-Length': raw.length,
        'Content-Disposition': 'attachment; filename="' +
          clean.replace(/[^\x20-\x7e]/g, '_') + '"; filename*=UTF-8\'\'' +
          encodeURIComponent(o.name),
        'Cache-Control': 'no-store',
      });
      return response.end(raw);
    }

    if (!project.drehbuch) return html(response,
      A.errorPage('f.no_script_t', 'f.no_script'), 404);
    const { cast, tokenMap } = buildCast(project.zuordnung, project.drehbuch.sprecher, project.personen);
    /* Whose booklet is this? For a part book it stands in the path, for
       the full script in the query - and there it also marks that
       person's own text, the way the tool does through cast[].ich. */
    let text, meins = null;
    try {
      if (action === 'rolle') {
        const person = decodeURIComponent(parts[3] || '');
        const n = new URLSearchParams((request.url || '').split('?')[1] || '').get('kontext');
        text = buildDocument(project.drehbuch, cast, tokenMap, 'rolle',
                            { person, context: n == null ? 1 : n });
        meins = person;
      } else if (action === 'probenplan') {
        text = buildDocument(project.drehbuch, cast, tokenMap, 'probenplan', { plan: project.plan });
      } else if (action === 'gesamt') {
        const f = new URLSearchParams((request.url || '').split('?')[1] || '');
        const whose = f.get('ich') || '';
        if (cast.some(x => x.b === whose)) meins = whose;
        const ownCast = cast.map(x => x.b === whose ? { ...x, ich: true } : x);
        text = buildDocument(project.drehbuch, ownCast, tokenMap, 'gesamt');
      } else {
        return html(response, A.errorPage('f.not_found_t', 'f.not_found'), 404);
      }
    } catch (e) {
      console.error('[Dokument] ' + (e && e.stack || e));
      return html(response, A.errorPage('f.failed_t', 'f.failed', { reason: reasonOf(e) }), 500);
    }
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    /* The bar back into the application, right after <body>.

       Not in the tool but here: the tool builds documents and knows
       nothing of sessions. When printing it disappears.             */
    if (meins && (project.personen || []).some(x => x.b === meins))
      text = text.replace('<body>',
        '<body>' + A.backBar(token, meins, !!project.plan?.proben?.length));
    /* Comments: the member signed in, else the person the path names. */
    {
      const who = await memberFrom(request);
      const me = (who && who.project.id === project.id) ? who.person
        : (project.personen || []).find(x => x.b === meins) || null;
      text = text.replace('<body>', '<body>' + docExtrasFor(A, project, token, action, me, ctx));
    }

    return response.end(text);
  }

  /* --- Gruppenlink: Namen waehlen --- */
  if (first === 'gruppe') {
    const token = String(parts[1] || '');
    const project = await S.findByGroupToken(token);
    if (!project) { await drainBody(request); return html(response,
      A.errorPage('f.link_gone3_t', 'f.link_gone3'), 404); }
    projectLanguage(project);
    if (!post) return html(response, A.pickNamePage(project, token, null));
    const { fields } = await readForm(request);
    const person = (project.personen || []).find(x => x.id === String(fields.person || ''));
    if (!person) return html(response, A.pickNamePage(project, token, {
      kind: 'error', key: 'r.name_gone' }));
    setMemberCookie(response, project.id, person.id);
    return redirect(response, '/theater/mit');
  }

  /* --- Bereich eines Ensemble-Mitglieds --- */
  if (first === 'mit') {
    const second = parts[1] || '';
    if (second === 'abmelden') {
      response.setHeader('Set-Cookie', `${MEMBER}=; Path=/theater; HttpOnly; SameSite=Lax; Max-Age=0`);
      addCookie(response, `${REGIE}=; Path=/theater; HttpOnly; SameSite=Lax; Max-Age=0`);
      addCookie(response, `${REALSELF}=; Path=/theater; HttpOnly; SameSite=Lax; Max-Age=0`);
      return redirect(response, '/theater');
    }
    const who = await memberFrom(request);
    if (!who) { await drainBody(request); return html(response,
      A.errorPage('f.not_signed_in_t', 'f.not_signed_in'), 401); }
    const { project, person } = who;
    projectLanguage(project);
    demoBanner(project);

    /* Who is being worked for, and who is one really? */
    const realSelfValue = sealedCookie(request, REALSELF);
    const realSelf = realSelfValue && realSelfValue.split(':')[0] === project.id
      ? (project.personen || []).find(x => x.id === realSelfValue.split(':')[1]) : null;

    /* The link to somebody's part book signs its owner in. Whoever has
       switched to somebody else through the dropdown gets it only with
       the director's rights - otherwise a member could pick up the
       director's own link, and with it the director's rights. */
    const bookLinkFor = async () => {
      const mayDirect = ctx.regieProject === project.id || ctx.directorProject === project.id;
      if (realSelf && realSelf.id !== person.id && !mayDirect) return '';
      // People made by hand before tokens existed get one now.
      if (!person.token) { person.token = S.randomId(16); await S.write(project); }
      return baseOf(request) + '/theater/ich/' + person.token + '/heft';
    };

    if (second === '' && post) {
      const { fields } = await readForm(request);
      if (String(fields.action) !== 'wechseln')
        return html(response, A.memberPage(project, person, {
          kind: 'error', key: 'r.unknown_action' }, realSelf));

      const target = (project.personen || []).find(x => x.id === String(fields.person || ''));
      if (!target) return html(response, A.memberPage(project, person, {
        kind: 'error', key: 'r.person_gone' }, realSelf));
      if (target.id === person.id) return html(response, A.memberPage(project, person, {
        kind: 'error', key: 'r.thats_you' }, realSelf));

      setMemberCookie(response, project.id, target.id);
      if (realSelf && target.id === realSelf.id) setRealSelfCookie(response, null);
      else if (!realSelf) setRealSelfCookie(response, project.id + ':' + person.id);
      // Otherwise the second cookie stays as it is: one goes on working
      // for somebody else, only now for a third person.
      return redirect(response, '/theater/mit');
    }

    // The print link belongs to the whole project; a member needs it for
    // the scripts page. Usually the director has been here first and it
    // exists; if not, make it now.
    if (!project.druck_token) { project.druck_token = S.randomId(18); await S.write(project); }

    /* The share button in the head carries the link to this person's
       part book on every page of the member area. */
    ctx.share = await bookLinkFor();
    if (person.token) ctx.app = { token: person.token, title: project.titel,
                                 short: PWA.shortNameOf(project.titel, t_(L, 'pwa.short')) };
    if (second === '') return html(response, A.memberPage(project, person, null, realSelf));

    /* The passages of one rehearsal, for a member: the same page as
       the director's, with the member's navigation. */
    if (second === 'plan' && parts[2]) {
      await drainBody(request);
      const id = decodeURIComponent(parts[2]);
      if (!project.skript || !project.plan) return html(response,
        A.errorPage('f.no_plan_t', 'f.no_plan'), 404);
      let d;
      try { d = passagesOf(project.skript, project.plan, id); }
      catch (e) {
        console.error('[Passagen] ' + (e && e.stack || e));
        return html(response, A.errorPage('f.failed3_t', 'f.failed3', { reason: reasonOf(e) }), 500);
      }
      if (!d) return html(response, A.errorPage('f.rehearsal_gone_t', 'f.rehearsal_gone'), 404);
      return html(response, A.passagesPage(project, d, null, { member: person }));
    }

    /* A calendar feed fetched on the member's behalf: most calendar
       services refuse a browser on another site (CORS). The address
       comes with the request and goes nowhere; the text goes back and
       is not kept. Only public hosts, only http(s), ten seconds, 15 MB. */
    if (second === 'kalender-abruf' && post) {
      const { fields } = await readForm(request, 20_000);
      const plain = (status, text) => { response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }); response.end(text); };
      let target;
      try { target = new URL(String(fields.url || '')); } catch { return plain(400, 'url'); }
      const host = target.hostname.toLowerCase();
      const local = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.|\[::1\]|::1$|fc|fd)/.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host) || /\.local$/.test(host);
      const dev = /^http:\/\/127\.0\.0\.1/.test(process.env.THEATER_BASIS || '');
      if (!/^https?:$/.test(target.protocol) || (local && !(dev && host === '127.0.0.1'))) return plain(400, 'host');
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 10000);
      try {
        const r = await fetch(target, { signal: ctl.signal, redirect: 'follow', headers: { accept: 'text/calendar, */*' } });
        if (!r.ok) return plain(502, 'status ' + r.status);
        const text = await r.text();
        if (text.length > 15_000_000) return plain(502, 'too big');
        if (!/BEGIN:VCALENDAR/.test(text.slice(0, 2000))) return plain(502, 'not a calendar');
        response.writeHead(200, { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'no-store' });
        return response.end(text);
      } catch (e) {
        return plain(502, 'fetch');
      } finally { clearTimeout(timer); }
    }

    if (second === 'zeiten') {
      const days = calendarDays(project);
      const states = () => dayStates(project, person, days);
      const ics = person.token ? baseOf(request) + '/theater/ich/' + person.token + '/kalender.ics' : '';
      if (!post) return html(response, A.myTimesPage(project, person, null, days, states(), ics));
      const { fields } = await readForm(request, 4_000_000);
      const entered = {};
      for (const t of days) {
        if (fields['t_' + t.iso] !== '1') continue;
        const from = time(fields['v_' + t.iso]) || '19:00';
        const to = time(fields['b_' + t.iso]) || '22:00';
        if (to <= from) continue;
        entered[t.iso] = { von: from, bis: to };
      }
      project.verfuegbar = project.verfuegbar || {};
      project.verfuegbar[person.id] = { tage: entered, stand: new Date().toISOString() };
      // The director strikes days for everyone; the flags travel in the
      // same form as the times.
      if (ctx.regieProject === project.id || ctx.directorProject === project.id) {
        project.einstellungen = project.einstellungen || {};
        project.einstellungen.gesperrt = days.filter(t => fields['g_' + t.iso] === '1').map(t => t.iso);
      }
      await S.write(project);
      const n = Object.keys(entered).length;
      return html(response, A.myTimesPage(project, person, timesSaved(n), days, states(), ics));
    }

    if (second === 'termine') {
      const query = new URLSearchParams((request.url || '').split('?')[1] || '');
      const view = { all: query.get('alle') === '1' };
      if (!post) return html(response, A.myDatesPage(project, person, proposeDates(project), null, view));
      const { fields } = await readForm(request);
      const rehearsal = String(fields.rehearsal || '');
      const mine = (project.plan?.proben || []).find(x => x.id === rehearsal);
      const mayDirect = ctx.regieProject === project.id || ctx.directorProject === project.id;
      const allowed = mine && (mine.gruppe.includes(person.b) || mayDirect);
      if (!allowed)
        return html(response, A.myDatesPage(project, person, proposeDates(project), {
          kind: 'error', key: 'r.not_yours' }, view));
      const old = (project.termine || []).find(t => t.probe_id === rehearsal);
      let m = null;

      if (fields.action === 'place') {
        // Only the place changes, the date stays
        if (!old) m = { kind: 'error', key: 'r.no_date' };
        else {
          old.ort = String(fields.place || '').trim().slice(0, 120);
          m = placeNotice(rehearsal, old.ort);
        }
        await S.write(project);
        return html(response, A.myDatesPage(project, person, proposeDates(project), m));
      }

      project.termine = (project.termine || []).filter(t => t.probe_id !== rehearsal);
      if (fields.action === 'halten' && date(fields.iso)) {
        project.termine.push({
          probe_id: rehearsal, iso: fields.iso,
          von: time(fields.from) || '', bis: time(fields.to) || '',
          gruppe: mine.gruppe, bestaetigt: true,
          ort: String(fields.place || '').trim().slice(0, 120) || old?.ort || '',
          gehalten: new Date().toISOString(), von_wem: person.b,
        });
        m = { kind: 'good', key: 'r.now_fixed', values: { p1: h(rehearsal) } };
      } else if (fields.action === 'loesen') {
        m = { kind: 'good', key: 'r.released', values: { p1: h(rehearsal) } };
      }
      await S.write(project);
      Reminders.refresh(project);
      return html(response, A.myDatesPage(project, person, proposeDates(project), m));
    }

    /* The part book for the screen: passage by passage, with the
       learning mode. The A4 document stays on the scripts page. */
    /* The whole play, readable on a phone: own lines marked, the
       rehearsals noted where they begin, comments by double tap. */
    if (second === 'stueck') {
      await drainBody(request);
      if (!project.skript) return html(response, A.errorPage('f.no_structure_t', 'f.no_structure'), 404);
      const blocks = wholePlay(project.skript, person.b);
      const starts = {};
      for (const pr of project.plan?.proben || [])
        for (const sz of pr.szenen || []) if (sz.nr_von != null) (starts[sz.nr_von] = starts[sz.nr_von] || []).push(pr.id);
      const mayAll = ctx.regieProject === project.id || ctx.directorProject === project.id;
      const nameOf = (b) => (project.personen || []).find(x => x.b === b)?.name || b;
      const comments = (project.kommentare || []).filter(c => mayAll || c.wer === person.b)
        .map(c => ({ id: c.id, nr: c.nr, text: c.text, wer: c.wer, name: nameOf(c.wer), datum: c.datum,
                     frage: !!c.frage, antwort: c.antwort || null, erledigt: !!c.erledigt }));
      return html(response, A.playPage(project, person, blocks, starts, comments));
    }

    /* The daily reminder: the phone's push subscription and the time.
       JSON in, JSON out; the part-book script talks to it. */
    if (second === 'erinnerung') {
      const answer = (obj, status = 200) => {
        response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        response.end(JSON.stringify(obj));
      };
      if (!post) { await drainBody(request); return answer({ ok: false, reason: 'method' }, 405); }
      const { fields } = await readForm(request);
      if (!Push.enabled()) return answer({ ok: false, reason: 'nokey' }, 404);
      const action = String(fields.action || '');
      const endpoint = String(fields.endpoint || '').trim();
      const localEndpoint = /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(endpoint);
      if (['an', 'aus', 'probe'].includes(action) && !(/^https:\/\/\S+$/.test(endpoint) || localEndpoint))
        return answer({ ok: false, reason: 'endpoint' }, 400);
      project.erinnerung = project.erinnerung || {};
      const entry = project.erinnerung[person.id] || { zeit: '19:00', zone: 'UTC', abos: [] };
      entry.abos = entry.abos || [];
      const takeTime = () => {
        if (fields.zeit != null) { if (!Reminders.validTime(String(fields.zeit))) return false; entry.zeit = String(fields.zeit); }
        if (fields.zone != null) { const z = String(fields.zone).slice(0, 64); if (!Reminders.validZone(z)) return false; entry.zone = z; }
        return true;
      };
      const status = () => ({ ok: true, zeit: entry.zeit, zone: entry.zone, endpoints: entry.abos.map(a => a.endpoint) });
      if (action === 'an') {
        const p256dh = String(fields.p256dh || ''), auth = String(fields.auth || '');
        if (Push.fromB64u(p256dh).length !== 65 || Push.fromB64u(auth).length !== 16) return answer({ ok: false, reason: 'keys' }, 400);
        if (!takeTime()) return answer({ ok: false, reason: 'zeit' }, 400);
        entry.abos = entry.abos.filter(a => a.endpoint !== endpoint).concat([{ endpoint, p256dh, auth, seit: new Date().toISOString() }]).slice(-5);
        delete entry.zuletzt;
        project.erinnerung[person.id] = entry;
      } else if (action === 'aus') {
        entry.abos = entry.abos.filter(a => a.endpoint !== endpoint);
        if (entry.abos.length) project.erinnerung[person.id] = entry; else delete project.erinnerung[person.id];
      } else if (action === 'zeit') {
        if (!takeTime()) return answer({ ok: false, reason: 'zeit' }, 400);
        delete entry.zuletzt;
        project.erinnerung[person.id] = entry;
      } else if (action === 'probe') {
        const abo = entry.abos.find(a => a.endpoint === endpoint);
        if (!abo) return answer({ ok: false, reason: 'noabo' }, 404);
        const r = await Push.send(Push.keysFromEnv(), abo, Reminders.testMessage(project, person, entry));
        if (r.gone) { entry.abos = entry.abos.filter(a => a !== abo); await S.write(project); Reminders.refresh(project); }
        return answer({ ...status(), ok: r.ok, status: r.status, reason: r.ok ? undefined : 'send' }, r.ok ? 200 : 502);
      } else return answer({ ok: false, reason: 'action' }, 400);
      await S.write(project);
      Reminders.refresh(project);
      return answer(status());
    }

    if (second === 'heft') {
      if (!project.skript) { await drainBody(request); return html(response,
        A.errorPage('f.no_structure_t', 'f.no_structure'), 404); }
      const passages = partBook(project.skript, person.b);
      const today = Learn.isoToday();

      /* An answer while learning, or the note on a chunk. Stored with
         the project under the person - it is theirs, and it moves with
         their link from phone to computer. */
      if (post) {
        const { fields } = await readForm(request);
        const answer = (obj, status = 200) => {
          response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
          response.end(JSON.stringify(obj));
        };
        const key = String(fields.key || '');
        if (!passages.some(p => p.chunks.some(c => c.key === key))) return answer({ ok: false, reason: 'key' }, 400);
        project.lernen = project.lernen || {};
        const mine = project.lernen[person.id] = project.lernen[person.id] || {};
        let rec = mine[key] || null;
        if (fields.antwort != null) {
          rec = Learn.answer(rec, String(fields.antwort), today);
          if (!rec) return answer({ ok: false, reason: 'antwort' }, 400);
        }
        if (fields.absicht != null) {
          rec = rec || { s: 0, f: today, l: [] };
          const a = String(fields.absicht).trim().slice(0, 200);
          if (a) rec.a = a; else delete rec.a;
        }
        if (!rec) return answer({ ok: false, reason: 'nothing' }, 400);
        mine[key] = rec;
        await S.write(project);
        return answer({ ok: true, rec });
      }

      await drainBody(request);
      const state = project.lernen?.[person.id] || {};
      // Comments as in the documents: the director sees all, everybody else their own.
      const mayAll = ctx.regieProject === project.id || ctx.directorProject === project.id;
      const nameOf = (b) => (project.personen || []).find(x => x.b === b)?.name || b;
      const comments = (project.kommentare || []).filter(c => mayAll || c.wer === person.b)
        .map(c => ({ id: c.id, nr: c.nr, text: c.text, wer: c.wer, name: nameOf(c.wer), datum: c.datum,
                     frage: !!c.frage, antwort: c.antwort || null, erledigt: !!c.erledigt }));
      const keys = Push.keysFromEnv();
      const remind = keys ? { key: keys.publicKey, ...(project.erinnerung?.[person.id] || {}) } : null;
      /* ?probe=<id>: only the passages of that rehearsal, in learning mode -
         the button on the rehearsal's page leads here. */
      const query = new URLSearchParams((request.url || '').split('?')[1] || '');
      const wanted = (project.plan?.proben || []).find(pr => pr.id === query.get('probe'));
      let filter = wanted ? { id: wanted.id, ranges: (wanted.szenen || [])
        .filter(sz => sz.nr_von != null && sz.nr_bis != null).map(sz => [Number(sz.nr_von), Number(sz.nr_bis)]) } : null;
      /* ?mit=A&mit=B: an ad-hoc rehearsal with whoever is around - only the
         passages whose cue comes from one of them. */
      const known = new Set((project.personen || []).map(x => x.b));
      const mit = query.getAll('mit').map(String).filter(b => known.has(b) && b !== person.b);
      if (mit.length) filter = { ...(filter || {}), mit };
      return html(response, A.bookPage(project, person, passages, wordsOf(passages), state, today, comments, remind, filter));
    }

    if (second === 'gesamt') {
      if (!project.drehbuch) return html(response,
        A.errorPage('f.no_script2_t', 'f.no_script2'), 404);
      const { cast, tokenMap } = buildCast(project.zuordnung, project.drehbuch.sprecher, project.personen);
      let text;
      try {
        text = buildDocument(project.drehbuch, cast, tokenMap, 'gesamt');
      } catch (e) {
        console.error('[Dokument] ' + (e && e.stack || e));
        return html(response, A.errorPage('f.failed2_t', 'f.failed2', { reason: reasonOf(e) }), 500);
      }
      // Show it in the browser rather than save it - printing happens
      // there, and the same link later delivers the newer state.
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      text = text.replace('<body>', '<body>' + docExtrasFor(A, project, project.druck_token,
        'gesamt', person, ctx));
      return response.end(text);
    }

    if (second === 'kommentare') {
      await drainBody(request);
      return html(response, A.myCommentsPage(project, person, null));
    }

    return html(response, A.errorPage('f.not_found2_t', 'f.not_found2'), 404);
  }

  /* --- Einstieg --- */
  if (first === '' && !post) {
    const id = projectIdFromCookie(request);
    if (id && await S.read(id)) return redirect(response, '/theater/projekt');
    // A member who is signed in lands on their own page, not at the code.
    if (await memberFrom(request)) return redirect(response, '/theater/mit');
    return html(response, A.entryPage(null, Demo.available()));
  }

  /* --- the demo projects: in as the director without a code, or on to
         the company link. Open to everyone; reset every 24 hours. --- */
  if (first === 'demo') {
    await drainBody(request);
    const project = await Demo.demoProject(parts[1] || '');
    if (!project) return html(response, A.errorPage('f.demo_gone_t', 'f.demo_gone'), 404);
    if (parts[2] === 'ensemble') return redirect(response, '/theater/gruppe/' + project.gruppen_token);
    setCookie(response, project.id);
    return redirect(response, '/theater/projekt');
  }

  if (first === 'zugang' && post) {
    const origin = Throttle.origin(request);
    const allowance = Throttle.mayTry(origin);
    if (!allowance.allowed) {
      await drainBody(request);
      const min = Math.ceil(allowance.waitSeconds / 60);
      return html(response, A.entryPage({ kind: 'error',
        key: 'r.throttled', values: { p1: min, p2: min === 1 ? '' : 'n' } }), 429);
    }
    const f = await form(request);
    const project = await S.findByCode(f.code || '');
    if (!project) {
      const n = Throttle.failedAttempt(origin);
      console.log('[Zugang] Fehlversuch ' + n + ' from ' + origin);
      return html(response, A.entryPage({
        kind: 'error', key: 'r.code_unknown' }), 401);
    }
    Throttle.succeeded(origin);
    setCookie(response, project.id);
    return redirect(response, '/theater/projekt');
  }

  if (first === 'abmelden') { clearCookie(response); return redirect(response, '/theater'); }

  /* --- from here on, only with an access code or the director's key ---

     The key hangs on the address as ?s=... With it the director can pass
     their link on - to an assistant, say - and switch between several
     projects themselves.                                            */
  const queryPart = new URLSearchParams((request.url || '').split('?')[1] || '');
  const key = queryPart.get('s');
  let project = null;
  if (key) {
    project = await S.findByDirectorToken(key);
    if (project) setCookie(response, project.id);
  }
  if (!project) {
    const projectId = projectIdFromCookie(request);
    project = projectId ? await S.read(projectId) : null;
  }
  /* The director and the assistant director, signed in through their
     personal link, may do everything the access code allows. */
  if (!project && regie) project = regie.project;
  if (!project) {
    await drainBody(request);
    return html(response, A.entryPage({ kind: 'error',
      key: 'r.expired' }), 401);
  }
  projectLanguage(project);
  demoBanner(project);

  /* In a demo the script stays as it is and no audiobook is made: the
     one would have the server hand out anybody's files for a day, the
     other keeps an API key with a project everyone can open. */
  if (project.demo && post && (first === 'skript' || first === 'hoerbuch')) {
    await drainBody(request);
    return html(response, A.errorPage('f.demo_locked_t', 'f.demo_locked'), 403);
  }

  const base = baseOf(request);

  // Create the links when needed and make them available for display
  let newLinks = false;
  if (!project.gruppen_token && (project.personen || []).length) {
    project.gruppen_token = S.randomId(18); newLinks = true;
  }
  if (!project.regie_token) { project.regie_token = S.randomId(20); newLinks = true; }
  if (!project.druck_token) { project.druck_token = S.randomId(18); newLinks = true; }
  if (newLinks) await S.write(project);
  project.gruppenlink = project.gruppen_token
    ? base + '/theater/gruppe/' + project.gruppen_token : '';
  project.regielink = base + '/theater/projekt?s=' + project.regie_token;
  project.drucklink = base + '/theater/druck/' + project.druck_token;

  if (first === 'projekt') {
    if (!post) return html(response, A.projectPage(project, null));
    const { fields } = await readForm(request);
    if (String(fields.action) === 'sprache') {
      project.einstellungen = project.einstellungen || {};
      const wanted = String(fields.language || '');
      if (isLanguage(wanted)) project.einstellungen.sprache = wanted;
      else delete project.einstellungen.sprache;
      await S.write(project);
      projectLanguage(project);
      return html(response, A.projectPage(project, { kind: 'good', key: 'r.language_saved' }));
    }
    if (String(fields.action) !== 'zeitraum')
      return html(response, A.projectPage(project, { kind: 'error', key: 'r.unknown_action' }));
    project.einstellungen = project.einstellungen || {};
    project.einstellungen.von = date(fields.von) || '';
    project.einstellungen.bis = date(fields.bis) || '';
    await S.write(project);
    return html(response, A.projectPage(project, { kind: 'good', key: 'r.period_saved' }));
  }

  /* Into somebody's calendar from the director's pages: sign in as that
     person the way the part book does, and go to the calendar. */
  if (first === 'als' && post) {
    const { fields } = await readForm(request);
    const person = (project.personen || []).find(x => x.id === String(fields.person || ''));
    if (!person) return html(response, A.projectPage(project, { kind: 'error', key: 'r.person_gone' }));
    setMemberCookie(response, project.id, person.id);
    setRealSelfCookie(response, null);
    return redirect(response, '/theater/mit/zeiten');
  }

  if (first === 'skript') {
    /* --- one version compared with the one before it --- */
    if (parts[1] === 'fassung') {
      await drainBody(request);
      const nr = Number(parts[2]);
      const v = versionByNumber(project, nr);
      const before = versionByNumber(project, nr - 1);
      if (!v || !before) return html(response, A.errorPage('f.no_version_t', 'f.no_version'), 404);
      let diff;
      try {
        diff = compareSpeeches(
          speechesOf(before.markdown, before.quelle, before.sprecherstil),
          speechesOf(v.markdown, v.quelle, v.sprecherstil));
      } catch (e) {
        console.error('[Fassung] ' + (e && e.stack || e));
        return html(response, A.errorPage('f.failed_t', 'f.failed', { reason: reasonOf(e) }), 500);
      }
      // Which rehearsals the changed speeches fall into - only for the
      // current version, whose cue numbers the plan knows.
      const byCue = v === project.drehbuch ? rehearsalsByCue(project.skript, project.plan) : new Map();
      return html(response, A.versionPage(project, v, before, diff, byCue));
    }

    if (!post) return html(response, A.uploadPage(project, null));
    let file, style = 'auto', fields;
    try {
      ({ files: [file], fields } = await (async () => {
        const r = await readForm(request, 30_000_000);
        return { files: [r.files.find(d => d.name === 'file')], fields: r.fields };
      })());
      style = String(fields.style || 'auto');
    } catch (e) {
      return html(response, A.uploadPage(project, failureNotice(e, 'r.read_failed')));
    }

    /* --- an older version made current again --- */
    if (String(fields.action || '') === 'zurueck') {
      const v = versionByNumber(project, Number(fields.fassung));
      if (!v || v === project.drehbuch)
        return html(response, A.uploadPage(project, { kind: 'error', key: 'r.no_version' }));
      let read_;
      try { read_ = readMarkdown(v.markdown, v.quelle, { style: v.sprecherstil }); }
      catch (e) {
        console.error('[Drehbuch] ' + (e && e.stack || e));
        return html(response, A.uploadPage(project, failureNotice(e, 'r.read_failed')));
      }
      const m = await takeInScript(project, {
        quelle: v.quelle, markdown: v.markdown, sprecherstil: read_.sprecherstil,
        titel: read_.titel, bloecke: read_.bloecke, sprecher: read_.sprecher,
        schriften: project.drehbuch?.schriften || null, original: null,
        wiederhergestellt: v.nr,
      });
      await S.write(project);
      return html(response, A.uploadPage(project, m));
    }

    if (!file || !file.content.length)
      return html(response, A.uploadPage(project, {
        kind: 'error', key: 'r.no_file' }));
    if (!/\.(docx|md|markdown|txt)$/i.test(file.filename))
      return html(response, A.uploadPage(project, { kind: 'error',
        key: 'r.bad_extension' }));

    /* How the speakers are written is detected from the text; when that
       is not conclusive the director picks it on the page and uploads
       once more. */
    let read_;
    try { read_ = await readScript(file.content, file.filename, { style }); }
    catch (e) {
      if (e && e.key !== 'r.style_unknown')
        console.error('[Drehbuch] ' + (e && e.stack || e));
      return html(response, A.uploadPage(project, failureNotice(e, 'r.read_failed')));
    }
    if (!read_.sprecher.length)
      return html(response, A.uploadPage(project, { kind: 'error',
        key: read_.sprecherstil === 'dot' ? 'r.no_speaker_dot' : 'r.no_speaker' }));

    const m = await takeInScript(project, {
      quelle: file.filename, markdown: read_.markdown,
      titel: read_.titel, bloecke: read_.bloecke, sprecher: read_.sprecher,
      // How the speakers are written - every later parse needs to know.
      sprecherstil: read_.sprecherstil,
      // The font embedded in the template belongs with it - only with
      // it do the lines break in print as they do in the original.
      schriften: read_.schriften || null,
      // Keep the original - whoever passes the play on, or wants to
      // work on it elsewhere, should not have to hunt for their own file.
      // As Base64, so it fits into the same record.
      original: {
        name: file.filename,
        mime: /\.docx$/i.test(file.filename)
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : 'text/markdown; charset=utf-8',
        bytes: file.content.length,
        daten: file.content.toString('base64'),
      },
    });
    await S.write(project);
    // The first script goes straight on to the casting; a new version
    // of a known one stays here, where the changes and the plan's state
    // are shown.
    if (!project.fassungen?.length) return redirect(response, '/theater/besetzung');
    return html(response, A.uploadPage(project, m));
  }

  if (first === 'besetzung') {
    if (!project.drehbuch) return html(response, A.castPage(project, null));
    if (!post) {
      // While showing it, check at once what stays stuck with the current mapping
      let stuck = [];
      if (project.zuordnung) {
        try {
          const b = buildCast(project.zuordnung, project.drehbuch.sprecher, project.personen);
          if (b.cast.length)
            stuck = buildStructure(project.drehbuch.markdown, b.cast, b.tokenMap,
                                  project.drehbuch.quelle,
                                  project.drehbuch.sprecherstil).unresolved;
        } catch { /* then without the hint */ }
      }
      return html(response, A.castPage(project, null, stuck));
    }

    const { fields } = await readForm(request);
    const z = {};
    for (const s2 of project.drehbuch.sprecher) {
      const t = s2.token;
      const art = String(fields['art_' + t] || 'person');
      const e = { art };
      const target = String(fields['ziel_' + t] || '').trim();
      if (target && (art === 'rolle' || art === 'alias')) e.ziel = target;
      z[t] = e;
    }
    project.zuordnung = z;

    const { cast, tokenMap } = buildCast(z, project.drehbuch.sprecher, project.personen);
    if (!cast.length) {
      await S.write(project);
      return html(response, A.castPage(project, { kind: 'error',
        key: 'r.no_person' }));
    }
    let built, newlyCreated;
    try {
      ({ built, newlyCreated } = rebuildStructure(project, cast, tokenMap));
    } catch (e) {
      console.error('[Struktur] ' + (e && e.stack || e));
      await S.write(project);
      return html(response, A.castPage(project, failureNotice(e, 'r.structure_failed')));
    }
    await S.write(project);

    const unresolved = built.unresolved;
    return html(response, A.castPage(project, unresolved.length ? null : {
      kind: 'good',
      key: newlyCreated ? 'r.taken_over_new' : 'r.taken_over',
      values: { p1: project.skript_ueberblick.repliken, p2: cast.length,
               p3: newlyCreated },
    }, unresolved));
  }

  /* --- the audiobook: for the director only ---

     It spends credit in the director's account, so only the director may
     set it going. The finished sound can be passed on afterwards through
     the print link - listening costs nothing more.                  */
  if (first === 'hoerbuch') {
    if (!project.skript) { await drainBody(request); return html(response,
      A.errorPage('f.no_structure_t', 'f.no_structure'), 404); }

    // Asking for the state: numbers only, so the page does not flicker.
    if (parts[1] === 'stand') {
      await drainBody(request);
      const st = HB.jobStateOf(project.id);
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8',
                               'Cache-Control': 'no-store' });
      return response.end(JSON.stringify(st ? {
        running: st.running, done: st.done, total: st.total,
        lastLine: st.lastLine || '', bytes: st.bytes, error: st.error,
      } : null));
    }

    // Die fertige Tonspur ausliefern.
    if (parts[1] === 'datei') {
      await drainBody(request);
      return await serveAudio(response, project, parts[2] || '', request);
    }

    const show = async (m) => {
      let voices = [];
      if (project.hoerbuch?.schluessel) {
        try { voices = await HB.fetchVoices(project.hoerbuch.schluessel); }
        catch (e) { m = m || { kind: 'error',
          key: e.key, values: e.values, text: e.message }; }
      }
      return html(response, A.audiobookPage(project, {
        voices,
        people: HB.speakingPeople(project.skript),
        jobState: HB.jobStateOf(project.id),
        rehearsals: project.plan?.proben || [],
        models: HB.MODELS,
        acts: HB.actsOf(project.skript),
      }, m));
    };

    if (!post) return await show(null);

    const { fields } = await readForm(request);
    const action = String(fields.action || '');
    project.hoerbuch = project.hoerbuch || {};
    let m = null;

    if (action === 'schluessel') {
      const k = String(fields.schluessel || '').trim();
      if (!k) m = { kind: 'error', key: 'r.no_key_entered' };
      else {
        // Check first, then store - a wrong key would otherwise only
        // have shown only when generating, hours later.
        try {
          await HB.fetchVoices(k);
          project.hoerbuch.schluessel = k;
          await S.write(project);
          m = { kind: 'good', key: 'r.key_stored' };
        } catch (e) { m = { kind: 'error',
          key: e.key, values: e.values, text: e.message }; }
      }
    } else if (action === 'schluessel_weg') {
      delete project.hoerbuch.schluessel;
      await S.write(project);
      m = { kind: 'good', key: 'r.key_removed' };
    } else if (action === 'voices') {
      const chosen = {};
      for (const [k, v] of Object.entries(fields))
        if (k.startsWith('stimme_') && v) chosen[k.slice(7)] = String(v);
      project.hoerbuch.stimmen = chosen;
      if (fields.modell) project.hoerbuch.modell = String(fields.modell);
      await S.write(project);
      const n = Object.keys(chosen).length;
      m = { kind: 'good', key: 'r.voices_saved', values: { p1: n } };
    } else if (action === 'abbrechen') {
      m = HB.cancelJob(project.id);
    } else if (action === 'erzeugen') {
      const raw = String(fields.umfang || 'alles');
      const scope = raw.startsWith('rehearsal:') ? { kind: 'rehearsal', rehearsal: raw.slice(10) }
                   : raw.startsWith('akt:')   ? { kind: 'act', act: Number(raw.slice(4)) }
                   : { kind: 'all' };
      m = HB.startJob(project, scope);
    } else {
      m = { kind: 'error', key: 'r.unknown_action2' };
    }
    return await show(m);
  }

  if (first === 'plan') {
    /* --- the passages of one rehearsal ---

       The plan names only the cast and the minutes. Whether the cut is
       any good is decided by the text - so it is one click away.     */
    if (parts[1]) {
      await drainBody(request);
      const id = decodeURIComponent(parts[1]);
      if (!project.skript || !project.plan) return html(response,
        A.errorPage('f.no_plan_t', 'f.no_plan'), 404);
      let d;
      try { d = passagesOf(project.skript, project.plan, id); }
      catch (e) {
        console.error('[Passagen] ' + (e && e.stack || e));
        return html(response, A.errorPage('f.failed3_t', 'f.failed3', { reason: reasonOf(e) }), 500);
      }
      if (!d) return html(response, A.errorPage('f.rehearsal_gone_t', 'f.rehearsal_gone'), 404);
      return html(response, A.passagesPage(project, d, null));
    }
    if (!post) return html(response, A.planPage(project, null, actsIn(project.skript)));
    if (!project.skript) return html(response, A.planPage(project, {
      kind: 'error', key: 'r.without_cast' }));
    const { fields } = await readForm(request);
    const action = String(fields.action || 'ableiten');
    const acts = actsIn(project.skript);
    const show = (m) => html(response, A.planPage(project, m, acts));

    /* --- reset: every rehearsal goes, and with them the fixed dates --- */
    if (action === 'zuruecksetzen') {
      const n = project.plan?.proben?.length || 0, d = (project.termine || []).length;
      project.plan = null; project.termine = [];
      await S.write(project);
      Reminders.refresh(project);
      return show({ kind: 'good', key: 'r.plan_reset', values: { p1: n, p2: d } });
    }

    /* --- from Hand nachbessern --- */
    if (action !== 'ableiten') {
      if (!project.plan?.proben?.length) return html(response, A.planPage(project, {
        kind: 'error', key: 'r.no_plan_to_revise' }));
      const rehearsal = String(fields.rehearsal || '');
      let m = null;
      if (action === 'streichen')      m = B.dropRehearsal(project, rehearsal);
      else if (action === 'zusammen')  m = fields.others
        ? B.mergeRehearsals(project, rehearsal, String(fields.others))
        : { kind: 'error', key: 'r.merge_with_what' };
      else if (action === 'dazu')      m = fields.person
        ? B.changeCast(project, rehearsal, String(fields.person), true)
        : { kind: 'error', key: 'r.add_whom' };
      else if (action === 'weg')       m = fields.person
        ? B.changeCast(project, rehearsal, String(fields.person), false)
        : { kind: 'error', key: 'r.remove_whom' };
      else if (action === 'notiz')     m = B.setNote(project, rehearsal, fields.notiz);
      else m = { kind: 'error', key: 'r.unknown_action3' };

      if (m.kind === 'good') await S.write(project);
      return html(response, A.planPage(project, m));
    }

    /* --- derive: for the chosen acts, adding to or replacing what is
           there. Rehearsals with a fixed date are never touched.     --- */
    const substitution = Math.min(40, Math.max(0, Number(fields.substitution ?? 20))) / 100;
    const maxGroup = Math.min(7, Math.max(2, Number(fields.maxgruppe ?? 5)));
    const mode = String(fields.modus || 'ersetzen');
    // A form without the act section (a script, an old client) means all acts.
    const offered = fields.akte === '1';
    const chosenActs = offered ? acts.map(a => a.nr).filter(nr => fields['akt_' + nr] === '1')
                               : acts.map(a => a.nr);
    const allActs = !acts.length || chosenActs.length === acts.length;
    if (offered && acts.length && !chosenActs.length) return show({ kind: 'error', key: 'r.no_acts' });
    const actList = allActs ? [] : chosenActs;

    const had = project.plan?.proben?.length ? project.plan : null;
    const fixedIds = new Set((project.termine || []).filter(t => t.bestaetigt).map(t => t.probe_id));
    let kept = [];
    if (had) {
      if (mode === 'ergaenzen') kept = had.proben;
      else kept = had.proben.filter(pr => fixedIds.has(pr.id) ||
        (!allActs && !(pr.szenen || []).some(sz => chosenActs.includes(Number(sz.akt)))));
    }
    let fresh;
    try {
      fresh = derivePlan(project.skript, { substitution, maxGroup, acts: actList,
        covered: kept.length ? unitsCoveredBy(project.skript, kept) : new Set() });
    } catch (e) {
      console.error('[Ableitung] ' + (e && e.stack || e));
      return show({ kind: 'error', key: 'r.derive_failed', values: { reason: reasonOf(e) } });
    }
    if (!fresh.proben.length && !kept.length) return show({ kind: 'error', key: 'r.no_rehearsal_found' });

    const droppedFixed = 0;
    let plan;
    if (!had) plan = fresh;
    else {
      plan = { ...had, proben: kept, erzeugt: fresh.erzeugt };
      mergeInto(project.skript, plan, fresh, { substitution, maxGroup });
    }
    project.plan = plan;
    // Dates of rehearsals that are gone go with them; fixed ones stayed.
    const keptIds = new Set(plan.proben.map(pr => pr.id));
    project.termine = (project.termine || []).filter(t => keptIds.has(t.probe_id));
    await S.write(project);
    const actNames = (allActs ? acts : acts.filter(a => chosenActs.includes(a.nr))).map(a => h(a.name)).join(', ');
    return show({ kind: 'good',
      key: !had ? 'r.derived' : mode === 'ergaenzen' ? 'r.derived_added' : 'r.derived_replaced',
      values: { p1: fresh.proben.length, p2: { share: plan.abdeckung },
                p3: kept.filter(pr => fixedIds.has(pr.id)).length, acts: actNames || '\u2013',
                total: plan.proben.length } });
  }

  if (first === 'leute') {
    if (!post) return html(response, A.companyPage(project, null, base));
    const { fields } = await readForm(request);
    // Action values stay German, like the URL paths; 'neu' is the default
    // and what the form sends.
    const action = String(fields.action || 'neu');
    project.personen = project.personen || [];
    let m;

    /* Short names come from a form once, so they go through h() before
       they land in a notice - the catalogue puts values in as they are. */
    if (action === 'loeschen') {
      const x = project.personen.find(y => y.id === String(fields.id || ''));
      if (!x) m = { kind: 'error', key: 'r.person_gone2' };
      else {
        project.personen = project.personen.filter(y => y !== x);
        if (project.verfuegbar) delete project.verfuegbar[x.id];
        m = { kind: 'good', key: 'r.removed', values: { p1: h(x.b) } };
      }
    } else if (action === 'aendern') {
      const x = project.personen.find(y => y.id === String(fields.id || ''));
      if (!x) m = { kind: 'error', key: 'r.person_gone3' };
      else {
        x.name = String(fields.name || '').trim().slice(0, 80);
        x.regie = fields.regie === '1';
        x.assistenz = fields.assistenz === '1';
        if (!x.regie) delete x.regie;
        if (!x.assistenz) delete x.assistenz;
        m = { kind: 'good', key: 'r.name_saved', values: { p1: h(x.b) } };
      }
    } else if (action === 'neuerlink') {
      project.gruppen_token = S.randomId(18);
      m = { kind: 'good', key: 'r.link_new' };
    } else if (action === 'neuerregielink') {
      project.regie_token = S.randomId(20);
      m = { kind: 'good', key: 'r.director_link_new' };
    } else {
      const b = String(fields.b || '').trim().toUpperCase().slice(0, 30);
      if (!b) m = { kind: 'error', key: 'r.without_short' };
      else if (project.personen.some(x => x.b === b))
        m = { kind: 'error', key: 'r.already_exists', values: { p1: h(b) } };
      else {
        project.personen.push({ id: S.randomId(6), b,
          name: String(fields.name || '').trim().slice(0, 80), token: S.randomId(16) });
        m = { kind: 'good', key: 'r.created', values: { p1: h(b) } };
      }
    }
    await S.write(project);
    project.gruppenlink = base + '/theater/gruppe/' + (project.gruppen_token || '');
    project.regielink = base + '/theater/projekt?s=' + (project.regie_token || '');
    return html(response, A.companyPage(project, m, base));
  }

  if (first === 'drucken') return html(response, A.printPage(project, null));

  /* --- the comments: questions first, then everything --- */
  if (first === 'kommentare') {
    if (!post) return html(response, A.commentsPage(project, null));
    const { fields } = await readForm(request);
    project.kommentare = project.kommentare || [];
    const c = project.kommentare.find(x => x.id === String(fields.id || ''));
    let m;
    if (!c) m = { kind: 'error', key: 'r.comment_gone' };
    else if (fields.action === 'antwort') {
      const text = String(fields.text || '').trim().slice(0, 2000);
      const by = regie?.person?.name || regie?.person?.b || t_(L, 'cmt.director');
      c.antwort = text ? { text, wer: by, datum: new Date().toISOString() } : null;
      m = { kind: 'good', key: text ? 'r.answer_saved' : 'r.answer_removed' };
    } else if (fields.action === 'erledigt') {
      c.erledigt = !c.erledigt;
      m = { kind: 'good', key: c.erledigt ? 'r.comment_done' : 'r.comment_reopened' };
    } else if (fields.action === 'loeschen') {
      project.kommentare = project.kommentare.filter(x => x !== c);
      m = { kind: 'good', key: 'r.comment_deleted' };
    } else m = { kind: 'error', key: 'r.unknown_action' };
    if (m.kind === 'good') await S.write(project);
    return html(response, A.commentsPage(project, m));
  }

  if (first === 'datei') {
    if (!project.drehbuch) return html(response, A.printPage(project, {
      kind: 'error', key: 'r.no_script_stored' }));
    const action = parts[1] || 'gesamt';
    const query = new URLSearchParams((request.url || '').split('?')[1] || '');
    const { cast, tokenMap } = buildCast(project.zuordnung, project.drehbuch.sprecher, project.personen);
    const shortName = (project.drehbuch.quelle || 'drehbuch').replace(/\.[^.]+$/, '');

    let text, name;
    try {
      if (action === 'rolle') {
        const person = String(query.get('person') || '');
        text = buildDocument(project.drehbuch, cast, tokenMap, 'rolle',
                            { person, context: query.get('kontext') ?? 1 });
        name = `${shortName} – Rollenheft ${person}.html`;
      } else if (action === 'probenplan') {
        text = buildDocument(project.drehbuch, cast, tokenMap, 'probenplan',
                            { plan: project.plan });
        name = `${shortName} – Probenplan.html`;
      } else {
        text = buildDocument(project.drehbuch, cast, tokenMap, 'gesamt');
        name = `${shortName} – Gesamtskript.html`;
      }
    } catch (e) {
      console.error('[Dokument] ' + (e && e.stack || e));
      return html(response, A.printPage(project, { kind: 'error',
        key: 'r.typeset_failed', values: { reason: reasonOf(e) } }));
    }

    return sendFile(response, text, name);
  }

  if (first === 'termine') {
    if (!post) return html(response, A.datesPage(project, proposeDates(project), null));
    const { fields } = await readForm(request);
    const rehearsal = String(fields.rehearsal || '');
    const before = (project.termine || []).find(t => t.probe_id === rehearsal);
    let m = null;

    if (fields.action === 'place') {
      if (!before) m = { kind: 'error', key: 'r.no_date2' };
      else {
        before.ort = String(fields.place || '').trim().slice(0, 120);
        m = placeNotice(rehearsal, before.ort);
      }
      await S.write(project);
      return html(response, A.datesPage(project, proposeDates(project), m));
    }

    /* Only a rehearsal the plan knows can be fixed - the identifier comes
       from a form and would otherwise go into the notice as it is. */
    const pr = (project.plan?.proben || []).find(x => x.id === rehearsal);
    if (!pr) {
      await drainBody(request);
      return html(response, A.datesPage(project, proposeDates(project),
        { kind: 'error', key: 'msg.rehearsal_gone' }));
    }
    project.termine = (project.termine || []).filter(t => t.probe_id !== rehearsal);
    if (fields.action === 'halten' && date(fields.iso)) {
      project.termine.push({
        probe_id: rehearsal, iso: fields.iso,
        von: time(fields.from) || '', bis: time(fields.to) || '',
        gruppe: pr.gruppe, bestaetigt: true,
        ort: String(fields.place || '').trim().slice(0, 120) || before?.ort || '',
        gehalten: new Date().toISOString(),
      });
      m = { kind: 'good', key: 'r.fixed', values: { p1: h(rehearsal) } };
    } else if (fields.action === 'loesen') {
      m = { kind: 'good', key: 'r.released2', values: { p1: h(rehearsal) } };
    }
    await S.write(project);
    Reminders.refresh(project);
    return html(response, A.datesPage(project, proposeDates(project), m));
  }

  return html(response, A.errorPage('f.not_found3_t', 'f.not_found3'), 404);
}

export { S as storage };
