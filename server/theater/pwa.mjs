/* ---------------------------------------------------------------------
   What makes the pages an installable app: the manifest, the icons and
   the service worker's address.

   The icons are drawn here - a bold P on the red of the pages, rounded -
   and encoded as PNG with nothing but zlib, so the repository carries
   no binary and no build step. They are made once and kept.
   --------------------------------------------------------------------- */

import zlib from 'node:zlib';

const RED = [0xb3, 0x27, 0x2d];
const GLYPH = [           // a 5x7 bitmap of the letter P
  '11110',
  '10001',
  '10001',
  '11110',
  '10000',
  '10000',
  '10000',
];

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
export function iconPng(size) {
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
export const icon = (size) => {
  if (!icons.has(size)) icons.set(size, iconPng(size));
  return icons.get(size);
};

export function manifest(name, shortName, lang) {
  return {
    id: '/theater/',
    name, short_name: shortName, lang,
    start_url: '/theater/mit',
    scope: '/theater/',
    display: 'standalone',
    background_color: '#f6f4f1',
    theme_color: '#b3272d',
    icons: [
      { src: '/theater/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/theater/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/theater/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
