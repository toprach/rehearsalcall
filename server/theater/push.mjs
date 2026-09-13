/* ---------------------------------------------------------------------
   Web Push with nothing but node:crypto.

   A phone hands the server a SUBSCRIPTION: an endpoint at its browser's
   push service and two keys. The server encrypts a small message for
   that phone (RFC 8291: ECDH on P-256, HKDF, AES-128-GCM, content
   coding "aes128gcm" of RFC 8188) and posts it to the endpoint with a
   VAPID token (RFC 8292: a JWT signed ES256 with the server's key pair)
   so the push service knows who is sending. The service worker on the
   phone shows it as a notification.

   The key pair comes from .env: THEATER_PUSH_PUBLIC and
   THEATER_PUSH_PRIVATE, base64url, made once with
   "node theater-code.mjs push-keys". Without them there is no push and
   the pages do not offer it.
   --------------------------------------------------------------------- */

import crypto from 'node:crypto';

export const b64u = buf => Buffer.from(buf).toString('base64url');
export const fromB64u = s => Buffer.from(String(s || ''), 'base64url');

/* ---------- the server's key pair ---------- */

export function generateKeys() {
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.generateKeys();
  return { publicKey: b64u(ecdh.getPublicKey()), privateKey: b64u(ecdh.getPrivateKey()) };
}

/* The pair from the environment, or null. A public key is the
   uncompressed point, 65 bytes starting with 0x04. */
export function keysFromEnv(env = process.env) {
  const pub = String(env.THEATER_PUSH_PUBLIC || '').trim(), priv = String(env.THEATER_PUSH_PRIVATE || '').trim();
  if (!pub || !priv) return null;
  if (fromB64u(pub).length !== 65 || fromB64u(pub)[0] !== 4 || fromB64u(priv).length !== 32) return null;
  return { publicKey: pub, privateKey: priv };
}
export const enabled = () => !!keysFromEnv();

/* A KeyObject for signing, built from the raw private scalar and the
   public point - the JWK way round, so no ASN.1 is needed. */
function privateKeyObject(keys) {
  const pub = fromB64u(keys.publicKey);
  return crypto.createPrivateKey({ format: 'jwk', key: {
    kty: 'EC', crv: 'P-256', x: b64u(pub.subarray(1, 33)), y: b64u(pub.subarray(33, 65)), d: keys.privateKey } });
}

/* ---------- VAPID ---------- */

/* The token for one push service: audience is the endpoint's origin,
   subject whom to contact about the sender, twelve hours of validity. */
