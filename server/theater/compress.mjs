/* gzip for every text answer.

   The pages are large - the part book with its data near a megabyte,
   the whole script more - and nothing on the way compressed them: Apache
   passes the proxied answer through as it is. Text shrinks to a tenth.

   The handlers write as they always did (writeHead, then end with the
   whole body). This holds the head back until the body is known, and
   compresses when the visitor accepts gzip, the body is text and worth
   it. A handler that streams with write() gets the plain answer.    */

import zlib from 'node:zlib';

const TEXT = /^(text\/|application\/(json|javascript|manifest\+json|xml)|image\/svg)/i;
const MIN = 1024;

const headerOf = (headers, name) => {
  if (!headers || Array.isArray(headers)) return undefined;
  const k = Object.keys(headers).find(x => x.toLowerCase() === name);
  return k === undefined ? undefined : headers[k];
};
const without = (headers, name) => Object.fromEntries(
  Object.entries(headers || {}).filter(([k]) => k.toLowerCase() !== name));

export function compressing(request, response) {
  if (request.method === 'HEAD') return;
  if (!/\bgzip\b/i.test(String(request.headers['accept-encoding'] || ''))) return;
  const { writeHead, write, end } = response;
  let held = null;                                  // [status, message, headers]

  const restore = () => { response.writeHead = writeHead; response.write = write; response.end = end; };
  const release = () => {
    restore();
    if (!held) return;
    const [status, message, headers] = held; held = null;
    if (message !== undefined) writeHead.call(response, status, message, headers);
    else if (headers) writeHead.call(response, status, headers);
    else writeHead.call(response, status);
  };

  response.writeHead = function (status, a, b) {
    held = typeof a === 'string' ? [status, a, b] : [status, undefined, a];
    return this;
  };
  response.write = function (...args) { release(); return write.apply(this, args); };
  response.end = function (chunk, enc, cb) {
    if (typeof chunk === 'function') { cb = chunk; chunk = undefined; enc = undefined; }
    if (typeof enc === 'function') { cb = enc; enc = undefined; }
    const headers = held ? held[2] : undefined;
    const type = String(headerOf(headers, 'content-type') || response.getHeader('content-type') || '');
    const encoded = headerOf(headers, 'content-encoding') || response.getHeader('content-encoding');
    const body = chunk == null ? null
      : Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk), enc || 'utf8');
    if (!body || body.length < MIN || encoded || !TEXT.test(type)) {
      release();
      return end.call(response, body ?? undefined, cb);
    }
    zlib.gzip(body, { level: 6 }, (err, packed) => {
      if (err) { release(); return end.call(response, body, cb); }
      if (held) held[2] = { ...without(without(held[2], 'content-length'), 'vary'),
                            'Content-Encoding': 'gzip', 'Vary': 'Accept-Encoding' };
      else {
        response.removeHeader('Content-Length');
        response.setHeader('Content-Encoding', 'gzip');
        response.setHeader('Vary', 'Accept-Encoding');
      }
      release();
      end.call(response, packed, cb);
    });
    return response;
  };
}
