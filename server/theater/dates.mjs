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
    if (!t) return null;
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

   It always starts tomorrow: no rehearsal can be arranged for this
   evening any more, and the search for dates starts there too.        */
export function period(project) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + 1);

  // The director may push the start out - rehearsals begin after the
  // casting is done, say - but never behind tomorrow.
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
function windowFor(group, date, available, personByShort) {
  let from = -Infinity, to = Infinity;
  const missing = [];
  for (const b of group) {
    const person = personByShort.get(b);
    const w = person ? windowOn(available[person.id], date) : null;
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
      return !person || !entered.has(person.id);
    });
    const needs = rehearsalLength(playing);
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
      possible.push({ date: d, from: r.from, to: r.to });
    }
    return {
      id: pr.id, group: pr.gruppe, needed, minutes: playing, needs,
      scenes: pr.szenen || [],
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
  for (const t of project.termine || []) {
    if (!t.bestaetigt || !t.iso) continue;
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

  const order = [...rehearsals].filter(x => !x.fixed).sort((a, b) =>
    (a.scarcity - b.scarcity) || (b.minutes - a.minutes));
  for (const pr of order) {
    for (const m of pr.possible) {
      const iso = isoDate(m.date);
      const gap = findGap(pr.needed, m, pr.needs, booked.get(iso) || [], stages);
      if (!gap) continue;
      pr.proposal = {
        date: m.date, iso, weekday: m.date.getDay(),
        from: clock(gap.from), to: clock(gap.to),
      };
      book(iso, pr.needed, gap.from, gap.to);
      break;
    }
    pr.alternatives = pr.possible
      .filter(m => !pr.proposal || isoDate(m.date) !== pr.proposal.iso)
      .slice(0, 4)
      .map(m => ({ date: m.date, weekday: m.date.getDay(),
                   from: clock(m.from), to: clock(m.from + pr.needs) }));
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

  const canOn = (b, date) => {
    const x = personByShort.get(b);
    return x ? !!windowOn(project.verfuegbar?.[x.id], date) : false;
  };

  const blocked = blockedOf(project);
  const states = {};
  for (const t of days) {
    const d = asDate(t.iso);
    if (!d) continue;
    if (blocked.has(t.iso)) { states[t.iso] = { level: 0, best: null, canCome: [], fixed: [], blocked: true }; continue; }

    // Who can make this day at all?
    const canCome = (project.personen || [])
      .filter(x => windowOn(project.verfuegbar?.[x.id], d))
      .map(x => x.b);

    let level = 0, best = null;
    for (const pr of mine) {
      const others = [...new Set([...pr.gruppe, ...directors])].filter(b => b !== person.b);
      const here = others.filter(b => canOn(b, d));
      const share = others.length ? here.length / others.length : 1;
      const st = share >= 1 ? 3 : (share >= 0.5 ? 2 : (here.length ? 1 : 0));
      if (st > level || (st === level && best && others.length > best.total)) {
        level = st;
        best = { rehearsal: pr.id, here: here.length, total: others.length,
                 missing: others.filter(b => !canOn(b, d)) };
      }
    }
    states[t.iso] = {
      level, best, canCome,
      fixed: [...fixed.values()].filter(x => x.iso === t.iso)
        .map(x => ({ rehearsal: x.probe_id, from: x.von, to: x.bis,
                     place: x.ort || '' })),
    };
  }
  return states;
}
