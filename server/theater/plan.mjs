/* ---------------------------------------------------------------------
   Deriving the rehearsal plan from the script.

   The input is the structure JSON the tool makes out of the script. It
   holds the casting (which actor plays which role) and the whole play in
   blocks. Out of that, the passages worth rehearsing are found here and
   bundled into evenings.

   The search itself lives in scenes.mjs - the same method that also runs
   locally. What is added here is the selection: what gets chosen is not
   a scene but a CAST; if the evening for that cast is happening anyway,
   every further passage for the same people costs nothing more.
   --------------------------------------------------------------------- */

import { findScenes, WPM, score } from './scenes.mjs';
import { SILENT_WEIGHT, loadTimeline } from './timeline.mjs';
import { unitsOf, recompute, sortPlan } from './revise.mjs';

/* As in scenes.mjs: split one unit into own and foreign words. */
function weigh(u, G) {
  let own = 0, foreign = u.groupWords;
  for (const [person, w] of u.speaks) (G.has(person) ? (own += w) : (foreign += w));
  for (const person of u.silent) if (!G.has(person)) foreign += SILENT_WEIGHT;
  return { own, foreign };
}

/* opt.acts     which acts to derive for (numbers); default all
   opt.covered  unit indexes already covered by rehearsals that stay -
                nothing is derived for them a second time            */
