/* ---------------------------------------------------------------------
   Comparing voice settings by ear.

   Speaks the same sentence several times with different settings and
   announces beforehand which variant is coming.

   Usage:  node elevenlabs-vergleich.mjs
   --------------------------------------------------------------------- */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const NL = /\r?\n/;

function findKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  const f = path.join(HERE, '.env');
  if (fs.existsSync(f)) {
    for (const line of fs.readFileSync(f, 'utf8').split(NL)) {
      const i = line.indexOf('=');
      if (i > 0 && line.slice(0, i).trim() === 'ELEVENLABS_API_KEY')
        return line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
  return null;
}
const KEY = findKey();
if (!KEY) { console.error('No key (ELEVENLABS_API_KEY or .env).'); process.exit(1); }

const MODEL = 'eleven_multilingual_v2';
const ANSAGER = 'JBFqnCBsd6RMkjVDRZzb';        // George, sachlich

async function speak(text, id, vs) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model_id: MODEL, voice_settings: vs })
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 160)}`);
  return Buffer.from(await r.arrayBuffer());
}

// A sentence with room to go up and down. Deliberately not from the
// play: its text is under copyright and does not belong in a public
// repository.
const SENTENCE = 'Nein, nein, nein! So war das doch gar nicht gemeint. ' +
             'Wir fangen noch einmal von vorne an – bitte!';
const VOICE = 'cgSgspJ2msm6clMCkdW9';         // Jessica

const VARIANTS = [
  { name: 'Matter-of-fact: stability 0.85 – style 0',
    vs: { stability:0.85, similarity_boost:0.75, style:0.0,  use_speaker_boost:true } },
  { name: 'Balanced: stability 0.5 – style 0.2',
    vs: { stability:0.50, similarity_boost:0.75, style:0.2,  use_speaker_boost:true } },
  { name: 'Lively: stability 0.3 – style 0.5',
    vs: { stability:0.30, similarity_boost:0.75, style:0.5,  use_speaker_boost:true } },
  { name: 'Overdone: stability 0.15 – style 0.8',
    vs: { stability:0.15, similarity_boost:0.75, style:0.8,  use_speaker_boost:true } },
  { name: 'Lively and faster: speed 1.15',
    vs: { stability:0.30, similarity_boost:0.75, style:0.5,  use_speaker_boost:true, speed:1.15 } },
  { name: 'Lively and slower: speed 0.85',
    vs: { stability:0.30, similarity_boost:0.75, style:0.5,  use_speaker_boost:true, speed:0.85 } },
];

const parts = [];
for (const v of VARIANTS) {
  console.log('  ' + v.name);
  parts.push(await speak(v.name, ANSAGER,
    { stability:0.9, similarity_boost:0.7, style:0, use_speaker_boost:true }));
  parts.push(await speak(SENTENCE, VOICE, v.vs));
}

const out = path.join(HERE, 'stimmen-vergleich.mp3');
fs.writeFileSync(out, Buffer.concat(parts));
console.log(`\nDone: ${out}  (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
