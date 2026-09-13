# The plan for the server edition

> **This is the original plan, kept for its reasoning.** It was written before
> anything was built. What was actually built differs in several points — the
> section [What became of it](#what-became-of-it) at the end lists them. The
> arguments still hold; some of the technical choices did not survive contact
> with the hosting.

Today the tool is a single HTML file that does everything in the browser. That
stays. The server only comes in where a file on its own cannot go any
further: when several people work on one project together, and when
availability has to be collected.

**The server should do little.** Parsing, typesetting and printing stay in the
browser. All that lives on the server is the project, the script, the casting,
the rehearsal plan and the dates.

## Roles

| Who | How they get in | What they may do |
|---|---|---|
| Director | access code | create the project, upload the script, assign the casting, derive and revise the rehearsal plan |
| Company | invitation link | pick their own name, enter availability, see dates |

### Access code

No mail sending, no registration, no password. The entry page says:

> **Getting access**
> Send an email to **johannes@kutsam.at** with the subject
> "Please send access for joku.tv/theater". You will get a code back to
> enter here.

That spares the whole mail infrastructure — no SMTP, no deliverability, no
bounces, no sign-in details that can get lost. With a handful of stages, doing
it by hand is simply the lesser evil.

The code is long and random, is good for exactly one project, and is stored
only as a hash. It stays valid until somebody withdraws it.

### Invitation link for the company

Two ways, and both are provided for:

* **one link for the whole troupe** — thrown into the group chat, after which
  everyone picks their name from a dropdown. Simple, but anyone could
  overwrite somebody else's availability;
* **a personal link per person** — then the page knows at once who entered
  something. Safer, but it needs one link per person to hand out.

This is not access protection in the strict sense, and the page says so. For a
rehearsal plan it is enough.

## The course of it

1. **Create the project** — enter a title and a code.
2. **Upload the script** (`.docx`). It is parsed in the browser and kept with
   the project. *The script is under copyright: it is visible only inside the
   project and is never served publicly.*
3. **Assign the casting** — the same interface as today, except that the
   configuration lives on the server instead of in localStorage.
4. **Derive the rehearsal plan** — `probenplan/szenen.mjs` runs in Node
   anyway. Then revise it by hand: drop scenes, merge them, change the cast,
   turn the substitution share per scene.
5. **Collect availability** — send out the invitation link.
6. **Propose dates** — available at any time, recomputed the moment somebody
   enters something.

## Availability: once, not 23 times

Everyone enters a **recurring** pattern ("Tuesday and Thursday from 19:00")
plus **exceptions** ("14–21 October, away"). From those two statements the
program works out all the rehearsal combinations.

Separate polls per combination — one Doodle for each of the 23 rehearsals —
would be 23 times the work, would be filled in inconsistently, and still could
not do the arithmetic. That is exactly where the ready-made tools fail
(Rallly, Framadate, Nuudel, Dudle): there, one poll is always one date. But
here the arithmetic is the whole point.

## Proposing dates

For every evening in the planning window it is settled who can come. A
rehearsal is possible on an evening when **everyone** in its cast can. Dates
are assigned by scarcity: the rehearsal with the fewest possible evenings
first — otherwise the easy pairs take the evenings that were the only ones on
which the big scene would have been possible.

For each rehearsal the output gives a proposal, fallback dates, and when
nothing fits, **who the reason is** — so the director knows whom to go and
ask.

## Technology

* **Node with no build step** (ESM `.mjs`, like the rest of the project),
  server-rendered HTML, no framework. Realistically 600–800 lines at the core.
* **PostgreSQL** (already set up on the machine).
* **Caddy** as a reverse proxy, certificate automatically from Let's Encrypt.
* TypeScript would be a bad bargain here: at this size and lifespan the build
  step costs more than the types bring in.

### Data model

    projekt(id, titel, angelegt, code_hash, notiz)
    datei(id, projekt_id, name, mime, bytes)          -- the script, private
    konfig(projekt_id, json)                          -- casting
    plan(projekt_id, json, bearbeitet)                -- rehearsal plan
    person(id, projekt_id, b, anzeigename, token)
    verfuegbar(person_id, wochentag, von, bis)        -- recurring
    sperre(person_id, von_datum, bis_datum, grund)    -- exceptions
    termin(id, projekt_id, probe_id, start, bestaetigt)

### Subdomain

`joku.tv` sits on Hetzner nameservers, so the subdomain `theater.joku.tv`
would be created in the Hetzner DNS as an A record pointing at the machine's
address.

## What became of it

The reasoning above held up. These decisions did not:

* **No subdomain.** `theater.joku.tv` was abandoned in favour of the path
  `joku.tv/theater`. The static site stays on Apache, the existing
  certificate keeps working, and PHP is untouched.
* **Apache instead of Caddy.** The hosting's own Node.js switch turned out to
  be broken, so Apache passes `/theater` through with `mod_proxy`
  (`server/htaccess.txt`). This is the better arrangement anyway.
* **Files instead of PostgreSQL.** A project is a few hundred kilobytes, never
  written by two people at once, and looked up by three keys. Files are
  enough, and they let the application run locally with no setup — which is
  half the battle while developing. PostgreSQL is still there behind the same
  interface and is used as soon as `PGUSER` is set.
* **One record, not eight tables.** Instead of the data model above there is
  one JSON document per project. Attachments that would bloat that document —
  audio tracks, the uploaded original — live beside it in a store of their
  own.
* **The rehearsal plan is computed on the server**, which was the open
  question at the end of the original plan. It is less clicking for the
  director.
* **Grown beyond the plan:** revising the plan by hand, a view of the
  passages of a single rehearsal, an audiobook spoken by ElevenLabs, printable
  documents behind stable URLs, and a calendar view for the company.