export function derivePlan(structure, opt = {}) {
  const substitution = Math.min(0.4, Math.max(0, Number(opt.substitution ?? 0.20)));
  const maxGroup = Math.min(9, Math.max(2, Number(opt.maxGroup ?? 5)));
  const minValue = Number(opt.minValue ?? 40);
  const acts = Array.isArray(opt.acts) && opt.acts.length ? new Set(opt.acts.map(Number)) : null;
  const covered = opt.covered instanceof Set ? opt.covered : new Set();

  const { scenes, units, s } = findScenes(structure, {
    shares: [substitution],
    sizes: [2, 3, 4, 5, 6, 7, 8, 9].filter(k => k <= maxGroup),
  });

  /* What is there to cover: the selected acts, minus what stays covered. */
  const wanted = u => (!acts || acts.has(Number(u.act))) && !covered.has(u.i);
  const open = units.map(u => wanted(u) ? u.ownWords : 0);
  const totalWords = open.reduce((a, b) => a + b, 0) || 1;
  const newIn = z => { let n = 0; for (let i = z.from; i <= z.to; i++) n += open[i]; return n; };
  const remainingValue = z => score(z, s) * (z.own ? newIn(z) / z.own : 0);

  /* Trim a scene down to what is still open.

     The catalogue holds overlapping passages - the same place can be
     rehearsable in several casts. Pick two of them and the same text
     would stand twice in the rehearsal book, with the markings on top of
     each other. So pull the edges back until only what is new remains;
     the middle stays untouched, because a passage has to hang together. */
  const trim = z => {
    while (z.from <= z.to && open[z.from] === 0) z.from++;
    while (z.to >= z.from && open[z.to] === 0) z.to--;
    let own = 0, foreign = 0, speeches = 0;
    for (let i = z.from; i <= z.to; i++) {
      const w = weigh(units[i], new Set(z.group));
      own += w.own; foreign += w.foreign; speeches += units[i].speeches;
    }
    z.own = own; z.foreign = foreign; z.speeches = speeches;
    z.share = foreign / ((own + foreign) || 1);
    z.minutes = (own + foreign) / WPM;
    z.act = units[z.from].act;
    z.cueFrom = units[z.from].cueFrom; z.cueTo = units[z.to].cueTo;
    for (let i = z.from; i <= z.to && z.cueFrom == null; i++) z.cueFrom = units[i].cueFrom;
    for (let i = z.to; i >= z.from && z.cueTo == null; i--) z.cueTo = units[i].cueTo;
    z.preview = units[z.from].preview;
  };

  const chosen = [];
  const taken = new Set();
  for (;;) {
    let best = null, bestValue = minValue;
    for (const z of scenes) {
      if (taken.has(z)) continue;
      if (newIn(z) < s.minOwnWords) continue;
      const v = remainingValue(z);
      if (v > bestValue) { bestValue = v; best = z; }
    }
    if (!best) break;
    const G = new Set(best.group);
    for (;;) {
      const more = scenes.filter(z => !taken.has(z) &&
        z.group.every(x => G.has(x)) && newIn(z) >= s.minOwnWords &&
        remainingValue(z) > 0);
      if (!more.length) break;
      more.sort((a, b) => remainingValue(b) - remainingValue(a));
      const z = more[0];
      taken.add(z);
      trim(z);
      chosen.push(z);
      for (let i = z.from; i <= z.to; i++) open[i] = 0;
    }
  }

  /* -------------------------------------------------------------------
     The gleaning.

     The pass above chooses by value - it finds the places that rehearse
     well in small groups and leaves the rest lying. But a rehearsal plan
     may not leave anything lying: every line of the play has to come up
     once.

     So everything still open is gathered into passages and given to the
     cast it needs. Usually that is a larger group than above - and that
     is the honest finding: some places simply cannot be done by two.
     ------------------------------------------------------------------- */
  const neededFor = (a, b) => {
    const who = new Set();
    for (let i = a; i <= b; i++) {
      for (const [person, w] of units[i].speaks) if (w > 0) who.add(person);
      for (const person of units[i].silent) who.add(person);
    }
    return [...who].sort();
  };
  const sizeOf = (a, b) => {
    let own = 0, speeches = 0;
    for (let i = a; i <= b; i++) { own += units[i].ownWords; speeches += units[i].speeches; }
    return { own, speeches };
  };

  // Find the open stretches; bridge short gaps (units already covered),
  // otherwise the rest falls into splinters.
  const GAP = 3;
  const leftovers = [];
  {
    let a = -1, gap = 0;
    for (let i = 0; i < units.length; i++) {
      if (open[i] > 0) { if (a < 0) a = i; gap = 0; }
      else if (a >= 0 && ++gap > GAP) { leftovers.push([a, i - gap]); a = -1; }
    }
    if (a >= 0) leftovers.push([a, units.length - 1]);
  }

  /* Collect first, then bundle: passages whose cast is contained in a
     larger one go to the same evening. Otherwise three rehearsals of
     eight would stand beside one of nine - three times the scheduling
     effort for the same result. */
  const rawLeftovers = leftovers
    .map(([a, b]) => ({ a, b, who: neededFor(a, b) }))
    .filter(r => r.who.length);
  rawLeftovers.sort((x, y) => y.who.length - x.who.length);
  const bundles = [];
  for (const r of rawLeftovers) {
    const into = bundles.find(k => r.who.every(w => k.who.includes(w)));
    if (into) into.parts.push(r);
    else bundles.push({ who: r.who, parts: [r] });
  }
  // A lone person belongs to a rehearsal they are in anyway.
  for (const k of bundles.filter(k => k.who.length < 2)) {
    const host = bundles.find(o => o !== k && o.who.length >= 2 && o.who.includes(k.who[0]))
              || chosen.find(z => z.group.includes(k.who[0]));
    if (host && host.parts) { host.parts.push(...k.parts); k.parts = []; }
    else if (host) { k.who = host.group.slice(); }
  }

  for (const { a, b, who } of bundles.flatMap(k => k.parts.map(t => ({ ...t, who: k.who })))) {
    const size = sizeOf(a, b);
    let own = 0, foreign = 0;
    for (let i = a; i <= b; i++) {
      const w = weigh(units[i], new Set(who));
      own += w.own; foreign += w.foreign;
    }
    chosen.push({
      from: a, to: b, group: who, p: 0,
      own, foreign, speeches: size.speeches,
      share: foreign / ((own + foreign) || 1),
      minutes: (own + foreign) / WPM,
      act: units[a].act,
      cueFrom: units[a].cueFrom, cueTo: units[b].cueTo,
      preview: units[a].preview,
      gleaning: true,
    });
    for (let i = a; i <= b; i++) open[i] = 0;
  }

  chosen.sort((a, b) => a.from - b.from);
  chosen.forEach((z, i) => z.sceneNo = i + 1);

  /* Same cast = one evening */
  const rehearsals = new Map();
  for (const z of chosen) {
    const k = z.group.join('+');
    if (!rehearsals.has(k)) rehearsals.set(k, { group: z.group, scenes: [] });
    rehearsals.get(k).scenes.push(z);
  }
  const list = [...rehearsals.values()];
  list.forEach(p => {
    p.minutes = p.scenes.reduce((a, z) => a + z.minutes, 0);
    p.own = p.scenes.reduce((a, z) => a + z.own, 0);
    p.foreign = p.scenes.reduce((a, z) => a + z.foreign, 0);
  });
  list.sort((a, b) => a.group.length - b.group.length || b.minutes - a.minutes);
  list.forEach((p, i) => p.id = 'P' + String(i + 1).padStart(2, '0'));

  const rest = open.reduce((a, b) => a + b, 0);

  /* The stored plan keeps its German field names - it is a data format,
     and plans already stored are in that shape. */
  return {
    erzeugt: new Date().toISOString().slice(0, 10),
    ersatzanteil: substitution,
    max_gruppe: maxGroup,
    woerter_je_minute: WPM,
    abdeckung: 1 - rest / totalWords,
    nachlese_proben: list.filter(p => p.scenes.some(z => z.gleaning)).length,
    proben: list.map(p => ({
      id: p.id, gruppe: p.group, minuten: p.minutes,
      nachlese: p.scenes.every(z => z.gleaning),
      ersatz_anteil: p.foreign / ((p.own + p.foreign) || 1),
      szenen: p.scenes.map(z => ({
        szene: z.sceneNo, akt: z.act, nr_von: z.cueFrom, nr_bis: z.cueTo,
        // Pass the timeline bounds along: reconstructing them from cue
        // numbers is only approximate, and then the coverage would be
        // wrong after the first change made by hand.
        von: z.from, bis: z.to,
        minuten: z.minutes, ersatz_anteil: z.share, anfang: z.preview,
        nachlese: !!z.gleaning,
      })),
    })),
  };
}

