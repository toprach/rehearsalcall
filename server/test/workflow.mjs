/* ---------------------------------------------------------------------
   The whole workflow, end to end, against a running instance.

   Every form the application has is submitted once: upload, casting,
   deriving, every change to the plan, entering availability for a whole
   cast, fixing and releasing a date from both sides, the place, the
   company page, switching languages and the About page. A rename that
   breaks one side of a form - as happened once with the upload field -
   shows up here and not in front of a director.

   Every step says what kind of answer it expects. "The page answered"
   is not enough: the casting page answers with an error notice just as
   readily as with a good one, and for a long time this test called
   that ok.

   Usage:
     node test/workflow.mjs http://127.0.0.1:3011 <access-code> <script.md>

   The script that goes with it: beispiel/shakespeare/a-midsummer-nights-dream.md
   - public domain, in the Gutenberg speaker style, five acts.

   Point it at a throwaway project: it changes the plan and the company.
   --------------------------------------------------------------------- */

import fs from 'node:fs';

const [, , BASE = 'http://127.0.0.1:3011', CODE, SCRIPT] = process.argv;
if (!CODE || !SCRIPT) {
  console.error('Usage: node test/workflow.mjs <base-url> <access-code> <script.md>');
  process.exit(2);
}

let cookies = '';
let failures = 0;

function remember(res) {
  const set = res.headers.getSetCookie?.() || [];
  for (const c of set) {
    const [pair] = c.split(';');
    const [name] = pair.split('=');
    cookies = cookies.split('; ').filter(x => x && !x.startsWith(name + '='))
      .concat(pair).join('; ');
  }
}

async function call(method, path, body, headers = {}) {
  const res = await fetch(BASE + path, {
    method, body, redirect: 'manual',
    headers: { cookie: cookies, ...headers },
  });
  remember(res);
  return { status: res.status, text: await res.text(), res };
}

const form = (fields) => ({
  body: new URLSearchParams(fields).toString(),
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
});
const post = (path, fields) => {
  const f = form(fields);
  return call('POST', path, f.body, f.headers);
};

/* The notice on a page: its kind and its text. */
const notice = (html) => {
  const m = /class="notice (good|error)">([\s\S]*?)<\/div>/.exec(html);
  return m ? { kind: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() } : null;
};
const good = (r) => notice(r.text)?.kind === 'good';
const errorNotice = (r) => notice(r.text)?.kind === 'error';
const say = (r) => notice(r.text) ? notice(r.text).kind + ': ' + notice(r.text).text.slice(0, 90)
                                  : 'status ' + r.status;

/* A page must not show the seams: no missing key, no placeholder left
   over, no "undefined" in the text. */
const seams = (html) => {
  const found = [];
  for (const m of html.matchAll(/\[[a-z]+\.[a-z0-9_]+\]/g)) found.push(m[0]);
  for (const m of html.replace(/<script>[\s\S]*?<\/script>/g, '').matchAll(/\{[a-z]+\}/g))
    found.push(m[0]);
  if (/>\s*undefined\s*</.test(html) || /\bNaN\b/.test(html)) found.push('undefined/NaN');
  return [...new Set(found)];
};

function check(name, ok, detail = '') {
  console.log((ok ? '  ok    ' : '  FAIL  ') + name + (detail ? '  - ' + detail : ''));
  if (!ok) failures++;
}
function clean(name, r) {
  const s = seams(r.text);
  check(name + ' has no seams', s.length === 0, s.join(' '));
}
const esc = s => s.replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---- 1. signing in ---- */
let r = await post('/theater/zugang', { code: CODE });
check('sign in', r.status === 303, 'status ' + r.status);
r = await call('GET', '/theater/projekt');
check('overview', r.status === 200, 'status ' + r.status);
clean('overview', r);

