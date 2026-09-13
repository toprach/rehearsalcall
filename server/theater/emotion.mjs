/* ---------------------------------------------------------------------
   Deriving emotion from the stage directions (for eleven_v3).

   v3 understands audio tags in square brackets. The tags themselves are
   English - that is what the model was trained on. The spoken text of
   course stays in whatever language the play is written in.

   Two jobs:
     1. playing directions  ->  a tag    "(shouts at them)" -> [shouting]
     2. incidental notes    ->  removed  "(to IVY)" would otherwise be read

   The cue words below are DATA, not code: they are the words a script
   actually uses. German and English cues sit in one table because they
   cannot collide - a German direction contains no English cue and the
   other way round, so no language detection is needed. To support a
   further language, add its words here.
   --------------------------------------------------------------------- */

/* Order matters: the first match wins. Only unambiguous directions get
   a tag - better no tag than a wrong one, or v3 overplays the moment. */
const RULES = [
  [/kreisch|schreit|brüll|scream|shriek/i,                    '[screaming]'],
  [/\bruft\b|zuruf|laut\b|von draußen|\boff\b|shout|calls out|from outside/i,
                                                                   '[shouting]'],
  [/flüster|gedämpft|leise|beiseite|whisper|aside|under his breath|softly/i,
                                                                   '[whispers]'],
  [/verzweifelt|hilflos|panisch|desperate|helpless|frantic/i,      '[desperate]'],
  [/ängstlich|angstvoll|erschrocken|entsetzt|besorgt|nervous|frightened|alarmed|anxious/i,
                                                                   '[nervously]'],
  [/wütend|ärgerlich|entrüstet|zornig|drohend|angry|furious|indignant|threatening/i,
                                                                   '[angrily]'],
  [/bestimmt|entschieden|streng|scharf|firmly|sternly|sharply|decisively/i,
                                                                   '[firmly]'],
  [/gerührt|schluchz|unter tränen|weint|sobbing|in tears|weeping|crying/i,
                                                                   '[crying]'],
  [/lacht|lachend|kichert|amüsiert|laughs|laughing|giggles|amused/i, '[laughs]'],
  [/seufz|resigniert|müde|erschöpft|sighs|wearily|exhausted|resigned/i, '[sighs]'],
  [/geistesabwesend|zerstreut|abwesend|absently|vaguely|distracted/i, '[absent-minded]'],
  [/spöttisch|sarkastisch|ironisch|sarcastic|mocking|ironically/i, '[sarcastic]'],
  [/eilig|hastig|schnell|stürzt|urgently|hurriedly|quickly|rushes/i, '[urgently]'],
  [/zärtlich|liebevoll|schmeichelnd|tenderly|fondly|warmly|coaxing/i, '[warmly]'],
  [/erstaunt|überrascht|verblüfft|surprised|astonished|amazed/i, '[surprised]'],
];

/* Brackets that hold no playing direction but an addressee, a prop or a
   movement. They do not belong in the spoken text.                     */
const INCIDENTAL = new RegExp('^(' + [
  // German
  'zu\\s', 'an\\s', 'ins?\\s', 'über\\s', 'von\\s', 'auf\\s', 'mit\\s',
  'nimmt', 'legt', 'deutet', 'öffnet', 'schließt', 'blickt', 'sieht',
  'schaut', 'geht', 'kommt', 'hält', 'gibt', 'greift', 'zieht', 'stellt',
  'setzt', 'steht', 'beginnt', 'küsst', 'umarmt', 'schlägt', 'wirft',
  'liest', 'ab\\s', 'weiter', 'ebenso', 'zusammen', 'zugleich', 'noch einmal',
  // English
  'to\\s', 'at\\s', 'into?\\s', 'over\\s', 'from\\s', 'on\\s', 'with\\s',
  'takes', 'puts', 'points', 'opens', 'closes', 'looks', 'sees', 'goes',
  'comes', 'holds', 'gives', 'grabs', 'pulls', 'places', 'sits', 'stands',
  'begins', 'kisses', 'embraces', 'hits', 'throws', 'reads', 'exit',
  'exits', 'again', 'likewise', 'together', 'at the same time',
].join('|') + ')', 'i');

export function tagFor(text) {
  for (const [re, tag] of RULES) if (re.test(text)) return tag;
  return null;
}

/* Returns { text, tag } for one speech.
   context = the stage direction immediately before it (optional).      */
export function prepare(raw, context) {
  let tag = null;
  const text = String(raw).replace(/\(([^)]{1,60})\)/g, (whole, inner) => {
    const found = tagFor(inner);
    if (found) { tag = tag || found; return ''; }   // playing direction -> tag
    if (INCIDENTAL.test(inner.trim())) return '';   // incidental -> drop
    return whole;                                   // a real aside stays
  }).replace(/\s{2,}/g, ' ').trim();

  // Nothing found in the speech? Then ask the direction before it.
  if (!tag && context) tag = tagFor(context);

  // Exclamations with no direction at all may be given a little push.
  if (!tag && /!\s*$/.test(text) && text.length < 60) tag = '[emphatically]';

  return { text, tag };
}

export function withTag(raw, context) {
  const { text, tag } = prepare(raw, context);
  return tag ? tag + ' ' + text : text;
}
