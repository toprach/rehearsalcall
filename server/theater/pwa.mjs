/* ---------------------------------------------------------------------
   What makes the pages an installable app: the manifest, the icons and
   the service worker's address.

   The icons are drawn here - a bold P on the red of the pages, rounded -
   and encoded as PNG with nothing but zlib, so the repository carries
   no binary and no build step. They are made once and kept.
   --------------------------------------------------------------------- */

import zlib from 'node:zlib';

const RED = [0xb3, 0x27, 0x2d];
/* A 5x7 bitmap font, capitals only: the icon shows the play's initial. */
const FONT = {
  A: '01110 10001 10001 11111 10001 10001 10001',
  B: '11110 10001 10001 11110 10001 10001 11110',
  C: '01110 10001 10000 10000 10000 10001 01110',
  D: '11110 10001 10001 10001 10001 10001 11110',
  E: '11111 10000 10000 11110 10000 10000 11111',
  F: '11111 10000 10000 11110 10000 10000 10000',
  G: '01110 10001 10000 10111 10001 10001 01111',
  H: '10001 10001 10001 11111 10001 10001 10001',
  I: '01110 00100 00100 00100 00100 00100 01110',
  J: '00111 00010 00010 00010 00010 10010 01100',
  K: '10001 10010 10100 11000 10100 10010 10001',
  L: '10000 10000 10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10101 10001 10001 10001',
  N: '10001 10001 11001 10101 10011 10001 10001',
  O: '01110 10001 10001 10001 10001 10001 01110',
  P: '11110 10001 10001 11110 10000 10000 10000',
  Q: '01110 10001 10001 10001 10101 10010 01101',
  R: '11110 10001 10001 11110 10100 10010 10001',
  S: '01111 10000 10000 01110 00001 00001 11110',
  T: '11111 00100 00100 00100 00100 00100 00100',
  U: '10001 10001 10001 10001 10001 10001 01110',
  V: '10001 10001 10001 10001 10001 01010 00100',
  W: '10001 10001 10001 10101 10101 10101 01010',
  X: '10001 10001 01010 00100 01010 10001 10001',
  Y: '10001 10001 01010 00100 00100 00100 00100',
  Z: '11111 00001 00010 00100 01000 10000 11111',
};
const glyphOf = (letter) => (FONT[letter] || FONT.P).split(' ');

/* The letter for a title: the first of its first telling word, articles
   skipped, accents dropped - "Der nackerte Waunsinn" gives N. */
export function initialOf(title) {
  const words = String(title || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase().split(/[^A-Z]+/).filter(Boolean);
  const ARTICLES = new Set(['DER', 'DIE', 'DAS', 'EIN', 'EINE', 'THE', 'A', 'AN', 'LE', 'LA', 'LES', 'IL', 'LO', 'EL']);
  const w = words.find(x => !ARTICLES.has(x)) || words[0] || 'P';
  return w.charAt(0);
}

/* CRC-32 as PNG wants it. */
const TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

/* The icon: a rounded red square, the P in white. "maskable" wants
   the drawing inside the middle 80 %, so the letter stays small. */
export function iconPng(size, letter = 'P') {
  const GLYPH = glyphOf(letter);
  const px = Buffer.alloc(size * size * 4);
  const r = Math.round(size * 0.2);                 // corner radius
  const inside = (x, y) => {
    const cx = x < r ? r : x >= size - r ? size - r - 1 : x;
    const cy = y < r ? r : y >= size - r ? size - r - 1 : y;
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
  };
  const cell = size * 0.5 / 7;                       // the glyph is half the height
  const gx = (size - 5 * cell) / 2, gy = (size - 7 * cell) / 2;
  const glyphAt = (x, y) => {
    const i = Math.floor((x - gx) / cell), j = Math.floor((y - gy) / cell);
    return i >= 0 && i < 5 && j >= 0 && j < 7 && GLYPH[j][i] === '1';
  };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const o = (y * size + x) * 4;
    if (!inside(x, y)) { px[o + 3] = 0; continue; }
    const white = glyphAt(x, y);
    px[o] = white ? 255 : RED[0]; px[o + 1] = white ? 255 : RED[1]; px[o + 2] = white ? 255 : RED[2]; px[o + 3] = 255;
  }
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;                     // filter: none
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;   // 8 bit RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ]);
}

const icons = new Map();
export const icon = (size, letter = 'P') => {
  const k = letter + size;
  if (!icons.has(k)) icons.set(k, iconPng(size, letter));
  return icons.get(k);
};

/* One manifest for the entry, one per play and person: a different id
   and start address make a separate app on the phone, so two plays can
   sit side by side. The start address is the personal link, which
   signs the person in even when the app has lost its cookies. */
export function manifest(name, shortName, lang, app = null) {
  const base = app ? '/theater/app/' + app.token + '/' : '/theater/';
  return {
    id: base,
    name, short_name: shortName, lang,
    start_url: app ? '/theater/ich/' + app.token + '/mit' : '/theater/mit',
    scope: '/theater/',
    display: 'standalone',
    background_color: '#f6f4f1',
    theme_color: '#b3272d',
    icons: [
      { src: base + 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: base + 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: base + 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

/* A short name for the home screen: the title cut at a word, 12 chars. */
export function shortNameOf(title, fallback) {
  const t = String(title || '').trim();
  if (!t) return fallback;
  if (t.length <= 12) return t;
  const cut = t.slice(0, 12);
  const at = cut.lastIndexOf(' ');
  return (at > 4 ? cut.slice(0, at) : cut).trim();
}