/* ---- 2. uploading the script ---- */
{
  const fd = new FormData();
  fd.append('file', new Blob([fs.readFileSync(SCRIPT)]), SCRIPT.split(/[\\/]/).pop());
  fd.append('style', 'auto');
  r = await call('POST', '/theater/skript', fd);
  check('upload a script', r.status === 303 && !errorNotice(r), say(r));
  r = await call('GET', '/theater/skript');
  check('upload page shows the script', /class="box"/.test(r.text) && r.status === 200);
  clean('upload page', r);
}

/* ---- 3. casting: take over the proposal as it stands ---- */
r = await call('GET', '/theater/besetzung');
clean('casting page', r);
{
  const fields = {};
  for (const m of r.text.matchAll(/<select name="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g)) {
    const selected = /<option value="([^"]*)"[^>]*selected/.exec(m[2]);
    fields[m[1]] = selected ? selected[1] : '';
  }
  for (const m of r.text.matchAll(/<input type="text" name="(name_[^"]+)" value="([^"]*)"/g))
    fields[m[1]] = m[2];
  const castSize = Object.keys(fields).filter(k => k.startsWith('art_')).length;
  check('casting page lists speakers', castSize > 0, castSize + ' speakers');
  r = await post('/theater/besetzung', fields);
  check('take over the casting', good(r), say(r));
}

/* ---- 4. deriving the plan ---- */
r = await post('/theater/plan', { action: 'ableiten', substitution: '20', maxgruppe: '5' });
check('derive the plan', good(r), say(r));
clean('plan page', r);
const ids = [...new Set([...r.text.matchAll(/>(P\d+)<\/b>/g)].map(m => m[1]))];
check('the plan has rehearsals', ids.length > 0, ids.length + ' rehearsals');

/* The cast of one rehearsal, read off the plan page. */
const groupOf = (html, id) => [...new Set([...(new RegExp('>' + id + '</b>[\\s\\S]*?</td>\\s*<td>([\\s\\S]*?)<div')
  .exec(html) || ['', ''])[1].matchAll(/<span class="chip">([^<]+)<\/span>/g)].map(m => m[1]))];

/* The people on the company page - they came out of the casting. */
const people = [...new Set([...(await call('GET', '/theater/leute')).text
  .matchAll(/<span class="chip">([^<]+)<\/span>/g)].map(m => m[1]))];
check('the company came out of the casting', people.length > 0, people.length + ' people');

/* ---- 5. every change to the plan ---- */
if (ids.length >= 2) {
  const first = ids[0], second = ids[1];
  const inFirst = new Set(groupOf(r.text, first));
  const who = people.find(x => !inFirst.has(x)) || people[0];
  r = await post('/theater/plan', { action: 'notiz', rehearsal: first, notiz: 'test note' });
  check('note on a rehearsal', good(r), say(r));
  r = await post('/theater/plan', { action: 'dazu', rehearsal: first, person: who });
  check('add a person', good(r), say(r));
  r = await post('/theater/plan', { action: 'weg', rehearsal: first, person: who });
  check('remove a person', good(r), say(r));
  r = await post('/theater/plan', { action: 'zusammen', rehearsal: first, others: second });
  check('merge two rehearsals', good(r), say(r));
  r = await post('/theater/plan', { action: 'streichen', rehearsal: first });
  check('drop a rehearsal', good(r), say(r));
  r = await post('/theater/plan', { action: 'streichen', rehearsal: 'P99' });
  check('dropping an unknown rehearsal is refused', errorNotice(r), say(r));
}

