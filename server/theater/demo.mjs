/* ---------------------------------------------------------------------
   Demo projects: two public-domain plays, open to everyone, and put
   back to how they were every 24 hours.

   The start page offers them; a visitor gets in as the director without
   a code, or through the company link as a member. Whatever they change
   stays for the others until the next reset - names, plans, dates,
   comments - so the demo looks used, not empty.

   What a demo does NOT allow (the router enforces it): uploading a
   script and generating an audiobook. The first would make the server
   host anybody's files for a day, the second keeps an API key with the
   project.

   The play files sit in THEATER_DEMO, by default beispiel/shakespeare
   of the repository. Without them there are no demos and the start
   page shows nothing of it.
   --------------------------------------------------------------------- */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as S from './storage.mjs';
import { readScript, buildStructure, buildCast, mappingProposal, normKey } from './script.mjs';
import { derivePlan, peopleOf, summaryOf } from './plan.mjs';
import { proposeDates, calendarDays } from './dates.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = process.env.THEATER_DEMO || path.resolve(HERE, '../../beispiel/shakespeare');
export const RESET_MS = 24 * 60 * 60 * 1000;

export const DEMOS = [
  { key: 'midsummer', title: 'A Midsummer Night’s Dream', file: 'a-midsummer-nights-dream.md',
    cast: 'midsummer-cast.json', language: 'en' },
  { key: 'macbeth', title: 'Macbeth', file: 'macbeth.md', cast: null, language: 'en' },
];

/* The demos whose files are actually there. */
export const available = () => DEMOS.filter(d => fs.existsSync(path.join(DIR, d.file)));

/* A small deterministic random source, so that the same demo comes
   back the same way after every reset. */
