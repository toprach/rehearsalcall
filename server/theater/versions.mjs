/* ---------------------------------------------------------------------
   Versions of the script, and keeping the rehearsal plan through them.

   A script gets uploaded more than once: a cut here, a line changed
   there, a scene moved. Two things follow from that.

   1. What changed, as a list of speeches - not as a diff of markdown,
      which would show every re-flowed paragraph. Speeches are compared
      by speaker and normalised text; formatting, whitespace and
      emphasis do not count.

   2. The rehearsal plan must survive. Its scenes point into the
      timeline by index and by cue number, and both shift as soon as a
      paragraph is inserted further up. So every scene is anchored to
      CONTENT: the speaker and the first eight words of its first and
      its last speech. After an upload the anchors are looked for in
      the new text; found means the indexes are moved along quietly,
      not found means the scene is marked and the director is told
      that the plan may no longer fit.

   Stored fields are German, as everywhere: fassungen, marke_von,
   marke_bis, unsicher, umgebaut, abgleich.
   --------------------------------------------------------------------- */

import { loadTimeline } from './timeline.mjs';
import { recompute, unitsOf } from './revise.mjs';

/* ---------- text normalising ---------- */

export const norm = t => String(t || '').toLowerCase()
  .replace(/[*_~\\]/g, '')
  .replace(/[^\p{L}\p{N}\s]/gu, ' ')
  .replace(/\s+/g, ' ').trim();

const words = t => norm(t).split(' ').filter(Boolean);
const ANCHOR_WORDS = 8;
const ANCHOR_MATCH = 0.6;       // share of the anchor's words that must be there
const REBUILT_SHARE = 1 / 3;    // changed speeches inside a scene that earn a hint

/* How alike are two short word lists? Share of a's words found in b. */
function overlap(a, b) {
  if (!a.length || !b.length) return 0;
  const set = new Set(b);
  let hit = 0;
  for (const w of a) if (set.has(w)) hit++;
  return hit / a.length;
}

/* ---------- speeches of a structure ---------- */

/* All speeches in order, with the unit they sit in. Tables are
   flattened the way passages.mjs does it. */
export function speechesOfUnits(units) {
  const out = [];
  units.forEach((u, i) => {
    const blocks = u.columns ? [...u.columns.backstage, ...u.columns.onstage] : (u.raw || []);
    for (const b of blocks) {
      if (b.typ !== 'replik' && b.typ !== 'fortsetzung') continue;
      out.push({ unit: i, nr: b.nr ?? null, who: b.ensemble || b.figur || b.sprecher_im_text || '',
                 text: b.text || '', cut: !!b.gestrichen });
    }
  });
  return out;
}

/* ---------- comparing two lists of speeches ---------- */

const keyOf = s => norm(s.who) + '|' + norm(s.text);

/* Myers' diff over the keys: O((n+m)·d), fast when little changed -
   which is the case here, a script gets touched up, not rewritten.
   Returns ops: 'equal' | 'removed' | 'added' with indexes into a and b. */
function diffKeys(a, b) {
  const n = a.length, m = b.length, max = n + m;
  const trace = [];
  let v = new Map([[1, 0]]);
  let found = false;
  for (let d = 0; d <= max && !found; d++) {
    const next = new Map();
    for (let k = -d; k <= d; k += 2) {
      let x;
      if (k === -d || (k !== d && (v.get(k - 1) ?? -1) < (v.get(k + 1) ?? -1))) x = v.get(k + 1) ?? 0;
      else x = (v.get(k - 1) ?? 0) + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) { x++; y++; }
      next.set(k, x);
      if (x >= n && y >= m) { found = true; break; }
    }
    trace.push(v);
    v = next;
  }
  // walk back
  const ops = [];
  let x = n, y = m;
  for (let d = trace.length - 1; d >= 0; d--) {
    const vv = trace[d];
    const k = x - y;
    const prevK = (k === -d || (k !== d && (vv.get(k - 1) ?? -1) < (vv.get(k + 1) ?? -1))) ? k + 1 : k - 1;
    const prevX = vv.get(prevK) ?? 0, prevY = prevX - prevK;
    while (x > prevX && y > prevY) { ops.push({ op: 'equal', a: x - 1, b: y - 1 }); x--; y--; }
    if (d > 0) {
      if (x === prevX) { ops.push({ op: 'added', b: y - 1 }); y--; }
      else { ops.push({ op: 'removed', a: x - 1 }); x--; }
    }
  }
  while (x > 0 && y > 0) { ops.push({ op: 'equal', a: x - 1, b: y - 1 }); x--; y--; }
  return ops.reverse();
}

