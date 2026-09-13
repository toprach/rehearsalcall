/* The push encryption against the example of RFC 8291, appendix A,
   the round trip with fresh keys, and the VAPID token.

     node test/push.mjs
*/
import crypto from 'node:crypto';
import * as P from '../theater/push.mjs';
import { dueNow } from '../theater/reminders.mjs';

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log((ok ? '  ok    ' : '  FAIL  ') + name + (ok || !detail ? '' : '  - ' + detail));
  if (!ok) failed++;
};

// --- RFC 8291, appendix A ---
const vector = {
  plaintext: 'When I grow up, I want to be a watermelon',
  auth: 'BTBZMqHH6r4Tts7J_aSIgg',
  uaPrivate: 'q1dXpw3UpT5VOmu_cf_v6ih07Aems3njxI-JWgLcM94',
  uaPublic: 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4',
  asPrivate: 'yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw',
  salt: 'DGv6ra1nlYgDCS1FRnbzlw',
  out: 'DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN',
};
const body = P.encrypt(vector.plaintext, { p256dh: vector.uaPublic, auth: vector.auth },
                       { asPrivate: vector.asPrivate, salt: vector.salt });
check('RFC 8291 example encrypts to the byte', P.b64u(body) === vector.out, P.b64u(body));
check('and decrypts back', P.decrypt(P.fromB64u(vector.out), vector.uaPrivate, vector.auth).toString() === vector.plaintext);

// --- round trip with fresh keys, as a browser would make them ---
const ua = crypto.createECDH('prime256v1'); ua.generateKeys();
const sub = { p256dh: P.b64u(ua.getPublicKey()), auth: P.b64u(crypto.randomBytes(16)) };
const msg = JSON.stringify({ title: 'Zeit für deinen Text – Ärger & Öl', body: 'heute fällig: 5' });
const rt = P.decrypt(P.encrypt(msg, sub), P.b64u(ua.getPrivateKey()), sub.auth).toString();
check('a fresh round trip keeps the text, umlauts included', rt === msg, rt);
let threw = false;
try { P.encrypt('x', { p256dh: sub.p256dh, auth: 'short' }); } catch { threw = true; }
check('bad subscription keys are refused', threw);

// --- VAPID ---
const keys = P.generateKeys();
check('generated keys have the right shape', P.fromB64u(keys.publicKey).length === 65 && P.fromB64u(keys.privateKey).length === 32);
check('keysFromEnv reads them', JSON.stringify(P.keysFromEnv({ THEATER_PUSH_PUBLIC: keys.publicKey, THEATER_PUSH_PRIVATE: keys.privateKey })) === JSON.stringify(keys));
check('keysFromEnv refuses rubbish', P.keysFromEnv({ THEATER_PUSH_PUBLIC: 'abc', THEATER_PUSH_PRIVATE: keys.privateKey }) === null);
const token = P.vapidToken(keys, 'https://push.example.org/send/abc', 'mailto:regie@example.org', 1700000000000);
const [h, c, s] = token.split('.');
const claims = JSON.parse(P.fromB64u(c));
check('token claims: audience is the origin, subject and expiry set',
      claims.aud === 'https://push.example.org' && claims.sub === 'mailto:regie@example.org' && claims.exp === 1700000000 + 12 * 3600,
      JSON.stringify(claims));
const pub = P.fromB64u(keys.publicKey);
const pubKey = crypto.createPublicKey({ format: 'jwk', key: { kty: 'EC', crv: 'P-256', x: P.b64u(pub.subarray(1, 33)), y: P.b64u(pub.subarray(33)) } });
check('token signature verifies with the public key',
      crypto.verify('sha256', Buffer.from(h + '.' + c), { key: pubKey, dsaEncoding: 'ieee-p1363' }, P.fromB64u(s)));
check('subject: mailto from the contact', P.vapidSubject({ THEATER_KONTAKT: 'a@b.example' }) === 'mailto:a@b.example');
check('subject: the site without a contact', P.vapidSubject({ THEATER_BASIS: 'https://joku.tv/theater' }) === 'https://joku.tv');
check('subject: nothing on http', P.vapidSubject({ THEATER_BASIS: 'http://127.0.0.1:3203' }) === '');

// --- when is a reminder due ---
const at = (iso) => new Date(iso).getTime();
const e = { zeit: '19:00', zone: 'Europe/Vienna' };
check('due at 19:00 Vienna time (17:00 UTC in summer)', dueNow(e, at('2026-09-13T17:00:30Z')) === '2026-09-13');
check('not due a minute earlier', dueNow(e, at('2026-09-13T16:59:30Z')) === null);
check('not due twice the same day', dueNow({ ...e, zuletzt: '2026-09-13' }, at('2026-09-13T17:00:30Z')) === null);
check('due again the next day', dueNow({ ...e, zuletzt: '2026-09-13' }, at('2026-09-14T17:00:30Z')) === '2026-09-14');
check('a bad zone falls back to UTC', dueNow({ zeit: '17:00', zone: 'Mars/Olympus' }, at('2026-09-13T17:00:30Z')) === '2026-09-13');
check('no time, never due', dueNow({ zone: 'Europe/Vienna' }, at('2026-09-13T17:00:30Z')) === null);

console.log('');
console.log(failed ? failed + ' check(s) failed' : 'push: all checks passed');
process.exit(failed ? 1 : 0);
