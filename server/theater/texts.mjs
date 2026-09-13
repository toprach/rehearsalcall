/* ---------------------------------------------------------------------
   Languages.

   English is the source, German the first translation. To add another
   language, copy texts/de.mjs, translate the right-hand side and enter
   it in LANGUAGES below - nothing else.

   Some texts carry markup (<b>, <a>). That is deliberate: they are ours,
   not a visitor's, and where a name stands in the same sentence it comes
   in through a placeholder and is escaped on the way. So: t(...) returns
   finished HTML, user data still goes through h().
   --------------------------------------------------------------------- */

import { en } from './texts/en.mjs';
import { de } from './texts/de.mjs';

export const LANGUAGES = [
  { code: 'en', name: 'English', locale: 'en-GB', texts: en },
  { code: 'de', name: 'Deutsch', locale: 'de-AT', texts: de },
];

const DEFAULT = 'en';
const byCode = code => LANGUAGES.find(l => l.code === code);

/* From the Accept-Language header, take the first language we have.
   Without weighting: whoever wants it exact switches in the page head. */
export function fromHeader(line) {
  for (const piece of String(line || '').split(',')) {
    const code = piece.trim().split(';')[0].slice(0, 2).toLowerCase();
    if (byCode(code)) return code;
  }
  return DEFAULT;
}

/* ---------------------------------------------------------------------
   One language: t() for texts, number()/percent()/date() for figures.

   If a key is missing from the translation, the English one is taken - a
   half-translated page is better than one with holes. If it is missing
   there too, the key itself stands there; that shows up when looking and
   is better than an empty space nobody notices.
   --------------------------------------------------------------------- */
export function language(code) {
  const L = byCode(code) || byCode(DEFAULT);
  const own = L.texts, fallback = en;

  const number = (n, digits = 0) => Number(n).toLocaleString(L.locale,
    { minimumFractionDigits: digits, maximumFractionDigits: digits });

  /* Percent with a narrow space before it, as German sets it; in
     English the sign sits against the number.                        */
  const percent = (share, digits = 0) =>
    number(share * 100, digits) + (L.code === 'de' ? ' %' : '%');

  /* Every language writes figures differently. But whoever produces a
     message sits deep in the application and does not know the
     visitor's language. So they pass the figure in a shape that says
     WHAT it is:

       { share: 0.976 }   ->  97,6 %   or  97.6%
       { number: 1929 }   ->  1.929    or  1,929
       { key: 'msg.x' }   ->  another message, inside this one

     Anything else is put in unchanged.                               */
  const put = (v) => {
    if (v && typeof v === 'object') {
      if ('share' in v) return percent(v.share, v.digits ?? 1);
      if ('number' in v) return number(v.number, v.digits ?? 0);
      if ('key' in v) return t(v.key, v.values);
    }
    return String(v);
  };

  const t = (key, values) => {
    let text = own[key] ?? fallback[key];
    if (text == null) return '[' + key + ']';
    if (typeof text === 'function') return text(values || {});
    if (values) text = text.replace(/\{(\w+)\}/g,
      (whole, k) => (k in values ? put(values[k]) : whole));
    return text;
  };

  /* Weekday and month names come from Intl, so they follow the chosen
     language without a table of our own. */
  const weekday = (n, style = 'long') =>
    new Intl.DateTimeFormat(L.locale, { weekday: style })
      .format(new Date(Date.UTC(2024, 0, 7 + n)));   // 7 Jan 2024 was a Sunday

  return {
    code: L.code,
    name: L.name,
    locale: L.locale,
    t,
    number,
    percent,
    weekday,
    date: (value, opt = {}) => new Date(value).toLocaleString(L.locale, opt),
    /* The picker in the page head. */
    picker: (path) => `<form method="post" action="/theater/sprache" class="langpick">
      <input type="hidden" name="back" value="${String(path || '/theater')
        .replace(/[&<>"']/g, '')}">
      <select name="language" onchange="this.form.submit()"
              aria-label="${t('nav.language')}">
        ${LANGUAGES.map(x => `<option value="${x.code}"${
          x.code === L.code ? ' selected' : ''}>${x.name}</option>`).join('')}
      </select>
      <noscript><button class="quiet mini">${t('nav.language')}</button></noscript>
    </form>`,
  };
}

export const isLanguage = code => !!byCode(code);