/* ---- 6. the passages of one rehearsal ---- */
r = await call('GET', '/theater/plan');
const planIds = [...new Set([...r.text.matchAll(/>(P\d+)<\/b>/g)].map(m => m[1]))];
const planHtml = r.text;
{
  const id = planIds[0];
  if (id) {
    const p = await call('GET', '/theater/plan/' + id);
    check('passages of a rehearsal', p.status === 200 && /class="line/.test(p.text), 'status ' + p.status);
    clean('passages page', p);
  }
  const gone = await call('GET', '/theater/plan/P99');
  check('unknown rehearsal gives 404', gone.status === 404, 'status ' + gone.status);
}

/* ---- 6b. a new version of the script ----

   The plan must survive an upload. A small edit - one speech changed,
   one cut, one added - keeps every passage; cutting the very first
   speech of a rehearsal's passage makes that rehearsal unsure; and an
   older version can be made current again. */
{
  const original = fs.readFileSync(SCRIPT, 'utf8');
  const uploadText = async (text, name) => {
    const fd = new FormData();
    fd.append('file', new Blob([text]), name);
    fd.append('style', 'auto');
    return call('POST', '/theater/skript', fd);
  };
  const target = planIds[0];
  const idsBefore = planIds.join(',');

  // version 2: change, cut, add - in speeches that are surely not anchors
  const v2 = original
    .replace('Four days will quickly steep themselves in night;',
             'Four days will quickly steep themselves in darkness;')
    .replace(/\nQUINCE\.\nIs all our company here\?\n/, '\nQUINCE.\nIs all our company here?\nAnd is the weather fair?\n');
  check('version 2 differs from the original', v2 !== original);
  r = await uploadText(v2, 'dream-v2.md');
  check('upload version 2', r.status === 200 && (good(r) || /version_unsure|Fassung/.test(r.text)), say(r));
  clean('upload page after version 2', r);
  check('version 2 is listed with its changes', /\/theater\/skript\/fassung\/2/.test(r.text));
  r = await call('GET', '/theater/plan');
  const idsAfter = [...new Set([...r.text.matchAll(/>(P\d+)<\/b>/g)].map(m => m[1]))].join(',');
  check('the plan survived the upload', idsAfter === idsBefore, idsAfter.slice(0, 40));
  r = await call('GET', '/theater/skript/fassung/2');
  check('version 2 compared with version 1', r.status === 200 && /class="diff"/.test(r.text)
        && /class="changed"/.test(r.text), 'status ' + r.status);
  clean('version page', r);
  r = await call('GET', '/theater/skript/fassung/9');
  check('an unknown version gives 404', r.status === 404, 'status ' + r.status);

  // version 3: cut the first speech of the target rehearsal's first passage
  const pg = await call('GET', '/theater/plan/' + target);
  const first = /<span class="speaker">([^<]+)<\/span>\s*<span class="words">([^<]+)<\/span>/.exec(pg.text);
  const who = first ? first[1].replace(/\s*[\u00b7\u2013].*$/, '').trim() : '';
  const lead = first ? first[2].split(/\s+/).slice(0, 5).join(' ') : '';
  const at = who && lead ? original.indexOf('\n' + who + '.\n' + lead) : -1;
  check('found the first speech of ' + target + ' in the file', at >= 0, who + ': ' + lead);
  if (at >= 0) {
    const end = original.indexOf('\n\n', at + 1);
    const v3 = original.slice(0, at) + original.slice(end);
    r = await uploadText(v3, 'dream-v3.md');
    check('upload version 3 warns that the plan may not fit', errorNotice(r) &&
          new RegExp('\\b' + target + '\\b').test(notice(r.text).text), say(r));
    r = await call('GET', '/theater/plan');
    check('the rehearsal is marked unsure', /class="unsure"/.test(r.text) &&
          new RegExp('>' + target + '<').test(r.text));
    clean('plan page with an unsure rehearsal', r);
    // back to version 2: the anchors are found again
    r = await post('/theater/skript', { action: 'zurueck', fassung: '2' });
    check('version 2 made current again', good(r), say(r));
    r = await call('GET', '/theater/plan');
    check('nothing unsure any more', !/class="unsure"/.test(r.text));
    r = await post('/theater/skript', { action: 'zurueck', fassung: '77' });
    check('restoring an unknown version is refused', errorNotice(r), say(r));
  }
}

/* ---- 7. the company page ---- */
const target = planIds.find(id => groupOf(planHtml, id).length >= 2) || planIds[0];
const cast = target ? groupOf(planHtml, target) : [];
{
  // The first person of the target rehearsal becomes the director: from
  // then on the director's calendar counts for every date.
  r = await call('GET', '/theater/leute');
  const idx = r.text.indexOf('<span class="chip">' + esc(cast[0]) + '</span>');
  const id = idx < 0 ? null : (/name="id" value="([^"]+)"/.exec(r.text.slice(idx)) || [])[1];
  check('found ' + cast[0] + ' on the company page', !!id);
  if (id) {
    r = await post('/theater/leute', { action: 'aendern', id, name: 'The Director', regie: '1' });
    check('mark ' + cast[0] + ' as the director', good(r) && /name="regie" value="1" checked/.test(r.text), say(r));
  }
  r = await post('/theater/projekt', { action: 'zeitraum', von: '', bis: '' });
  check('save an empty rehearsal period', good(r), say(r));
}
r = await post('/theater/leute', { action: 'neu', b: 'TESTPERSON', name: 'Test Person' });
check('add a person to the company', good(r), say(r));
r = await post('/theater/leute', { action: 'neu', b: 'TESTPERSON', name: 'Twice' });
check('the same short name twice is refused', errorNotice(r), say(r));
r = await post('/theater/leute', { action: 'neu', b: '<b>X</b>', name: 'Injection' });
check('a short name is escaped in the notice', good(r) && !/<b>X<\/b>/.test(r.text) &&
      /&lt;B&gt;X&lt;\/B&gt;/.test(r.text), say(r));
