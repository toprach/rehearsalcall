/* ---------------------------------------------------------------------
   Project Gutenberg play (HTML edition)  ->  script in the tool's format

     node gutenberg-to-md.mjs pg1514-images.html a-midsummer-nights-dream.md

   The HTML editions of the Shakespeare plays on gutenberg.org mark
   things up consistently:

     <h2><b>ACT I</b></h2>                 act
     <h3><b>SCENE I. A place.</b></h3>     scene
     <p class="scenedesc">Enter <span class="charname">Ross</span>.</p>
     <p class="right">[<i>Exeunt.</i>]</p>
     <p class="drama">NAME.<br>line<br>line</p>

   That is turned into

     # ACT I
     ## SCENE I. A place.
     *Enter ROSS.*
     *[Exeunt.]*
     NAME.
     line
     line

   The speaker keeps the Gutenberg form - the name alone on a line,
   ending in a full stop - on purpose: the tool recognises that style
   by itself (see DREHBUCH-FORMAT.md), and the example is meant to
   exercise exactly that. Names inside stage directions are set in
   capitals, because that is how the tool tells an entrance from a
   word; the HTML marks them, so nothing has to be guessed.

   Everything before "ACT I" is the front matter: title, author, the
   dramatis personae. The Project Gutenberg header and licence are
   dropped; the text itself is in the public domain.
   --------------------------------------------------------------------- */

import fs from 'node:fs';

const [, , input, output] = process.argv;
if (!input || !output) {
  console.error('Usage: node gutenberg-to-md.mjs <pg-images.html> <out.md>');
  process.exit(2);
}

const html = fs.readFileSync(input, 'utf8');

/* Only the play: between the start marker and the end marker. */
const start = html.indexOf('*** START OF THE PROJECT GUTENBERG EBOOK');
const end = html.indexOf('*** END OF THE PROJECT GUTENBERG EBOOK');
const body = html.slice(start < 0 ? 0 : start, end < 0 ? html.length : end);

const entity = s => s
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n)));

/* A character name marked in the HTML: set in capitals so the tool
   recognises it in a stage direction. "Theseus, Hippolyta,
   Philostrate" is one span holding three names. */
const capitals = s => s.replace(/<span class="charname">([\s\S]*?)<\/span>/g,
  (m, inner) => inner.toUpperCase());

/* Inline markup inside a paragraph. Square brackets with italics are
   the inline directions: "[<i>Aside.</i>]" -> "*(Aside.)*". Other
   italics become emphasis. */
const inline = s => entity(capitals(s)
  .replace(/\[\s*<i>([\s\S]*?)<\/i>\s*\]/g, (m, x) => '*(' + x.trim() + ')*')
  .replace(/<i>([\s\S]*?)<\/i>/g, (m, x) => '*' + x.trim() + '*')
  .replace(/<[^>]+>/g, '')
  .replace(/[ \t]+/g, ' '));

const lines = [];
const put = (...x) => lines.push(...x);

/* The title: the first h1 in the text. */
const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(body);
const title = h1 ? inline(h1[1]).replace(/\s+/g, ' ').trim() : 'Untitled';
put('# ' + title, '');
const by = /<h2 class="no-break">([\s\S]*?)<\/h2>/.exec(body);
if (by) put(inline(by[1]).trim(), '');

/* Now the blocks in document order. The contents table at the top is
   skipped (it sits in a <table>); the dramatis personae are kept as a
   list so that a name there is not taken for a speaker. */
const block = /<(h2|h3|p)([^>]*)>([\s\S]*?)<\/\1>/g;
let inPlay = false, inPersonae = false;
let m;
while ((m = block.exec(body))) {
  const [, tag, attrs, raw] = m;
  const cls = (/class="([^"]*)"/.exec(attrs) || [])[1] || '';
  const text = inline(raw).replace(/\s*\n\s*/g, '\n').trim();
  if (!text) continue;

  if (tag === 'h2') {
    if (/^ACT\b/i.test(text)) { inPlay = true; inPersonae = false; put('# ' + text, ''); }
    else if (/dramatis/i.test(text)) { inPersonae = true; put(text, ''); }
    continue;
  }
  if (tag === 'h3') {
    if (!inPlay) continue;                 // "SCENE: Athens..." in the front matter
    put('## ' + text.replace(/\n/g, ' '), '');
    continue;
  }
  if (inPersonae && !inPlay) {
    for (const l of text.split('\n')) if (l.trim()) put('- ' + l.trim());
    put('');
    continue;
  }
  if (!inPlay) continue;

  if (cls === 'scenedesc' || cls === 'right') {
    // A direction: the whole line in italics. Brackets stay as they are.
    put('*' + text.replace(/\n/g, ' ').replace(/^\*|\*$/g, '').trim() + '*', '');
    continue;
  }
  // A speech, or a continuation after a direction (then without a name).
  put(text, '');
}

const text = lines.join('\n').replace(/\n{3,}/g, '\n\n') + '\n';
fs.writeFileSync(output, text);

const all = text.split('\n');
const speakers = all.filter(l => /^[A-Z][A-Z0-9 .'’,-]{0,40}\.$/.test(l));
console.log(`${output}: ${all.length} lines, ${speakers.length} speaker lines, ` +
            `${new Set(speakers).size} different names`);
