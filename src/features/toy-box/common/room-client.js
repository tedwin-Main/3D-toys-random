// Manages browser client connection to room relay.

import { encodeSend, decodeFrame } from './relay-wire.js';
import { createFastLinks } from './fast-links.js';

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

// direct links need WebRTC; ?nop2p forces relay only (A/B latency checks)
const directLinksAllowed = () => typeof RTCPeerConnection !== 'undefined' && !/[?&]nop2p\b/.test(location.search);

// Cloud Sync > one relay: resolves with live room handle once server confirms seat
// cap = seat cap asked by room creator (relay clamps; default 14)
// fastLinks: open WebRTC links host <> guests; send(data, { fast: true }) then goes direct where a link is open
function openRoom(url, { game, nick, room, cap, fastLinks = false }) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    // hung socket (blocked host, dead edge): give up so next relay gets a turn
    const giveUp = setTimeout(() => { if (!joined) { reject(unreachable()); ws.close(); } }, CONNECT_TIMEOUT_MS);
    const handlers = { data: new Set(), roster: new Set(), host: new Set(), close: new Set() };
    const emit = (type, ...args) => handlers[type].forEach((fn) => fn(...args));
    let joined = false, links = null;

    const r = {
      me: null, code: null, color: null, slot: 0, host: null, players: [],
      get isHost() { return this.me === this.host; },
      player(id) { return this.players.find((p) => p.id === id); },
      // opts.to = one peer id; opts.sticky = host state replayed to late joiners; opts.fast = direct link first (lossy, unordered)
      send(data, opts = {}) {
        const json = JSON.stringify(data);
        const to = opts.fast && links ? sendDirect(json, opts.to) : opts.to;
        if (Array.isArray(to) && !to.length) return;
        if (ws.readyState === WebSocket.OPEN) ws.send(encodeSend(json, { to, sticky: opts.sticky }));
      },
      // guest input: host only, other guests never read it
      toHost(data, opts = {}) { this.send(data, { ...opts, to: this.host }); },
      isDirect(peer) { return !!links?.isOpen(peer); },
      get directCount() { return links?.openCount ?? 0; },
      on(type, fn) { handlers[type].add(fn); return () => handlers[type].delete(fn); },
      leave() { ws.close(); },
    };

    ws.onopen = () => ws.send(JSON.stringify({ t: 'join', game, nick, room, cap }));
    // bfcache keeps a frozen page (and its socket) alive; a frozen host would stall the room
    addEventListener('pagehide', () => ws.close(), { once: true });
    // app-level heartbeat from a worker: frozen pages stop sending, so server drops them (protocol pongs come from the browser even when frozen)
    const hb = startTicker(0.2, () => { if (ws.readyState === WebSocket.OPEN) ws.send('{"t":"hb"}'); });
    ws.onmessage = (e) => {
      let m;
      try { m = decodeFrame(e.data); } catch { return; } // relay passes peer payloads through unchecked: drop bad ones
      if (m.t === 'joined') {
        joined = true;
        clearTimeout(giveUp);
        Object.assign(r, { me: m.id, code: m.room, host: m.host, color: m.color, slot: m.slot });
        if (fastLinks && directLinksAllowed()) links = createFastLinks(r, (data, from) => emit('data', data, from));
        resolve(r);
      } else if (m.t === 'error') {
        if (!joined) { reject(new Error(m.message)); ws.close(); }
      } else if (m.t === 'roster') {
        const was = r.isHost;
        r.host = m.host;
        r.players = m.players;
        links?.sync();
        emit('roster', r.players);
        if (was !== r.isHost) emit('host', r.isHost);
      } else if (m.t === 'data') {
        if (m.data?._rtc) links?.signal(m.from, m.data._rtc);
        else emit('data', m.data, m.from);
      }
    };
    // fast send: direct where a link is open; returns peers still needing the relay (unchanged `to` if none went direct)
    function sendDirect(json, to) {
      const peers = to != null ? [to] : r.players.map((p) => p.id).filter((id) => id !== r.me);
      const rest = peers.filter((id) => !links.trySend(id, json));
      return rest.length === peers.length ? to : rest;
    }
    ws.onerror = () => { if (!joined) reject(unreachable()); };
    ws.onclose = () => { hb(); clearTimeout(giveUp); links?.closeAll(); if (joined) emit('close'); else reject(unreachable()); };
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
