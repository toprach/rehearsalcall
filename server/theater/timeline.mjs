/* ---------------------------------------------------------------------
   The timeline of the play: per unit, who speaks and who is present.

   A unit is one block of the script; in the table of the second act a
   table row is one unit, because the two columns run at the same time
   and cannot be pulled apart.

   Counting is done in PEOPLE (level B), not in roles: it is Anna
   who comes to the rehearsal, not MRS.CLACKETT.

   The field names of the parsed structure (sequenz, typ, replik,
   figur, ebene, ...) are the tool's format and stay as they are; see
   DREHBUCH-FORMAT.md.
   --------------------------------------------------------------------- */

export const SILENT_WEIGHT = 8;   // silent presence ~ one short speech

/* ---------------------------------------------------------------------
   Who is who? Role name (level C) -> person (level B).

   Several parts need this: the timeline for counting, the audiobook for
   picking voices. So it stands here once instead of three times nearly
   alike.
   --------------------------------------------------------------------- */
export function castIndex(structure) {
  const cast = structure?.figuren || [];
  const people = cast.filter(f => f.ebene === 'B').map(f => f.name);
  const nameToPerson = new Map();
  for (const f of cast) {
    if (f.ebene === 'B') nameToPerson.set(f.name, f.name);
    if (f.ebene === 'C') {
      const b = cast.find(x => x.id === f.gespielt_von);
      if (b) nameToPerson.set(f.name, b.name);
    }
  }
  // short forms the script uses
  for (const [k, v] of [['MRS.C', 'MICKEY'], ['MRS CLACKETT', 'MICKEY'],
                        ['JOHN', 'HANNO']])
    nameToPerson.set(k, v);

  /* Looking up, patiently: the script does not always write dots and
     spaces the same way, and "EINBRECHER/GREGG" names two at once. */
  const personFor = (name) => {
    const k = String(name || '').replace(/\.$/, '').trim();
    const hit = nameToPerson.get(k) || nameToPerson.get(k.replace(/\./g, ''))
             || nameToPerson.get(k.replace(/\s/g, '.'));
    if (hit) return hit;
    const first = k.split(/\s*(?:\/| und | and )\s*/)[0];
    return nameToPerson.get(first) || null;
  };

  /* Which roles does this person play? */
  const rolesOf = (person) => {
    const b = cast.find(f => f.ebene === 'B' && f.name === person);
    return b ? cast.filter(f => f.ebene === 'C' && f.gespielt_von === b.id)
                   .map(f => f.name) : [];
  };

  return { cast, people, nameToPerson, personFor, rolesOf };
}

export function loadTimeline(structure) {
  const d = structure;
  const { people, nameToPerson, personFor } = castIndex(d);

  const wordCount = t =>
    (String(t).match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;

  /* People named in a stage direction.
     Only names in capitals count - that is how the script writes them. */
  const NAME_IN_TEXT =
    /\b[A-ZÄÖÜ][A-ZÄÖÜ.]{2,}(?:\s[A-ZÄÖÜ][A-ZÄÖÜ.]{2,})?\b/g;
  function peopleIn(text) {
    const out = new Set();
    for (const raw of String(text).match(NAME_IN_TEXT) || []) {
      const p = personFor(raw);
      if (p) out.add(p);
    }
    return out;
  }

  /* ---- collecting the blocks ---------------------------------------- */
  const units = [];
  let act = 0, actName = 'Front matter';

  function collect(list, tableRow) {
    const u = {
      i: units.length, act, actName,
      speaks: new Map(),         // person -> words
      groupWords: 0,             // speeches by "ALLE" and the like
      silent: new Set(),         // present without text, per stage direction
      cueFrom: null, cueTo: null,
      tableRow: tableRow ?? null,
      speeches: 0,
      preview: '',
      // Carry the original blocks along. The timeline only counts
      // words; whoever wants to show the passage itself needs the
      // text. These are references, not copies.
      raw: list,
    };
    for (const b of list) {
      if (b.typ === 'replik' || b.typ === 'fortsetzung') {
        const w = wordCount(b.text);
        u.speeches++;
        if (b.nr != null) { if (u.cueFrom == null) u.cueFrom = b.nr; u.cueTo = b.nr; }
        if (!u.preview) u.preview = (b.figur ? b.figur + ': ' : '') + b.text.slice(0, 60);
        if (b.ebene === 'GROUP' || !b.ensemble) { u.groupWords += w; continue; }
        // Double speakers "PHILIP und FLAVIA" are already resolved; split
        // once more to be safe.
        const ps = new Set([b.ensemble]);
        for (const p of peopleIn(b.figur || '')) ps.add(p);
        for (const p of ps)
          u.speaks.set(p, (u.speaks.get(p) || 0) + Math.round(w / ps.size));
      } else if (b.typ === 'regieanweisung') {
        for (const p of peopleIn(b.text)) u.silent.add(p);
        if (!u.preview) u.preview = '(' + b.text.slice(0, 55) + ')';
      } else if (b.typ === 'text') {
        // Continuation of the speaker last named in the same block
        const w = wordCount(b.text);
        const last = [...u.speaks.keys()].pop();
        if (last) u.speaks.set(last, u.speaks.get(last) + w);
      }
    }
    // Count silent presence only where the person does not speak here.
    for (const p of u.speaks.keys()) u.silent.delete(p);
    u.ownWords = [...u.speaks.values()].reduce((a, b) => a + b, 0);
    u.weight = u.ownWords + u.groupWords + u.silent.size * SILENT_WEIGHT;
    if (u.weight > 0 || u.speeches) units.push(u);
    return u;
  }

  for (const s of d.sequenz) {
    if (s.typ === 'kapitel') {
      const m = /^(\d+)\.$/.exec(s.kapitel || '');
      if (m) { act = Number(m[1]); actName = s.text; }
      continue;
    }
    if (s.typ === 'tabelle') {
      for (const z of s.zeilen) {
        const u = collect([...(z.hinter_der_buehne || []),
                           ...(z.auf_der_buehne || [])], z.zeile);
        // Keep the columns apart as well - when showing the passage one
        // has to see what happens backstage and what happens on stage.
        u.columns = { backstage: z.hinter_der_buehne || [],
                      onstage: z.auf_der_buehne || [] };
      }
      continue;
    }
    collect([s]);
  }
  units.forEach((u, i) => u.i = i);
  return { units, people, nameToPerson, source: d };
}
