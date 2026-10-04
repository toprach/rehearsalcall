/* The date arithmetic on a made-up project: the director counts as free
   without entering anything, except on struck days.

     node test/dates.mjs
*/
import { proposeDates, dayStates, calendarDays, oneDatePerDay, dayView, displayDays } from '../theater/dates.mjs';

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
check('the director is not listed as having time - struck days say where the director is', !(states[day(5)]?.canCome || []).includes('RITA'), JSON.stringify(states[day(5)]));
check('and does not count towards the colour: nobody else needed, so the day is fully green',
      states[day(5)]?.level === 3 && states[day(5)]?.best?.total === 0 && !(states[day(5)].best.missing || []).includes('RITA'), JSON.stringify(states[day(5)]));

// One date per day: a plan rehearsal and a free one on the same day become one.
const merging = { ...project, personen: [...project.personen, { id: 'b', b: 'BEN' }],
  termine: [
    { probe_id: 'P01', iso: day(5), von: '19:00', bis: '20:00', gruppe: ['ANNA'], bestaetigt: true, ort: 'Hall' },
    { probe_id: 'F-1', frei: true, iso: day(5), von: '18:00', bis: '21:00', bestaetigt: true, ort: '',
      gruppe: ['ANNA', 'BEN'], zeiten: { ANNA: { von: '19:30', bis: '21:00' }, BEN: { von: '18:00', bis: '19:00' } }, inhalt: 'Act II' },
    { probe_id: 'P01', iso: day(6), von: '19:00', bis: '20:30', gruppe: ['ANNA'], bestaetigt: true },
  ] };
check('several dates on a day are merged', oneDatePerDay(merging) === true);
const d5 = merging.termine.filter(t => t.iso === day(5));
check('one date per day remains, the free one\u2019s id kept', d5.length === 1 && d5[0].probe_id === 'F-1' && d5[0].frei, JSON.stringify(d5));
check('each person from the earliest start to the latest end',
      d5[0]?.zeiten?.ANNA?.von === '19:00' && d5[0]?.zeiten?.ANNA?.bis === '21:00' && d5[0]?.zeiten?.BEN?.bis === '19:00' &&
      d5[0]?.von === '18:00' && d5[0]?.bis === '21:00', JSON.stringify(d5[0]));
check('what is rehearsed keeps the plan id and the note, the place survives',
      /P01/.test(d5[0]?.inhalt || '') && /Act II/.test(d5[0]?.inhalt || '') && d5[0]?.ort === 'Hall', JSON.stringify(d5[0]));
const d6 = merging.termine.filter(t => t.iso === day(6));
check('a lone plan date becomes a free one', d6.length === 1 && d6[0].frei && d6[0].zeiten?.ANNA?.von === '19:00' && /^F-/.test(d6[0].probe_id), JSON.stringify(d6));
check('a second run changes nothing', oneDatePerDay(merging) === false);
check('the replaced dates are kept aside', (merging.termine_alt || []).length === 3 && merging.termine_alt.every(t => t.durch && t.ersetzt));
const shown = displayDays(merging);
check('the calendar reaches back to the month of the first date', shown[0].iso.slice(8) === '01' && shown.some(x => x.iso === day(6)));
const view = dayView(merging, merging.personen[1], shown);
check('the day view: rows sorted by start, the director counts as in it',
      view[day(5)]?.date?.rows?.[0]?.b === 'BEN' && view[day(5)]?.date?.withMe === true, JSON.stringify(view[day(5)]?.date));
check('the director has no window in the day view', !('RITA' in (view[day(5)]?.windows || {})) && !!view[day(5)]?.windows?.ANNA);

console.log('');
console.log(failed ? failed + ' check(s) failed' : 'dates: all checks passed');
process.exit(failed ? 1 : 0);
