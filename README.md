# rehearsalcall

Tools for rehearsing a stage play: personalised scripts, part books, a
rehearsal plan for small groups, and an audiobook read from the script.
Written for „Der nackerte Waunsinn" (after Michael Frayn, *Noises Off*) at
the Tassilobühne in Bad Hall, Austria.

**The text of the play is under copyright and is not part of this
repository.** Only the software is published; every company brings its own
script. For trying things out, two public-domain plays by Shakespeare come
along in [`beispiel/shakespeare/`](beispiel/shakespeare).

## Quick start with Docker

    git clone https://github.com/toprach/rehearsalcall.git
    cd rehearsalcall
    cp /somewhere/theater-md.html .        # the parsing tool, see werkzeug/ below
    cp .env.example .env                   # and put a secret in THEATER_GEHEIMNIS
    docker compose up -d
    docker compose exec theater node theater-code.mjs new "Title of the play"

The last line prints the access code for the director. The application
answers on `127.0.0.1:3011`; put a reverse proxy with TLS in front of it
and set `THEATER_BASIS` in `.env` to the address visitors see. Storage is
one JSON file per project in a named volume. For PostgreSQL instead, set
`WITH_POSTGRES=true` and `PGUSER`/`PGPASSWORD` in `.env` and start with
`docker compose --profile postgres up -d --build` - details under
[Running it in a container](#running-it-in-a-container).

To try it, upload `beispiel/shakespeare/a-midsummer-nights-dream.md` as
the script. Without Docker, `cd server && node app.js` needs nothing but
Node 20 or newer; the same environment variables apply.

How a script must be formatted to be read is described in
[DREHBUCH-FORMAT.md](DREHBUCH-FORMAT.md). For trying things out,
[`beispiel/`](beispiel) holds a short, entirely invented play together with
two castings — an ordinary one and one with a play within the play — and
[`beispiel/shakespeare/`](beispiel/shakespeare) two complete plays from
Project Gutenberg, *A Midsummer Night's Dream* and *Macbeth*, with a
converter for any other Gutenberg play and a worked prompt book for the
*Dream*. The Shakespeare texts keep the Gutenberg way of naming the
speaker (`BANQUO.` alone on its line); the reader recognises that style
by itself.

A server edition runs at [joku.tv/theater](https://joku.tv/theater) so that
several companies can work with it and rehearsal dates are found
automatically — see [SERVER-PLAN.md](SERVER-PLAN.md). It ships as a
container; see [Running it in a container](#running-it-in-a-container).

One part is **not** published here: `werkzeug/theater-md.html`, the tool
that reads a `.docx`. The server needs it, so whoever runs the software
supplies it — see [werkzeug/](#werkzeug) below.

## probenplan/

Finds passages that can be rehearsed in small groups. At its centre is a
transformation that takes the percentage threshold out of the arithmetic:
give every word of an absent person the weight λ = (1−p)/p, and a passage has
a positive sum exactly when the share read by the director stays below p.
What we look for are the longest passages with a positive sum.

Group size is weighed through the difficulty of finding a date: if each
person is free on a given evening with probability q, a date for |G| people
works out with q^|G|. At q = 0.5, every further person doubles the effort.

At length in [REGELWERK.md](probenplan/REGELWERK.md), including the
measurement of which substitution share actually pays off.

    node probenplan/probenplan.mjs struktur.json --substitution 20 --max 5

## server/

The server edition, as it runs at
[joku.tv/theater](https://joku.tv/theater): Node with no build step,
server-rendered HTML. The director gets in with an access code, every company
member through a link of their own.

The road leads from the script all the way to the date: upload a `.docx` →
assign the speakers → derive the rehearsal plan → collect availability →
dates.

**There is only one parser.** `theater/script.mjs` does not reimplement
reading `.docx`; it loads `werkzeug/theater-md.html` and runs its script in a
context of its own, with a stand-in where the browser would be. That way the
tool and the server cannot drift apart.

The heart of it is the date arithmetic in `theater/dates.mjs`. Each person
enters **once** when they are generally free and when they are away; from
that follows, for every evening, who can come. A rehearsal fits when its
whole cast can. The director enters nothing: they count as free on every
evening and strike, for everyone, the days on which nothing can happen.
Dates are assigned **by scarcity** — the rehearsal with the
fewest possible evenings first. Otherwise the small groups, which are easy to
schedule, take exactly the evenings that were the only ones on which the big
scene would have been possible.

Separate polls per combination would be many times the work and still could
not do the arithmetic; that is where the ready-made tools fail (Rallly,
Framadate, Nuudel): there, one poll is always one date.

**Demo projects.** With `THEATER_DEMO` pointing at `beispiel/shakespeare`
(the Docker image does that by itself), the start page offers *A
Midsummer Night's Dream* and *Macbeth* as demo projects: in as the
director without a code, or through the company link. Anyone may change
them; once an hour the server puts back every demo that is a day old.
Uploading a script and the audiobook are switched off in them.

Members mostly come on a phone. The four places they go sit in a bar at
the bottom of the screen, and the part book has a screen edition next to
the A4 one: passage by passage with its cue, and a **learning mode** that
hides the own lines until they are revealed, steps to the next passage
and remembers which passages sit. A review mode goes through what is
learnt already, a back button shows the passage before once more, and
after ten minutes of practice a round of applause asks whether to go on
now or tomorrow. Pages are light by default; a switch in the head turns
them dark.

The part book can also **remind** a member every day at a time of their
choosing: the phone subscribes to push messages, and the server sends
the figures of the day (due, new) at the next quarter hour on the
phone's own clock - a clock inside the service, no cron entry. Web Push is done with nothing but `node:crypto` (RFC 8291 and
8292); the server needs a key pair in `.env`, made once with
`node theater-code.mjs push-keys` (`THEATER_PUSH_PUBLIC`,
`THEATER_PUSH_PRIVATE`). Without it the page does not offer reminders.
On the iPhone this works once the page is on the home screen as an app.

A script is uploaded more than once while rehearsals run. Every version
is kept, and the page shows what changed from one to the next as a list
of speeches (changed, new, cut - formatting does not count), printable
as a change sheet for the company. The rehearsal plan is not thrown
away: every passage is anchored to the speaker and first words of its
first and last speech and found again in the new text. Only when an
anchor is gone does the director get a warning that the plan may no
longer fit there, with the choice to derive it again.

Besides that road, the server also shows the **passages** of a single
rehearsal — what is actually spoken there, with the lines the director has to
read set apart — it lets the plan be **revised by hand**, and it can have an
**audiobook** spoken by ElevenLabs: the whole play, one act, or just one
rehearsal.

Storage is one JSON file per project, so the application runs locally with no
setup and **no dependencies** — `npm install` fetches nothing. PostgreSQL is
optional: `npm install pg`, set `PGUSER`, and it is used instead — one
interface, two back ends.

    node theater-code.mjs new "Title of the project" regie@example.org   # project and access code
    node theater-code.mjs list                                           # overview

The same can be done in the browser: with `THEATER_ADMIN` set in `.env`,
`/theater/admin` lists the projects, creates one (the director's email
address is required, so that a code can be sent again later), hands out
a new access code, and deletes a project with everything attached to
it. The program still sends nothing itself - the page shows the code
once and offers a ready-made email to send. Guessing the key is braked
the same way as guessing an access code. Without `THEATER_ADMIN` the
page does not exist.

Credentials come from a `.env` next to `app.js`; there is a template in
[`server/.env.beispiel`](server/.env.beispiel). Apache passes `/theater`
through to the service, see [`server/htaccess.txt`](server/htaccess.txt);
`server/theater-start.sh` keeps it alive from the crontab.

`THEATER_KONTAKT` is the address the entry page names for anyone who has
no access code yet; leave it unset and the page says to ask whoever runs
the installation. The page footer links to `/theater/ueber`, which shows
the version (from `server/package.json`), the repository, author and
licence.

## Running it in a container

    cp .env.example .env          # and put a secret in THEATER_GEHEIMNIS
    cp /somewhere/theater-md.html .
    docker compose up -d

The application then answers on `127.0.0.1:3011`. Put a reverse proxy in
front of it for TLS, and set `THEATER_BASIS` to the address visitors
actually see - behind a proxy that cannot be worked out from the request,
and the links handed to the company would carry `127.0.0.1` instead.

**The parsing tool is not in the image.** `theater-md.html` is not part
of this repository (see below), and the server needs it to read `.docx`.
compose mounts it read-only from beside `compose.yaml`. Without it the
application starts and answers, but uploading a script fails with a
message saying exactly that.

Storage is one JSON file per project in a named volume - backing up
means copying `theater-data`. That needs nothing but Node, so **the
default image carries no dependencies at all**: no `node_modules`, just
the base image and the sources.

PostgreSQL is optional and stays out of the image unless asked for. Set
in `.env`

    WITH_POSTGRES=true
    PGUSER=theater
    PGPASSWORD=...

and start with

    docker compose --profile postgres up -d --build

`WITH_POSTGRES` builds the `pg` driver in; `PGUSER` is what switches the
application over. The driver is loaded only then - without `PGUSER` it is
never touched, so leaving it out costs nothing.

Access codes are made inside the container:

    docker compose exec theater node theater-code.mjs new "Company name"

## werkzeug/

`theater-md.html` is **not published with this repository**. It is a
single file you open in a browser, with no server and no installation; it
reads a script as `.docx` or `.md` and produces the script with speaker
names resolved, the part books, the rehearsal plan drawn in, a structure
JSON and an FDX file for ElevenLabs.

The server needs it: `theater/script.mjs` loads it and runs its script
rather than reimplementing the parser, so that the two cannot drift
apart. Put the file at `werkzeug/theater-md.html`, or point
`THEATER_WERKZEUG` at it.

`theater.html` - the older, simpler forerunner for plain text files.


## audio/

Speech for an excerpt through ElevenLabs, one voice per person, with emotions
derived from the stage directions. The key comes from `ELEVENLABS_API_KEY` or
from a `.env` beside it and does not belong in the repository.

The rules that turn a stage direction into an audio tag live in
`server/theater/emotion.mjs`. There is one copy, and both sides use it.
The same goes for the scene search: `probenplan/` calls the server's
modules rather than holding a second implementation of it.


## Calendars

Every member has a calendar feed at `/theater/ich/<token>/kalender.ics`:
fixed rehearsals ("Rehearsal P04: me + ANNA"), proposals as tentative,
the own evenings as transparent events, each linking into the app. On the
availability page a member can add their own calendars (ICS addresses or
a downloaded .ics file); those stay in the browser and are never sent to
the server. Reading them uses [ical.js](https://github.com/kewisch/ical.js)
(Mozilla Public License 2.0), vendored under `server/theater/static/vendor/`.

## A note on language

The interface speaks English by default and German as the first
translation; a switch sits in the page header. Adding a language means
copying `server/theater/texts/de.mjs`, translating the right-hand side
and registering it in `texts.mjs` — nothing else.

The code and its comments are English. Two things stay German on
purpose, because they are contracts rather than code:

* **URL paths.** `/theater/druck/<token>/rolle/NAME` is printed in part
  books already handed out; renaming it would break every link in
  circulation.
* **The field names inside a stored record** — `personen`, `drehbuch`,
  `skript`, `plan`, `termine`. Part of that shape comes straight from the
  parsing tool (see DREHBUCH-FORMAT.md), and installations already
  running hold their data in it. Renaming would force a migration and buy
  nothing.

The example play and the words used in access codes are German too —
they are content, not code.


## Ideas, questions, bugs

Ideas and questions go to [Discussions](https://github.com/toprach/rehearsalcall/discussions)
(categories *Ideas* and *Q&A*); a concrete wish or a bug becomes an
[issue](https://github.com/toprach/rehearsalcall/issues/new/choose) - the
templates ask the few questions that make it understandable without you
in the room. German or English, as you like.

## Licence

MIT, see [LICENSE](LICENSE).
