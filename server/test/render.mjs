/* ---------------------------------------------------------------------
   Every view, rendered in every language with made-up data.

   Some pages cannot be reached in a test without outside help - the
   audiobook page with a working key and a running job needs an
   ElevenLabs account. So the views are called directly here, with
   invented voices and a job in progress, and the result is searched for
   the seams a translation leaves: a missing key, a placeholder nobody
   filled, "undefined" in the text.

     node test/render.mjs
   --------------------------------------------------------------------- */

import { views, ABOUT } from '../theater/views.mjs';
import { LANGUAGES } from '../theater/texts.mjs';

const project = {
  id: 'abcd1234', titel: 'Test <Play>',
  personen: [
    { id: 'p1', b: 'OBERON', name: 'O. Berg', token: 'tok1' },
    { id: 'p2', b: 'PUCK', name: '', token: 'tok2' },
    { id: 'p3', b: 'TITANIA', name: 'T. Ania', funktion: 'Souffleuse', token: 'tok3' },
  ],
  drehbuch: { quelle: 'dream.md', titel: ['A Dream', 'Act I'], bloecke: 200,
              sprecher: [{ token: 'OBERON', n: 3 }, { token: 'PUCK', n: 2 }, { token: 'ALL', n: 1 }],
              sprecherstil: 'dot', original: { name: 'dream.md', bytes: 12345 } },
  zuordnung: { OBERON: { art: 'person', name: 'O. Berg' }, PUCK: { art: 'rolle', ziel: 'OBERON' },
               ALL: { art: 'gruppe' } },
  skript_ueberblick: { repliken: 120, personen: 3, rollen: 1 },
  plan: { ersatzanteil: 0.2, max_gruppe: 5, abdeckung: 0.93, bearbeitet: '2026-09-01T10:00:00Z',
          proben: [
            { id: 'P01', gruppe: ['OBERON', 'PUCK'], minuten: 12.4, ersatz_anteil: 0.1,
              szenen: [{ szene: 1 }], notiz: 'quietly' },
            { id: 'P02', gruppe: ['OBERON', 'PUCK', 'TITANIA'], minuten: 30, ersatz_anteil: 0,
              szenen: [{ szene: 2 }, { szene: 3 }], nachlese: true },
          ] },
  verfuegbar: { p1: { tage: { '2026-10-01': { von: '19:00', bis: '22:00' } }, stand: '2026-09-01T10:00:00Z' } },
  termine: [{ probe_id: 'P01', iso: '2026-10-01', von: '19:00', bis: '20:00', bestaetigt: true, ort: 'Stage' }],
  einstellungen: { bis: '2026-12-01' },
  hoerbuch: { schluessel: 'sk', stimmen: { p1: 'v1' }, modell: 'eleven_v3' },
  gruppenlink: 'https://x/theater/gruppe/abc', regielink: 'https://x/theater/projekt?s=abc',
  drucklink: 'https://x/theater/druck/abc',
};
project.drehbuch.nr = 2; project.drehbuch.hochgeladen = '2026-09-02T10:00:00Z';
project.drehbuch.aenderungen = { geaendert: 3, neu: 1, gestrichen: 2, gleich: 100 };
project.drehbuch.neue_sprecher = ['FAIRY'];
project.fassungen = [{ nr: 1, quelle: 'dream-v1.md', hochgeladen: '2026-09-01T10:00:00Z',
  markdown: 'x', sprecherstil: 'dot', bloecke: 190, repliken: 118, aenderungen: null }];
