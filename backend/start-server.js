/**
 * FILE: 3d-toys/backend/start-server.js
 * PURPOSE: one-port server for whole toy box: static toys under /3d-toys/, room relay socket for multiplayer toys
 * UI: every 3D Toy Box page (static), multiplayer toys (websocket)
 * USED BY: npm start (3d-toys/package.json)
 * KEY EXPORTS: none (boots http server on PORT, default 5055)
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { networkInterfaces } from 'node:os';
import { createRoomRelay } from './room-relay.js';

const PORT = Number(process.env.PORT ?? 5055);
const ROOT = join(import.meta.dirname, '..');
const BASE = '/3d-toys/';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wasm': 'application/wasm',
  '.mp3': 'audio/mpeg',
  '.md': 'text/markdown; charset=utf-8',
};

// Run engine: resolve url under a root dir; null when it escapes root
function safeJoin(root, rel) {
  const p = normalize(join(root, rel));
  return p === root || p.startsWith(root + sep) ? p : null;
}

async function sendFile(res, file) {
  const body = await readFile(file);
  res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-cache' }).end(body);
}

// Run engine: static hosting; folders serve index.html
const http = createServer(async (req, res) => {
  const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (path === '/health') return res.writeHead(200).end('ok');
  if (path === '/' || path === '/3d-toys') return res.writeHead(302, { location: BASE }).end();
  if (!path.startsWith(BASE)) return res.writeHead(404).end('not found');
  // Multiplayer > Lobby > invite link: LAN address so friends on other devices can join
  if (path === BASE + 'lan.json') {
    const ip = Object.values(networkInterfaces()).flat().find((n) => n && n.family === 'IPv4' && !n.internal)?.address ?? null;
    return res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ ip, port: PORT }));
  }
  try {
    let file = safeJoin(ROOT, path.slice(BASE.length));
    // keep server code + deps private
    const relTop = path.slice(BASE.length).split('/')[0];
    if (!file || ['backend', 'node_modules', 'package.json', 'package-lock.json'].includes(relTop)) return res.writeHead(404).end('not found');
    let st = await stat(file).catch(() => null);
    if (st?.isDirectory()) {
      if (!path.endsWith('/')) return res.writeHead(301, { location: path + '/' }).end();
      file = join(file, 'index.html');
      st = await stat(file).catch(() => null);
    }
    if (!st) return res.writeHead(404).end('not found');
    await sendFile(res, file);
  } catch {
    res.writeHead(500).end('server error');
  }
});

// Cloud Sync: room relay socket for multiplayer toys
const relay = createRoomRelay();
http.on('upgrade', (req, socket, head) => {
  const path = (req.url ?? '').split('?')[0];
  if (path === BASE + 'rooms') return relay.handleUpgrade(req, socket, head);
  socket.destroy();
});

http.listen(PORT, () => console.log(`3d toy box on http://localhost:${PORT}${BASE}  (rooms ws ${BASE}rooms)`));