/* Two lists of speeches -> what changed.

   A removed and an added speech next to each other, same speaker,
   texts that still overlap, are one CHANGED speech - that is what the
   director wants to see, not a deletion and an insertion.

   Returns { equal, changed, added, removed, hunks } where hunks are
   the runs of change in order, each { items: [{ kind, old, new }] }. */
export function compareSpeeches(oldList, newList) {
  const ops = diffKeys(oldList.map(keyOf), newList.map(keyOf));
  const items = [];
  let i = 0;
  while (i < ops.length) {
    const o = ops[i];
    if (o.op === 'equal') { items.push({ kind: 'equal', old: oldList[o.a], new: newList[o.b] }); i++; continue; }
    // collect a run of removed and added
    const removed = [], added = [];
    while (i < ops.length && ops[i].op !== 'equal') {
      if (ops[i].op === 'removed') removed.push(oldList[ops[i].a]);
      else added.push(newList[ops[i].b]);
      i++;
    }
    // pair up by speaker and likeness
    const usedB = new Set();
    for (const r of removed) {
      let best = -1, bestScore = 0;
      added.forEach((s, k) => {
        if (usedB.has(k) || norm(s.who) !== norm(r.who)) return;
        const sc = overlap(words(r.text), words(s.text));
        if (sc > bestScore) { bestScore = sc; best = k; }
      });
      if (best >= 0 && bestScore >= 0.5) { usedB.add(best); items.push({ kind: 'changed', old: r, new: added[best] }); }
      else items.push({ kind: 'removed', old: r });
    }
    added.forEach((s, k) => { if (!usedB.has(k)) items.push({ kind: 'added', new: s }); });
  }
  const count = kind => items.filter(x => x.kind === kind).length;
  const hunks = [];
  let run = null;
  for (const it of items) {
    if (it.kind === 'equal') { run = null; continue; }
    if (!run) { run = { items: [] }; hunks.push(run); }
    run.items.push(it);
  }
  return { equal: count('equal'), changed: count('changed'), added: count('added'),
           removed: count('removed'), hunks, items };
}

/* ---------- anchoring the plan ---------- */

/* The anchor of a scene: speaker and first words of its first (or
   last) speech, taken from the structure the plan was made on. */
function anchorAt(units, span, which) {
  const [from, to] = span;
  if (which === 'start') {
    for (let i = from; i <= to; i++) {
      const s = speechesOfUnits([units[i]])[0];
      if (s && !s.cut) return { wer: s.who, text: words(s.text).slice(0, ANCHOR_WORDS).join(' ') };
    }
  } else {
    for (let i = to; i >= from; i--) {
      const list = speechesOfUnits([units[i]]).filter(s => !s.cut);
      if (list.length) { const s = list[list.length - 1];
        return { wer: s.who, text: words(s.text).slice(0, ANCHOR_WORDS).join(' ') }; }
    }
  }
  return null;
}

/* Where is the anchor in the new text? The speaker must be the same
   and enough of the words must be there; of several places the one
   nearest to where it used to be. Returns the unit index or null. */
