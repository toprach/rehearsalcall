/* ---------------------------------------------------------------------
   Managing access codes.

   Run on the server, in the directory ~/theater-app:

     node theater-code.mjs new "Example Players" [regie@example.org]
     node theater-code.mjs list                           all projects
     node theater-code.mjs code <project-id>              set a new code

   A code is shown once and afterwards kept only as a hash. It goes to
   the director by mail; the address is kept with the project so that
   it can be sent again. The same can be done in the browser at
   /theater/admin, with THEATER_ADMIN set.
   --------------------------------------------------------------------- */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// Take the credentials from .env, the same way the service does.
const envFile = path.join(HERE, '.env');
if (fs.existsSync(envFile)) {
  for (const row of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const i = row.indexOf('=');
    if (i > 0 && !row.trim().startsWith('#'))
      process.env[row.slice(0, i).trim()] = row.slice(i + 1).trim();
  }
}

const S = await import('./theater/storage.mjs');

/* The codes themselves are made in storage.mjs - the admin page makes
   them the same way. */
const newCode = S.newCode;

const [, , command, ...rest] = process.argv;
await S.setUp();

if (command === 'new' || command === 'neu') {
  // A last word with an @ in it is the director's address.
  const email = rest.length > 1 && /@/.test(rest[rest.length - 1]) ? rest.pop() : '';
  const title = rest.join(' ').trim();
  if (!title) {
    console.error('Usage: node theater-code.mjs new "Title of the project" [email]');
    process.exit(1);
  }
  const code = newCode();
  const p = await S.newProject(title, code, email);
  console.log('');
  console.log('  Project:      ' + p.titel);
  console.log('  Id:           ' + p.id);
  if (email) console.log('  Director:     ' + email);
  console.log('  Access code:  ' + code);
  console.log('');
  console.log('  Send this code to the director. It is not shown again.');
  console.log('  Entry: ' + (process.env.THEATER_BASIS || 'https://joku.tv') + '/theater');
  console.log('');
} else if (command === 'list' || command === 'liste') {
  const all = await S.allProjects();
  if (!all.length) console.log('  No projects yet.');
  for (const p of all) {
    const withEntry = Object.values(p.verfuegbar || {})
      .filter(v => Object.keys(v.tage || {}).length || (v.wochentage || []).length).length;
    console.log(`  ${p.id}  ${String(p.titel).padEnd(34)} ` +
                `${String(p.plan?.proben?.length || 0).padStart(3)} rehearsals  ` +
                `${String((p.personen || []).length).padStart(2)} people  ` +
                `${withEntry} with availability` +
                (p.regie_email ? '  ' + p.regie_email : ''));
  }
} else if (command === 'code') {
  const p = await S.read(rest[0]);
  if (!p) { console.error('  No project with that id.'); process.exit(1); }
  const code = newCode();
  p.code_streuwert = S.hashOf(code);
  await S.write(p);
  console.log(`\n  ${p.titel}\n  New access code: ${code}\n`);
  console.log('  The old one no longer works.\n');
} else if (command === 'clear' || command === 'leeren') {
  const p = await S.read(rest[0]);
  if (!p) { console.error('  No project with that id.'); process.exit(1); }
  const before = Object.keys(p.verfuegbar || {}).length;
  p.verfuegbar = {};
  await S.write(p);
  console.log('');
  console.log('  ' + p.titel);
  console.log('  ' + before + ' availability entries deleted.');
  console.log('  People and the rehearsal plan stay.');
  console.log('');
} else if (command === 'move' || command === 'umziehen') {
  // From PostgreSQL into files - or the other way round, depending on
  // what is set at the moment. The target is whichever side is not in
  // use.
  const target = rest[0];
  if (target !== 'files' && target !== 'postgresql') {
    console.error('  Usage: node theater-code.mjs move files|postgresql');
    process.exit(1);
  }
  if (target === S.storageKind) {
    console.log('  ' + target + ' is already in use.');
  } else {
    const all = await S.allProjects();
    console.log(`  ${all.length} projects read from ${S.storageWhere()}`);
    // Load the other side with the environment switched over.
    if (target === 'files') delete process.env.PGUSER;
    else if (!process.env.PGUSER) {
      console.error('  PostgreSQL credentials are missing (PGUSER).');
      process.exit(1);
    }
    const T = await import('./theater/storage.mjs?target=' + target);
    await T.setUp();
    for (const p of all) { await T.write(p); console.log('    ' + p.id + '  ' + p.titel); }
    console.log(`  written to ${T.storageWhere()}`);
    await T.shutDown();
  }
} else {
  console.log('  Storage: ' + S.storageWhere());
  console.log('');
  console.log('  node theater-code.mjs new "Title"      create a project');
  console.log('  node theater-code.mjs list             list the projects');
  console.log('  node theater-code.mjs code <id>        set a new access code');
  console.log('  node theater-code.mjs clear <id>       delete the availability');
  console.log('  node theater-code.mjs move files|postgresql');
}
await S.shutDown();
