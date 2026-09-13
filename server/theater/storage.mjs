/* ---------------------------------------------------------------------
   Storage.

   A project is a record of a few hundred kilobytes. Never more than one
   writer at a time, and it is looked up by three keys. Files are enough
   for that.

   So there are two back ends behind one interface:

     files         one JSON file per project. The default.
                   Backing up means copying a directory. And the
                   application runs locally with nothing to set up first
                   - while developing, that is half the battle.

     PostgreSQL    taken as soon as PGUSER is set. A project is a row,
                   its content JSONB. The driver is loaded on demand and
                   is not a dependency of this package - whoever wants it
                   installs pg.

   Beside that there is an ATTACHMENT store for things that do not
   belong in the record - audio tracks, the uploaded original. The
   record is rewritten whole on every change, and an audiobook weighs
   more than everything else together.

   Every access the application makes goes through this module.

   NOTE ON NAMES: the field names INSIDE a stored record stay German -
   personen, drehbuch, skript, plan, termine and so on. They are a data
   format, not code: part of it comes straight from the parsing tool
   (see DREHBUCH-FORMAT.md), and installations already running hold
   records in that shape. Renaming them would force a migration and buy
   nothing. The code around them speaks English.
   --------------------------------------------------------------------- */

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

/* ---------- shared tools ---------- */

/* Random characters with nothing to confuse: no 0/O, no 1/l/I.

   randomInt rather than randomBytes with a remainder: 256 does not
   divide evenly by 31, so the first eight letters would come up a
   little more often. For access tokens that matters.                  */
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
export function randomId(length = 10) {
  let s = '';
  for (let i = 0; i < length; i++) s += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return s;
}

/* Access codes are never stored in the clear. */
export const hashOf = code =>
  crypto.createHash('sha256').update(String(code).trim().toLowerCase()).digest('hex');

/* An access code: six characters from the alphabet above - letters
   and digits, nothing that can be misread. 31^6, around 887 million
   possibilities; with the brake in throttle.mjs that is out of reach
   of guessing. Codes that were made earlier keep working: only the
   hash is stored.                                                     */
export const newCode = () => randomId(6);

const isId = x => /^[a-z0-9]{4,32}$/.test(String(x || ''));
const isToken = x => /^[a-z0-9]{8,40}$/.test(String(x || ''));

/* ===================================================================
   Back end 1: files
   =================================================================== */

const DIRECTORY = process.env.THEATER_DATEN ||
  path.join(process.env.HOME || process.env.USERPROFILE || '.', 'theater-daten');

const fileOf = id => path.join(DIRECTORY, id + '.json');
/* The suffix stays as it was: an audiobook costs real credit to
   generate, and a renamed directory would orphan the ones already
   there. */
const blobPath = (id, name) => path.join(DIRECTORY, id + '.beilagen', name);

/* Attachment names only ever come from the program, but a name that
   led out of the directory would be a quiet hole. */
const isBlobName = x => /^[a-z0-9][a-z0-9._-]{0,60}$/i.test(String(x || '')) &&
                        !String(x).includes('..');

