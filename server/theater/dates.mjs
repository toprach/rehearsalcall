/* ---------------------------------------------------------------------
   Proposing dates.

   Everyone enters when they are generally free (weekday and time) and
   when they are not (blocked periods, a holiday say). From that follows,
   for every evening, who can come. A rehearsal fits an evening when its
   whole cast can.

   Dates are given out by scarcity: the rehearsal with the fewest
   possible evenings first. Otherwise the pairs, which are easy to
   schedule, take exactly the evenings that were the only ones on which
   the big scene would have been possible.

   Day names are not built here. The page knows the visitor's language
   and formats them with Intl; this module returns the weekday number.
   --------------------------------------------------------------------- */

const asDate = s => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
};
const asMinutes = s => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || ''));
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};
const twoDigits = n => String(n).padStart(2, '0');
export const isoDate = d =>
  `${d.getFullYear()}-${twoDigits(d.getMonth() + 1)}-${twoDigits(d.getDate())}`;

/* Can this person make that evening, and if so, in what window?

   Entries are per calendar day. Older entries by weekday are still read,
   so that nothing is lost.                                            */
function windowOn(entry, date) {
  if (!entry) return null;
  const iso = isoDate(date);

  if (entry.tage) {
    const t = entry.tage[iso];
    if (!t || t.nein) return null;
    const a = asMinutes(t.von), b = asMinutes(t.bis);
    return (a == null || b == null || b <= a) ? null : { from: a, to: b };
  }

  for (const s of entry.sperren || []) {
    const from = s.von || '0000-01-01', to = s.bis || '9999-12-31';
    if (iso >= from && iso <= to) return null;
  }
  const day = date.getDay();
  let from = null, to = null;
  for (const w of entry.wochentage || []) {
    if (Number(w.tag) !== day) continue;
    const a = asMinutes(w.von), b = asMinutes(w.bis);
    if (a == null || b == null || b <= a) continue;
    if (from == null || a < from) from = a;
    if (to == null || b > to) to = b;
  }
  return from == null ? null : { from, to };
}

/* The rehearsal period. The director sets how long rehearsing goes on -
   usually up to the dress rehearsal. Without a setting we take three
   months.

   It starts today. This evening is still an evening: a company that
   decides at noon to meet tonight would otherwise find today missing
   from the calendar, and a rehearsal fixed for today would drop out of
   the proposals although it has not been held yet.                    */
export function period(project) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  // The director may push the start out - rehearsals begin after the
  // casting is done, say - but never behind today.
  const from = asDate(project?.einstellungen?.von);
  if (from && from > start) { start.setTime(from.getTime()); }

  let end = asDate(project?.einstellungen?.bis);
  if (!end || end <= start) {
    end = new Date(start);
    end.setMonth(end.getMonth() + 3);
  }
  // Very long periods bring nothing and make the page heavy.
  const limit = new Date(start);
  limit.setMonth(limit.getMonth() + 12);
  if (end > limit) end = limit;
  return { start, end };
}

export function calendarDays(project) {
  const { start, end } = period(project);
  const out = [];
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    out.push({ iso: isoDate(d), day: d.getDate(), month: d.getMonth(),
               year: d.getFullYear(), weekday: d.getDay() });
  }
  return out;
}

/* The evenings of the rehearsal period. */
/* Days the director has struck - a holiday, the hall taken. No
   rehearsal is proposed for them, whoever could. */
export const blockedOf = project =>
  new Set((project?.einstellungen?.gesperrt || []).filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x)));

function evenings(project) {
  const { start, end } = period(project);
  const blocked = blockedOf(project);
  const out = [];
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1))
    if (!blocked.has(isoDate(d))) out.push(new Date(d));
  return out;
}

/* How long does the rehearsal take?

   Not as long as the playing time: you stop, repeat, talk it over. As a
   rule of thumb, three times that plus a quarter of an hour for
   arriving, rounded up to a quarter of an hour, at least 45 minutes. */
