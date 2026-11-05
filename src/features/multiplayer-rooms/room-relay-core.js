// Implements transport-free room relay logic for rooms, roster, and message fan-out.

import { SEND_MARK, parseSendHeader, deliverPrefix } from '../toy-box/common/relay-wire.js';

const DEFAULT_SEATS = 14; // classic party games
export const MAX_SEATS = 32; // party royale shows; see room-capacity-test.js for the CPU + bandwidth numbers behind it
const SILENT_MS = 20000; // clients send hb every 5 s; frozen/bfcached pages go quiet
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const SEND_BYTE = SEND_MARK.charCodeAt(0), BAR_BYTE = '|'.charCodeAt(0);
// first 14 = classic palette; slots 15-32 only appear in party royale rooms
const COLORS = ['#ff5a5f', '#3fa7ff', '#ffd23f', '#5ee07a', '#c77dff', '#ff9f43', '#2de2e6', '#ff6ec7', '#a3e635', '#f8fafc', '#8b5cf6', '#14b8a6', '#ffb4a2', '#4361ee',
  '#e63946', '#06d6a0', '#ffd6a5', '#9b5de5', '#f15bb5', '#00bbf9', '#fee440', '#8ac926', '#ff7b00', '#b5838d', '#56cfe1', '#d9ed92', '#ef476f', '#118ab2', '#ffafcc', '#7f5539', '#cdb4db', '#2ec4b6'];
// sock adapter: { send(str | Buffer as text frame), close(), isOpen() }; maxSeats override only for capacity measurements
export function createRelayCore({ maxSeats = MAX_SEATS } = {}) {
  // creator picks seat cap for room; clamp to 2..maxSeats
  const seatCap = (cap) => Math.max(2, Math.min(maxSeats, Math.floor(Number(cap)) || DEFAULT_SEATS));
  const rooms = new Map();
  const conns = new Set();
  let nextId = 1;

  const sendRaw = (conn, frame) => { if (conn.sock.isOpen()) conn.sock.send(frame); };
  const deliverFrame = (from, payload) => Buffer.concat([Buffer.from(deliverPrefix(from)), payload]);
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
    if (!room) { room = { key, code, game, host: null, players: new Map(), state: null, cap: seatCap(msg.cap) }; rooms.set(key, room); }
    if (room.players.size >= room.cap) return send(conn, { t: 'error', message: 'Room is full.' });
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
    if (room.state) sendRaw(conn, deliverFrame(room.host, room.state));
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

  // Cloud Sync > relay: read the short header only, forward payload bytes untouched; one frame buffer shared by every receiver
  // host may pin a sticky payload for late joiners
  function relay(conn, buf) {
    const head = readSendHeader(buf);
    if (!head) return;
    const room = conn.room, me = conn.player, payload = buf.subarray(head.end + 1);
    const out = deliverFrame(me.id, payload);
    const targets = head.to ? [...new Set(head.to)].map((id) => room.players.get(id)) : room.players.values();
    for (const p of targets) if (p && p !== me) sendRaw(p.conn, out);
    if (head.sticky && me.id === room.host) room.state = Buffer.from(payload);
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
      const buf = typeof raw === 'string' ? Buffer.from(raw) : raw;
      if (buf[0] === SEND_BYTE) { if (conn.room) relay(conn, buf); return; }
      let msg;
      try { msg = JSON.parse(buf.toString()); } catch { return; }
      // latency probe: bounce straight back, no room work (load test splits network vs relay time)
      if (msg.t === 'echo') return sendRaw(conn, buf);
      if (msg.t === 'join') { if (!conn.room) join(conn, msg); return; }
      if (msg.t === 'leave') leave(conn);
    },
    close(conn) { leave(conn); conns.delete(conn); },
    // drop silent conns so ghosts don't hold host
    sweep(now = Date.now()) {
      for (const conn of conns) if (now - conn.lastSeen > SILENT_MS) { conn.sock.close(); this.close(conn); }
    },
    get size() { return conns.size; },
  };
}

// ">to|sticky|payload": header ends at the second bar; null when malformed
function readSendHeader(buf) {
  const first = buf.indexOf(BAR_BYTE, 1), end = first < 0 ? -1 : buf.indexOf(BAR_BYTE, first + 1);
  const head = end < 0 ? null : parseSendHeader(buf.toString('latin1', 1, end));
  return head && { ...head, end };
}
