# rehearsalcall

Rehearsal planning for theatre companies. Node without a build step,
server-rendered HTML; `server/` is the application, `probenplan/` the
scene search, `beispiel/` example plays. Read `README.md` and
`DREHBUCH-FORMAT.md` for what it does and what it reads.

## Contracts – do not rename

URL paths (`/theater/projekt`, `/theater/druck/<token>/rolle/NAME` …),
the field names inside a stored project record (`personen`, `drehbuch`,
`skript`, `plan`, `termine`, `verfuegbar[].tage/von/bis` …), the values
of `zuordnung[].art` and of form `action` fields are **German on
purpose** and are in circulation. Code, comments, local names and
interfaces between modules are English. Texts live in
`server/theater/texts/en.mjs` and `de.mjs`, nowhere else.

## What is not here

The parsing tool `theater-md.html` is not in this repository (see
README). Never commit it, never commit credentials, play texts under
copyright, or real names except the author's. `git status` before every
commit.

## Testing

    cd server
    node test/render.mjs
    THEATER_WERKZEUG=<path to theater-md.html> THEATER_DATEN=/tmp/theater-daten \
      HOST=127.0.0.1 PORT=3203 THEATER_GEHEIMNIS=probe THEATER_BASIS=http://127.0.0.1:3203 \
      THEATER_ADMIN=test node app.js &
    node theater-code.mjs new "Throwaway"          # prints the access code
    THEATER_ADMIN=test node test/workflow.mjs http://127.0.0.1:3203 <code> \
      ../beispiel/shakespeare/a-midsummer-nights-dream.md

Both must be green before a change is pushed. `index.mjs`, `script.mjs`
and the text catalogues have CRLF line endings; keep them.

## Deploying

Not from here. The server behind joku.tv, its deploy scripts and the
private material live in the private repository `toprach/jokutv`.