export function rehearsalLength(playingMinutes) {
  const raw = Math.max(45, Math.round(Number(playingMinutes || 0) * 3 + 15));
  return Math.ceil(raw / 15) * 15;
}

/* Intersection of a group's time windows on one evening.
   Returns not-ok as soon as a single person cannot.                    */
/* The director plans by striking days, not by entering evenings: they
   count as free the whole evening on every day that is not struck.
   (Struck days never reach here - evenings() leaves them out.) */
const ALWAYS = { from: 0, to: 24 * 60 };
const windowOfPerson = (person, available, date) =>
  !person ? null : person.regie ? ALWAYS : windowOn(available?.[person.id], date);

function windowFor(group, date, available, personByShort) {
  let from = -Infinity, to = Infinity;
  const missing = [];
  for (const b of group) {
    const person = personByShort.get(b);
    const w = windowOfPerson(person, available, date);
    if (!w) { missing.push(b); continue; }
    if (w.from > from) from = w.from;
    if (w.to < to) to = w.to;
  }
  if (missing.length) return { ok: false, missing };
  return { ok: true, from, to };
}

/* Does the rehearsal still fit into the gaps of that evening?

   An evening does not belong to a single rehearsal: two people going
   through a three-minute scene do not need a whole evening. They come
   one after another.

   At the same time there is usually only one stage - so two rehearsals
   at the same time would not work even when nobody appears twice.
   Whoever has several rooms raises "buehnen".                         */
function findGap(group, window_, length, bookings, stages) {
  const candidates = [window_.from, ...bookings.map(x => x.to)]
    .filter(t => t >= window_.from && t + length <= window_.to)
    .sort((a, b) => a - b);
  for (const start of candidates) {
    const atSameTime = bookings.filter(x => start < x.to && x.from < start + length);
    if (atSameTime.length >= stages) continue;                // stage taken
    if (atSameTime.some(x => x.group.some(b => group.includes(b)))) continue;
    return { from: start, to: start + length };
  }
  return null;
}

const clock = m => `${twoDigits(Math.floor(m / 60))}:${twoDigits(m % 60)}`;

/* Who else speaks inside a rehearsal's scenes without being in its
   group? The plan lets the director read small parts ("the director
   reads x %"); these are the people read for - welcome when they can
   make it, not needed for the date. */
export function substitutesOf(structure, rehearsal) {
  const ranges = (rehearsal?.szenen || rehearsal?.scenes || [])
    .filter(z => z.nr_von != null && z.nr_bis != null).map(z => [Number(z.nr_von), Number(z.nr_bis)]);
  if (!ranges.length || !structure) return [];
  const group = new Set(rehearsal.gruppe || rehearsal.group || []);
  const count = new Map();
  const take = (e) => {
    if (!e || e.typ !== 'replik' || e.nr == null || !e.ensemble || group.has(e.ensemble)) return;
    if (!ranges.some(([a, b]) => e.nr >= a && e.nr <= b)) return;
    const c = count.get(e.ensemble) || { b: e.ensemble, speeches: 0, words: 0 };
    c.speeches++;
    c.words += String(e.text || '').split(/\s+/).filter(Boolean).length;
    count.set(e.ensemble, c);
  };
  for (const s of structure.sequenz || []) {
    if (s.typ === 'tabelle')
      for (const z of s.zeilen || []) [...(z.hinter_der_buehne || []), ...(z.auf_der_buehne || [])].forEach(take);
    else take(s);
  }
  return [...count.values()].sort((a, b) => b.speeches - a.speeches || b.words - a.words);
}

/* A rehearsal is rehearsed more than once. A fixed date that lies in
   the past moves into the history (project.verlauf), where the director
   notes afterwards how well it sits; the rehearsal is then open for the
   next date. Returns whether anything moved. */