const fileStore = {
  kind: 'files',
  where: DIRECTORY,

  async setUp() {
    await fs.mkdir(DIRECTORY, { recursive: true, mode: 0o700 });
  },

  async read(id) {
    if (!isId(id)) return null;
    try { return JSON.parse(await fs.readFile(fileOf(id), 'utf8')); }
    catch { return null; }
  },

  async allProjects() {
    const names = await fs.readdir(DIRECTORY).catch(() => []);
    const out = [];
    for (const n of names.sort()) {
      if (!n.endsWith('.json')) continue;
      const p = await this.read(n.slice(0, -5));
      if (p) out.push(p);
    }
    return out;
  },

  /* Write beside it first, then rename. If something breaks mid-write,
     the old version is still whole.                                   */
  async write(project) {
    project.geaendert = new Date().toISOString();
    const target = fileOf(project.id);
    const scratch = target + '.' + process.pid + '.new';
    await fs.writeFile(scratch, JSON.stringify(project, null, 1), { mode: 0o600 });
    await fs.rename(scratch, target);
    return project;
  },

  async search(matches) {
    for (const p of await this.allProjects()) if (matches(p)) return p;
    return null;
  },

  /* The record and its attachments. Nothing else refers to a project
     by id, so nothing else has to be cleaned up. */
  async deleteProject(id) {
    if (!isId(id)) return false;
    let there = true;
    try { await fs.access(fileOf(id)); } catch { there = false; }
    await fs.rm(fileOf(id), { force: true });
    await fs.rm(path.join(DIRECTORY, id + '.beilagen'), { recursive: true, force: true });
    return there;
  },

  async shutDown() { /* nothing to close */ },

  /* ---- attachments: one subdirectory per project ---- */

  async putBlob(id, name, content) {
    if (!isId(id) || !isBlobName(name)) throw new Error('illegal attachment name');
    await fs.mkdir(path.dirname(blobPath(id, name)), { recursive: true, mode: 0o700 });
    await fs.writeFile(blobPath(id, name), content, { mode: 0o600 });
  },

  async appendBlob(id, name, content) {
    if (!isId(id) || !isBlobName(name)) throw new Error('illegal attachment name');
    await fs.mkdir(path.dirname(blobPath(id, name)), { recursive: true, mode: 0o700 });
    await fs.appendFile(blobPath(id, name), content, { mode: 0o600 });
  },

  async getBlob(id, name) {
    if (!isId(id) || !isBlobName(name)) return null;
    try { return await fs.readFile(blobPath(id, name)); } catch { return null; }
  },

  async blobSize(id, name) {
    if (!isId(id) || !isBlobName(name)) return 0;
    try { return (await fs.stat(blobPath(id, name))).size; } catch { return 0; }
  },

  async dropBlob(id, name) {
    if (!isId(id) || !isBlobName(name)) return;
    await fs.rm(blobPath(id, name), { force: true });
  },
};

/* ===================================================================
   Back end 2: PostgreSQL
   =================================================================== */

async function buildDatabase() {
  /* The driver is loaded only here, and only when PGUSER is set - so it
     does not have to be installed at all for the ordinary case. That is
     why it is not a dependency in package.json. */
  let pg;
  try {
    ({ default: pg } = await import('pg'));
  } catch {
    throw new Error(
      'PGUSER is set, so PostgreSQL is wanted - but the driver is not installed.\n' +
      '  npm install pg                                (plain Node)\n' +
      '  docker build --build-arg WITH_POSTGRES=true   (container)\n' +
      '  Or unset PGUSER: then one JSON file per project is used, which needs nothing.');
  }
  const pool = new pg.Pool({
    host: process.env.PGHOST || '127.0.0.1',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE || process.env.PGUSER,
    max: 4,
    idleTimeoutMillis: 30000,
  });
  pool.on('error', e => console.error('[database] ' + e.message));

  const fromRow = r => r ? Object.assign(r.daten, {
    id: r.id, titel: r.titel, code_streuwert: r.code_streuwert,
    angelegt: r.angelegt, geaendert: r.geaendert,
  }) : null;

  return {
    kind: 'postgresql',
    where: (process.env.PGDATABASE || process.env.PGUSER) + ' on ' +
           (process.env.PGHOST || '127.0.0.1'),
    pool,

    /* The column names stay as they were: an existing installation
       should not have to migrate for a translation.                  */
    async setUp() {
      await pool.query(`
        create table if not exists projekt (
          id             text primary key,
          titel          text not null,
          code_streuwert text not null unique,
          angelegt       timestamptz not null default now(),
          geaendert      timestamptz not null default now(),
          daten          jsonb not null
        );`);
      await pool.query(`
        create table if not exists beilage (
          projekt_id text not null references projekt(id) on delete cascade,
          name       text not null,
          inhalt     bytea not null,
          primary key (projekt_id, name)
        );`);
    },

    async read(id) {
      if (!isId(id)) return null;
      const r = await pool.query('select * from projekt where id = $1', [id]);
      return fromRow(r.rows[0]);
    },

    async allProjects() {
      const r = await pool.query('select * from projekt order by angelegt');
      return r.rows.map(fromRow);
    },

    async write(project) {
      const data = { ...project };
      for (const k of ['id', 'titel', 'code_streuwert', 'angelegt', 'geaendert'])
        delete data[k];
      await pool.query(`
        insert into projekt (id, titel, code_streuwert, daten)
             values ($1, $2, $3, $4)
        on conflict (id) do update
           set titel = excluded.titel, daten = excluded.daten, geaendert = now()`,
        [project.id, project.titel, project.code_streuwert, data]);
      return project;
    },

    /* Three keys are searched for; at this number of projects, walking
       them is fast enough and saves three indexes.                    */
    async search(matches) {
      for (const p of await this.allProjects()) if (matches(p)) return p;
      return null;
    },

    /* The attachments go with it: the table refers to the project with
       "on delete cascade". */
    async deleteProject(id) {
      if (!isId(id)) return false;
      const r = await pool.query('delete from projekt where id = $1', [id]);
      return r.rowCount > 0;
    },

    /* ---- attachments: one table, content as bytea ----

       Appending uses ||. For audio tracks that is a few hundred writes
       of a few kilobytes each - enough for this, and it saves a second
       store beside the database.                                     */

    async putBlob(id, name, content) {
      await pool.query(`
        insert into beilage (projekt_id, name, inhalt) values ($1, $2, $3)
        on conflict (projekt_id, name) do update set inhalt = excluded.inhalt`,
        [id, name, content]);
    },

    async appendBlob(id, name, content) {
      await pool.query(`
        insert into beilage (projekt_id, name, inhalt) values ($1, $2, $3)
        on conflict (projekt_id, name) do update
           set inhalt = beilage.inhalt || excluded.inhalt`,
        [id, name, content]);
    },

    async getBlob(id, name) {
      const r = await pool.query(
        'select inhalt from beilage where projekt_id = $1 and name = $2', [id, name]);
      return r.rows[0] ? r.rows[0].inhalt : null;
    },

    async blobSize(id, name) {
      const r = await pool.query(
        'select length(inhalt) as n from beilage where projekt_id = $1 and name = $2',
        [id, name]);
      return r.rows[0] ? Number(r.rows[0].n) : 0;
    },

    async dropBlob(id, name) {
      await pool.query('delete from beilage where projekt_id = $1 and name = $2',
                       [id, name]);
    },

    async shutDown() { await pool.end(); },
  };
}

