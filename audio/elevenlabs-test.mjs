/* ---------------------------------------------------------------------
   Speaking an excerpt with ElevenLabs.

   Usage:
     node elevenlabs-test.mjs <struktur.json> [count] [start]

   Switching the model:
     set ELEVENLABS_MODEL=eleven_multilingual_v2

   The key is looked for in
     1. the environment variable ELEVENLABS_API_KEY
     2. .env  (beside this script, a line  ELEVENLABS_API_KEY=sk_...)
     3. elevenlabs.key
   Never pass the .env on.

   The voice table below is the one used for "Der nackerte Waunsinn" -
   it is an example, not part of the program. Your own play has other
   people in it; the voice_id in the structure JSON takes precedence
   anyway.
   --------------------------------------------------------------------- */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepare } from '../server/theater/emotion.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const [, , jsonPath, countArg, startArg] = process.argv;
const LIMIT = Number(countArg || 15);
const START = Number(startArg || 0);
const NL = /\r?\n/;

function readEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, 'utf8').split(NL)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 1) continue;
    let v = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    out[t.slice(0, i).trim()] = v;
  }
  return out;
}
const ENV = readEnvFile(path.join(HERE, '.env'));

function findKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  if (ENV.ELEVENLABS_API_KEY) return ENV.ELEVENLABS_API_KEY;
  const f = path.join(HERE, 'elevenlabs.key');
  if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8').trim();
  return null;
}
const KEY = findKey();
if (!jsonPath) {
  console.error('Usage: node elevenlabs-test.mjs <struktur.json> [count] [start]');
  process.exit(1);
}
if (!KEY) {
  console.error('No key found. Looked for in:');
  console.error('  1. Umgebungsvariable ELEVENLABS_API_KEY');
  console.error('  2. ' + path.join(HERE, '.env'));
  console.error('  3. ' + path.join(HERE, 'elevenlabs.key'));
  process.exit(1);
}

// eleven_v3 is the most expressive and can take audio tags like [laughs].
const MODEL = process.env.ELEVENLABS_MODEL || ENV.ELEVENLABS_MODEL || 'eleven_v3';
const IS_V3 = MODEL.startsWith('eleven_v3');

/* ---------------------------------------------------------------------
   One voice per PERSON, not per role. In the play it is the same person
   who takes the stage role; what differs is the manner, not the throat.
   So the level only steers the settings:
     level B (company, backstage)        = plainer, calmer
     level C (role in the play within)   = more theatrical
   --------------------------------------------------------------------- */
const PERSONEN = {
  MICKEY: { id:'pFZP5JQG7iQjIQuC4Bku', voice:'Lily – velvety actress',      rollen:['MRS.CLACKETT'] },
  STEVE:  { id:'cjVigY5qzO86Huf0OWal', voice:'Eric – smooth, trustworthy',  rollen:['ROGER'] },
  IVY:    { id:'cgSgspJ2msm6clMCkdW9', voice:'Jessica – playful, bright',   rollen:['VICKI'] },
  BOBBY:  { id:'N2lVS1w4EtoT3dr4eOWO', voice:'Callum – husky trickster',    rollen:['PHILIP','SCHEICH'] },
  CHRIS:  { id:'Xb7hH8MSUJpSbSDYk0k2', voice:'Alice – clear, engaging',     rollen:['FLAVIA'] },
  HANNO:  { id:'pqHfZKP75CvOlQylNhV4', voice:'Bill – wise, mature, old',    rollen:['EINBRECHER'] },
  JOSH:   { id:'onwK4e9ZLuTAKqWW03F9', voice:'Daniel – steady broadcaster', rollen:[] },
  GREGG:  { id:'CwhRBWXzGAHq8TQ4Fs17', voice:'Roger – laid-back, casual',   rollen:[] },
  NESSIE: { id:'FGY2WhTYpPnrIDTdsKH5', voice:'Laura – enthusiast, quirky',  rollen:[] },
};
const ERZAEHLER = { id:'JBFqnCBsd6RMkjVDRZzb', voice:'George – warm storyteller' };
const FALLBACK  = { id:'SAz9YHcvj6GT2YYXdXww', voice:'River – neutral' };

