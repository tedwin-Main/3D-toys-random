/**
 * FILE: RANDOM_dump/3d-toys/components/room-client.js
 * PURPOSE: browser side of room relay: join/create room by code, roster + host tracking, send to all or one peer
 * UI: every multiplayer toy (through room-lobby.js)
 * USED BY: components/room-lobby.js, multiplayer toy pages
 * KEY EXPORTS: connectRoom, startTicker
 */

// Cloud Sync > join: resolves with live room handle once server confirms seat
export function connectRoom({ game, nick, room }) {
  return new Promise((resolve, reject) => {
    // absolute path so toys work both standalone and inside shell iframe
    const url = new URL('/3d-toys/rooms', location.href);
    url.protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(url);
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
    ws.onerror = () => { if (!joined) reject(new Error('Room server unreachable. Start it: cd 3d-toys && npm start')); };
    ws.onclose = () => { hb(); if (joined) emit('close'); };
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
