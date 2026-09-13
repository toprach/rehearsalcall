/* ---------------------------------------------------------------------
   Reading form data.

   Two kinds:
     application/x-www-form-urlencoded  ordinary forms
     multipart/form-data                with a file

   The parser below is kept short but covers what browsers actually
   send. A ready-made package for this would be more dependency than
   benefit.
   --------------------------------------------------------------------- */

async function readAll(request, limit) {
  const chunks = [];
  let size = 0, tooMuch = false;
  // Keep reading past the limit, but stop keeping anything: a half-read
  // request body makes Apache reset the HTTP/2 stream, and the browser
  // then shows ERR_HTTP2_PROTOCOL_ERROR instead of a message anyone can
  // understand.
  for await (const c of request) {
    size += c.length;
    if (size > limit) { tooMuch = true; chunks.length = 0; continue; }
    if (!tooMuch) chunks.push(c);
  }
  if (tooMuch) {
    const e = new Error('file too large');
    e.key = 'r.too_large';
    e.values = { mb: Math.round(limit / 1048576) };
    throw e;
  }
  return Buffer.concat(chunks);
}

/* Returns { fields, files } - files are { name, filename, content } */
export async function readForm(request, limit = 30_000_000) {
  const type = String(request.headers['content-type'] || '');
  const raw = await readAll(request, limit);

  if (!type.startsWith('multipart/form-data')) {
    const fields = {};
    for (const [k, v] of new URLSearchParams(raw.toString('utf8'))) fields[k] = v;
    return { fields, files: [] };
  }

  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(type);
  if (!m) {
    const e = new Error('no boundary');
    e.key = 'r.no_boundary';
    throw e;
  }
  const boundary = Buffer.from('--' + (m[1] || m[2]).trim());

  const fields = {};
  const files = [];
  let pos = raw.indexOf(boundary);
  while (pos >= 0) {
    let start = pos + boundary.length;
    if (raw[start] === 0x2d && raw[start + 1] === 0x2d) break;     // closing mark
    if (raw[start] === 0x0d) start += 2; else if (raw[start] === 0x0a) start += 1;

    const headEnd = raw.indexOf('\r\n\r\n', start);
    if (headEnd < 0) break;
    const head = raw.toString('utf8', start, headEnd);
    const bodyFrom = headEnd + 4;

    const next = raw.indexOf(boundary, bodyFrom);
    if (next < 0) break;
    let bodyTo = next;
    if (raw[bodyTo - 1] === 0x0a) bodyTo--;
    if (raw[bodyTo - 1] === 0x0d) bodyTo--;

    const nameM = /name="([^"]*)"/i.exec(head);
    const fileM = /filename="([^"]*)"/i.exec(head);
    const name = nameM ? nameM[1] : '';
    if (fileM) {
      if (fileM[1])
        files.push({ name, filename: fileM[1],
                     content: raw.subarray(bodyFrom, bodyTo) });
    } else if (name) {
      fields[name] = raw.toString('utf8', bodyFrom, bodyTo);
    }
    pos = next;
  }
  return { fields, files };
}
