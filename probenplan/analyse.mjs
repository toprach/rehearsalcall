/* Which substitution share pays off? How much of the play can be
   rehearsed in small groups? The answer by trying every combination.

   The search itself lives in the server modules - there is only one
   implementation, and this is the same one the application runs.      */
import fs from 'node:fs';
import { findScenes, WPM, KNOBS } from '../server/theater/scenes.mjs';

const PATH = process.argv[2] || 'struktur.json';
const structure = JSON.parse(fs.readFileSync(PATH, 'utf8'));

/* A greedy covering plan: always take the scene with the best ratio of
   newly covered text to scheduling effort.                            */
function plan(scenes, units, s) {
  const open = units.map(u => u.ownWords);
  const total = open.reduce((a, b) => a + b, 0);
  const chosen = [];
  for (;;) {
    let best = null, bestValue = 0;
    for (const z of scenes) {
      let fresh = 0;
      for (let i = z.from; i <= z.to; i++) fresh += open[i];
      if (fresh < s.minOwnWords) continue;
      const v = (fresh - s.setup) * Math.pow(s.q, z.group.length - 2);
      if (v > bestValue) { bestValue = v; best = z; }
    }
    if (!best) break;
    for (let i = best.from; i <= best.to; i++) open[i] = 0;
    chosen.push(best);
  }
  const rest = open.reduce((a, b) => a + b, 0);
  return { chosen, coverage: 1 - rest / total, total };
}

console.log('Subst.  maxGrp  Scenes  Coverage   Rehearsal-min  Director reads  Date effort');
console.log('------  ------  ------  ---------  -------------  --------------  -----------');
for (const p of [0, 0.05, 0.10, 0.20]) {
  for (const maxG of [2, 3, 4, 5]) {
    const { scenes, units, s } = findScenes(structure,
      { shares: [p], sizes: [2, 3, 4, 5].filter(k => k <= maxG) });
    const r = plan(scenes, units, s);
    const min = r.chosen.reduce((a, z) => a + z.minutes, 0);
    const foreign = r.chosen.reduce((a, z) => a + z.foreign, 0) / WPM;
    // Date effort: expected attempts per rehearsal, added up
    const effort = r.chosen.reduce((a, z) => a + Math.pow(1 / s.q, z.group.length), 0);
    console.log(
      String(p * 100).padStart(4) + '%  ' + String(maxG).padStart(6) + '  ' +
      String(r.chosen.length).padStart(6) + '  ' +
      (r.coverage * 100).toFixed(1).padStart(8) + '%  ' +
      min.toFixed(0).padStart(13) + '  ' +
      foreign.toFixed(1).padStart(12) + ' min  ' + effort.toFixed(0).padStart(11));
  }
}