project.plan.abgleich = { datum: '2026-09-02T10:00:00Z', unsicher: ['P02'], umgebaut: ['P01'] };
project.plan.proben[1].unsicher = true;
project.plan.proben[0].szenen[0].umgebaut = true;
const diff = { equal: 100, changed: 1, added: 1, removed: 1, hunks: [{ items: [
  { kind: 'changed', old: { nr: 12, who: 'OBERON', text: 'Ill met by moonlight' },
                     new: { nr: 12, who: 'OBERON', text: 'Ill met by daylight' } },
  { kind: 'removed', old: { nr: 13, who: 'PUCK', text: 'Gone.' } },
  { kind: 'added', new: { nr: 13, who: 'TITANIA', text: 'New line <here>' } },
] }] };
const byCue = new Map([[12, new Set(['P01'])], [13, new Set(['P01', 'P02'])]]);
const person = project.personen[0];
const datesResult = {
  until: new Date('2026-12-01'),
  hint: { key: 'msg.without_date', values: { open: 1, total: 2 } },
  rehearsals: [
    { id: 'P01', group: ['OBERON', 'PUCK'], minutes: 12.4, needs: 60, scenes: [1], possible: [{}],
      fixed: true, proposal: { date: new Date('2026-10-01'), iso: '2026-10-01', weekday: 4, from: '19:00', to: '20:00' },
      alternatives: [] },
    { id: 'P02', group: ['OBERON', 'PUCK', 'TITANIA'], minutes: 30, needs: 105, scenes: [2, 3],
      possible: [], withoutEntry: ['TITANIA'], tooShort: 0, longestWindow: 0, oftenUnavailable: [] },
  ],
};
const days = [];
for (let i = 1; i <= 35; i++) {
  const d = new Date(2026, 9, i);
  days.push({ iso: d.toISOString().slice(0, 10), day: d.getDate(), month: d.getMonth(),
              year: d.getFullYear(), weekday: d.getDay() });
}
const states = Object.fromEntries(days.map((t, i) => [t.iso, {
  level: i % 4, canCome: i % 2 ? ['PUCK'] : [],
  best: i % 3 ? { rehearsal: 'P01', here: 1, total: 1, missing: [] } : null,
  fixed: i === 0 ? [{ rehearsal: 'P01', from: '19:00', to: '20:00', place: 'Stage' }] : [],
}]));
const passages = {
  rehearsal: project.plan.proben[0],
  sum: { own: 10, foreign: 2, chorus: 1 }, silent: ['TITANIA'],
  scenes: [{ szene: 1, act: 'ACT I', nr_von: 1, nr_bis: 9, minuten: 12.4, ersatz_anteil: 0.1,
             missing: ['TITANIA'], silent: [],
             parts: [
               { kind: 'speech', own: true, role: 'OBERON', who: 'OBERON', text: 'Ill met by moonlight.' },
               { kind: 'speech', own: false, role: 'TITANIA', who: 'TITANIA', text: 'What, jealous Oberon!' },
               { kind: 'speech', chorus: true, text: 'All together' },
               { kind: 'direction', text: 'Exit PUCK.' },
               { kind: 'chapter', text: 'SCENE II' },
               { kind: 'table', rows: [{ backstage: [{ kind: 'direction', text: 'noise' }],
                                         onstage: [{ kind: 'speech', own: true, who: 'PUCK', text: 'Here.' }] }] },
             ] }],
};
const audiobook = {
  voices: [{ id: 'v1', name: 'Alice', description: 'warm' }, { id: 'v2', name: 'Bob' }],
  people: [{ id: 'p1', name: 'OBERON', roles: ['PUCK'] }, { id: 'ERZAEHLER', name: 'Narrator', roles: [], isNarrator: true }],
  jobState: { running: true, done: 3, total: 10, skipped: 1, lastLine: 'OBERON: Ill met', bytes: 2_500_000,
              error: null, file: 'p01.mp3', what: { key: 'msg.hb_rehearsal', values: { id: 'P01' } } },
  rehearsals: project.plan.proben,
  models: [['eleven_v3', 'Eleven v3'], ['eleven_multilingual_v2', 'Multilingual v2']],
  acts: [1, 2, 3, 4, 5],
};

const seams = (html) => {
  const found = [];
  for (const m of html.matchAll(/\[[a-z]+\.[a-z0-9_]+\]/g)) found.push(m[0]);
  for (const m of html.replace(/<script>[\s\S]*?<\/script>/g, '').matchAll(/\{[a-z]+\}/g)) found.push(m[0]);
  if (/>\s*undefined\s*</.test(html) || /\bNaN\b/.test(html)) found.push('undefined/NaN');
  return [...new Set(found)];
};

