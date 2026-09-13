/* ---------------------------------------------------------------------
   The Node service behind Apache.

   Apache serves the static site and passes only /theater and /gesund
   through here by way of .htaccess. So this service deals with the
   rehearsal planning alone; static files stay in the document root and
   are served by Apache.

   The application lives outside public_html - otherwise node_modules
   would be visible through the web server.
   --------------------------------------------------------------------- */

import http from 'node:http';
import { handle, storage } from './theater/index.mjs';
import * as Demo from './theater/demo.mjs';

const PORT = Number(process.env.PORT || 3011);
const HOST = process.env.HOST || '127.0.0.1';

/* Use up the request body, even when the answer did not read it.

   Somebody uploading a large file while signed out used to get a 401 in
   the middle of sending - the browser was not finished, Apache reset the
   HTTP/2 stream, and the browser showed ERR_HTTP2_PROTOCOL_ERROR instead
   of being asked to sign in.                                           */
function drainRest(request) {
  if (request.readableEnded || request.destroyed) return;
  request.on('error', () => {});
  request.resume();
}

/* Record every request with its duration and size. Without that there
   is no telling afterwards whether a request even arrived. */
function log(request, response, path, started) {
  const ms = Date.now() - started;
  const incoming = Number(request.headers['content-length'] || 0);
  console.log('[' + new Date().toISOString() + '] ' +
    (request.method || '?').padEnd(4) + ' ' + path + ' -> ' + response.statusCode +
    '  ' + ms + ' ms' + (incoming ? '  ' + Math.round(incoming / 1024) + ' KB in' : '') +
    '  ' + Math.round(process.memoryUsage().rss / 1048576) + ' MB');
}

const server = http.createServer(async (request, response) => {
  const path = (request.url || '/').split('?')[0];
  const started = Date.now();
  response.on('finish', () => {
    if (path !== '/gesund') log(request, response, path, started);
  });
  response.on('close', () => {
    if (!response.writableFinished)
      console.error('[' + new Date().toISOString() + '] ABORTED ' +
        (request.method || '?') + ' ' + path + '  after ' + (Date.now() - started) + ' ms');
  });
  try {
    if (path === '/gesund') {
      response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      return response.end('ok');
    }
    if (path === '/theater' || path.startsWith('/theater/')) {
      await handle(request, response, path);
      return drainRest(request);
    }

    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found.');
    drainRest(request);
  } catch (e) {
    console.error('[' + new Date().toISOString() + '] ' + path + ': ' + (e && e.stack || e));
    if (!response.headersSent) {
      response.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end('<h1>Something went wrong</h1>' +
                   '<p>Please try again. <a href="/theater">Back</a></p>');
    } else response.end();
    drainRest(request);
  }
});

await storage.setUp();

/* The demo projects: made when missing, put back every 24 hours. The
   check runs at start and once an hour, in the background - deriving
   a plan for a big cast takes a while, and the service should answer
   meanwhile. */
Demo.ensureAll();
setInterval(() => Demo.ensureAll(), 60 * 60 * 1000).unref();

server.listen(PORT, HOST, () => {
  console.log('[' + new Date().toISOString() + '] Rehearsal Planner ready on ' +
              HOST + ':' + PORT + ', Node ' + process.version);
});

for (const sig of ['SIGTERM', 'SIGINT'])
  process.on(sig, () => {
    console.log('[' + new Date().toISOString() + '] ' + sig + ' – shutting down');
    server.close(() => process.exit(0));
  });

process.on('uncaughtException', e =>
  console.error('[' + new Date().toISOString() + '] unexpected: ' + (e && e.stack || e)));
