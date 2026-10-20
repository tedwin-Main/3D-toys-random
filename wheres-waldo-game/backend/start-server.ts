// Single-process game server: static hosting of the built client plus the
// /ws doorway (backend/routes/game-socket.ts), so the whole thing deploys as one container.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import type { Lobby } from './game-lobby.ts';
import { attachWs } from './routes/game-socket.ts';

const PORT = Number(process.env.PORT ?? 8787);
const DIST = join(import.meta.dirname, '..', 'dist');

const lobbies = new Map<string, Lobby>();

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json'
};

const http = createServer(async (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200).end('ok');
    return;
  }
  // Serve the production bundle when it exists; in dev, Vite serves the client.
  try {
    const rel = normalize(decodeURIComponent((req.url ?? '/').split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    let file = join(DIST, rel === '/' ? 'index.html' : rel);
    const found = await stat(file).catch(() => null);
    if (!found || found.isDirectory()) file = join(DIST, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});

attachWs(http, lobbies);

http.listen(PORT, () => {
  console.log(`waldo server on :${PORT}  (ws at /ws)`);
});
