/* Which acts the company sees.

   The director releases acts one by one (project.einstellungen.akte_frei,
   a list of act numbers; missing means all). What is not released is
   left out for the company - in the part book, the play, the documents
   and the learning reminders. The director sees everything.

   Acts are the numbered chapters of the structure ("1.", "2." ...) and
   in a built document the <h1 class="chapter"> with <span
   class="chapnr">N.</span>, each followed by its sections up to the next
   chapter. Cutting there keeps every cue number and learning key of the
   acts that stay as they were. */

const actNr = (s) => {
  const m = s?.typ === 'kapitel' && /^(\d+)\.$/.exec(s.kapitel || '');
  return m ? Number(m[1]) : null;
};

/* The acts of a structure: [{ nr, name }]. */
export function actsOf(structure) {
  return (structure?.sequenz || []).map(s => actNr(s) != null ? { nr: actNr(s), name: s.text || '' } : null)
    .filter(Boolean);
}

/* The numbers not released, as a set; empty when all are. */
export function hiddenActs(project) {
  const free = project?.einstellungen?.akte_frei;
  if (!Array.isArray(free)) return new Set();
  return new Set(actsOf(project.skript).map(a => a.nr).filter(n => !free.includes(n)));
}

/* The structure without the hidden acts. */
export function trimStructure(structure, hidden) {
  if (!structure || !hidden?.size) return structure;
  let act = null;
  const sequenz = [];
  for (const s of structure.sequenz || []) {
    const n = actNr(s);
    if (n != null) act = n;
    if (act == null || !hidden.has(act)) sequenz.push(s);
  }
  return { ...structure, sequenz };
}

/* A built document without the hidden acts. */
export function trimDocument(html, hidden) {
  if (!hidden?.size || typeof html !== 'string') return html;
  const heads = [...html.matchAll(/<h1 class="chapter"[^>]*>(?:<span class="chapnr">(\d+)\.<\/span>)?/g)]
    .map(m => ({ at: m.index, nr: m[1] ? Number(m[1]) : null }));
  const close = html.lastIndexOf('</main>') >= 0 ? html.lastIndexOf('</main>') : html.lastIndexOf('</body>');
  const end = close >= 0 ? close : html.length;
  let out = '', from = 0, act = null;
  heads.forEach((hd, i) => {
    if (hd.nr != null) act = hd.nr;
    const to = i + 1 < heads.length ? heads[i + 1].at : end;
    if (act != null && hidden.has(act)) { out += html.slice(from, hd.at); from = to; }
  });
  return out + html.slice(from);
}
