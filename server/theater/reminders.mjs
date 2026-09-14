/* ---------------------------------------------------------------------
   The daily reminder to learn one's lines.

   A member picks a time on the part-book page and lets the phone
   subscribe; the subscription is stored with the project under the
   person, German field names as everywhere:

     erinnerung[personId] = {
       zeit: '19:00', zone: 'Europe/Vienna', zuletzt: '2026-09-13',
       abos: [{ endpoint, p256dh, auth, seit }],
       termine_gesendet: ['P04@2026-09-20']     // rehearsals already announced
     }

   The same subscriptions carry a second kind of message: an hour before
   a fixed rehearsal the person is in (the director is in all of them),
   once per rehearsal and day. The daily message names the next
   rehearsal too when it is today or tomorrow.

   Every quarter of an hour the clock looks at every entry: when the
   wall clock in the person's time zone has passed the chosen time - by
   less than two hours, so a service that was down at that moment still
   catches up, but yesterday's is not sent at dawn - and nothing was
   sent that day, the message goes out to each subscription: with the
   figures of the day, due and new, so it is worth opening. What is
   looked at is a small index in memory, filled at start and kept up to
   date by the route; the project itself is read only when something is
   to be sent. No cron entry is needed.
   --------------------------------------------------------------------- */

import * as S from './storage.mjs';
import * as Push from './push.mjs';
import { partBook } from './book.mjs';
import * as Learn from './learn.mjs';
import { language, isLanguage } from './texts.mjs';

/* ---------- time ---------- */

/* Date and hh:mm on the wall clock of a zone; UTC if the zone is not
   one the runtime knows. */
export function localParts(zone, nowMs = Date.now()) {
  let f;
  try { f = new Intl.DateTimeFormat('en-GB', { timeZone: zone || 'UTC', hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); }
  catch { f = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); }
  const p = {};
  for (const x of f.formatToParts(new Date(nowMs))) p[x.type] = x.value;
  return { date: p.year + '-' + p.month + '-' + p.day, hm: (p.hour === '24' ? '00' : p.hour) + ':' + p.minute };
}
export const validZone = zone => { try { new Intl.DateTimeFormat('en-GB', { timeZone: zone }); return true; } catch { return false; } };
export const validTime = t => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(t || ''));

/* The local date if the entry is due now, else null: the chosen time
   has passed today by less than the window, and nothing went out. */
export const WINDOW_MIN = 120;
export const LEAD_MIN = 60;                 // the rehearsal reminder: an hour before
const minutesOf = hm => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3, 5));

/* The fixed rehearsals this person goes to, soonest first. The director
   is at every one. */
export function rehearsalsOf(project, person) {
  const out = [];
  for (const x of project.termine || []) {
    if (!x.bestaetigt || !x.iso || !validTime(x.von)) continue;
    const group = x.gruppe || (project.plan?.proben || []).find(p => p.id === x.probe_id)?.gruppe || [];
    if (!person.regie && !group.includes(person.b)) continue;
    out.push({ id: x.probe_id, iso: x.iso, von: x.von, bis: validTime(x.bis) ? x.bis : '', ort: x.ort || '', gruppe: group });
  }
  return out.sort((a, b) => (a.iso + a.von).localeCompare(b.iso + b.von));
}
export const rehearsalKey = r => r.id + '@' + r.iso;

/* The rehearsals of an entry that want their message now: today in the
   person's zone, within the hour before the start, not yet announced. */
export function rehearsalsDue(entry, nowMs = Date.now()) {
  if (!entry || !(entry.termine || []).length) return [];
  const { date, hm } = localParts(entry.zone, nowMs);
  const now = minutesOf(hm), sent = new Set(entry.gesendet || []);
  return entry.termine.filter(r => r.iso === date && !sent.has(rehearsalKey(r)) &&
    now >= minutesOf(r.von) - LEAD_MIN && now < minutesOf(r.von));
}
export function dueNow(entry, nowMs = Date.now()) {
  if (!entry || !validTime(entry.zeit)) return null;
  const { date, hm } = localParts(entry.zone, nowMs);
  const late = minutesOf(hm) - minutesOf(entry.zeit);
  if (late < 0 || late >= WINDOW_MIN) return null;
  if (entry.zuletzt === date) return null;
  return date;
}

/* ---------- the index ---------- */

const index = new Map();          // projectId -> { personId -> { zeit, zone, zuletzt } }

export function refresh(project) {
  const entries = {};
  for (const [pid, e] of Object.entries(project.erinnerung || {})) {
    if (!e || !validTime(e.zeit) || !(e.abos || []).length) continue;
    const person = (project.personen || []).find(x => x.id === pid);
    entries[pid] = { zeit: e.zeit, zone: e.zone, zuletzt: e.zuletzt || '',
                     termine: person ? rehearsalsOf(project, person) : [], gesendet: e.termine_gesendet || [] };
  }
  if (Object.keys(entries).length) index.set(project.id, entries); else index.delete(project.id);
}
export async function load() {
  index.clear();
  for (const p of await S.allProjects()) refresh(p);
  return index.size;
}
export const indexed = () => [...index.entries()].map(([id, e]) => ({ id, people: Object.keys(e) }));

/* ---------- the message ---------- */

/* What the day looks like for this person: due and new, in their
   language. today is the date in their zone. */