/* ===================================================================
   Facade
   =================================================================== */

const S = process.env.PGUSER ? await buildDatabase() : fileStore;

export const storageKind = S.kind;
export const storageWhere = () => S.kind + ' (' + S.where + ')';

export const read = id => S.read(id);
export const allProjects = () => S.allProjects();
export const write = p => S.write(p);
export const setUp = () => S.setUp();
export const shutDown = () => S.shutDown();
export const deleteProject = id => S.deleteProject(id);

/* Attachments. The name is free to choose, but carries no path. */
export const putBlob = (id, name, content) => S.putBlob(id, name, content);
export const appendBlob = (id, name, content) => S.appendBlob(id, name, content);
export const getBlob = (id, name) => S.getBlob(id, name);
export const blobSize = (id, name) => S.blobSize(id, name);
export const dropBlob = (id, name) => S.dropBlob(id, name);

export const findByCode = code => {
  const h = hashOf(code);
  return S.search(p => p.code_streuwert === h);
};

export const findByGroupToken = t =>
  isToken(t) ? S.search(p => p.gruppen_token === t) : Promise.resolve(null);

export const findByDirectorToken = t =>
  isToken(t) ? S.search(p => p.regie_token === t) : Promise.resolve(null);

export const findByPrintToken = t =>
  isToken(t) ? S.search(p => p.druck_token === t) : Promise.resolve(null);

export async function findByPersonToken(t) {
  if (!isToken(t)) return null;
  const project = await S.search(p => (p.personen || []).some(x => x.token === t));
  if (!project) return null;
  const person = project.personen.find(x => x.token === t);
  return person ? { project, person } : null;
}

export async function newProject(title, code, email = '') {
  const p = {
    id: randomId(8),
    titel: String(title || 'Untitled').slice(0, 120),
    code_streuwert: hashOf(code),
    angelegt: new Date().toISOString(),
    regie_email: String(email || '').trim().slice(0, 200),   // whom the code went to
    personen: [],        // { id, b, name, token }
    drehbuch: null,      // { quelle, markdown, sprecher, schriften }
    zuordnung: null,     // speaker name -> what it is
    skript: null,        // the structure from the tool
    plan: null,          // the derived rehearsal plan
    verfuegbar: {},      // personId -> { tage, stand }
    termine: [],         // { probe_id, iso, von, bis, ort, bestaetigt }
    einstellungen: {},   // bis, buehnen
  };
  await S.write(p);
  return p;
}
