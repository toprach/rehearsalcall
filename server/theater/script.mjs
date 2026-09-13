/* ---------------------------------------------------------------------
   Reading the script.

   There is exactly ONE parser: the one in theater-md.html. Rather than
   rebuild it for the server - and so have two versions that drift apart
   - the file is loaded here and its script run in a context of its own.
   The stand-in below replaces everything the script expects from a
   browser.

   That file is not published with this repository. Whoever runs the
   software puts it in place; see the README.

   What comes out:
     readScript()       .docx or .md  ->  markdown and the speaker names
     buildStructure()   markdown + cast  ->  struktur.json

   The names inside that structure are the tool's format and stay German;
   see DREHBUCH-FORMAT.md.
   --------------------------------------------------------------------- */

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { Blob } from 'node:buffer';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/* Where the tool is.

   It is NOT part of the published repository - the operator supplies it.
   Looked for in THEATER_WERKZEUG first, then beside this directory. */
const TOOL = process.env.THEATER_WERKZEUG ||
  path.join(HERE, 'werkzeug', 'theater-md.html');

let cachedScript = null;
function toolScript() {
  if (cachedScript) return cachedScript;
  if (!fs.existsSync(TOOL)) {
    /* Say plainly what is missing. The tool is not part of the published
       repository - whoever runs the software puts it there. Without it
       no script can be read at all, so this is worth a sentence rather
       than a stack trace. */
    throw new Error(
      'The parsing tool is missing.\n' +
      '  expected at: ' + TOOL + '\n' +
      '  Put theater-md.html there, or point THEATER_WERKZEUG at it.\n' +
      '  Without it no script can be read.');
  }
  const html = fs.readFileSync(TOOL, 'utf8');
  const m = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('the tool at ' + TOOL + ' holds no script');
  cachedScript = m[1];
  return cachedScript;
}

/* The tool's interface is replaced here by a stand-in: every element
   answers to everything. One set of elements it does have to know - the
   output checkboxes. The tool reads them, and their default in the
   browser is not "off":

     optEmbedFont  embed the font          on  (else Helvetica is missing)
     optIchColor   own text in yellow      on
     optNumbers    entrance numbers        off
     optCut        leave cut passages out  off
                                                                        */
const CHECKED = { optEmbedFont: true, optIchColor: true };

function standIn(id) {
  return new Proxy(function () {}, {
    get(_, name) {
      if (name === Symbol.toPrimitive || name === 'toString') return () => '';
      if (name === 'value' || name === 'textContent' || name === 'innerHTML') return '';
      if (name === 'checked') return !!CHECKED[id];
      if (name === 'disabled') return false;
      if (name === 'id') return id || '';
      if (name === 'files') return [];
      if (name === 'children' || name === 'rows' || name === 'options') return [];
      if (name === 'then') return undefined;            // must not look like a promise
      return standIn(id);
    },
    set() { return true; },
    apply() { return standIn(id); },
    has() { return true; },
  });
}

/* A document that remembers what was asked of it. */
function documentStandIn() {
  return new Proxy({}, {
    get(_, name) {
      if (name === 'getElementById') return (id) => standIn(String(id));
      if (name === 'querySelector') return () => standIn('');
      if (name === 'querySelectorAll') return () => [];
      if (name === 'createElement') return () => standIn('');
      if (name === Symbol.toPrimitive || name === 'toString') return () => '';
      if (name === 'then') return undefined;
      return standIn('');
    },
    set() { return true; },
    has() { return true; },
  });
}

function newContext() {
  const g = {
    document: documentStandIn(),
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    alert: () => {}, confirm: () => true, prompt: () => null,
    location: { href: '' }, navigator: { userAgent: 'node' },
    FileReader: class {}, Blob, URL, Response, Request, Headers,
    ReadableStream, DecompressionStream, CompressionStream,
    TextDecoder, TextEncoder, Uint8Array, ArrayBuffer, DataView, Buffer,
    atob, btoa, console, setTimeout, clearTimeout, fetch,
  };
  g.window = g; g.globalThis = g; g.self = g;
  const c = vm.createContext(g);
  vm.runInContext(toolScript(), c, { filename: 'theater-md.html' });
  return c;
}

const inContext = (c, expression) => vm.runInContext(expression, c);

/* An error that carries a message key, so the page can say it in the
   visitor's language. */
function failure(key, values) {
  const e = new Error(key);
  e.key = key;
  if (values) e.values = values;
  return e;
}

/* ---------------------------------------------------------------------
   Step 1: read the file. Returns the markdown and the speaker names
   found, with how often each occurs - the mapping needs no more.
   --------------------------------------------------------------------- */
