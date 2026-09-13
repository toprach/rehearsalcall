/* ---------------------------------------------------------------------
   Finding rehearsal scenes.

   The idea
   --------
   For a group G, every word one of its members speaks is a gain; every
   word of an absent person has to be read out by the director and is a
   loss. Give the loss the weight

        lambda = (1 - p) / p       p = tolerated substitution share

   and a passage has a positive sum exactly when its substitution share
   stays below p - and so does every initial segment of it, because the
   search starts over whenever the sum goes negative. p = 10 % gives
   lambda = 9, p = 20 % gives lambda = 4. The threshold is therefore not
   guessed; it falls out of the arithmetic.

   What we look for are the longest passages with a positive sum.
   --------------------------------------------------------------------- */

import { loadTimeline, SILENT_WEIGHT } from './timeline.mjs';

export const WPM = 130;                 // speaking pace, words per minute

export const KNOBS = {
  minOwnWords:      110,  // below this, coming together is not worth it
  minSpeeches:       12,
  maxForeignRun:     70,  // this many substitution words in a row tear the scene
  q:                0.5,  // probability that one person is free on any
                          // given evening
  setup:             60,  // word-equivalent per scene (finding the place, setting up)
};

const combinations = (arr, k) => {
  const out = [];
  (function walk(start, cur) {
    if (cur.length === k) return out.push(cur.slice());
    for (let i = start; i < arr.length; i++) { cur.push(arr[i]); walk(i + 1, cur); cur.pop(); }
  })(0, []);
  return out;
};

/* Splitting one unit into gain and loss with respect to G */
function weigh(u, G) {
  let own = 0, foreign = u.groupWords;
  for (const [p, w] of u.speaks) (G.has(p) ? (own += w) : (foreign += w));
  for (const p of u.silent) if (!G.has(p)) foreign += SILENT_WEIGHT;
  return { own, foreign };
}

/* Longest passages with a positive sum (Kadane, greedily continued) */
function passages(units, G, lambda, s) {
  const out = [];
  let i = 0;
  while (i < units.length) {
    let start = i, sum = 0, best = 0, bestEnd = -1, foreignRun = 0;
    let j = i;
    for (; j < units.length; j++) {
      const u = units[j];
      if (u.act !== units[start].act) break;            // do not mix acts
      const { own, foreign } = weigh(u, G);
      foreignRun = own > 0 ? 0 : foreignRun + foreign;
      if (foreignRun > s.maxForeignRun) break;          // too long a monologue to read
      const v = own - (foreign ? lambda * foreign : 0);
      if (sum + v < 0) break;
      sum += v;
      if (sum > best) { best = sum; bestEnd = j; }
    }
    if (bestEnd >= start) { out.push([start, bestEnd]); i = bestEnd + 1; }
    else i = Math.max(start + 1, j === start ? start + 1 : j);
  }
  return out;
}

export function findScenes(structure, opt = {}) {
  const s = { ...KNOBS, ...opt };
  const { units, people } = loadTimeline(structure);
  const SHARES = opt.shares || [0, 0.05, 0.10, 0.20];
  const SIZES = opt.sizes || [2, 3, 4, 5];

  const raw = [];
  for (const k of SIZES) {
    for (const gArr of combinations(people, k)) {
      const G = new Set(gArr);
      for (const p of SHARES) {
        const lambda = p > 0 ? (1 - p) / p : 1e9;
        for (const [a, b] of passages(units, G, lambda, s)) {
          // Trim the edges: a scene has to begin and end with a word of
          // the group's own.
          let x = a, y = b;
          while (x <= y && weigh(units[x], G).own === 0) x++;
          while (y >= x && weigh(units[y], G).own === 0) y--;
          if (y < x) continue;

          let own = 0, foreign = 0, speeches = 0;
          const speaking = new Set();
          for (let i = x; i <= y; i++) {
            const w = weigh(units[i], G);
            own += w.own; foreign += w.foreign; speeches += units[i].speeches;
            for (const q of units[i].speaks.keys()) if (G.has(q)) speaking.add(q);
          }
          if (own < s.minOwnWords || speeches < s.minSpeeches) continue;
          // Only the people who actually speak make up the group.
          const Gs = [...speaking].sort();
          if (Gs.length < 2) continue;
          raw.push({ from: x, to: y, group: Gs, p, own, foreign, speeches,
                     share: foreign / (own + foreign) });
        }
      }
    }
  }

  /* --- folding duplicates together ----------------------------------- */
  // Same group: merge overlapping passages into the best one.
  const byGroup = new Map();
  for (const r of raw) {
    const k = r.group.join('+');
    if (!byGroup.has(k)) byGroup.set(k, []);
    byGroup.get(k).push(r);
  }
  const filtered = [];
  for (const [, list] of byGroup) {
    list.sort((a, b) => (b.own - a.own) || (a.p - b.p));
    const kept = [];
    for (const r of list) {
      const overlaps = kept.find(o => Math.min(o.to, r.to) - Math.max(o.from, r.from) >= 0);
      if (!overlaps) kept.push(r);
    }
    filtered.push(...kept);
  }

  // A scene falls away when a proper subgroup covers nearly the same thing.
  filtered.sort((a, b) => a.group.length - b.group.length || b.own - a.own);
  const scenes = [];
  for (const r of filtered) {
    const rs = new Set(r.group);
    const redundant = scenes.some(o =>
      o.group.length < r.group.length &&
      o.group.every(x => rs.has(x)) &&
      (Math.min(o.to, r.to) - Math.max(o.from, r.from) + 1) >= 0.9 * (r.to - r.from + 1));
    if (!redundant) scenes.push(r);
  }

  scenes.forEach(r => {
    r.act = units[r.from].act;
    r.cueFrom = units[r.from].cueFrom; r.cueTo = units[r.to].cueTo;
    for (let i = r.from; i <= r.to && r.cueFrom == null; i++) r.cueFrom = units[i].cueFrom;
    for (let i = r.to; i >= r.from && r.cueTo == null; i--) r.cueTo = units[i].cueTo;
    r.minutes = (r.own + r.foreign) / WPM;
    r.preview = units[r.from].preview;
    r.value = score(r, s);
  });
  scenes.sort((a, b) => a.from - b.from);
  return { scenes, units, people, s };
}

/* ---------------------------------------------------------------------
   The scoring function
   --------------------
   Yield  = own words - lambda * substitution words
   Cost   = finding a date. If each person is free on a given evening
            with probability q, a date for |G| people works out with
            q^|G|, so one needs q^-|G| attempts. At q = 0.5, every
            further person doubles the effort.
   Value  = yield * q^(|G|-2)      (normalised to a pair)
   --------------------------------------------------------------------- */
export function score(r, s = KNOBS) {
  const lambda = r.p > 0 ? (1 - r.p) / r.p : 1e9;
  const yield_ = r.own - (r.foreign ? lambda * r.foreign : 0);
  return (yield_ - s.setup) * Math.pow(s.q, r.group.length - 2);
}