/* The acts of a structure with their headings, for the plan page. */
export function actsIn(structure) {
  const out = [];
  for (const s of structure?.sequenz || []) {
    const m = s.typ === 'kapitel' && /^(\d+)\.$/.exec(s.kapitel || '');
    if (m) out.push({ nr: Number(m[1]), name: s.text || ('Akt ' + m[1]) });
  }
  return out;
}

/* Which units does a rehearsal cover, on this structure? For carrying
   fixed rehearsals through a new derivation. */
export function unitsCoveredBy(structure, rehearsals) {
  const { units } = loadTimeline(structure);
  const covered = new Set();
  for (const pr of rehearsals)
    for (const sz of pr.szenen || []) {
      const span = unitsOf(units, sz);
      if (span) for (let i = span[0]; i <= span[1]; i++) covered.add(i);
    }
  return covered;
}

/* Merge freshly derived rehearsals into a plan that stays: new
   identifiers continue after the highest one there, scene numbers are
   given afresh in text order, the figures are recomputed. */
export function mergeInto(structure, plan, fresh, settings) {
  let max = 0;
  for (const pr of plan.proben) { const n = Number((/^P(\d+)$/.exec(pr.id) || [])[1]); if (n > max) max = n; }
  for (const pr of fresh.proben) pr.id = 'P' + String(++max).padStart(2, '0');
  plan.proben.push(...fresh.proben);
  const all = plan.proben.flatMap(pr => pr.szenen || []).sort((a, b) => (a.von ?? 0) - (b.von ?? 0));
  all.forEach((sz, i) => { sz.szene = i + 1; });
  plan.ersatzanteil = settings.substitution;
  plan.max_gruppe = settings.maxGroup;
  plan.woerter_je_minute = fresh.woerter_je_minute;
  plan.nachlese_proben = plan.proben.filter(p => p.nachlese).length;
  recompute(structure, plan);
  sortPlan(plan);
  return plan;
}

/* Pull the people (level B) out of the structure - so the director does
   not have to type the cast in a second time. */
export function peopleOf(structure) {
  const out = [];
  for (const f of structure?.figuren || []) {
    if (f.ebene !== 'B') continue;
    out.push({
      b: f.name,
      name: f.schauspieler || (f.voller_name !== f.name ? f.voller_name : '') || '',
      funktion: f.funktion || '',
    });
  }
  return out;
}

/* A few figures for the display. */
export function summaryOf(structure) {
  const cast = structure?.figuren || [];
  return {
    quelle: structure?.quelle || '',
    personen: cast.filter(f => f.ebene === 'B').length,
    rollen: cast.filter(f => f.ebene === 'C').length,
    repliken: (structure?.leseabfolge || []).filter(x => x.typ === 'replik').length,
    bloecke: (structure?.sequenz || []).length,
  };
}
