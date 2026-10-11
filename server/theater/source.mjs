/* The script from an address.

   An administrator may give a project an address its script is fetched
   from - typically the export link of a Google document
   (.../document/d/<id>/export?format=docx). This module only downloads
   and says what came back; taking the script in is index.mjs's job.

   Errors are thrown as { key, values } with keys from the text
   catalogues, so the page can say in words what went wrong - above all
   the one that will happen: a document not shared for "anyone with the
   link", for which Google answers with a sign-in page.            */

const LIMIT = 30_000_000;          // the same as for an upload
const TIMEOUT = 60_000;

const fail = (key, values = {}) => Object.assign(new Error(key), { key, values });

/* An address the administrator may enter: http or https, nothing else. */
export function checkAddress(text) {
  const s = String(text || '').trim();
  if (!s) return '';
  let u;
  try { u = new URL(s); } catch { return null; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  if (s.length > 2000) return null;
  return u.href;
}

/* The file name the server gives, from Content-Disposition; the
   RFC 5987 form (filename*=UTF-8''...) first, as Google sends both. */
function nameFrom(header) {
  const h = String(header || '');
  const star = /filename\*\s*=\s*([^']*)'[^']*'([^;]+)/i.exec(h);
  if (star) { try { return decodeURIComponent(star[2].trim().replace(/^"|"$/g, '')); } catch {} }
  const plain = /filename\s*=\s*"([^"]*)"|filename\s*=\s*([^;]+)/i.exec(h);
  return plain ? (plain[1] ?? plain[2]).trim() : '';
}

/* Download. Resolves to { content: Buffer, filename } with a file name
   ending in .docx or .md, so readScript knows how to read it. */
export async function download(url) {
  let r;
  try {
    r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT),
                           headers: { 'User-Agent': 'rehearsalcall (script refresh)' } });
  } catch (e) {
    throw fail('src.unreachable', { reason: String(e?.cause?.code || e?.name || e?.message || e) });
  }
  const type = String(r.headers.get('content-type') || '').toLowerCase();
  if (r.status === 401 || r.status === 403) throw fail('src.not_shared', { status: r.status });
  if (r.status === 404) throw fail('src.not_found');
  if (!r.ok) throw fail('src.http', { status: r.status });
  if (Number(r.headers.get('content-length') || 0) > LIMIT) throw fail('src.too_big');

  const content = Buffer.from(await r.arrayBuffer());
  if (content.length > LIMIT) throw fail('src.too_big');
  if (!content.length) throw fail('src.empty');

  let name = nameFrom(r.headers.get('content-disposition')).replace(/[\\/]/g, '_');
  // A Word file is a zip archive: it starts with "PK".
  if (content[0] === 0x50 && content[1] === 0x4b) {
    if (!/\.docx$/i.test(name)) name = (name.replace(/\.[^.]*$/, '') || 'skript') + '.docx';
    return { content, filename: name };
  }
  // A sign-in or consent page instead of the file: not shared.
  if (type.includes('text/html')) throw fail('src.not_shared', { status: r.status });
  if (type.startsWith('text/')) {
    if (!/\.(md|markdown|txt)$/i.test(name)) name = (name.replace(/\.[^.]*$/, '') || 'skript') + '.md';
    return { content, filename: name };
  }
  throw fail('src.not_docx', { type: type.split(';')[0] || '?' });
}