let failures = 0;
for (const { code } of LANGUAGES) {
  const A = views(code, '/theater/x');
  const pages = {
    entryPage: () => A.entryPage({ kind: 'error', key: 'r.code_unknown' }),
    aboutPage: () => A.aboutPage(),
    projectPage: () => A.projectPage(project, { kind: 'good', key: 'r.created', values: { p1: 'X' } }),
    uploadPage: () => A.uploadPage(project, { kind: 'error', key: 'r.style_unknown', values: { colon: 3, dot: 4 } }),
    castPage: () => A.castPage(project, null, ['PUCK']),
    planPage: () => A.planPage(project, { kind: 'good', key: 'r.derived', values: { p1: 2, p2: { share: 0.93 } } }),
    passagesPage: () => A.passagesPage(project, passages, null),
    audiobookPage: () => A.audiobookPage(project, audiobook, { kind: 'good', key: 'r.key_stored' }),
    audiobookDone: () => A.audiobookPage(project, { ...audiobook,
      jobState: { ...audiobook.jobState, running: false, error: 'boom' } }, null),
    companyPage: () => A.companyPage(project, null, 'https://x'),
    pickNamePage: () => A.pickNamePage(project, 'tok', { kind: 'error', key: 'r.name_gone' }),
    memberPage: () => A.memberPage(project, person, null, project.personen[1]),
    switchPage: () => A.switchPage(project, person, project.personen[1], '/theater/druck/t/mit/PUCK', '/theater/mit'),
    backBar: () => A.backBar('tok', 'OBERON', true),
    myDatesPage: () => A.myDatesPage(project, person, datesResult, { kind: 'good', key: 'r.now_fixed', values: { p1: 'P01' } }),
    datesPage: () => A.datesPage(project, datesResult, null),
    datesEmpty: () => A.datesPage(project, { rehearsals: [], hint: { key: 'msg.no_plan' } }, null),
    myTimesPage: () => A.myTimesPage(project, person, { kind: 'good', key: 'r.times_saved', values: { n: 3 } }, days, states),
    printPage: () => A.printPage(project, null),
    docsPage: () => A.docsPage(project, 'https://x/theater/druck/abc'),
    errorPage: () => A.errorPage('f.failed_t', 'f.failed', { reason: 'because' }),
    versionPage: () => A.versionPage(project, project.drehbuch, project.fassungen[0], diff, byCue),
    versionEmpty: () => A.versionPage(project, project.drehbuch, project.fassungen[0],
      { equal: 5, changed: 0, added: 0, removed: 0, hunks: [] }, new Map()),
    adminLoginPage: () => A.adminLoginPage({ kind: 'error', key: 'r.admin_wrong' }),
    adminPage: () => A.adminPage([
      { id: 'abcd1234', titel: 'One <play>', angelegt: '2026-09-01T10:00:00Z', email: 'a@b.c',
        people: 3, rehearsals: 2, withEntry: 1 },
      { id: 'efgh5678', titel: 'Two', angelegt: '', email: '', people: 0, rehearsals: 0, withEntry: 0 },
    ], { kind: 'good', key: 'r.admin_created', values: { p1: 'One' } },
       { id: 'abcd1234', titel: 'One <play>', email: 'a@b.c', code: 'ruhig-probe-ab12' },
       'https://x/theater'),
    adminEmpty: () => A.adminPage([], null, null, 'https://x/theater'),
  };
  for (const [name, render] of Object.entries(pages)) {
    let html, problem = '';
    try { html = render(); } catch (e) { problem = 'throws: ' + e.message; }
    const s = html ? seams(html) : [];
    const ok = !problem && s.length === 0 && html.length > 200;
    console.log((ok ? '  ok    ' : '  FAIL  ') + code + ' ' + name + (problem || s.length ? '  - ' + (problem || s.join(' ')) : ''));
    if (!ok) failures++;
  }
}
console.log('  version ' + (ABOUT.version || '(none)'));
console.log(failures ? `\n${failures} FAILED` : '\nall views render clean');
process.exit(failures ? 1 : 0);