/* How the speaker stands in the text.

     colon   ROGER: text            the rule, see DREHBUCH-FORMAT.md
     dot     ROGER.                 the Gutenberg editions: the name alone
             text                   on its line, with a full stop

   The tool tells the two apart by counting. When the count is not
   conclusive it says so, and the director chooses - guessing would
   quietly produce a script with no speakers at all.                   */
export const SPEAKER_STYLES = ['colon', 'dot'];
const styleOf = s => SPEAKER_STYLES.includes(s) ? s : 'auto';

/* Set the style in the tool's context. Older copies of the tool know no
   such variable; then the colon style is all there is, as before. */
function applyStyle(c, style) {
  if (typeof c.detectSpeakerStyle !== 'function') return;
  inContext(c, 'speakerStyle = ' + JSON.stringify(styleOf(style)));
}

export function detectStyle(markdown) {
  const c = newContext();
  if (typeof c.detectSpeakerStyle !== 'function') return { style: 'colon', colon: 0, dot: 0 };
  return JSON.parse(inContext(c, 'JSON.stringify(detectSpeakerStyle(' +
                                 JSON.stringify(markdown) + '))'));
}

export async function readScript(buffer, filename, opt = {}) {
  const c = newContext();
  const isDocx = /\.docx$/i.test(filename || '');
  let markdown;

  if (isDocx) {
    const ab = buffer.buffer.slice(buffer.byteOffset,
                                 buffer.byteOffset + buffer.byteLength);
    inContext(c, 'srcKind = "docx"');
    markdown = await c.readDocx(ab);
  } else {
    inContext(c, 'srcKind = "md"');
    markdown = buffer.toString('utf8');
  }
  return analyse(c, markdown, opt);
}

/* The same for markdown that is already there - an older version being
   made current again. The source name says whether it came out of a
   Word file, which matters for how table cells are read. */
export function readMarkdown(markdown, source, opt = {}) {
  const c = newContext();
  inContext(c, 'srcKind = ' + JSON.stringify(/\.docx$/i.test(source || '') ? 'docx' : 'md'));
  return analyse(c, markdown, opt);
}

/* The speeches of a markdown text, casting-independent: speaker name
   as it stands in the text, cue number, text. For comparing versions. */
export function speechesOf(markdown, source, style) {
  const c = newContext();
  inContext(c, 'srcKind = ' + JSON.stringify(/\.docx$/i.test(source || '') ? 'docx' : 'md'));
  applyStyle(c, style);
  inContext(c, 'cast = []; tokenMap = {};');
  inContext(c, 'blocks = parseMarkdown(' + JSON.stringify(markdown) + ')');
  return JSON.parse(inContext(c, `JSON.stringify(blocks.flatMap(b =>
    b.kind === 'table'
      ? b.rows.flatMap(r => r.flatMap(cell => cell.flatMap(g => g)))
      : [b]).filter(b => b.kind === 'speech' || b.kind === 'cont')
    .map(b => ({ nr: b.cueNr ?? null, who: b.token || '', text: b.text || '', cut: !!b.struck })))`));
}

function analyse(c, markdown, opt) {
  if (!markdown || markdown.length < 200) throw failure('r.no_readable_text');

  /* Which way the speakers are written: as chosen, else as detected.
     Undecidable and nothing chosen - then the director has to say. */
  const detected = detectStyle(markdown);
  let style = styleOf(opt.style);
  if (style === 'auto') {
    if (detected.style === 'unknown')
      throw failure('r.style_unknown', { colon: detected.colon, dot: detected.dot });
    style = detected.style;
  }
  applyStyle(c, style);

  // Run it through without a cast: then every speaker is "unknown" and we
  // see the raw names exactly as they stand in the script.
  inContext(c, 'cast = []; tokenMap = {};');
  inContext(c, 'blocks = parseMarkdown(' + JSON.stringify(markdown) + ')');

  const raw = inContext(c, `JSON.stringify(
    Object.entries(blocks.filter(b => b.kind === 'speech')
      .reduce((a, b) => { a[b.token] = (a[b.token] || 0) + 1; return a; }, {}))
      .map(([token, n]) => ({ token, n }))
      .sort((a, b) => b.n - a.n))`);

  const titles = inContext(c, 'JSON.stringify(docTitles || [])');
  // The font embedded in the Word template belongs to the script: only
  // with it do the lines break in print as they do in the original.
  const fonts = JSON.parse(inContext(c, 'JSON.stringify(docxFonts || null)'));
  return {
    markdown,
    sprecher: JSON.parse(raw),
    titel: JSON.parse(titles),
    schriften: fonts,
    bloecke: inContext(c, 'blocks.length'),
    // Stored with the script (German, like every stored field), so that
    // every later parse reads it the same way.
    sprecherstil: style,
    erkannt: detected,
  };
}

