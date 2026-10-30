/**
 * FILE: src/features/toy-box/common/room-client.js
 * PURPOSE: browser side of room relay: join/create room by code (Cloudflare relay first, same-origin Render relay fallback), roster + host tracking, send to all, one peer, or host
 * UI: every multiplayer toy (through room-lobby.js)
 * USED BY: components/room-lobby.js, multiplayer toy pages
 * KEY EXPORTS: connectRoom, startTicker
 */

const CLOUD_RELAY = 'wss://toy-rooms.tedwin1996.workers.dev/3d-toys/rooms';
const CONNECT_TIMEOUT_MS = 4000;

// absolute path so toys work both standalone and inside shell iframe
function sameOriginRelay() {
  const url = new URL('/3d-toys/rooms', location.href);
  url.protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.href;
}
// Cloud Sync > relay order: ?relay=cloud|local forces one; localhost/LAN stay on own server (offline dev, LAN parties)
function relayUrls() {
  const force = new URLSearchParams(location.search).get('relay');
  if (force === 'cloud') return [CLOUD_RELAY];
  if (force === 'local') return [sameOriginRelay()];
  const lan = /^(localhost|127\.|\[::1\]|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(location.hostname);
  return lan ? [sameOriginRelay()] : [CLOUD_RELAY, sameOriginRelay()];
}
const unreachable = () => Object.assign(new Error('Room server unreachable. Start it: cd 3d-toys && npm start'), { unreachable: true });

// Cloud Sync > join: tries each relay in order; moves on only when one is unreachable (not on "Room is full")
export async function connectRoom(opts) {
  let err;
  for (const url of relayUrls()) {
    try { return await openRoom(url, opts); } catch (e) { err = e; if (!e.unreachable) break; }
  }
  throw err;
}

// Cloud Sync > one relay: resolves with live room handle once server confirms seat
function openRoom(url, { game, nick, room }) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    // hung socket (blocked host, dead edge): give up so next relay gets a turn
    const giveUp = setTimeout(() => { if (!joined) { reject(unreachable()); ws.close(); } }, CONNECT_TIMEOUT_MS);
    const handlers = { data: new Set(), roster: new Set(), host: new Set(), close: new Set() };
    const emit = (type, ...args) => handlers[type].forEach((fn) => fn(...args));
    let joined = false;

    const r = {
      me: null, code: null, color: null, slot: 0, host: null, players: [],
      get isHost() { return this.me === this.host; },
      player(id) { return this.players.find((p) => p.id === id); },
      // opts.to = one peer id; opts.sticky = host state replayed to late joiners
      send(data, opts = {}) {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ t: 'send', data, to: opts.to, sticky: !!opts.sticky }));
      },
      // guest input: host only, other guests never read it
      toHost(data) { this.send(data, { to: this.host }); },
      on(type, fn) { handlers[type].add(fn); return () => handlers[type].delete(fn); },
      leave() { ws.close(); },
    };

    ws.onopen = () => ws.send(JSON.stringify({ t: 'join', game, nick, room }));
    // bfcache keeps a frozen page (and its socket) alive; a frozen host would stall the room
    addEventListener('pagehide', () => ws.close(), { once: true });
    // app-level heartbeat from a worker: frozen pages stop sending, so server drops them (protocol pongs come from the browser even when frozen)
    const hb = startTicker(0.2, () => { if (ws.readyState === WebSocket.OPEN) ws.send('{"t":"hb"}'); });
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.t === 'joined') {
        joined = true;
        clearTimeout(giveUp);
        Object.assign(r, { me: m.id, code: m.room, host: m.host, color: m.color, slot: m.slot });
        resolve(r);
      } else if (m.t === 'error') {
        if (!joined) { reject(new Error(m.message)); ws.close(); }
      } else if (m.t === 'roster') {
        const was = r.isHost;
        r.host = m.host;
        r.players = m.players;
        emit('roster', r.players);
        if (was !== r.isHost) emit('host', r.isHost);
      } else if (m.t === 'data') emit('data', m.data, m.from);
    };
    ws.onerror = () => { if (!joined) reject(unreachable()); };
    ws.onclose = () => { hb(); clearTimeout(giveUp); if (joined) emit('close'); else reject(unreachable()); };
  });
}

// Run engine: steady sim tick from a worker; rAF + main-thread timers stall in background tabs, which would freeze a hosting tab for everyone
export function startTicker(hz, fn) {
  const src = `setInterval(() => postMessage(0), ${1000 / hz});`;
  const w = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
  let last = performance.now();
  w.onmessage = () => {
    const now = performance.now();
    fn(Math.min((now - last) / 1000, 0.1));
    last = now;
  };
  return () => w.terminate();
}
