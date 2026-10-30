/**
 * FILE: src/features/multiplayer-rooms/room-relay-core.js
 * PURPOSE: transport-free room relay logic: join by game + 4-letter code, roster, host election + migration, message fan-out, silent-socket sweep
 * UI: every multiplayer toy (via toy-box/common/room-client.js)
 * USED BY: room-relay.js (Node ws, Render)
 * KEY EXPORTS: createRelayCore
 */

const MAX_PLAYERS = 14;
const SILENT_MS = 20000; // clients send hb every 5 s; frozen/bfcached pages go quiet
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const COLORS = ['#ff5a5f', '#3fa7ff', '#ffd23f', '#5ee07a', '#c77dff', '#ff9f43', '#2de2e6', '#ff6ec7', '#a3e635', '#f8fafc', '#8b5cf6', '#14b8a6', '#ffb4a2', '#4361ee'];

// sock adapter: { send(str), close(), isOpen() }
export function createRelayCore() {
  const rooms = new Map();
  const conns = new Set();
  let nextId = 1;

  const sendRaw = (conn, str) => { if (conn.sock.isOpen()) conn.sock.send(str); };
  const send = (conn, msg) => sendRaw(conn, JSON.stringify(msg));
  function makeCode(game) {
    let code;
    do code = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
    while (rooms.has(`${game}:${code}`));
    return code;
  }
  function roster(room) {
    const players = [...room.players.values()].map((p) => ({ id: p.id, nick: p.nick, color: p.color, slot: p.slot }));
    const str = JSON.stringify({ t: 'roster', host: room.host, players });
    for (const p of room.players.values()) sendRaw(p.conn, str);
  }

  // Cloud Sync > room join: create or join, pick free color slot, first player hosts
  function join(conn, msg) {
    const game = String(msg.game ?? '').slice(0, 40);
    if (!game) return send(conn, { t: 'error', message: 'Missing game.' });
    let code = String(msg.room ?? '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    if (!code) code = makeCode(game);
    const key = `${game}:${code}`;
    let room = rooms.get(key);
    if (!room) { room = { key, code, game, host: null, players: new Map(), state: null }; rooms.set(key, room); }
    if (room.players.size >= MAX_PLAYERS) return send(conn, { t: 'error', message: 'Room is full.' });
    const used = new Set([...room.players.values()].map((p) => p.slot));
    let slot = 0;
    while (used.has(slot)) slot++;
    const nick = String(msg.nick ?? '').trim().slice(0, 16) || `Player ${slot + 1}`;
    const p = { id: nextId++, nick, slot, color: COLORS[slot % COLORS.length], conn };
    room.players.set(p.id, p);
    if (!room.host) room.host = p.id;
    conn.room = room; conn.player = p;
    send(conn, { t: 'joined', id: p.id, room: code, host: room.host, color: p.color, slot });
    // host-pushed snapshot (e.g. lobby phase) so late joiners render right away
    if (room.state != null) send(conn, { t: 'data', from: room.host, data: room.state });
    roster(room);
  }

  // Cloud Sync > leave: drop player, migrate host to oldest remaining, delete empty room
  function leave(conn) {
    const room = conn.room;
    if (!room) return;
    room.players.delete(conn.player.id);
    conn.room = null;
    if (!room.players.size) return rooms.delete(room.key);
    if (room.host === conn.player.id) room.host = room.players.keys().next().value;
    roster(room);
  }

  // Cloud Sync > relay: to one peer, or everyone else; stringify once per message, not per peer; host may pin a sticky state for joiners
  function relay(conn, msg) {
    const room = conn.room;
    const out = JSON.stringify({ t: 'data', from: conn.player.id, data: msg.data });
    if (msg.to != null) { const p = room.players.get(msg.to); if (p) sendRaw(p.conn, out); }
    else for (const p of room.players.values()) if (p.id !== conn.player.id) sendRaw(p.conn, out);
    if (msg.sticky && conn.player.id === room.host) room.state = msg.data;
  }

  return {
    rooms,
    connect(sock) {
      const conn = { sock, room: null, player: null, lastSeen: Date.now() };
      conns.add(conn);
      return conn;
    },
    message(conn, raw) {
      conn.lastSeen = Date.now();
      const str = String(raw);
      let msg;
      try { msg = JSON.parse(str); } catch { return; }
      // latency probe: bounce straight back, no room work (load test splits network vs relay time)
      if (msg.t === 'echo') return sendRaw(conn, str);
      if (msg.t === 'join') { if (!conn.room) join(conn, msg); return; }
      if (!conn.room) return;
      if (msg.t === 'send') relay(conn, msg);
      else if (msg.t === 'leave') leave(conn);
    },
    close(conn) { leave(conn); conns.delete(conn); },
    // drop silent conns so ghosts don't hold host
    sweep(now = Date.now()) {
      for (const conn of conns) if (now - conn.lastSeen > SILENT_MS) { conn.sock.close(); this.close(conn); }
    },
    get size() { return conns.size; },
  };
}
