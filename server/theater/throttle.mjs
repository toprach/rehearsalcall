/* ---------------------------------------------------------------------
   A brake against guessing codes.

   The access code is the director's only secret. Without a brake,
   somebody could simply try one after another - so after a few failed
   attempts there is a wait, and the wait grows.

   The counters live in memory. A restart forgets them; that is
   acceptable here, because restarts are rare and the codes themselves
   have room enough.
   --------------------------------------------------------------------- */

const STEPS = [
  { after: 5,  wait:        60_000 },   // after 5 failures, one minute
  { after: 10, wait:     5 * 60_000 },
  { after: 20, wait:    30 * 60_000 },
  { after: 50, wait: 6 * 60 * 60_000 },
];

const counters = new Map();           // key -> { failures, freeAt }

/* Sweep up, so the map does not grow without bound. */
function sweep(now) {
  if (counters.size < 500) return;
  for (const [k, v] of counters) if (v.freeAt < now - 3600_000) counters.delete(k);
}

/* Who is asking? Behind the proxy the real address is in the
   X-Forwarded-For header; without it we take what the socket says. */
export function origin(request) {
  const forwarded = String(request.headers['x-forwarded-for'] || '')
    .split(',')[0].trim();
  return forwarded || request.socket?.remoteAddress || 'unknown';
}

/* May it try? Returns { allowed, waitSeconds }. */
export function mayTry(key) {
  const e = counters.get(key);
  const now = Date.now();
  if (!e || !e.freeAt || e.freeAt <= now) return { allowed: true, waitSeconds: 0 };
  return { allowed: false, waitSeconds: Math.ceil((e.freeAt - now) / 1000) };
}

export function failedAttempt(key) {
  const now = Date.now();
  sweep(now);
  const e = counters.get(key) || { failures: 0, freeAt: 0 };
  e.failures++;
  let wait = 0;
  for (const st of STEPS) if (e.failures >= st.after) wait = st.wait;
  if (wait) e.freeAt = now + wait;
  counters.set(key, e);
  return e.failures;
}

export function succeeded(key) {
  counters.delete(key);
}

/* For the health page only. */
export const state = () => ({
  watched: counters.size,
  blocked: [...counters.values()].filter(v => v.freeAt > Date.now()).length,
});
