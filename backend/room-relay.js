/**
 * FILE: 3d-toys/backend/room-relay.js
 * PURPOSE: game-agnostic websocket room relay: join by game + 4-letter code, roster, host election + migration, message fan-out
 * UI: every multiplayer toy (via components/room-client.js)
 * USED BY: backend/start-server.js
 * KEY EXPORTS: createRoomRelay
 */
import { WebSocketServer } from 'ws';

const MAX_PLAYERS = 12;
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const COLORS = ['#ff5a5f', '#3fa7ff', '#ffd23f', '#5ee07a', '#c77dff', '#ff9f43', '#2de2e6', '#ff6ec7', '#a3e635', '#f8fafc', '#8b5cf6', '#14b8a6'];

export function createRoomRelay() {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 256 * 1024 });
  const rooms = new Map();
  let nextId = 1;

  const send = (ws, msg) => { if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg)); };
  function makeCode(game) {
    let code;
    do code = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
    while (rooms.has(`${game}:${code}`));
    return code;
  }
  function roster(room) {
    const players = [...room.players.values()].map((p) => ({ id: p.id, nick: p.nick, color: p.color, slot: p.slot }));
    for (const p of room.players.values()) send(p.ws, { t: 'roster', host: room.host, players });
  }

  // Cloud Sync > room join: create or join, pick free color slot, first player hosts
  function join(ws, msg) {
    const game = String(msg.game ?? '').slice(0, 40);
    if (!game) return send(ws, { t: 'error', message: 'Missing game.' });
    let code = String(msg.room ?? '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    if (!code) code = makeCode(game);
    const key = `${game}:${code}`;
    let room = rooms.get(key);
    if (!room) { room = { key, code, game, host: null, players: new Map(), state: null }; rooms.set(key, room); }
    if (room.players.size >= MAX_PLAYERS) return send(ws, { t: 'error', message: 'Room is full.' });
    const used = new Set([...room.players.values()].map((p) => p.slot));
    let slot = 0;
    while (used.has(slot)) slot++;
    const nick = String(msg.nick ?? '').trim().slice(0, 16) || `Player ${slot + 1}`;
    const p = { id: nextId++, nick, slot, color: COLORS[slot % COLORS.length], ws };
    room.players.set(p.id, p);
    if (!room.host) room.host = p.id;
    ws.room = room; ws.player = p;
    send(ws, { t: 'joined', id: p.id, room: code, host: room.host, color: p.color, slot });
    // host-pushed snapshot (e.g. lobby phase) so late joiners render right away
    if (room.state != null) send(ws, { t: 'data', from: room.host, data: room.state });
    roster(room);
  }

  // Cloud Sync > leave: drop player, migrate host to oldest remaining, delete empty room
  function leave(ws) {
    const room = ws.room;
    if (!room) return;
    room.players.delete(ws.player.id);
    ws.room = null;
    if (!room.players.size) return rooms.delete(room.key);
    if (room.host === ws.player.id) room.host = room.players.keys().next().value;
    roster(room);
  }

  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.lastSeen = Date.now();
    ws.on('pong', () => (ws.isAlive = true));
    ws.on('message', (raw) => {
      ws.lastSeen = Date.now();
      let msg;
      try { msg = JSON.parse(String(raw)); } catch { return; }
      if (msg.t === 'join') { if (!ws.room) join(ws, msg); return; }
      const room = ws.room;
      if (!room) return;
      // Cloud Sync > relay: to one peer, or everyone else; host may pin a sticky state for joiners
      if (msg.t === 'send') {
        const out = { t: 'data', from: ws.player.id, data: msg.data };
        if (msg.to != null) { const p = room.players.get(msg.to); if (p) send(p.ws, out); }
        else for (const p of room.players.values()) if (p.id !== ws.player.id) send(p.ws, out);
        if (msg.sticky && ws.player.id === room.host) room.state = msg.data;
      } else if (msg.t === 'leave') leave(ws);
    });
    ws.on('close', () => leave(ws));
  });

  // heartbeat: drop dead sockets and silent (frozen/bfcached) pages so ghosts don't hold host; clients send hb every 5 s
  const beat = setInterval(() => {
    const now = Date.now();
    for (const ws of wss.clients) {
      if (!ws.isAlive || now - ws.lastSeen > 20000) { ws.terminate(); continue; }
      ws.isAlive = false;
      ws.ping();
    }
  }, 5000);
  beat.unref();

  return {
    handleUpgrade(req, socket, head) { wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req)); },
    rooms,
  };
}
