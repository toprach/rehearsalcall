/* ---------------------------------------------------------------------
   The audiobook: having the play spoken by ElevenLabs.

   What it is good for: whoever is learning their text would rather hear
   it than read it - and hears the others' cues along the way. That is
   why the passages of a single rehearsal can be made on their own.

   One voice per PERSON, not per role. In the play it is the same person
   who takes a stage role; what differs is the manner, not the throat. So
   the level only steers the settings.

   The key belongs to the director and is kept with the project. That is
   a deliberate decision and the page says so: without keeping it, it
   would have to be entered for every section, and generating runs for
   hours.
   --------------------------------------------------------------------- */

import * as S from './storage.mjs';
import { prepare } from './emotion.mjs';
import { passagesOf, allBlocks } from './passages.mjs';
import { castIndex } from './timeline.mjs';

const API = 'https://api.elevenlabs.io/v1';

/* eleven_v3 is the most expressive and understands audio tags like
   [laughs]. v2 is cheaper and faster.                                  */
export const MODELS = [
  ['eleven_v3', 'v3 – expressive, understands playing directions'],
  ['eleven_multilingual_v2', 'multilingual v2 – calmer, cheaper'],
  ['eleven_turbo_v2_5', 'turbo v2.5 – fastest'],
];

/* stability: low = lively, high = calm.
   style only has an effect up to v2; v3 steers expression through the
   text itself.                                                        */
const SETTINGS = {
  narrator: { stability: 0.75, similarity: 0.75, style: 0.05 },
  company:  { stability: 0.55, similarity: 0.75, style: 0.15 },  // level B
  onstage:  { stability: 0.32, similarity: 0.75, style: 0.45 },  // level C
};

export const NARRATOR = 'ERZAEHLER';

/* ---------------------------------------------------------------------
   Who appears? The level-B people and the narrator - the director has to
   choose a voice for each of them.
   --------------------------------------------------------------------- */
export function speakingPeople(structure) {
  const { people, rolesOf } = castIndex(structure);
  const out = people.map(name => ({ id: name, name, roles: rolesOf(name) }));
  out.push({ id: NARRATOR, name: 'Narrator', roles: [], isNarrator: true });
  return out;
}

/* The acts the play has, as numbers - so the page can offer each of
   them, however many there are. Level-1 chapters are the acts. */
export function actsOf(structure) {
  const acts = [];
  for (const s of structure?.sequenz || []) {
    const m = s.typ === 'kapitel' && /^(\d+)\.$/.exec(s.kapitel || '');
    if (m) acts.push(Number(m[1]));
  }
  return acts;
}

/* Which voice speaks this entry of the reading order, and how? */
function voiceFor(entry, voices, personFor) {
  const role = entry.figur;
  if (entry.typ === 'regieanweisung' || !role || role === 'Erzähler')
    return { id: voices[NARRATOR], settings: SETTINGS.narrator };

  // The reading order names the company member for every speech.
  const person = entry.ensemble || personFor(role);
  if (!person || !voices[person]) return null;

  // Does the person speak under their own name or as a stage role?
  const asRole = person !== role;
  return { id: voices[person], settings: asRole ? SETTINGS.onstage : SETTINGS.company };
}

/* ---------------------------------------------------------------------
   The reading order for the wanted scope.

   The whole play, one act, or the passages of one rehearsal. The last
   uses the same assembly as the view in the rehearsal plan.
   --------------------------------------------------------------------- */
export function readingOrderFor(project, scope) {
  const all = project.skript?.leseabfolge || [];
  if (scope.kind === 'all') return all;

  if (scope.kind === 'rehearsal') {
    const d = passagesOf(project.skript, project.plan, scope.rehearsal);
    if (!d) return [];
    const out = [];
    for (const sc of d.scenes) {
      for (const b of allBlocks(sc.parts)) {
        if (b.cut) continue;
        if (b.kind === 'direction') out.push({ typ: 'regieanweisung', text: b.text });
        else if (b.kind === 'speech')
          out.push({ typ: 'replik', text: b.text, figur: b.role || b.who,
                     ensemble: b.who || null });
      }
    }
    return out;
  }

  /* An act: the reading order knows nothing of acts. But it comes about
     in exactly the same order as the sequence - so one counts along how
     many entries each section produced, and then knows which stretch
     belongs to which act.

     Counting rule as in the tool: one entry per block, except for
     chapters - those are not spoken.                                  */
  const counts = b => b && (b.typ === 'replik' || b.typ === 'fortsetzung' ||
                            b.typ === 'regieanweisung' || b.typ === 'text');
  const out = [];
  let act = 0, i = 0;
  for (const s of project.skript?.sequenz || []) {
    if (s.typ === 'kapitel') {
      const m = /^(\d+)\.$/.exec(s.kapitel || '');
      if (m) act = Number(m[1]);
      continue;
    }
    const blocks = s.typ === 'tabelle'
      ? s.zeilen.flatMap(z => [...(z.hinter_der_buehne || []),
                               ...(z.auf_der_buehne || [])])
      : [s];
    for (const b of blocks) {
      if (!counts(b)) continue;
      if (act === scope.act && all[i]) out.push(all[i]);
      i++;
    }
  }
  return out;
}