export function archivePast(project, today = isoDate(new Date())) {
  const past = (project.termine || []).filter(t => t.bestaetigt && t.iso && t.iso < today);
  if (!past.length) return false;
  project.verlauf = project.verlauf || [];
  for (const t of past) {
    if (project.verlauf.some(v => v.probe_id === t.probe_id && v.iso === t.iso)) continue;
    project.verlauf.push({ probe_id: t.probe_id, iso: t.iso, von: t.von || '', bis: t.bis || '',
      ort: t.ort || '', gruppe: t.gruppe || [], sitzt: null, notiz: '' });
  }
  project.termine = project.termine.filter(t => !past.includes(t));
  return true;
}
const sameGroup = (a, b) => !a || !a.length || [...a].sort().join('+') === [...(b || [])].sort().join('+');
export const historyOf = (project, rehearsal) => (project.verlauf || [])
  .filter(v => v.probe_id === rehearsal.id && sameGroup(v.gruppe, rehearsal.gruppe || rehearsal.group))
  .sort((a, b) => a.iso.localeCompare(b.iso));

/* ---------------------------------------------------------------------
   The main function: collect the possible evenings for every rehearsal,
   then hand out a proposal.
   --------------------------------------------------------------------- */
export function proposeDates(project) {
  const plan = project.plan;
  if (!plan || !Array.isArray(plan.proben))
    return { rehearsals: [], hint: { key: 'msg.no_plan' } };

  const personByShort = new Map();
  for (const p of project.personen || []) personByShort.set(p.b, p);

  /* The director is at every rehearsal. So a rehearsal fits an evening
     only when its cast AND the director can - and the director cannot
     be in two rehearsals at once, which is what keeps them one after
     the other on a shared evening. */
  const directors = directorsOf(project);
  const needing = (group) => [...new Set([...group, ...directors])];

  // How many rehearsals can run at once? Usually there is one stage.
  const stages = Math.max(1, Number(project.einstellungen?.buehnen || 1));
  const days = evenings(project);
  const until = period(project).end;

  // Who has entered anything at all?
  const entered = new Set(Object.keys(project.verfuegbar || {}).filter(id => {
    const v = project.verfuegbar[id] || {};
    return Object.keys(v.tage || {}).length || (v.wochentage || []).length;
  }));

  const rehearsals = plan.proben.map(pr => {
    const playing = Number(pr.minuten || 0);
    const needed = needing(pr.gruppe);
    const withoutEntry = needed.filter(b => {
      const person = personByShort.get(b);
      return !person || (!person.regie && !entered.has(person.id));
    });
    const needs = rehearsalLength(playing);
    // read for by the director: asked along when they can, never waited for
    const optional = substitutesOf(project.skript, pr)
      .filter(o => personByShort.has(o.b) && !needed.includes(o.b));
    const history = historyOf(project, pr);
    const rated = history.filter(v => v.sitzt != null);
    const possible = [];
    const missingCount = new Map();
    let longest = 0, tooShort = 0;
    for (const d of days) {
      const r = windowFor(needed, d, project.verfuegbar || {}, personByShort);
      if (!r.ok) {
        for (const b of r.missing) missingCount.set(b, (missingCount.get(b) || 0) + 1);
        continue;
      }
      const span = r.to - r.from;
      if (span > longest) longest = span;
      if (span < needs) { tooShort++; continue; }
      /* The time goes where the most people overlap: the window of the
         needed ones, narrowed to those of the optional people who can
         as long as the rehearsal still fits. */
      let from = r.from, to = r.to;
      const also = [];
      for (const o of optional) {
        const w = windowOfPerson(personByShort.get(o.b), project.verfuegbar || {}, d);
        if (!w) continue;
        const f = Math.max(from, w.from), t2 = Math.min(to, w.to);
        if (t2 - f >= needs) { from = f; to = t2; also.push(o.b); }
      }
      possible.push({ date: d, from: r.from, to: r.to, pref: { from, to }, also });
    }
    return {
      id: pr.id, group: pr.gruppe, needed, minutes: playing, needs,
      scenes: pr.szenen || [],
      optional, history, held: history.length,
      lastRating: rated.length ? rated[rated.length - 1].sitzt : null,
      withoutEntry,
      possible,
      scarcity: possible.length,
      tooShort, longestWindow: longest,
      oftenUnavailable: [...missingCount.entries()]
        .sort((a, b) => b[1] - a[1]).slice(0, 3),
    };
  });

  /* Handing out: scarcest rehearsal first, an evening only once, and one
     person not twice on the same evening.                              */
  // isoDate -> [{ group, from, to }]  in minutes since midnight
  const booked = new Map();
  const book = (iso, group, from, to) => {
    const list = booked.get(iso) || [];
    list.push({ group, from, to });
    booked.set(iso, list);
  };

  /* Fixed dates are settled. They are not recomputed, but they do book
     their people - so the rest gives way to them. */
  const fixed = new Map();
  const today = isoDate(new Date());
  for (const t of project.termine || []) {
    if (!t.bestaetigt || !t.iso || t.iso < today) continue;   // the past is history
    fixed.set(t.probe_id, t);
    const pr = rehearsals.find(x => x.id === t.probe_id);
    const group = pr ? pr.needed : needing(t.gruppe || []);
    const from = asMinutes(t.von) ?? 19 * 60;
    const to = asMinutes(t.bis) ?? (from + (pr ? pr.needs : 90));
    book(t.iso, group, from, to);
  }
  for (const pr of rehearsals) {
    const t = fixed.get(pr.id);
    if (!t) continue;
    const d = asDate(t.iso);
    pr.fixed = true;
    pr.proposal = { date: d, iso: t.iso, weekday: d ? d.getDay() : null,
                    from: t.von || '', to: t.bis || '' };
  }

  /* What has never been rehearsed comes before a repeat; among the
     repeats what sits worst comes first. */
  const order = [...rehearsals].filter(x => !x.fixed).sort((a, b) =>
    ((a.held ? 1 : 0) - (b.held ? 1 : 0)) ||
    ((a.lastRating ?? -1) - (b.lastRating ?? -1)) ||
    (a.scarcity - b.scarcity) || (b.minutes - a.minutes));
  for (const pr of order) {
    for (const m of pr.possible) {
      const iso = isoDate(m.date);
      const taken = booked.get(iso) || [];
      // first where the optional people can as well, else anywhere that evening
      let gap = m.also.length ? findGap(pr.needed, m.pref, pr.needs, taken, stages) : null;
      const withOptional = !!gap;
      if (!gap) gap = findGap(pr.needed, m, pr.needs, taken, stages);
      if (!gap) continue;
      pr.proposal = {
        date: m.date, iso, weekday: m.date.getDay(),
        from: clock(gap.from), to: clock(gap.to),
        optional: withOptional ? m.also : [],
      };
      book(iso, pr.needed, gap.from, gap.to);
      break;
    }
    pr.alternatives = pr.possible
      .filter(m => !pr.proposal || isoDate(m.date) !== pr.proposal.iso)
      .slice(0, 4)
      .map(m => ({ date: m.date, weekday: m.date.getDay(),
                   from: clock(m.pref.from), to: clock(m.pref.from + pr.needs) }));
  }

  rehearsals.sort((a, b) => {
    if (a.proposal && b.proposal) return a.proposal.iso.localeCompare(b.proposal.iso);
    if (a.proposal) return -1;
    if (b.proposal) return 1;
    return a.group.length - b.group.length;
  });

  const open = rehearsals.filter(p => !p.proposal).length;
  return {
    rehearsals, until, directors,
    hint: open ? { key: 'msg.without_date',
                   values: { open, total: rehearsals.length } } : null,
  };
}

