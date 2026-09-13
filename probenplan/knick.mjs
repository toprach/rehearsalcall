/* Where does a higher substitution share stop paying off? */
import fs from 'node:fs';
import { findScenes, WPM } from '../server/theater/scenes.mjs';

const PATH = process.argv[2] || 'struktur.json';
const structure = JSON.parse(fs.readFileSync(PATH, 'utf8'));
const SHARES = [0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40];

console.log('Subst.   2       3       4       5     | director reads in total (plan of 5s)');
for (const p of SHARES) {
  const row = [];
  let foreignMinutes = 0;
  for (const maxG of [2, 3, 4, 5]) {
    const { scenes, units, s } = findScenes(structure,
      { shares: [p], sizes: [2, 3, 4, 5].filter(k => k <= maxG) });
    const open = units.map(u => u.ownWords);
    const total = open.reduce((a, b) => a + b, 0);
    let foreign = 0;
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
      foreign += best.foreign;
    }
    row.push((100 * (1 - open.reduce((a, b) => a + b, 0) / total)).toFixed(1) + '%');
    if (maxG === 5) foreignMinutes = foreign / WPM;
  }
  console.log(String(p * 100).padStart(4) + '%  ' + row.map(x => x.padStart(6)).join('  ') +
              '  |  ' + foreignMinutes.toFixed(1) + ' min');
}
