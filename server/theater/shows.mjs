/* ---------------------------------------------------------------------
   The performances, from the company's own page.

   The director may give a project the address of a page that lists the
   performances - the company's tickets page. It is fetched every hour,
   and each date found goes into the calendar and the calendar feed as
   a performance, for everybody.

   What is read: list entries holding a day and a month abbreviation
   (<b>31</b><small>Dez</small>) and a time (19:30), with whatever
   marks stand beside them (Premiere, a note). Such pages leave out the
   year; it is worked out from the order, starting at the presale date
   the page carries ("start":"2026-11-02") or two months back from
   today, and going to the next year where a month comes before the one
   above it.
   --------------------------------------------------------------------- */

const LIMIT = 2_000_000;
const TIMEOUT = 20_000;

const MONTHS = { jan: 1, 'jän': 1, jaen: 1, feb: 2, 'mär': 3, mar: 3, mrz: 3, apr: 4, mai: 5, may: 5, jun: 6, jul: 7,
                 aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, dez: 12, dec: 12 };
const two = n => String(n).padStart(2, '0');
const text = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&#?\w+;/g, ' ').replace(/\s+/g, ' ').trim();

/* The dates of a page, as [{ iso, von, notiz }], in page order. */
export function parseShows(page, today = new Date()) {
  const html = String(page || '');
  const start = /"start"\s*:\s*"(\d{4})-(\d{2})-(\d{2})"/.exec(html);
  const back = new Date(today); back.setMonth(back.getMonth() - 2);
  let year = start ? Number(start[1]) : back.getFullYear();
  const from = start ? [Number(start[2]), Number(start[3])] : [back.getMonth() + 1, back.getDate()];
  const out = [];
  let last = null;
  for (const item of html.split(/<li\b/i).slice(1)) {
    const body = item.split(/<\/li>/i)[0];
    const d = /<b>\s*(\d{1,2})\.?\s*<\/b>\s*<small>\s*([A-Za-zÄÖÜäöü]{3})/.exec(body);
    if (!d) continue;
    const month = MONTHS[d[2].toLowerCase()];
    const day = Number(d[1]);
    const time = /\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/.exec(text(body));
    if (!month || day < 1 || day > 31 || !time) continue;
    if (last == null) { if (month < from[0] || (month === from[0] && day < from[1])) year++; }
    else if (month < last) year++;
    last = month;
    // the marks beside the date: Premiere, Derniere, a note - not the buttons
    const notiz = [...body.matchAll(/<span class="(?:marke[^"]*|notiz)">([\s\S]*?)<\/span>/g)].map(m => text(m[1])).filter(Boolean).join(' · ');
    out.push({ iso: `${year}-${two(month)}-${two(day)}`, von: `${two(time[1])}:${time[2]}`, ...(notiz ? { notiz: notiz.slice(0, 120) } : {}) });
  }
  return out;
}

/* Fetch and read. Errors are thrown as { key } from the text catalogues. */
export async function fetchShows(url) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT);
  let response;
  try { response = await fetch(url, { signal: ctl.signal, redirect: 'follow', headers: { 'User-Agent': 'rehearsalcall' } }); }
  catch { clearTimeout(timer); throw Object.assign(new Error('show.unreachable'), { key: 'show.unreachable' }); }
  clearTimeout(timer);
  if (!response.ok) throw Object.assign(new Error('show.unreachable'), { key: 'show.unreachable' });
  const body = await response.text();
  if (body.length > LIMIT) throw Object.assign(new Error('show.unreachable'), { key: 'show.unreachable' });
  return parseShows(body);
}