function rng(seed) {
  let a = 0;
  for (const c of seed) a = (a * 31 + c.charCodeAt(0)) >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const iso = d => d.toISOString().slice(0, 10);

/* The mapping the casting file asks for - the same reading as the
   deploy script uses: people, roles of people, spellings, groups. */
function mappingFrom(script, castFile) {
  const z = mappingProposal(script.sprecher);
  const names = new Map();                       // short name -> actor
  if (!castFile) return { z, names };
  const cfg = JSON.parse(fs.readFileSync(castFile, 'utf8'));
  const people = new Map(), roles = new Map(), aliases = new Map();
  for (const p of cfg.cast || []) {
    people.set(normKey(p.b), p);
    if (p.a) names.set(p.b, p.a);
    for (const al of p.aliases || []) aliases.set(normKey(al), p.b);
    for (const rl of p.roles || []) {
      roles.set(normKey(rl.c), p.b);
      for (const al of rl.aliases || []) aliases.set(normKey(al), rl.c);
    }
  }
  const byKey = new Map(script.sprecher.map(s => [normKey(s.token), s.token]));
  const tokenFor = name => byKey.get(normKey(name)) || name;
  for (const s of script.sprecher) {
    const t = s.token, k = normKey(t);
    if (people.has(k)) z[t] = { art: 'person' };
    else if (roles.has(k)) z[t] = { art: 'rolle', ziel: tokenFor(roles.get(k)) };
    else if (aliases.has(k)) z[t] = { art: 'alias', ziel: tokenFor(aliases.get(k)) };
    else {
      const tm = (cfg.tokenMap || {})[k] ?? (cfg.tokenMap || {})[t];
      if (tm === 'GROUP') z[t] = { art: 'gruppe' };
      else if (tm === 'IGNORE') z[t] = { art: 'ignorieren' };
      else if (typeof tm === 'string' && /^[BC]:/.test(tm)) z[t] = { art: 'alias', ziel: tokenFor(tm.slice(2)) };
    }
  }
  return { z, names };
}

/* Build the project afresh. An existing record lends its id, code and
   links, so that cookies and bookmarks survive the reset. */
export async function seed(def, existing = null) {
  const now = new Date();
  const random = rng(def.key);
  const script = await readScript(fs.readFileSync(path.join(DIR, def.file)), def.file);
  script.nr = 1; script.hochgeladen = now.toISOString(); script.aenderungen = null;

  const end = new Date(now); end.setDate(end.getDate() + 70);
  const p = {
    id: existing?.id || S.randomId(8),
    titel: def.title,
    code_streuwert: existing?.code_streuwert || S.hashOf(S.newCode()),
    angelegt: existing?.angelegt || now.toISOString(),
    regie_email: '',
    demo: def.key,
    demo_reset: now.toISOString(),
    gruppen_token: existing?.gruppen_token || S.randomId(18),
    regie_token: existing?.regie_token || S.randomId(20),
    druck_token: existing?.druck_token || S.randomId(18),
    personen: [],
    drehbuch: script,
    fassungen: [],
    zuordnung: null, skript: null, plan: null,
    verfuegbar: {}, termine: [], kommentare: [],
    einstellungen: { sprache: def.language, von: '', bis: iso(end) },
  };

  const { z, names } = mappingFrom(script, def.cast ? path.join(DIR, def.cast) : null);
  p.zuordnung = z;
  const { cast, tokenMap } = buildCast(z, script.sprecher, []);
  const built = buildStructure(script.markdown, cast, tokenMap, script.quelle, script.sprecherstil);
  p.skript = built.structure;
  p.skript_ueberblick = summaryOf(built.structure);
  for (const x of peopleOf(built.structure)) {
    const old = (existing?.personen || []).find(y => y.b === x.b);
    p.personen.push({ id: old?.id || S.randomId(6), b: x.b, name: names.get(x.b) || x.name || '',
                      funktion: x.funktion, token: old?.token || S.randomId(16) });
  }

  p.plan = derivePlan(p.skript, { substitution: 0.2, maxGroup: 5 });

  /* Availability: most people have entered a few evenings a week, a
     few have not yet - the way a real company looks a fortnight in. */
  const days = calendarDays(p);
  p.personen.forEach((x, i) => {
    if (random() < 0.2) return;
    const tage = {};
    for (const d of days) {
      const evening = [2, 4, 5, 0].includes(d.weekday);     // Tue, Thu, Fri, Sun
      if (evening && random() < 0.7) tage[d.iso] = { von: '19:00', bis: '22:30' };
      else if (!evening && random() < 0.15) tage[d.iso] = { von: '19:30', bis: '22:00' };
    }
    p.verfuegbar[x.id] = { tage, stand: now.toISOString() };
  });

  /* A few dates already fixed, from the program's own proposals. */
  const r = proposeDates(p);
  for (const pr of r.rehearsals.filter(x => x.proposal).slice(0, 3)) {
    p.termine.push({ probe_id: pr.id, iso: pr.proposal.iso, von: pr.proposal.from, bis: pr.proposal.to,
                     gruppe: pr.group, bestaetigt: true, ort: 'Rehearsal hall',
                     gehalten: now.toISOString(), von_wem: 'demo' });
  }
  return p;
}

const stale = p => !p.demo_reset || Date.now() - Date.parse(p.demo_reset) > RESET_MS;

/* The demo project for a key, as it is - a visitor never waits for a
   rebuild (deriving a plan for a big cast takes the better part of a
   minute). The hourly check below does the resetting. Null when the
   files are not there or the project has not been made yet. */
export async function demoProject(key) {
  if (!available().some(d => d.key === key)) return null;
  return (await S.allProjects()).find(p => p.demo === key) || null;
}

/* Make what is missing, rebuild what is a day old. Runs at start and
   once an hour, never in a request. */
export async function ensureAll() {
  for (const def of available()) {
    try {
      const existing = (await S.allProjects()).find(p => p.demo === def.key) || null;
      if (existing && !stale(existing)) continue;
      const p = await seed(def, existing);
      await S.write(p);
      console.log('[Demo] ' + (existing ? 'reset ' : 'created ') + def.key + ' (' + p.id + ')');
    } catch (e) { console.error('[Demo] ' + def.key + ': ' + (e && e.stack || e)); }
  }
}