r = await call('GET', '/theater/leute');
clean('company page', r);
for (const short of ['TESTPERSON', '<B>X</B>']) {
  const idx = r.text.indexOf('<span class="chip">' + esc(short) + '</span>');
  const id = idx < 0 ? null : (/name="id" value="([^"]+)"/.exec(r.text.slice(idx)) || [])[1];
  if (id) {
    if (short === 'TESTPERSON') {
      const c = await post('/theater/leute', { action: 'aendern', id, name: 'Renamed Person' });
      check('rename a person', good(c), say(c));
    }
    const d = await post('/theater/leute', { action: 'loeschen', id });
    check('remove ' + short, good(d), say(d));
  } else check('find ' + short, false);
}
r = await post('/theater/leute', { action: 'neuerlink' });
check('new company link', good(r), say(r));

/* ---- 8. the print documents ---- */
r = await call('GET', '/theater/drucken');
clean('print page', r);
const printBase = (/\/theater\/druck\/[a-z0-9]{10,}/.exec(r.text) || [])[0];
check('print page shows its link', !!printBase);
const bookPeople = [...r.text.matchAll(/\/rolle\/([A-Za-z%0-9.]+)"/g)].map(m => m[1]);
if (printBase) {
  for (const doc of ['/gesamt', '/probenplan']) {
    const d = await call('GET', printBase + doc);
    check('document ' + doc, d.status === 200 && d.text.length > 1000, d.text.length + ' B');
  }
  const d0 = await call('GET', printBase);
  check('document index', d0.status === 200 && /\/gesamt/.test(d0.text));
  clean('document index', d0);
  if (bookPeople[0]) {
    const d = await call('GET', printBase + '/rolle/' + bookPeople[0]);
    check('part book', d.status === 200 && /class="backbar"/.test(d.text), d.text.length + ' B');
    const d3 = await call('GET', printBase + '/rolle/' + bookPeople[0] + '?kontext=3');
    check('part book with more context is longer', d3.status === 200 && d3.text.length > d.text.length,
          d.text.length + ' -> ' + d3.text.length + ' B');
  }
  const file = await call('GET', '/theater/datei/gesamt');
  check('full script as a file', file.status === 200 &&
        /attachment/.test(file.res.headers.get('content-disposition') || ''));
}

/* ---- 9. the member area: a whole cast enters availability ----

   Everyone in one rehearsal says yes to the same evenings. Then the
   dates page has to propose one of them - that is the calendar being
   counted, not merely stored. */
const director = cookies;
check('a rehearsal with a cast to enter times for', cast.length > 0, target + ': ' + cast.join(', '));
{
  // From the director's pages straight into somebody's calendar.
  r = await post('/theater/als', { person: 'nobody' });
  check('calendar for an unknown person is refused', errorNotice(r), say(r));
  const page_ = await call('GET', '/theater/leute');
  const idx = page_.text.indexOf('<span class="chip">' + esc(cast[1] || cast[0]) + '</span>');
  const id = (/name="id" value="([^"]+)"/.exec(page_.text.slice(idx)) || [])[1];
  r = await post('/theater/als', { person: id });
  check('calendar for a person from the director pages', r.status === 303 &&
        /\/theater\/mit\/zeiten/.test(r.res.headers.get('location') || ''), 'status ' + r.status);
  r = await call('GET', '/theater/mit/zeiten');
  check('that calendar opens', r.status === 200 && /class="overlay"/.test(r.text));
  cookies = director;
}
let days = [];
for (const b of cast) {
  cookies = '';
  const m = await call('GET', printBase + '/mit/' + encodeURIComponent(b) + '?goto=zeiten');
  check('from the part book into the member area (' + b + ')', m.status === 303, 'status ' + m.status);
  const cal = await call('GET', '/theater/mit/zeiten');
  check('calendar for ' + b, cal.status === 200 && /class="day /.test(cal.text));
  if (b === cast[0]) {
    clean('calendar', cal);
    days = [...cal.text.matchAll(/name="t_(\d{4}-\d{2}-\d{2})"/g)].map(x => x[1]).slice(0, 12);
  }
  const fields = {};
  for (const iso of days) { fields['t_' + iso] = '1'; fields['v_' + iso] = '18:00'; fields['b_' + iso] = '23:00'; }
  const e = await post('/theater/mit/zeiten', fields);
  check('enter availability (' + b + ')', good(e), say(e));
  const me = await call('GET', '/theater/mit');
  check('member page counts the evenings (' + b + ')', me.status === 200 &&
        new RegExp('\\b' + days.length + ' ').test(me.text));
  clean('member page', me);
  if (b === cast[0]) {
    check('the director sees the project link', /href="\/theater\/projekt"/.test(me.text));
    const pj = await call('GET', '/theater/projekt');
    check('the director opens the project through the company link', pj.status === 200);
    const all = await call('GET', '/theater/mit/termine?alle=1');
    check('all rehearsals for a member', all.status === 200 &&
          planIds.every(id => all.text.includes('>' + id + '<')), 'status ' + all.status);
    clean('all rehearsals page', all);
    const pg = await call('GET', '/theater/mit/plan/' + target);
    check('passages of a rehearsal for a member', pg.status === 200 && /class="line/.test(pg.text)
          && /\/theater\/mit\/termine/.test(pg.text));
    clean('member passages page', pg);
    const docs = await call('GET', (/\/theater\/druck\/[a-z0-9]{10,}/.exec(me.text) || [])[0] || '/x');
    check('a member reaches the scripts page', docs.status === 200 && /\/gesamt/.test(docs.text));
  }
}

/* ---- 10. dates: proposed, fixed from the company, place, released ---- */
{
  // Still signed in as the last cast member.
  let d = await call('GET', '/theater/mit/termine');
  check('my dates page', d.status === 200, 'status ' + d.status);
  clean('my dates page', d);
  const mine = new RegExp('name="rehearsal" value="' + target + '"[\\s\\S]*?name="iso" value="([^"]+)"' +
    '[\\s\\S]*?name="from" value="([^"]*)"[\\s\\S]*?name="to" value="([^"]*)"').exec(d.text);
  check('a date is proposed for ' + target, !!mine, mine ? mine[1] + ' ' + mine[2] + '-' + mine[3] : 'none');
  if (mine) {
    d = await post('/theater/mit/termine', { action: 'halten', rehearsal: target, iso: mine[1], from: mine[2], to: mine[3], place: 'Attic <room>' });
    check('confirm the date from the company, with a place', good(d) && /Attic &lt;room&gt;/.test(d.text), say(d));
    d = await post('/theater/mit/termine', { action: 'place', rehearsal: target, place: 'Stage <left>' });
    check('enter the place from the company', good(d) && /Stage &lt;left&gt;/.test(d.text), say(d));
    d = await post('/theater/mit/termine', { action: 'halten', rehearsal: 'P99', iso: mine[1], from: mine[2], to: mine[3] });
    check('a foreign rehearsal is refused', errorNotice(d), say(d));
  }

  cookies = director;
  d = await call('GET', '/theater/termine');
  check('dates page', d.status === 200, 'status ' + d.status);
  clean('dates page', d);
  check('the fixed date shows as fixed', /class="isfixed"/.test(d.text) && /Stage &lt;left&gt;/.test(d.text));
  check('the director is shown at the rehearsals', /class="chip muted"/.test(d.text));
  d = await post('/theater/termine', { action: 'loesen', rehearsal: target });
  check('release the date', good(d), say(d));
  const m = /name="action" value="halten">([\s\S]*?)<\/form>/.exec(d.text);
  if (m) {
    const val = n => (new RegExp('name="' + n + '" value="([^"]*)"').exec(m[1]) || [])[1];
    d = await post('/theater/termine', { action: 'halten', rehearsal: val('rehearsal'),
      iso: val('iso'), from: val('from'), to: val('to'), place: 'Stage' });
    check('fix a date as the director, with a place', good(d) && /value="Stage"/.test(d.text), say(d));
    d = await post('/theater/termine', { action: 'place', rehearsal: val('rehearsal'), place: 'Rehearsal room' });
    check('enter the place as the director', good(d) && /Rehearsal room/.test(d.text), say(d));
    d = await post('/theater/termine', { action: 'loesen', rehearsal: val('rehearsal') });
    check('release it again', good(d), say(d));
  } else check('a date to fix as the director', false);
  d = await post('/theater/termine', { action: 'halten', rehearsal: 'P99', iso: '2030-01-01', from: '19:00', to: '21:00' });
  check('fixing an unknown rehearsal is refused', errorNotice(d), say(d));
}

/* ---- 11. languages and the About page ---- */
r = await post('/theater/sprache', { language: 'de', back: '/theater/plan' });
check('switch language', r.status === 303);
r = await call('GET', '/theater/plan');
check('page in German after switching', /Probenplan/.test(r.text));
clean('plan page in German', r);
r = await call('GET', '/theater/termine');
clean('dates page in German', r);
r = await call('GET', '/theater/ueber');
check('About page in German', r.status === 200 && /Version/.test(r.text) && /\d+\.\d+/.test(r.text));
clean('About page', r);
await post('/theater/sprache', { language: 'en', back: '/theater/plan' });

/* ---- 12. the audiobook page without a key ---- */
r = await call('GET', '/theater/hoerbuch');
check('audiobook page', r.status === 200, 'status ' + r.status);
clean('audiobook page', r);
r = await post('/theater/hoerbuch', { action: 'schluessel', schluessel: '' });
check('audiobook refuses an empty key', errorNotice(r), say(r));
r = await post('/theater/hoerbuch', { action: 'schluessel', schluessel: 'sk_not_a_real_key' });
check('audiobook refuses a wrong key', errorNotice(r), say(r));

/* ---- 13. signing out ---- */
r = await call('GET', '/theater/abmelden');
check('sign out', r.status === 303);
r = await call('GET', '/theater/projekt');
check('nothing without the cookie', r.status === 401, 'status ' + r.status);

/* ---- 14. administration ----

   Only when the instance has a key and the test knows it: pass it in
   THEATER_ADMIN. A project is made, its code used to sign in, the code
   renewed, the project deleted - and the trail checked at every step. */
const ADMIN = process.env.THEATER_ADMIN || '';
if (!ADMIN) {
  console.log('  --    administration skipped (set THEATER_ADMIN to test it)');
} else {
  cookies = '';
  r = await call('GET', '/theater/admin');
  check('admin asks for the key', r.status === 200 && /name="key"/.test(r.text), 'status ' + r.status);
  clean('admin login page', r);
  r = await post('/theater/admin', { key: 'not-the-key' });
  check('admin refuses a wrong key', r.status === 401 && errorNotice(r), say(r));
  r = await post('/theater/admin', { key: ADMIN });
  check('admin accepts the key', r.status === 303, 'status ' + r.status);
  r = await call('GET', '/theater/admin');
  check('admin lists the projects', r.status === 200 && /name="action" value="neu"/.test(r.text));
  clean('admin page', r);
  r = await post('/theater/admin', { action: 'neu', titel: 'Workflow <test>', email: 'nonsense' });
  check('admin insists on an email address', errorNotice(r), say(r));
  r = await post('/theater/admin', { action: 'neu', titel: 'Workflow <test>', email: 'regie@example.org' });
  check('admin creates a project', good(r) && /Workflow &lt;test&gt;/.test(r.text), say(r));
  clean('admin page after creating', r);
  const code1 = (/id="freshcode">([^<]+)</.exec(r.text) || [])[1];
  const rowStart = r.text.indexOf('<b>Workflow &lt;test&gt;</b>');
  const id = (/<code>([a-z0-9]{8})<\/code>/.exec(r.text.slice(rowStart)) || [])[1];
  check('the code is shown once', !!code1 && /^[a-z0-9]{6}$/.test(code1 || ''), code1);
  check('the new project is in the list', !!id, id);
  check('the email is offered as a mail link', /href="mailto:regie%40example.org\?subject=/.test(r.text));
  const admin = cookies;

  cookies = '';
  r = await post('/theater/zugang', { code: code1 || 'x' });
  check('the new code signs a director in', r.status === 303, 'status ' + r.status);
  r = await call('GET', '/theater/projekt');
  check('the new project opens', r.status === 200 && /Workflow &lt;test&gt;/.test(r.text));

  cookies = admin;
  r = await post('/theater/admin', { action: 'code', id });
  check('admin renews the code', good(r), say(r));
  const code2 = (/id="freshcode">([^<]+)</.exec(r.text) || [])[1];
  check('a different code came out', !!code2 && code2 !== code1, code2);
  cookies = '';
  r = await post('/theater/zugang', { code: code1 || 'x' });
  check('the old code no longer works', r.status === 401, 'status ' + r.status);
  r = await post('/theater/zugang', { code: code2 || 'x' });
  check('the new code works', r.status === 303, 'status ' + r.status);

  cookies = admin;
  r = await post('/theater/admin', { action: 'loeschen', id, bestaetigung: 'wrong' });
  check('deleting needs the title', errorNotice(r), say(r));
  r = await post('/theater/admin', { action: 'loeschen', id, bestaetigung: 'Workflow <test>' });
  check('admin deletes the project', good(r) && !new RegExp('value="' + id + '"').test(r.text), say(r));
  cookies = '';
  r = await post('/theater/zugang', { code: code2 || 'x' });
  check('the deleted project cannot be opened', r.status === 401, 'status ' + r.status);
  cookies = admin;
  r = await call('GET', '/theater/admin/abmelden');
  check('admin signs out', r.status === 303);
  r = await call('GET', '/theater/admin');
  check('admin asks for the key again', /name="key"/.test(r.text));
}

console.log(failures ? `\n${failures} FAILED` : '\nall steps passed');
process.exit(failures ? 1 : 0);
