/**
 * FILE: render-studio/backend/start-server.js
 * PURPOSE: one-port server for whole repo: studio gallery, media with Range streaming, asset list api, 3d-toys static under /3d-toys/, multiplayer room relay
 * UI: every Render Studio screen, every 3D Toy Box page, multiplayer toys (websocket)
 * USED BY: npm start (root package.json, render-studio/package.json), render.yaml
 * KEY EXPORTS: none (boots http server on PORT, default 5066)
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import { extname, join, normalize, sep } from 'node:path';
import { CATEGORIES, TABS, listAssets } from './list-assets.js';
import { createRoomRelay } from '../../3d-toys/backend/room-relay.js';

const PORT = Number(process.env.PORT ?? 5066);
const ROOT = join(import.meta.dirname, '..');
const FRONTEND = join(ROOT, 'frontend');
const MEDIA = join(ROOT, 'media');
const TOYS = join(ROOT, '..', '3d-toys');
const TOYS_BASE = '/3d-toys/';
// toy server code + deps stay private
const TOYS_PRIVATE = ['backend', 'node_modules', 'package.json', 'package-lock.json'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.wasm': 'application/wasm',
  '.mp3': 'audio/mpeg',
  '.md': 'text/markdown; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.hdr': 'image/vnd.radiance',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
};

// Run engine: resolve url under a root dir; null when it escapes root
function safeJoin(root, rel) {
  const p = normalize(join(root, rel));
  return p === root || p.startsWith(root + sep) ? p : null;
}

// Viewer > video: Range requests so Safari plays mp4 + seeking works; streams, never loads whole file
function sendFile(req, res, file, size) {
  const type = MIME[extname(file).toLowerCase()] ?? 'application/octet-stream';
  const head = { 'content-type': type, 'accept-ranges': 'bytes', 'cache-control': 'no-cache' };
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '');
  if (m && (m[1] || m[2])) {
    // bytes=-500 means last 500 bytes
    let start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
    let end = m[1] && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
    if (start >= size || start > end) return res.writeHead(416, { 'content-range': `bytes */${size}` }).end();
    res.writeHead(206, { ...head, 'content-range': `bytes ${start}-${end}/${size}`, 'content-length': end - start + 1 });
    return req.method === 'HEAD' ? res.end() : createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...head, 'content-length': size });
  req.method === 'HEAD' ? res.end() : createReadStream(file).pipe(res);
}

// Run engine: map url to a file: /media/ and /3d-toys/ get their own roots, rest is frontend/; null = blocked
function resolve(path) {
  if (path.startsWith('/media/')) return safeJoin(MEDIA, path.slice('/media/'.length));
  if (path.startsWith(TOYS_BASE)) {
    const rel = path.slice(TOYS_BASE.length);
    return TOYS_PRIVATE.includes(rel.split('/')[0]) ? null : safeJoin(TOYS, rel);
  }
  return safeJoin(FRONTEND, path.slice(1));
}

// Run engine: allowlist only frontend/, media/ and 3d-toys/; tool source + backends stay private
const http = createServer(async (req, res) => {
  const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (path === '/health') return res.writeHead(200).end('ok');
  // no favicon file; 204 keeps console clean
  if (path === '/favicon.ico') return res.writeHead(204).end();
  if (path === '/3d-toys') return res.writeHead(301, { location: TOYS_BASE }).end();
  // Toy Box > Lobby > invite link: LAN address so friends on other devices can join
  if (path === TOYS_BASE + 'lan.json') {
    const ip = Object.values(networkInterfaces()).flat().find((n) => n && n.family === 'IPv4' && !n.internal)?.address ?? null;
    return res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ ip, port: PORT }));
  }
  try {
    // Studio > screen load: asset list + tab labels
    if (path === '/api/assets') {
      const assets = await listAssets(ROOT);
      const categories = CATEGORIES.map(({ id, label, group, subs }) => ({ id, label, group, subs }));
      return res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-cache' }).end(JSON.stringify({ categories, tabs: TABS, assets }));
    }
    let file = resolve(path);
    if (!file) return res.writeHead(404).end('not found');
    let st = await stat(file).catch(() => null);
    if (st?.isDirectory()) {
      if (!path.endsWith('/')) return res.writeHead(301, { location: path + '/' }).end();
      file = join(file, 'index.html');
      st = await stat(file).catch(() => null);
    }
    if (!st?.isFile()) return res.writeHead(404).end('not found');
    sendFile(req, res, file, st.size);
  } catch {
    res.writeHead(500).end('server error');
  }
});

// Cloud Sync: room relay socket for multiplayer toys
const relay = createRoomRelay();
http.on('upgrade', (req, socket, head) => {
  if ((req.url ?? '').split('?')[0] === TOYS_BASE + 'rooms') return relay.handleUpgrade(req, socket, head);
  socket.destroy();
});

http.listen(PORT, () => console.log(`render studio on http://localhost:${PORT}/  toys on ${TOYS_BASE}  (rooms ws ${TOYS_BASE}rooms)`));
