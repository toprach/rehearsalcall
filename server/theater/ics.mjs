/* ---------------------------------------------------------------------
   A calendar feed for one person: the rehearsals and the own evenings,
   as iCalendar text that a phone or a desktop calendar subscribes to.

   Times are written "floating" - 19:00 is 19:00 wherever the phone is
   set - which is exactly what a wall-clock rehearsal time means; so no
   time zone block is needed. Fixed rehearsals are events, proposals
   are tentative events, the own evenings are transparent (they do not
   block the calendar). Every event links into the app.

   Generating iCalendar is a page of text; a library would bring
   node_modules to a server that runs without any. So this stays small
   and does the two things that matter: escaping and line folding.
   --------------------------------------------------------------------- */

import { proposeDates } from './dates.mjs';
import { language, isLanguage } from './texts.mjs';

const esc = s => String(s ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const stamp = (iso, hm) => iso.replace(/-/g, '') + 'T' + hm.replace(':', '') + '00';
const utcNow = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');

/* Lines longer than 75 octets are folded with CRLF + space. */
function fold(line) {
  const out = [];
  let buf = '';
  for (const ch of line) {
    const bytes = Buffer.byteLength(ch, 'utf8');
    if (Buffer.byteLength(buf, 'utf8') + bytes > (out.length ? 74 : 75)) { out.push(buf); buf = ' '; }
    buf += ch;
  }
  out.push(buf);
  return out.join('\r\n');
}

function event(fields) {
  const lines = ['BEGIN:VEVENT'];
  for (const [k, v] of Object.entries(fields)) if (v != null && v !== '') lines.push(fold(k + ':' + v));
  lines.push('END:VEVENT');
  return lines;
}

export function feedFor(project, person, base) {
  const code = project.einstellungen?.sprache;
  const t = language(isLanguage(code) ? code : 'de').t;
  const me = person.b;
  const link = (id) => base + '/theater/ich/' + (person.token || '') + '/plan/' + encodeURIComponent(id);
  const now = utcNow();
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//rehearsalcall//' + esc(project.id) + '//DE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    fold('X-WR-CALNAME:' + esc(project.titel)), 'REFRESH-INTERVAL;VALUE=DURATION:PT1H', 'X-PUBLISHED-TTL:PT1H',
  ];

  const titleFor = (id, group) => {
    const inIt = person.regie || group.includes(me);
    const others = group.filter(b => b !== me);
    if (inIt) return others.length ? t('ics.with_me', { id, others: others.join(' + ') }) : t('ics.with_me_alone', { id });
    return t('ics.without_me', { id, who: group.join(', ') });
  };
  const describe = (id, group, place) => [
    t('ics.cast', { who: group.join(', ') }), place ? t('ics.place', { place }) : '', t('ics.passages', { url: link(id) }),
  ].filter(Boolean).join('\n');

  // fixed rehearsals
  const fixed = new Set();
  for (const x of project.termine || []) {
    if (!x.bestaetigt || !x.iso || !x.von) continue;
    const group = x.gruppe || (project.plan?.proben || []).find(p => p.id === x.probe_id)?.gruppe || [];
    fixed.add(x.probe_id);
    lines.push(...event({
      UID: project.id + '-' + x.probe_id + '@rehearsalcall',
      DTSTAMP: now,
      DTSTART: stamp(x.iso, x.von),
      DTEND: x.bis ? stamp(x.iso, x.bis) : null,
      SUMMARY: esc(titleFor(x.probe_id, group)),
      DESCRIPTION: esc(describe(x.probe_id, group, x.ort)),
      LOCATION: x.ort ? esc(x.ort) : null,
      URL: link(x.probe_id),
      STATUS: 'CONFIRMED',
    }));
  }

  // proposals: what the program would take, tentative
  try {
    for (const pr of proposeDates(project).rehearsals) {
      if (!pr.proposal || fixed.has(pr.id)) continue;
      lines.push(...event({
        UID: project.id + '-' + pr.id + '-vorschlag@rehearsalcall',
        DTSTAMP: now,
        DTSTART: stamp(pr.proposal.iso, pr.proposal.from),
        DTEND: stamp(pr.proposal.iso, pr.proposal.to),
        SUMMARY: esc(t('ics.proposal') + titleFor(pr.id, pr.group)),
        DESCRIPTION: esc(t('ics.proposal_what') + '\n' + describe(pr.id, pr.group, '')),
        URL: link(pr.id),
        STATUS: 'TENTATIVE',
        TRANSP: 'TRANSPARENT',
      }));
    }
  } catch { /* no plan: nothing to propose */ }

  // the own evenings
  const v = project.verfuegbar?.[person.id] || {};
  for (const [iso, e] of Object.entries(v.tage || {})) {
    if (!e || !e.von || !e.bis) continue;
    lines.push(...event({
      UID: project.id + '-' + person.id + '-frei-' + iso + '@rehearsalcall',
      DTSTAMP: now,
      DTSTART: stamp(iso, e.von),
      DTEND: stamp(iso, e.bis),
      SUMMARY: esc(t('ics.free')),
      DESCRIPTION: esc(t('ics.free_what', { title: project.titel })),
      URL: base + '/theater/ich/' + (person.token || '') + '/zeiten',
      TRANSP: 'TRANSPARENT',
    }));
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}
