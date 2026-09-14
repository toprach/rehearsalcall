/* The date arithmetic on a made-up project: the director counts as free
   without entering anything, except on struck days.

     node test/dates.mjs
*/
import { proposeDates, dayStates, calendarDays } from '../theater/dates.mjs';

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log((ok ? '  ok    ' : '  FAIL  ') + name + (ok || !detail ? '' : '  - ' + detail));
  if (!ok) failed++;
};

const iso = (d) => d.toISOString().slice(0, 10);
const day = (n) => { const d = new Date(); d.setUTCHours(12, 0, 0, 0); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
const evening = { von: '19:00', bis: '22:00' };
const project = {
  id: 'x', titel: 'X',
  personen: [{ id: 'a', b: 'ANNA' }, { id: 'r', b: 'RITA', regie: true }],
  plan: { proben: [{ id: 'P01', gruppe: ['ANNA'], minuten: 10, szenen: [] }] },
  verfuegbar: { a: { tage: { [day(3)]: evening, [day(5)]: evening } } },
  termine: [],
  einstellungen: { gesperrt: [day(3)] },
};

let r = proposeDates(project);
check('one rehearsal, one proposal', r.rehearsals.length === 1 && !!r.rehearsals[0].proposal, JSON.stringify(r.rehearsals[0]?.proposal));
check('the director is not waited for', r.rehearsals[0].withoutEntry.length === 0, JSON.stringify(r.rehearsals[0].withoutEntry));
check('the struck day is skipped, the other one taken', r.rehearsals[0].proposal?.iso === day(5), r.rehearsals[0].proposal?.iso);

const noDirector = { ...project, personen: [{ id: 'a', b: 'ANNA' }, { id: 'r', b: 'RITA' }],
  plan: { proben: [{ id: 'P01', gruppe: ['ANNA', 'RITA'], minuten: 10, szenen: [] }] } };
r = proposeDates(noDirector);
check('without the flag a person without entries is waited for', r.rehearsals[0].withoutEntry.includes('RITA') && !r.rehearsals[0].proposal);

const states = dayStates(project, project.personen[0], calendarDays(project));
check('the struck day is marked blocked', states[day(3)]?.blocked === true);
check('the director counts as able to come on a free day', (states[day(5)]?.canCome || []).includes('RITA'), JSON.stringify(states[day(5)]));

console.log('');
console.log(failed ? failed + ' check(s) failed' : 'dates: all checks passed');
process.exit(failed ? 1 : 0);
