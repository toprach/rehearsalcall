/* ---------------------------------------------------------------------
   Revising the rehearsal plan by hand.

   The derivation is a proposal, not a verdict. The director knows
   things that are not in the text: that two people travel together
   anyway, that somebody is still learning the part, that a scene makes
   no sense without the fourth.

   After every change, playing time, substitution share and coverage are
   recomputed - otherwise numbers would stand there that no longer hold.

   Each change returns a message as a KEY with values, not a finished
   sentence: down here it is not known which language the visitor chose.
   Translating happens when the page is set. A value shaped
   { share: 0.08 } is put in as a percentage the way that language
   writes it.
   --------------------------------------------------------------------- */

import { loadTimeline, SILENT_WEIGHT } from './timeline.mjs';
import { WPM } from './scenes.mjs';

/* Which units belong to a scene?

   Since the derivation passes the bounds along, this is a lookup. Older
   plans do not have them - for those it is computed back from the cue
   numbers, which is a little less precise.                            */
export function unitsOf(units, scene) {
  if (Number.isInteger(scene.von) && Number.isInteger(scene.bis) &&
      scene.von >= 0 && scene.bis < units.length && scene.bis >= scene.von)
    return [scene.von, scene.bis];

  let from = -1, to = -1;
  for (let k = 0; k < units.length; k++) {
    const u = units[k];
    if (u.cueFrom == null && u.cueTo == null) continue;
    const a = u.cueFrom ?? u.cueTo, b = u.cueTo ?? u.cueFrom;
    if (from < 0 && b >= scene.nr_von) from = k;
    if (a <= scene.nr_bis) to = k;
  }
  return (from < 0 || to < from) ? null : [from, to];
}

/* Own and foreign words of one unit for a given cast. */
function weigh(u, G) {
  let own = 0, foreign = u.groupWords;
  for (const [person, w] of u.speaks) (G.has(person) ? (own += w) : (foreign += w));
  for (const person of u.silent) if (!G.has(person)) foreign += SILENT_WEIGHT;
  return { own, foreign };
}

/* ---------------------------------------------------------------------
   Recompute everything: per scene, per rehearsal, and the coverage
   overall.
   --------------------------------------------------------------------- */
export function recompute(structure, plan) {
  const { units } = loadTimeline(structure);
  const total = units.reduce((a, u) => a + u.ownWords, 0) || 1;
  const covered = new Array(units.length).fill(false);

  for (const pr of plan.proben) {
    const G = new Set(pr.gruppe);
    let ownAll = 0, foreignAll = 0;
    for (const sz of pr.szenen) {
      const span = unitsOf(units, sz);
      if (!span) { sz.minuten = 0; sz.ersatz_anteil = 0; continue; }
      let own = 0, foreign = 0;
      for (let i = span[0]; i <= span[1]; i++) {
        const w = weigh(units[i], G);
        own += w.own; foreign += w.foreign;
        covered[i] = true;
      }
      sz.minuten = (own + foreign) / WPM;
      sz.ersatz_anteil = foreign / ((own + foreign) || 1);
      ownAll += own; foreignAll += foreign;
    }
    pr.minuten = pr.szenen.reduce((a, s) => a + (s.minuten || 0), 0);
    pr.ersatz_anteil = foreignAll / ((ownAll + foreignAll) || 1);
  }

  let open = 0;
  for (let i = 0; i < units.length; i++) if (!covered[i]) open += units[i].ownWords;
  plan.abdeckung = 1 - open / total;
  plan.bearbeitet = new Date().toISOString();
  return plan;
}

/* The identifiers stay what they are.

   Earlier the plan was renumbered after every change - and then the
   rehearsal one was just working on was suddenly called something else,
   and the next click hit the wrong one. Besides, fixed dates and printed
   rehearsal books point at the old names.

   Sorting still happens: small groups first.                          */