// role (C) -> person (B)
const ROLLE2PERSON = {};
for (const [p, v] of Object.entries(PERSONEN)) v.rollen.forEach(r => ROLLE2PERSON[r] = p);

/* Settings. stability: low = lively, high = calm.
   style only works in v2; v3 steers expression through the text itself. */
const EINSTELLUNG = {
  erzaehler: { stability:0.75, similarity:0.75, style:0.05 },
  ensemble:  { stability:0.55, similarity:0.75, style:0.15 },   // Ebene B
  buehne:    { stability:0.32, similarity:0.75, style:0.45 },   // Ebene C
};

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
// a voice_id stored by the tool takes precedence
data.figuren.forEach(f => {
  if (!f.voice_id) return;
  if (PERSONEN[f.name]) PERSONEN[f.name].id = f.voice_id;
  if (f.id === 'ERZAEHLER') ERZAEHLER.id = f.voice_id;
});

function stimmeFuer(figur) {
  if (!figur || figur === 'Erzähler') return { v: ERZAEHLER, s: EINSTELLUNG.erzaehler, ebene:'Erzähler' };
  if (PERSONEN[figur])               return { v: PERSONEN[figur], s: EINSTELLUNG.ensemble, ebene:'B' };
  const p = ROLLE2PERSON[figur];
  if (p)                             return { v: PERSONEN[p], s: EINSTELLUNG.buehne, ebene:'C' };
  // a swapped role "EINBRECHER/GREGG" or a double speaker "PHILIP und FLAVIA"
  const erste = String(figur).split(/\s*(?:\/| und )\s*/)[0];
  if (PERSONEN[erste])               return { v: PERSONEN[erste], s: EINSTELLUNG.ensemble, ebene:'B' };
  if (ROLLE2PERSON[erste])           return { v: PERSONEN[ROLLE2PERSON[erste]], s: EINSTELLUNG.buehne, ebene:'C' };
  return { v: FALLBACK, s: EINSTELLUNG.ensemble, ebene:'?' };
}

async function speak(text, v, s) {
  const vs = IS_V3
    ? { stability: s.stability, similarity_boost: s.similarity }
    : { stability: s.stability, similarity_boost: s.similarity,
        style: s.style ?? 0, use_speaker_boost: true };
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v.id}`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model_id: MODEL, voice_settings: vs })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 180)}`);
  return Buffer.from(await res.arrayBuffer());
}

const items = data.leseabfolge.slice(START, START + LIMIT);
console.log(`Model: ${MODEL}`);
console.log(`Entries ${START}–${START + items.length - 1} of ${data.leseabfolge.length}
`);

const parts = [];
for (const [i, it] of items.entries()) {
  const figur = it.figur || 'Erzähler';
  const { v, s, ebene } = stimmeFuer(figur);
  const label = `${String(START + i).padStart(4)} ${ebene.padEnd(8)} ${figur.padEnd(13)}`;
  // Derive the emotion from the stage directions; only v3 takes the tags.
  const vor = data.leseabfolge[START + i - 1];
  const kontext = (it.typ !== 'regieanweisung' && vor && vor.typ === 'regieanweisung') ? vor.text : '';
  const { text, tag } = prepare(it.text, kontext);
  const nutz = (IS_V3 && tag) ? tag + ' ' + text : text;
  try {
    parts.push(await speak(nutz, v, s));
    console.log(`${label} ${v.voice.split(' –')[0].padEnd(8)} ${String(tag || '').padEnd(15)} ${text.slice(0, 44)}`);
  } catch (e) {
    console.error(`${label} FAILED – ${e.message}`);
    break;
  }
}

if (parts.length) {
  const out = jsonPath.replace(/\.json$/i, '') + `-${MODEL}-${START}.mp3`;
  fs.writeFileSync(out, Buffer.concat(parts));
  console.log(`\nDone: ${out}  (${(fs.statSync(out).size / 1024).toFixed(0)} KB, ${parts.length} Abschnitte)`);
}
