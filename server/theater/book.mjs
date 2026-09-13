/* ---------------------------------------------------------------------
   A part book for the screen.

   The printed part book is an A4 document set by the tool. On a phone
   that is a postage stamp. This module pulls one person's passages out
   of the structure the way the tool does - own speeches with the cue
   before them and the directions around them - so that a page can show
   them one after another in flowing text, and hide the own lines for
   learning.

   A PASSAGE is a run of the person's own speeches with nothing but
   directions in between. It carries the cue: the last speech by
   somebody else before it.
   --------------------------------------------------------------------- */

/* The sequence flattened: table rows resolved, backstage before stage. */
function flatten(structure) {
  const out = [];
  for (const s of structure?.sequenz || []) {
    if (s.typ === 'tabelle') {
      for (const z of s.zeilen || []) out.push(...(z.hinter_der_buehne || []), ...(z.auf_der_buehne || []));
    } else out.push(s);
  }
  return out;
}

const speaks = (e, b) => !!e.ensemble && e.ensemble === b ||
  (e.figuren || []).some(f => f.ensemble === b);

export function partBook(structure, b) {
  const passages = [];
  let chapter = '', act = '';
  let cur = null;                 // the passage being collected
  let cue = null;                 // last speech by somebody else
  let pending = [];               // directions since the last speech

  for (const e of flatten(structure)) {
    if (e.typ === 'kapitel') {
      if (/^\d+\.$/.test(e.kapitel || '')) act = e.text || '';
      chapter = e.text || '';
      cur = null; pending = [];
      continue;
    }
    if (e.typ === 'regieanweisung' || e.typ === 'text') {
      if (cur) cur.after.push(e.text || '');
      else pending.push(e.text || '');
      continue;
    }
    if (e.typ !== 'replik' && e.typ !== 'fortsetzung') continue;

    if (speaks(e, b)) {
      if (!cur) {
        cur = { nr: e.nr ?? null, act, chapter, cue, before: pending,
                lines: [], after: [], cut: !!e.gestrichen,
                role: e.figur && e.figur !== b ? e.figur : '' };
        passages.push(cur);
        pending = [];
      } else if (cur.after.length) {
        // directions between two own speeches belong inside the passage
        cur.lines.push({ direction: cur.after.join(' ') });
        cur.after = [];
      }
      cur.lines.push({ who: e.figur || e.sprecher_im_text || b, text: e.text || '',
                       cont: e.typ === 'fortsetzung', cut: !!e.gestrichen });
    } else {
      cur = null;
      cue = { who: e.figur || e.sprecher_im_text || '', text: e.text || '', nr: e.nr ?? null };
      pending = [];
    }
  }
  passages.forEach((p, i) => { p.i = i + 1; });
  return passages;
}

/* Rough count of the words one has to learn. */
export const wordsOf = passages => passages.reduce((a, p) =>
  a + p.lines.reduce((x, l) => x + (l.text ? l.text.split(/\s+/).length : 0), 0), 0);