export function sortPlan(plan) {
  plan.proben.sort((a, b) =>
    a.gruppe.length - b.gruppe.length || (b.minuten || 0) - (a.minuten || 0));
}

/* Carry fixed dates along when rehearsals are renamed. */
export function moveDatesAlong(project, renamed, removed) {
  project.termine = (project.termine || [])
    .filter(t => !removed.has(t.probe_id))
    .map(t => renamed.has(t.probe_id)
      ? { ...t, probe_id: renamed.get(t.probe_id) } : t);
}

/* ---------------------------------------------------------------------
   The changes themselves. Each returns a message.
   --------------------------------------------------------------------- */

export function dropRehearsal(project, rehearsalId) {
  const plan = project.plan;
  const pr = plan.proben.find(x => x.id === rehearsalId);
  if (!pr) return { kind: 'error', key: 'msg.rehearsal_gone' };
  plan.proben = plan.proben.filter(x => x !== pr);
  const removed = new Set([rehearsalId]);
  recompute(project.skript, plan);
  sortPlan(plan);
  moveDatesAlong(project, new Map(), removed);
  return { kind: 'good', key: 'msg.dropped',
           values: { id: rehearsalId, coverage: { share: plan.abdeckung } } };
}

export function mergeRehearsals(project, a, b) {
  const plan = project.plan;
  const pa = plan.proben.find(x => x.id === a);
  const pb = plan.proben.find(x => x.id === b);
  if (!pa || !pb) return { kind: 'error', key: 'msg.one_gone' };
  if (pa === pb) return { kind: 'error', key: 'msg.same_one' };

  pa.gruppe = [...new Set([...pa.gruppe, ...pb.gruppe])].sort();
  pa.szenen = [...pa.szenen, ...pb.szenen].sort((x, y) => x.szene - y.szene);
  pa.nachlese = pa.nachlese && pb.nachlese;
  plan.proben = plan.proben.filter(x => x !== pb);

  recompute(project.skript, plan);
  sortPlan(plan);
  moveDatesAlong(project, new Map(), new Set([b]));
  return { kind: 'good', key: 'msg.merged',
           values: { a, b, group: pa.gruppe.join(', '),
                     min: Math.round(pa.minuten) } };
}

export function changeCast(project, rehearsalId, person, joining) {
  const plan = project.plan;
  const pr = plan.proben.find(x => x.id === rehearsalId);
  if (!pr) return { kind: 'error', key: 'msg.rehearsal_gone' };
  const known = (project.personen || []).some(x => x.b === person);
  if (!known) return { kind: 'error', key: 'msg.not_in_company',
                       values: { who: person } };

  if (joining) {
    if (pr.gruppe.includes(person))
      return { kind: 'error', key: 'msg.already_there', values: { who: person } };
    pr.gruppe = [...pr.gruppe, person].sort();
  } else {
    if (!pr.gruppe.includes(person))
      return { kind: 'error', key: 'msg.not_there', values: { who: person } };
    if (pr.gruppe.length <= 1)
      return { kind: 'error', key: 'msg.needs_one' };
    pr.gruppe = pr.gruppe.filter(x => x !== person);
  }

  recompute(project.skript, plan);
  sortPlan(plan);

  return { kind: 'good', key: joining ? 'msg.joined' : 'msg.left',
           values: { who: person, id: rehearsalId,
                     share: { share: pr.ersatz_anteil || 0, digits: 0 } } };
}

/* One note per rehearsal - for everything that fits nowhere else. */
export function setNote(project, rehearsalId, text) {
  const pr = project.plan?.proben?.find(x => x.id === rehearsalId);
  if (!pr) return { kind: 'error', key: 'msg.rehearsal_gone' };
  pr.notiz = String(text || '').trim().slice(0, 200);
  return { kind: 'good', key: pr.notiz ? 'msg.note_saved' : 'msg.note_gone',
           values: { id: rehearsalId } };
}