export function vapidToken(keys, endpoint, subject, now = Date.now()) {
  const aud = new URL(endpoint).origin;
  const header = b64u(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const claims = { aud, exp: Math.floor(now / 1000) + 12 * 3600 };
  if (subject) claims.sub = subject;
  const input = header + '.' + b64u(JSON.stringify(claims));
  const sig = crypto.sign('sha256', Buffer.from(input), { key: privateKeyObject(keys), dsaEncoding: 'ieee-p1363' });
  return input + '.' + b64u(sig);
}

/* The contact behind the token: mailto: the operator, else the site. */
export function vapidSubject(env = process.env) {
  const contact = String(env.THEATER_KONTAKT || '').trim();
  if (/^[^\s@]+@[^\s@]+$/.test(contact)) return 'mailto:' + contact;
  const base = String(env.THEATER_BASIS || '').trim();
  return /^https:\/\//.test(base) ? new URL(base).origin : '';
}

/* ---------- encryption, RFC 8291 ---------- */

const RS = 4096;
const info = s => Buffer.from(s, 'ascii');

/* Encrypt a message for a subscription {p256dh, auth}. The salt and
   the server's ephemeral key can be given for the test vector; they
   are drawn fresh otherwise. Returns the whole body with its header. */
export function encrypt(plaintext, subscription, opt = {}) {
  const uaPublic = fromB64u(subscription.p256dh);
  const authSecret = fromB64u(subscription.auth);
  if (uaPublic.length !== 65 || authSecret.length !== 16) throw new Error('bad subscription keys');
  const as = crypto.createECDH('prime256v1');
  if (opt.asPrivate) as.setPrivateKey(fromB64u(opt.asPrivate)); else as.generateKeys();
  const asPublic = as.getPublicKey();
  const salt = opt.salt ? fromB64u(opt.salt) : crypto.randomBytes(16);

  const ecdhSecret = as.computeSecret(uaPublic);
  const keyInfo = Buffer.concat([info('WebPush: info\0'), uaPublic, asPublic]);
  const ikm = Buffer.from(crypto.hkdfSync('sha256', ecdhSecret, authSecret, keyInfo, 32));
  const cek = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, info('Content-Encoding: aes128gcm\0'), 16));
  const nonce = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, info('Content-Encoding: nonce\0'), 12));

  const data = Buffer.concat([Buffer.from(plaintext), Buffer.from([2])]);   // 0x02: the last record
  if (data.length + 16 > RS) throw new Error('message too long');
  const cipher = crypto.createCipheriv('aes-128-gcm', cek, nonce);
  const body = Buffer.concat([cipher.update(data), cipher.final(), cipher.getAuthTag()]);

  const header = Buffer.alloc(16 + 4 + 1 + 65);
  salt.copy(header, 0); header.writeUInt32BE(RS, 16); header[20] = 65; asPublic.copy(header, 21);
  return Buffer.concat([header, body]);
}

/* The other direction, for the tests: what a browser does. */
export function decrypt(body, uaPrivate, authSecret) {
  const salt = body.subarray(0, 16), idlen = body[20], asPublic = body.subarray(21, 21 + idlen);
  const ua = crypto.createECDH('prime256v1'); ua.setPrivateKey(fromB64u(uaPrivate));
  const uaPublic = ua.getPublicKey();
  const ecdhSecret = ua.computeSecret(asPublic);
  const keyInfo = Buffer.concat([info('WebPush: info\0'), uaPublic, asPublic]);
  const ikm = Buffer.from(crypto.hkdfSync('sha256', ecdhSecret, fromB64u(authSecret), keyInfo, 32));
  const cek = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, info('Content-Encoding: aes128gcm\0'), 16));
  const nonce = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, info('Content-Encoding: nonce\0'), 12));
  const rec = body.subarray(21 + idlen);
  const d = crypto.createDecipheriv('aes-128-gcm', cek, nonce);
  d.setAuthTag(rec.subarray(rec.length - 16));
  const plain = Buffer.concat([d.update(rec.subarray(0, rec.length - 16)), d.final()]);
  let end = plain.length - 1;
  while (end >= 0 && plain[end] === 0) end--;
  if (plain[end] !== 2) throw new Error('bad padding');
  return plain.subarray(0, end);
}

/* ---------- sending ---------- */

/* Post one message to one subscription. Resolves to {ok, status,
   gone}: gone means the subscription is dead and should be dropped. */
export async function send(keys, subscription, payload, opt = {}) {
  const body = encrypt(JSON.stringify(payload), subscription);
  const headers = {
    'Content-Type': 'application/octet-stream',
    'Content-Encoding': 'aes128gcm',
    'Content-Length': String(body.length),
    'TTL': String(opt.ttl ?? 6 * 3600),
    'Urgency': opt.urgency || 'normal',
    'Authorization': 'vapid t=' + vapidToken(keys, subscription.endpoint, opt.subject ?? vapidSubject()) + ', k=' + keys.publicKey,
  };
  try {
    const r = await fetch(subscription.endpoint, { method: 'POST', headers, body,
      signal: AbortSignal.timeout(opt.timeoutMs || 10000) });
    return { ok: r.status >= 200 && r.status < 300, status: r.status, gone: r.status === 404 || r.status === 410 };
  } catch (e) {
    return { ok: false, status: 0, gone: false, error: e?.message || String(e) };
  }
}