/* ---------------------------------------------------------------------
   Step 2: build the structure with the assigned cast.

   cast    = [{ b, bFull, a, funktion, ich, aliases, roles:[{c,aliases}] }]
   mapping = { "SPELLING": "TARGET" }   for divergent spellings
   --------------------------------------------------------------------- */
export function buildStructure(markdown, cast, mapping, source, style) {
  const c = newContext();
  inContext(c, 'srcKind = ' +
    JSON.stringify(/\.docx$/i.test(source || '') ? 'docx' : 'md'));
  inContext(c, 'srcName = ' + JSON.stringify(source || 'script'));
  applyStyle(c, style);
  inContext(c, 'cast = ' + JSON.stringify(cast));
  inContext(c, 'tokenMap = ' + JSON.stringify(mapping || {}));
  inContext(c, 'blocks = parseMarkdown(' + JSON.stringify(markdown) + ')');
  const structure = c.buildStructure();
  if (!structure || !Array.isArray(structure.figuren))
    throw failure('r.structure_failed');
  structure.quelle = source || structure.quelle;

  const unresolved = inContext(c,
    `JSON.stringify([...new Set(blocks
      .filter(b => b.kind === 'speech' && b.res && b.res.kind === '?')
      .map(b => b.token))])`);
  return { structure, unresolved: JSON.parse(unresolved) };
}

/* A proposal for the cast: every speaker found is at first a person of
   their own. That fits most plays; where there is a play within the
   play, the director assigns the roles afterwards. */
export function castProposal(speakers) {
  return speakers
    .filter(s => s.token && /[A-Za-zÄÖÜ]/.test(s.token))
    .map(s => ({ b: s.token, bFull: s.token, a: '', funktion: '',
                 ich: false, aliases: [], roles: [], auftritte: s.n }));
}

/* Normalising as the tool does: dots, spaces and dashes do not count,
   nor does capitalisation. "MRS.C." and "Mrs C" are therefore the same
   key. */
