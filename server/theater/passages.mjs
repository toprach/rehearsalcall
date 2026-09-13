/* ---------------------------------------------------------------------
   Picking out the passages of one rehearsal.

   The plan says WHO rehearses when. What gets spoken is not in it - and
   without that there is no judging whether the cut is any good. This
   view shows the passages in full and sets apart what the director has
   to read instead.

   The arithmetic runs on the same units as the derivation and the
   revision; the bounds in the plan are indexes into that list.
   --------------------------------------------------------------------- */

import { loadTimeline } from './timeline.mjs';
import { unitsOf } from './revise.mjs';

/* The blocks of a scene in order, tables resolved.

   Anyone walking the text rarely cares whether they are standing in a
   two-column passage. Only the display does - so the resolving lives
   here and not scattered over four places. */
export const allBlocks = (parts) => (parts || []).flatMap(t =>
  t.kind === 'table' ? t.rows.flatMap(r => [...r.backstage, ...r.onstage]) : [t]);

/* One block, enriched by the question: does somebody present speak it? */
function decorate(b, G) {
  if (b.typ === 'replik' || b.typ === 'fortsetzung')
    return {
      kind: 'speech',
      own: !!(b.ensemble && G.has(b.ensemble)),
      chorus: !b.ensemble,              // "ALLE", chorus - assigned to nobody
      role: b.figur || b.sprecher_im_text || '',
      who: b.ensemble || '',
      continuation: b.typ === 'fortsetzung',
      innerPlay: !!b.im_stueck_im_stueck,
      cut: !!b.gestrichen,
      cue: b.nr ?? null,
      text: b.text || '',
    };
  if (b.typ === 'kapitel')
    return { kind: 'chapter', text: b.text || '' };
  return { kind: 'direction', text: b.text || '' };
}

const emptyCount = () => ({ own: 0, foreign: 0, chorus: 0 });
function count(into, list) {
  for (const x of list) {
    if (x.kind !== 'speech' || x.cut) continue;
    if (x.chorus) into.chorus++;
    else if (x.own) into.own++;
    else into.foreign++;
  }
  return into;
}

/* ---------------------------------------------------------------------
   Everything that comes up in one rehearsal - scene by scene, block by
   block. Returns null when there is no such rehearsal.
   --------------------------------------------------------------------- */
export function passagesOf(structure, plan, rehearsalId) {
  const rehearsal = (plan?.proben || []).find(p => p.id === rehearsalId);
  if (!rehearsal) return null;

  const { units } = loadTimeline(structure);
  const G = new Set(rehearsal.gruppe || []);
  const sum = emptyCount();

  const scenes = (rehearsal.szenen || []).map(sz => {
    const span = unitsOf(units, sz);
    const parts = [];
    const counted = emptyCount();

    // Who stands on stage according to the directions without speaking,
    // and does not come to the rehearsal. That makes up a good part of
    // the substitution share but appears in no speech.
    const silent = new Set();

    for (let i = span ? span[0] : 0; span && i <= span[1]; i++) {
      const u = units[i];
      for (const person of u.silent) if (!G.has(person)) silent.add(person);

      if (u.columns) {
        const backstage = u.columns.backstage.map(b => decorate(b, G));
        const onstage = u.columns.onstage.map(b => decorate(b, G));
        count(counted, backstage); count(counted, onstage);
        // Consecutive table rows belong in ONE table - otherwise the
        // column headings would stand above every single row.
        const last = parts[parts.length - 1];
        if (last && last.kind === 'table') last.rows.push({ backstage, onstage });
        else parts.push({ kind: 'table', rows: [{ backstage, onstage }] });
      } else {
        const bs = (u.raw || []).map(b => decorate(b, G));
        for (const b of bs) parts.push(b);
        count(counted, bs);
      }
    }

    /* If the scene starts in the middle of a speech, it still has to say
       who is speaking - otherwise a nobody talks at the top.          */
    const speeches = allBlocks(parts).filter(b => b.kind === 'speech');
    if (speeches[0]?.continuation) {
      speeches[0].continuation = false;
      speeches[0].carriesOn = true;
    }

    sum.own += counted.own; sum.foreign += counted.foreign; sum.chorus += counted.chorus;

    return {
      ...sz,
      act: units[span ? span[0] : 0]?.actName || '',
      parts, counted,
      silent: [...silent].sort(),
      missing: [...new Set(speeches
        .filter(b => !b.own && !b.chorus && b.who).map(b => b.who))].sort(),
    };
  });

  return {
    rehearsal, scenes, sum,
    silent: [...new Set(scenes.flatMap(s => s.silent))].sort(),
    missing: [...new Set(scenes.flatMap(s => s.missing))].sort(),
  };
}