/* ---------------------------------------------------------------------
   Looking up the voices in the director's account.
   --------------------------------------------------------------------- */
export async function fetchVoices(key) {
  const res = await fetch(API + '/voices', { headers: { 'xi-api-key': key } });
  if (!res.ok) {
    // Carry the message key on the error: it is thrown here, but the
    // message is set where the language is known.
    const e = new Error('ElevenLabs ' + res.status);
    e.key = res.status === 401 ? 'msg.hb_key_refused' : 'msg.hb_answered';
    e.values = { status: res.status };
    throw e;
  }
  const d = await res.json();
  return (d.voices || []).map(v => ({
    id: v.voice_id,
    name: v.name,
    description: [v.labels?.gender, v.labels?.age, v.labels?.accent,
                  v.labels?.description].filter(Boolean).join(', '),
  })).sort((a, b) => a.name.localeCompare(b.name));
}

async function speak(key, model, text, voice) {
  const v3 = model.startsWith('eleven_v3');
  const res = await fetch(`${API}/text-to-speech/${voice.id}`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text, model_id: model,
      voice_settings: v3
        ? { stability: voice.settings.stability,
            similarity_boost: voice.settings.similarity }
        : { stability: voice.settings.stability,
            similarity_boost: voice.settings.similarity,
            style: voice.settings.style ?? 0, use_speaker_boost: true },
    }),
  });
  if (!res.ok)
    throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`);
  return Buffer.from(await res.arrayBuffer());
}

/* ---------------------------------------------------------------------
   The job.

   Generating takes a long time - a whole act is hundreds of sections. So
   it runs in the background and the page asks for the state. At most one
   per project: two jobs at once would write the same file and spend the
   same credit.
   --------------------------------------------------------------------- */
const jobs = new Map();

export const jobStateOf = id => jobs.get(id) || null;

export const fileNameFor = scope => scope.kind === 'rehearsal'
  ? `audiobook-${String(scope.rehearsal).replace(/[^a-z0-9]/gi, '')}.mp3`
  : scope.kind === 'act' ? `audiobook-act${scope.act}.mp3` : 'audiobook-full.mp3';

/* The scope's name is a message key too - the page says it in the
   visitor's language. */
export function scopeName(scope) {
  if (scope.kind === 'rehearsal')
    return { key: 'msg.hb_rehearsal', values: { id: scope.rehearsal } };
  if (scope.kind === 'act') return { key: 'msg.hb_act', values: { n: scope.act } };
  return { key: 'msg.hb_all' };
}

export function startJob(project, scope) {
  if (jobs.get(project.id)?.running)
    return { kind: 'error', key: 'msg.hb_busy' };

  const key = project.hoerbuch?.schluessel;
  if (!key) return { kind: 'error', key: 'msg.hb_no_key' };

  const voices = project.hoerbuch?.stimmen || {};
  if (!voices[NARRATOR]) return { kind: 'error', key: 'msg.hb_no_narrator' };

  const entries = readingOrderFor(project, scope);
  if (!entries.length) return { kind: 'error', key: 'msg.hb_no_text' };

  const file = fileNameFor(scope);
  const job = {
    running: true, scope, file,
    what: scopeName(scope),
    total: entries.length, done: 0, skipped: 0,
    startedAt: Date.now(), error: null, bytes: 0,
  };
  jobs.set(project.id, job);

  // Deliberately not awaited: the job carries on while the page already
  // answers. Failures land in the job, not in nowhere.
  run(project, entries, job, key, voices)
    .catch(e => { job.error = e.message; })
    .finally(() => { job.running = false; job.endedAt = Date.now(); });

  return { kind: 'good', key: 'msg.hb_started',
           values: { what: job.what, n: entries.length } };
}

export function cancelJob(projectId) {
  const j = jobs.get(projectId);
  if (!j?.running) return { kind: 'error', key: 'msg.hb_idle' };
  j.cancel = true;
  return { kind: 'good', key: 'msg.hb_cancelling' };
}

async function run(project, entries, job, key, voices) {
  const { personFor } = castIndex(project.skript);
  const model = project.hoerbuch?.modell || 'eleven_v3';
  const v3 = model.startsWith('eleven_v3');

  // Start from the beginning - otherwise the new recording hangs onto
  // the old one.
  await S.putBlob(project.id, job.file, Buffer.alloc(0));

  for (let i = 0; i < entries.length; i++) {
    if (job.cancel) break;
    const e = entries[i];
    const voice = voiceFor(e, voices, personFor);
    if (!voice?.id) { job.skipped++; job.done++; continue; }

    // The playing direction before a speech colours its tone.
    const before = entries[i - 1];
    const context = (e.typ !== 'regieanweisung' && before?.typ === 'regieanweisung')
      ? before.text : '';
    const { text, tag } = prepare(e.text, context);
    if (!text) { job.skipped++; job.done++; continue; }

    const audio = await speak(key, model,
      (v3 && tag) ? tag + ' ' + text : text, voice);
    await S.appendBlob(project.id, job.file, audio);
    job.bytes += audio.length;
    job.done++;
    job.lastLine = (e.figur || 'Narrator') + ': ' + text.slice(0, 60);
  }
}