function findAnchor(anchor, speeches, near) {
  if (!anchor) return null;
  const want = words(anchor.text);
  let best = null, bestDist = Infinity;
  for (const s of speeches) {
    if (s.cut || norm(s.who) !== norm(anchor.wer)) continue;
    if (overlap(want, words(s.text).slice(0, ANCHOR_WORDS + 2)) < ANCHOR_MATCH) continue;
    const dist = Math.abs(s.unit - near);
    if (dist < bestDist) { bestDist = dist; best = s.unit; }
  }
  return best;
}

/* Carry the plan from one structure to the next.

   oldStructure   what the plan was made on (may be null - then only
                  stored anchors can be used)
   newStructure   the freshly built one
   plan           changed in place

   Returns { unsure: [ids], rebuilt: [ids] } - the rehearsals whose
   anchors were not found, and those whose text changed a lot. */
export function realignPlan(oldStructure, newStructure, plan) {
  if (!plan?.proben?.length) return { unsure: [], rebuilt: [] };
  const oldUnits = oldStructure ? loadTimeline(oldStructure).units : null;
  const newUnits = loadTimeline(newStructure).units;
  const speeches = speechesOfUnits(newUnits);
  const unsure = new Set(), rebuilt = new Set();

  for (const pr of plan.proben) {
    delete pr.unsicher;
    for (const sz of pr.szenen || []) {
      /* Anchors: from the old structure, unless the scene was already
         adrift - then the stored ones are all there is. */
      let span = oldUnits ? unitsOf(oldUnits, sz) : null;
      if (!sz.unsicher && span) {
        sz.marke_von = anchorAt(oldUnits, span, 'start') || sz.marke_von;
        sz.marke_bis = anchorAt(oldUnits, span, 'end') || sz.marke_bis;
      }
      const near = span ? span : [sz.von ?? 0, sz.bis ?? 0];
      const from = findAnchor(sz.marke_von, speeches, near[0]);
      const to = findAnchor(sz.marke_bis, speeches, near[1]);

      if (from == null || to == null || to < from) {
        sz.unsicher = true; pr.unsicher = true; unsure.add(pr.id);
        continue;
      }
      // how much changed inside?
      if (oldUnits && span) {
        const before = speechesOfUnits(oldUnits.slice(span[0], span[1] + 1));
        const after = speechesOfUnits(newUnits.slice(from, to + 1));
        const cmp = compareSpeeches(before, after);
        const changed = cmp.changed + cmp.added + cmp.removed;
        sz.umgebaut = changed / Math.max(1, before.length) >= REBUILT_SHARE;
        if (sz.umgebaut) rebuilt.add(pr.id);
      }
      delete sz.unsicher;
      sz.von = from; sz.bis = to;
      sz.nr_von = newUnits[from].cueFrom ?? sz.nr_von;
      sz.nr_bis = newUnits[to].cueTo ?? sz.nr_bis;
      for (let i = from; i <= to && sz.nr_von == null; i++) sz.nr_von = newUnits[i].cueFrom;
      for (let i = to; i >= from && sz.nr_bis == null; i--) sz.nr_bis = newUnits[i].cueTo;
      sz.anfang = newUnits[from].preview;
      sz.akt = newUnits[from].act;
    }
  }
  recompute(newStructure, plan);
  plan.abgleich = { datum: new Date().toISOString(),
                    unsicher: [...unsure], umgebaut: [...rebuilt] };
  return { unsure: [...unsure], rebuilt: [...rebuilt] };
}

/* Which rehearsals cover a cue number, on a given structure? For the
   version page: "this changed speech falls into P07". */
export function rehearsalsByCue(structure, plan) {
  const map = new Map();
  if (!structure || !plan?.proben?.length) return map;
  const { units } = loadTimeline(structure);
  for (const pr of plan.proben)
    for (const sz of pr.szenen || []) {
      const span = unitsOf(units, sz);
      if (!span) continue;
      for (let i = span[0]; i <= span[1]; i++)
        for (const s of speechesOfUnits([units[i]]))
          if (s.nr != null) {
            if (!map.has(s.nr)) map.set(s.nr, new Set());
            map.get(s.nr).add(pr.id);
          }
    }
  return map;
}
