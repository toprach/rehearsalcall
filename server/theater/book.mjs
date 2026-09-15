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
   somebody else before it - and, for reading, a little of what came
   before and after it.

   For learning, a long passage is cut into CHUNKS of a few sentences;
   the end of one chunk is the cue of the next. Every chunk has a key
   made from its words, not from its number, so that the learning state
   survives a new version of the script as long as the words stay.
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

const isSpeech = e => e.typ === 'replik' || e.typ === 'fortsetzung';
const isDirection = e => e.typ === 'regieanweisung' || e.typ === 'text';

/* What a reader wants around a passage: speeches and directions, as
   plain {who, text} entries, nearest first for "before". */
function around(flat, from, to, n) {
  const entry = e => isSpeech(e)
    ? { who: e.figur || e.sprecher_im_text || '', text: e.text || '', cont: e.typ === 'fortsetzung' }
    : { text: e.text || '', dir: true };
  const before = [], after = [];
  for (let i = from - 1; i >= 0 && before.length < n; i--) {
    const e = flat[i];
    if (e.typ === 'kapitel') break;
    if (isSpeech(e) || isDirection(e)) before.push(entry(e));
  }
  for (let i = to + 1; i < flat.length && after.length < n; i++) {
    const e = flat[i];
    if (e.typ === 'kapitel') break;
    if (isSpeech(e) || isDirection(e)) after.push(entry(e));
  }
  return { before, after };
}

export function partBook(structure, b, opt = {}) {
  const context = opt.context ?? 8;
  const flat = flatten(structure);
  const passages = [];
  let chapter = '', act = '';
  let cur = null;                 // the passage being collected
  let cue = null;                 // last speech by somebody else
  let pending = [];               // directions since the last speech

  flat.forEach((e, idx) => {
    if (e.typ === 'kapitel') {
      if (/^\d+\.$/.test(e.kapitel || '')) act = e.text || '';
      chapter = e.text || '';
      cur = null; pending = [];
      return;
    }
    if (isDirection(e)) {
      if (cur) cur.after.push(e.text || '');
      else pending.push(e.text || '');
      return;
    }
    if (!isSpeech(e)) return;

    if (speaks(e, b)) {
      if (!cur) {
        cur = { nr: e.nr ?? null, act, chapter, cue, before: pending,
                lines: [], after: [], cut: !!e.gestrichen,
                role: e.figur && e.figur !== b ? e.figur : '',
                from: idx - pending.length, to: idx };
        passages.push(cur);
        pending = [];
      } else if (cur.after.length) {
        // directions between two own speeches belong inside the passage
        cur.lines.push({ direction: cur.after.join(' ') });
        cur.after = [];
      }
      cur.to = idx;
      cur.lines.push({ who: e.figur || e.sprecher_im_text || b, text: e.text || '',
                       cont: e.typ === 'fortsetzung', cut: !!e.gestrichen });
    } else {
      cur = null;
      cue = { who: e.figur || e.sprecher_im_text || '', text: e.text || '', nr: e.nr ?? null, b: e.ensemble || null };
      pending = [];
    }
  });

  passages.forEach((p, i) => {
    p.i = i + 1;
    const a = around(flat, p.from, p.to, context);
    p.ctxBefore = a.before; p.ctxAfter = a.after;
    delete p.from; delete p.to;
    p.chunks = chunksOf(p, b, opt.chunkWords ?? 40);
  });
  return passages;
}

/* The whole play for the screen: chapters, speeches and directions in
   order, the own speeches marked. What the plan document shows on A4,
   readable on a phone. */
export function wholePlay(structure, b) {
  const out = [];
  for (const e of flatten(structure)) {
    if (e.typ === 'kapitel') out.push({ kind: 'chapter', text: e.text || '', act: /^\d+\.$/.test(e.kapitel || '') });
    else if (isDirection(e)) out.push({ kind: 'dir', text: e.text || '' });
    else if (isSpeech(e)) out.push({ kind: 'speech', nr: e.nr ?? null, who: e.figur || e.sprecher_im_text || '',
                                     text: e.text || '', cont: e.typ === 'fortsetzung', own: speaks(e, b), cut: !!e.gestrichen });
  }
  return out;
}

/* Rough count of the words one has to learn. */
export const wordsOf = passages => passages.reduce((a, p) =>
  a + p.lines.reduce((x, l) => x + (l.text ? l.text.split(/\s+/).length : 0), 0), 0);

/* ---- chunks and keys ---- */

const norm = s => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const firstWords = (s, n) => norm(s).split(' ').slice(0, n).join(' ');
const hash = (s) => {
  let h = 2166136261;
  for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(36);
};
const countWords = s => (norm(s).match(/\S+/g) || []).length;
const endsSentence = s => /[.!?…"”’')\]]\s*$/.test(String(s || ''));

/* Cut the own lines of a passage into chunks of about maxWords, only
   at the end of a sentence. A short tail joins the chunk before it. */
export function chunksOf(p, b, maxWords = 40) {
  const groups = [];
  let g = [], words = 0;
  for (const l of p.lines) {
    g.push(l);
    if (l.text) words += countWords(l.text);
    if (l.text && words >= maxWords && (endsSentence(l.text) || words >= maxWords * 1.5)) { groups.push(g); g = []; words = 0; }
  }
  if (g.length) {
    const tail = g.reduce((x, l) => x + (l.text ? countWords(l.text) : 0), 0);
    if (groups.length && tail < 12) groups[groups.length - 1].push(...g);
    else groups.push(g);
  }
  const lastText = (lines) => { for (let i = lines.length - 1; i >= 0; i--) if (lines[i].text) return lines[i].text; return ''; };
  const ownText = (lines) => lines.filter(l => l.text).map(l => l.text).join(' ');
  return groups.map((lines, k) => {
    const cue = k === 0 ? p.cue : { who: b, text: lastText(groups[k - 1]), own: true };
    const key = hash(firstWords(ownText(lines), 8)) + '.' + hash(firstWords(cue ? cue.text : '', 6));
    return { key, cue, lines, before: k === 0 ? p.before : [], after: k === groups.length - 1 ? p.after : [],
             teil: groups.length > 1 ? [k + 1, groups.length] : null, words: lines.reduce((x, l) => x + (l.text ? countWords(l.text) : 0), 0) };
  });
}