export const normKey = s =>
  String(s || '').replace(/[.\s’'`-]/g, '').toUpperCase();

/* ---------------------------------------------------------------------
   Building the cast from the director's mapping.

   mapping = { "ROGER": { art:'rolle', ziel:'STEVE' },
               "STEVE": { art:'person', name:'Sam Porter' },
               "MRS.C": { art:'alias', ziel:'MRS.CLACKETT' },
               "ALLE" : { art:'gruppe' },
               "AKT"  : { art:'ignorieren' } }

   The kind names are stored with the project, so they stay as they are.
   --------------------------------------------------------------------- */
export function buildCast(mapping, speakers) {
  const z = mapping || {};
  const all = (speakers || []).map(s => s.token);
  const kindOf = t => (z[t]?.art) || 'person';

  // 1. people
  const cast = [];
  const byShort = new Map();
  for (const t of all) {
    if (kindOf(t) !== 'person') continue;
    const e = { b: t, bFull: z[t]?.voll || t, a: z[t]?.name || '',
                funktion: z[t]?.funktion || '', ich: !!z[t]?.ich,
                aliases: [], roles: [] };
    cast.push(e); byShort.set(t, e);
  }
  // 2. assign the roles to people
  for (const t of all) {
    if (kindOf(t) !== 'rolle') continue;
    const host = byShort.get(z[t]?.ziel);
    if (host) host.roles.push({ c: t, voiceC: '', aliases: [] });
  }
  // 3. spellings, groups and omissions
  const tokenMap = {};
  const isRole = new Set(all.filter(t => kindOf(t) === 'rolle'));
  for (const t of all) {
    const a = kindOf(t);
    if (a === 'gruppe')      { tokenMap[normKey(t)] = 'GROUP'; continue; }
    if (a === 'ignorieren')  { tokenMap[normKey(t)] = 'IGNORE'; continue; }
    if (a !== 'alias') continue;
    const target = z[t]?.ziel;
    if (!target) continue;
    tokenMap[normKey(t)] = byShort.has(target) ? 'B:' + target
                         : isRole.has(target) ? 'C:' + target : 'IGNORE';
  }
  return { cast, tokenMap };
}

/* ---------------------------------------------------------------------
   A proposal for the mapping.

   The director should not have to fill in 31 rows by hand. What can be
   recognised for certain is proposed; the rest they see at a glance,
   because it stands there as "a person".
   --------------------------------------------------------------------- */

/* Names that mean the whole troupe. German and English side by side -
   they cannot collide, so no language detection is needed. */
const CHORUS = new RegExp('^(' + [
  'alle', 'andere', 'die anderen', 'beide', 'alle (drei|vier|fünf)\\b.*',
  'die übrigen',
  'all', 'the others', 'others', 'both', 'all (three|four|five)\\b.*',
  'the rest', 'everyone',
].join('|') + ')$', 'i');

/* Two names joined - both speak the same line. The tool resolves that
   itself; German "und" and English "and". */
const JOINED = /\s+(?:und|and)\s+/i;

function distance(a, b) {                   // Levenshtein, kept short
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 3) return 9;
  const v = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = v[0]; v[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const t = v[j];
      v[j] = Math.min(v[j] + 1, v[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = t;
    }
  }
  return v[b.length];
}

export function mappingProposal(speakers) {
  const list = [...(speakers || [])].sort((a, b) => b.n - a.n);
  const z = {};
  const certain = [];                       // already recognised as a person

  for (const s of list) {
    const t = s.token;

    // "ALLE", "THE OTHERS" - the whole troupe speaks
    if (CHORUS.test(t.trim())) { z[t] = { art: 'gruppe' }; continue; }

    // "PHILIP und FLAVIA" - both speak; the tool resolves that itself
    if (JOINED.test(t)) { z[t] = { art: 'auto' }; continue; }

    // "EINBRECHER/HANNO" - a role with a swap; likewise by itself
    if (t.includes('/')) { z[t] = { art: 'auto' }; continue; }

    // Same spelling after normalising - the tool folds them together
    // anyway, nothing to do here
    const same = certain.find(x => normKey(x) === normKey(t));
    if (same) { z[t] = { art: 'auto', ziel: same }; continue; }

    // Similar spelling to a more frequent name -> a typing slip
    const nk = normKey(t);
    const near = certain.find(x => {
      const nx = normKey(x);
      return distance(nk, nx) <= 2 || (nk.length >= 3 && nx.startsWith(nk));
    });
    if (near) { z[t] = { art: 'alias', ziel: near }; continue; }

    z[t] = { art: 'person', name: '' };
    certain.push(t);
  }
  return z;
}

/* ---------------------------------------------------------------------
   Building finished documents.

   Nothing is rebuilt here either: the tool already typesets the full
   script, the part books and the marked rehearsal plan - it is only
   called. The fonts from the Word template come along, so the lines
   break exactly as they do in the original.

   kind: 'gesamt' | 'rolle' | 'probenplan'
   --------------------------------------------------------------------- */
export function buildDocument(script, cast, mapping, kind, opt = {}) {
  const c = newContext();
  inContext(c, 'srcKind = ' +
    JSON.stringify(/\.docx$/i.test(script.quelle || '') ? 'docx' : 'md'));
  inContext(c, 'srcName = ' + JSON.stringify(script.quelle || 'script'));
  applyStyle(c, script.sprecherstil);
  if (script.schriften)
    inContext(c, 'docxFonts = ' + JSON.stringify(script.schriften));
  inContext(c, 'cast = ' + JSON.stringify(cast));
  inContext(c, 'tokenMap = ' + JSON.stringify(mapping || {}));
  inContext(c, 'blocks = parseMarkdown(' + JSON.stringify(script.markdown) + ')');

  if (kind === 'rolle') {
    const b = String(opt.person || '');
    const exists = inContext(c, 'cast.some(p => p.b === ' + JSON.stringify(b) + ')');
    if (!exists) throw failure('r.person_not_in_cast');
    // The query parameter is called kontext (it is printed in part books
    // already handed out); the option here is English like the rest.
    const n = Math.min(3, Math.max(0, Number(opt.context ?? opt.kontext ?? 1)));
    return inContext(c, `bookletDoc(cast.find(p => p.b === ${JSON.stringify(b)}), ${n})`);
  }
  if (kind === 'probenplan') {
    if (!opt.plan?.proben?.length) throw failure('r.no_plan_yet');
    inContext(c, 'plan = ' + JSON.stringify(opt.plan));
    return inContext(c, 'planScriptDoc()');
  }
  return inContext(c, 'buildDocument(buildBody(), PAGE_FMT)');
}

/* Collect the fonts from the Word template - they belong to the script
   and are kept with it. */
export async function fontsFrom(buffer, filename) {
  if (!/\.docx$/i.test(filename || '')) return null;
  const c = newContext();
  const ab = buffer.buffer.slice(buffer.byteOffset,
                                buffer.byteOffset + buffer.byteLength);
  inContext(c, 'srcKind = "docx"');
  await c.readDocx(ab);
  return JSON.parse(inContext(c, 'JSON.stringify(docxFonts || null)'));
}
