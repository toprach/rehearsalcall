/* ---------------------------------------------------------------------
   Produce a rehearsal plan on the command line.

   Usage:  node probenplan.mjs [struktur.json] [--substitution 20] [--max 5]

   Writes probenplan.json (for the marking in the script) and prints a
   readable overview.

   The derivation itself is NOT repeated here: it is the same one the
   server runs (server/theater/plan.mjs). Two implementations would drift
   apart, and then the plan on the command line would differ from the
   plan in the application.
   --------------------------------------------------------------------- */
import fs from 'node:fs';
import { derivePlan } from '../server/theater/plan.mjs';

const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 ? process.argv[i + 1] : d;
};
const PATH = process.argv[2] && !process.argv[2].startsWith('--')
  ? process.argv[2] : 'struktur.json';
const SUBSTITUTION = Number(arg('substitution', arg('ersatz', 20))) / 100;
const MAXG = Number(arg('max', 5));
const MINVALUE = Number(arg('minvalue', arg('mindestwert', 40)));

const structure = JSON.parse(fs.readFileSync(PATH, 'utf8'));
const plan = derivePlan(structure, {
  substitution: SUBSTITUTION, maxGroup: MAXG, minValue: MINVALUE,
});

/* The stored plan keeps its German field names - it is a data format
   shared with the tool that draws the plan into the script. */
const duration = m =>
  Math.floor(m) + ':' + String(Math.round((m % 1) * 60)).padStart(2, '0');
const scenes = plan.proben.flatMap(p => p.szenen);
const readAloud = plan.proben.reduce(
  (a, p) => a + p.szenen.reduce((b, z) => b + z.minuten * z.ersatz_anteil, 0), 0);

console.log(`Substitution share at most ${(SUBSTITUTION * 100).toFixed(0)} %, ` +
            `groups of up to ${MAXG} people`);
console.log(`${scenes.length} scenes in ${plan.proben.length} rehearsals, ` +
            `coverage ${(plan.abdeckung * 100).toFixed(1)} %`);
console.log(`The director reads for ${duration(readAloud)} min in total\n`);

for (const p of plan.proben) {
  console.log(`${p.id}  ${p.gruppe.join(', ')}`);
  console.log(`    ${p.szenen.length} scene(s), ${duration(p.minuten)} min of playing ` +
              `time, substitution ${(100 * p.ersatz_anteil).toFixed(0)} %` +
              (p.nachlese ? '   [gleaning]' : ''));
  for (const z of p.szenen)
    console.log(`      Scene ${String(z.szene).padStart(2)}  act ${z.akt}  ` +
                `#${z.nr_von}–${z.nr_bis}  ${duration(z.minuten)} min  ` +
                (z.ersatz_anteil
                  ? `substitution ${(100 * z.ersatz_anteil).toFixed(0)} %  `
                  : '                      ') +
                String(z.anfang || '').replace(/\s+/g, ' ').slice(0, 52));
  console.log('');
}

if (plan.abdeckung < 1)
  console.log(`Not covered: ${((1 - plan.abdeckung) * 100).toFixed(1)} % of the ` +
              'spoken text. A higher substitution share or a larger group helps.');

fs.writeFileSync('probenplan.json', JSON.stringify(plan, null, 1), 'utf8');
console.log('\nprobenplan.json written.');
