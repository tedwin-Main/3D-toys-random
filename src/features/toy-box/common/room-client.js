// Manages browser client connection to room relay.

import { encodeSend, encodeSendBytes, decodeFrame } from './relay-wire.js';
import { IS_PREVIEW, warmUp, markReady } from './preview-mode.js';

const CONNECT_TIMEOUT_MS = 4000;

// absolute path so toys work both standalone and inside shell iframe
function sameOriginRelay() {
  const url = new URL('/3d-toys/rooms', location.href);
  url.protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.href;
}
const unreachable = () => Object.assign(new Error('Room server unreachable. Start it: cd 3d-toys && npm start'), { unreachable: true });

// Cloud Sync > join: page's own server hosts the relay (Render SG in production, localhost / LAN in dev)
export function connectRoom(opts) {
  return openRoom(sameOriginRelay(), opts);
}

// Cloud Sync > one relay: resolves with live room handle once server confirms seat
// cap = seat cap asked by room creator (relay clamps; default 14)
function openRoom(url, { game, nick, room, cap }) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.binaryType = 'arraybuffer';
    // hung socket (blocked host, dead edge): give up so next relay gets a turn
    const giveUp = setTimeout(() => { if (!joined) { reject(unreachable()); ws.close(); } }, CONNECT_TIMEOUT_MS);
    const handlers = { data: new Set(), roster: new Set(), host: new Set(), close: new Set() };
    const emit = (type, ...args) => handlers[type].forEach((fn) => fn(...args));
    let joined = false;

    const r = {
      me: null, code: null, color: null, slot: 0, host: null, players: [],
      get isHost() { return this.me === this.host; },
      player(id) { return this.players.find((p) => p.id === id); },
      // data = JSON-able value, or Uint8Array sent as a binary frame (peers get a Uint8Array back)
      // opts.to = peer id (SERVER_PEER = host the relay runs); opts.sticky = host state replayed to late joiners (JSON only)
      send(data, opts = {}) {
        if (ws.readyState !== WebSocket.OPEN) return;
        const wire = { to: opts.to, sticky: opts.sticky };
        ws.send(data instanceof Uint8Array ? encodeSendBytes(data, wire) : encodeSend(JSON.stringify(data), wire));
      },
      // guest input: host only, other guests never read it
      toHost(data, opts = {}) { this.send(data, { ...opts, to: this.host }); },
      on(type, fn) { handlers[type].add(fn); return () => handlers[type].delete(fn); },
      leave() { ws.close(); },
    };

    ws.onopen = () => ws.send(JSON.stringify({ t: 'join', game, nick, room, cap }));
    // bfcache keeps a frozen page (and its socket) alive; a frozen host would stall the room
    addEventListener('pagehide', () => ws.close(), { once: true });
    // app-level heartbeat from a worker: frozen pages stop sending, so server drops them (protocol pongs come from the browser even when frozen)
    const hb = startTicker(0.2, () => { if (ws.readyState === WebSocket.OPEN) ws.send('{"t":"hb"}'); }, { warm: false });
    ws.onmessage = (e) => {
      let m;
      try { m = decodeFrame(e.data); } catch { return; } // relay passes peer payloads through unchecked: drop bad ones
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

// Run engine: steady sim tick from a worker; rAF + main-thread timers stall in background tabs, which would freeze a hosting tab for everyone.
// Ticks lock to an exact 1/hz grid (setInterval rounds 16.67 ms to 16, so ticks wandered up to a whole tick off the grid
// and the server's input queue held an extra tick to absorb it); after a stall the grid restarts instead of bursting.
// ?preview: fast-forward to mid-game before the first tick; opts = { warm: false } opts out, or { warmStep, isMid, warmSeconds } (see warmUp)
export function startTicker(hz, fn, { warm = true, warmStep = fn, isMid, warmSeconds } = {}) {
  let worker = null, stopped = false;
  const begin = () => { if (!stopped) worker = spawnTickWorker(hz, fn); };
  if (IS_PREVIEW && warm) warmUp(hz, warmStep, { isMid, seconds: warmSeconds }).then(() => { begin(); markReady(); });
  else begin();
  const stop = () => { stopped = true; worker?.terminate(); };
  // move every later tick by ms (positive = later); the server host uses this to land guest inputs just before its tick
  stop.shift = (ms) => worker?.postMessage(ms);
  return stop;
}

function spawnTickWorker(hz, fn) {
  const src = `const P = ${1000 / hz}; let next = performance.now();
    const beat = () => {
      postMessage(0);
      next += P;
      const now = performance.now();
      if (now - next > 5 * P) next = now;
      setTimeout(beat, Math.max(0, next - now));
    };
    onmessage = (e) => { next += e.data; };
    setTimeout(beat, P);`;
  const w = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
  let last = performance.now();
  w.onmessage = () => {
    const now = performance.now();
    fn(Math.min((now - last) / 1000, 0.1));
    last = now;
  };
  return w;
}
