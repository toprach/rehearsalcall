/* ---------------------------------------------------------------------
   Learning one's lines: spaced retrieval.

   Every chunk of a part book has a record for its person:
     s  the step, 0..5 - how far apart the repetitions may be
     f  the day it is due again, ISO date
     l  the last ten answers: 0 again, 1 with help, 2 knew it
     a  the note the actor wrote: what the character wants here

   An answer moves the step: "knew it" one up, "with help" keeps it
   (but at least 1), "again" back to 0 and due today. The due date is
   today plus the interval of the new step. That is the Leitner box in
   its plainest form; the testing effect does the rest.
   --------------------------------------------------------------------- */

export const INTERVALS = [0, 1, 3, 7, 14, 30];      // days per step
export const RATINGS = { nochmal: 0, hilfe: 1, kann: 2 };

export const isoToday = (d = new Date()) => {
  const x = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return x.toISOString().slice(0, 10);
};
export function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function answer(rec, rating, today = isoToday()) {
  const code = RATINGS[rating];
  if (code == null) return null;
  const r = { s: rec?.s || 0, f: rec?.f || today, l: [...(rec?.l || [])], a: rec?.a || '' };
  r.l = r.l.concat([code]).slice(-10);
  if (code === 2) r.s = Math.min(INTERVALS.length - 1, r.s + 1);
  else if (code === 1) r.s = Math.max(1, r.s);
  else r.s = 0;
  r.f = addDays(today, INTERVALS[r.s]);
  if (!r.a) delete r.a;
  return r;
}

/* How often it went wrong lately; the intensive mode sorts by this. */
export const failRate = rec => {
  const l = rec?.l || [];
  return l.length ? l.filter(x => x === 0).length / l.length : 0;
};
export const failCount = rec => (rec?.l || []).filter(x => x === 0).length;

/* The figures for the page: due today, never seen, per step, sitting. */
export function summary(state, chunks, today = isoToday()) {
  const perStep = INTERVALS.map(() => 0);
  let due = 0, fresh = 0, sittingWords = 0, words = 0, hard = 0;
  for (const c of chunks) {
    const r = state?.[c.key];
    words += c.words || 0;
    if (!r) { fresh++; continue; }
    perStep[Math.min(r.s, perStep.length - 1)]++;
    if (r.f <= today) due++;
    if (r.s >= 3) sittingWords += c.words || 0;
    if (failCount(r) >= 2) hard++;
  }
  return { due, fresh, perStep, hard, words, sitting: words ? sittingWords / words : 0, total: chunks.length };
}