/* ---------------------------------------------------------------------
   How does one day stand?

   For a company member's calendar: on which day is it worth offering
   time? The measure is one's own rehearsals - if only one's own consent
   is missing for one of them, that is a good day, even when nobody else
   can.

   Levels:
     0  nobody from my rehearsals can
     1  at least one
     2  at least half of one rehearsal
     3  everyone else of one rehearsal - only I am missing
   --------------------------------------------------------------------- */
/* Who is the director? Marked on the company page; there may be none,
   and there may be two. The assistant director is not needed at every
   rehearsal and so does not count here. */
export function directorsOf(project) {
  return (project?.personen || []).filter(x => x.regie).map(x => x.b);
}

export function dayStates(project, person, days) {
  const personByShort = new Map();
  for (const x of project.personen || []) personByShort.set(x.b, x);

  const directors = directorsOf(project);
  const isDirector = directors.includes(person.b);
  // The director's own calendar: every rehearsal is theirs.
  const mine = (project.plan?.proben || []).filter(pr =>
    isDirector || pr.gruppe.includes(person.b));
  const fixed = new Map();
  for (const t of project.termine || [])
    if (t.bestaetigt && t.iso) fixed.set(t.probe_id, t);

  const canOn = (b, date) => !!windowOfPerson(personByShort.get(b), project.verfuegbar, date);

  const blocked = blockedOf(project);
  const states = {};
  for (const t of days) {
    const d = asDate(t.iso);
    if (!d) continue;
    if (blocked.has(t.iso)) { states[t.iso] = { level: 0, best: null, canCome: [], fixed: [], blocked: true }; continue; }

    // Who can make this day at all? The directors are not counted: they
    // plan by striking days, and are there on every other one.
    const canCome = (project.personen || [])
      .filter(x => !directors.includes(x.b) && windowOfPerson(x, project.verfuegbar, d))
      .map(x => x.b);

    let level = 0, best = null;
    const list = [];
    for (const pr of mine) {
      const others = pr.gruppe.filter(b => b !== person.b && !directors.includes(b));
      const here = others.filter(b => canOn(b, d));
      const share = others.length ? here.length / others.length : 1;
      const st = share >= 1 ? 3 : (share >= 0.5 ? 2 : (here.length ? 1 : 0));
      list.push({ rehearsal: pr.id, here: here.length, total: others.length, st, share,
                  group: others, missing: others.filter(b => !canOn(b, d)) });
    }
    /* Which of my rehearsals does the day suit? The most complete one
       first; among complete ones the larger (harder to gather), among
       incomplete ones the one with the fewest people missing. */
    list.sort((a, b) => (b.share - a.share) ||
      (a.share >= 1 ? b.total - a.total : a.missing.length - b.missing.length));
    const worth = list.filter(x => x.here > 0 || x.total === 0);
    if (worth.length) { best = worth[0]; level = best.st; }
    // When each of them can: minutes from midnight, for the bars in the
    // day panel. The directors are there anyway and get no bar.
    const windows = {};
    for (const b of canCome) {
      const w = windowOfPerson(personByShort.get(b), project.verfuegbar, d);
      if (w) windows[b] = [w.from, w.to];
    }
    /* For the director's own calendar: can this rehearsal actually be
       fixed on this day - does a time exist where the WHOLE cast (not
       just "others", the director too) is free? Only then is there a
       sensible default to offer; asking them to fix on a day nobody
       agreed to would be a promise the app cannot back up. */
    const commonWindow = (rehearsalId) => {
      const pr = mine.find(p => p.id === rehearsalId);
      const needed = [...new Set([...(pr?.gruppe || []), ...directors])];
      const w = windowFor(needed, d, project.verfuegbar || {}, personByShort);
      return w.ok ? { from: clock(w.from), to: clock(w.to) } : null;
    };
    states[t.iso] = {
      level, best, canCome, windows,
      suits: worth.slice(0, 4).map(x => ({ rehearsal: x.rehearsal, here: x.here, total: x.total,
        ...(isDirector ? commonWindow(x.rehearsal) : null) })),
      // Fixed dates of MY rehearsals (the director's: all of them).
      fixed: [...fixed.values()].filter(x => x.iso === t.iso &&
          (isDirector || (x.gruppe || []).includes(person.b) ||
           mine.some(pr => pr.id === x.probe_id)))
        .map(x => ({ rehearsal: x.probe_id, from: x.von, to: x.bis,
                     place: x.ort || '' })),
    };
  }
  return states;
}