export function messageFor(project, person, today) {
  const code = project.einstellungen?.sprache;
  const t = language(isLanguage(code) ? code : 'de').t;
  let due = 0, fresh = 0, total = 0;
  try {
    const chunks = partBook(project.skript, person.b).flatMap(p => p.chunks);
    const f = Learn.summary(project.lernen?.[person.id] || {}, chunks, today);
    due = f.due; fresh = f.fresh; total = f.total;
  } catch { /* no script yet: still a nudge */ }
  let body = !total ? t('push.body_none') : !due && !fresh ? t('push.body_done') : t('push.body', { due, fresh });
  // the next rehearsal, when it is today or tomorrow
  const tomorrow = addDaysIso(today, 1);
  const next = rehearsalsOf(project, person).find(r => r.iso >= today);
  if (next && next.iso <= tomorrow)
    body += ' ' + t('push.next_rehearsal', { id: next.id, when: t(next.iso === today ? 'push.today' : 'push.tomorrow'), von: next.von });
  return { title: t('push.title', { title: project.titel }), body, url: '/theater/ich/' + (person.token || '') + '/heft' };
}
const addDaysIso = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

/* An hour before a rehearsal: when, where, with whom. */
export function messageForRehearsal(project, person, r) {
  const code = project.einstellungen?.sprache;
  const t = language(isLanguage(code) ? code : 'de').t;
  const others = (r.gruppe || []).filter(b => b !== person.b);
  return {
    title: t('push.rehearsal_title', { title: project.titel, id: r.id }),
    body: t('push.rehearsal_body', { von: r.von, bis: r.bis ? '\u2013' + r.bis : '', ort: r.ort ? ' \u00b7 ' + r.ort : '',
                                     with: others.length ? ' \u00b7 ' + t('push.with', { who: others.join(', ') }) : '' }),
    url: '/theater/ich/' + (person.token || '') + '/termine',
  };
}
export function testMessage(project, person, entry) {
  const code = project.einstellungen?.sprache;
  const t = language(isLanguage(code) ? code : 'de').t;
  return { title: t('push.test_title'), body: t('push.test_body', { zeit: entry.zeit }),
           url: '/theater/ich/' + (person.token || '') + '/heft' };
}

/* Send one payload to every subscription of an entry; dead ones are
   dropped. Returns how many took it. */
export async function deliver(entry, payload) {
  const keys = Push.keysFromEnv();
  if (!keys) return 0;
  let sent = 0;
  const keep = [];
  for (const abo of entry.abos || []) {
    const r = await Push.send(keys, abo, payload);
    if (r.ok) sent++;
    if (!r.gone) keep.push(abo);
    if (!r.ok) console.error('[push] ' + new URL(abo.endpoint).host + ' -> ' + (r.status || r.error));
  }
  entry.abos = keep;
  return sent;
}

/* ---------- the clock ---------- */

let running = false;
export async function tick(nowMs = Date.now()) {
  if (running || !Push.enabled()) return 0;
  running = true;
  let sent = 0;
  try {
    for (const [projectId, people] of [...index.entries()]) {
      const duePeople = Object.entries(people).filter(([, e]) => dueNow(e, nowMs) || rehearsalsDue(e, nowMs).length);
      if (!duePeople.length) continue;
      const project = await S.read(projectId);
      if (!project) { index.delete(projectId); continue; }
      let changed = false;
      for (const [pid, indexed] of duePeople) {
        const entry = project.erinnerung?.[pid];
        if (!entry) continue;
        const person = (project.personen || []).find(x => x.id === pid);
        // the daily message
        const date = dueNow(entry, nowMs);
        if (date) {
          entry.zuletzt = date; changed = true;
          if (person) sent += await deliver(entry, messageFor(project, person, date));
        }
        // the hour before a rehearsal, once each
        for (const r of rehearsalsDue({ ...indexed, gesendet: entry.termine_gesendet || [] }, nowMs)) {
          entry.termine_gesendet = (entry.termine_gesendet || []).concat(rehearsalKey(r)).slice(-100); changed = true;
          if (person) sent += await deliver(entry, messageForRehearsal(project, person, r));
        }
        if (!entry.abos.length) { delete project.erinnerung[pid]; changed = true; }
      }
      if (changed) { await S.write(project); refresh(project); }
    }
  } catch (e) {
    console.error('[push] ' + (e && e.stack || e));
  } finally { running = false; }
  return sent;
}

let timer = null;
export async function start() {
  if (!Push.enabled()) { console.log('[' + new Date().toISOString() + '] push: off (no THEATER_PUSH_* keys)'); return; }
  const n = await load();
  console.log('[' + new Date().toISOString() + '] push: on, reminders in ' + n + ' project(s)');
  /* Every five minutes, so "an hour before" is an hour and not
     seventy minutes; once an hour the index is rebuilt from the
     records, in case a date was fixed by a path that did not say so. */
  const STEP = 5 * 60 * 1000;
  let runs = 0;
  const schedule = () => {
    const ms = STEP - (Date.now() % STEP) + 2000;          // just after the five minutes
    timer = setTimeout(async () => { if (++runs % 12 === 0) await load(); await tick(); schedule(); }, ms);
    timer.unref();
  };
  tick();                                                  // what was missed while down
  schedule();
}
export function stop() { if (timer) clearTimeout(timer); timer = null; }
