/**
 * FILE: src/features/multiplayer-rooms/room-load-test.js
 * PURPOSE: load-tests room relay: N fake players in one room, host snapshots 20 Hz, guest inputs 20 Hz to host, reports guest-host-guest RTT
 * UI: none (cli)
 * USED BY: npm run load-test (3d-toys/package.json)
 * KEY EXPORTS: none (run: node backend/room-load-test.js [ws-url] [players=14] [seconds=30])
 */
import WebSocket from 'ws';

const URL_ARG = process.argv[2] ?? 'ws://localhost:5055/3d-toys/rooms';
const PLAYERS = Number(process.argv[3] ?? 14);
const SECONDS = Number(process.argv[4] ?? 30);
const HZ = 20;

// ~1 KB snapshot, shaped like a slim sumo snapshot for 14 players
const fakeSnap = () => ({ g: 's', ph: 'fight', t: 12.34, ring: 14.2, rd: 2, win: null, ev: [],
  P: Array.from({ length: PLAYERS }, (_, i) => [i + 1, 3.21, -4.56, 1.23, -2.34, 1.57, 0.5, 5, 0, 1, 0.42, 0]) });

const rtts = [];
let received = 0;

// Load test > one fake player: resolves with { ws, id, host } once seated
function joinPlayer(room) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL_ARG);
    const me = { ws, id: null, host: null };
    ws.on('open', () => ws.send(JSON.stringify({ t: 'join', game: 'load-test', nick: 'bot', room })));
    ws.on('error', reject);
    ws.on('message', (raw) => {
      received++;
      const m = JSON.parse(String(raw));
      if (m.t === 'joined') { me.id = m.id; me.host = m.host; me.code = m.room; resolve(me); }
      else if (m.t === 'roster') me.host = m.host;
      else if (m.t === 'error') reject(new Error(m.message));
      else if (m.t === 'data' && m.data.g === 'ping' && me.id === me.host) send(me, { g: 'pong', ts: m.data.ts }, m.from);
      else if (m.t === 'data' && m.data.g === 'pong') rtts.push(performance.now() - m.data.ts);
    });
  });
}
const send = (p, data, to) => p.ws.send(JSON.stringify({ t: 'send', data, to }));

function percentile(sorted, q) { return sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))] : NaN; }

// Load test > run: host first, guests join its code, traffic for SECONDS, then report
const host = await joinPlayer('');
const guests = [];
for (let i = 1; i < PLAYERS; i++) guests.push(await joinPlayer(host.code));
console.log(`room ${host.code}: ${PLAYERS} players on ${URL_ARG}, ${SECONDS}s`);

const timers = [
  setInterval(() => send(host, fakeSnap()), 1000 / HZ),
  setInterval(() => guests.forEach((g) => send(g, { g: 'i', x: 0.71, z: -0.71, d: 3 }, g.host)), 1000 / HZ),
  setInterval(() => guests.forEach((g) => send(g, { g: 'ping', ts: performance.now() }, g.host)), 500),
];
const t0 = performance.now();
await new Promise((r) => setTimeout(r, SECONDS * 1000));
timers.forEach(clearInterval);
[host, ...guests].forEach((p) => p.ws.close());

const sorted = rtts.sort((a, b) => a - b);
const fmt = (v) => `${v.toFixed(1)} ms`;
console.log(`rtt guest>host>guest  n=${sorted.length}  p50=${fmt(percentile(sorted, 0.5))}  p95=${fmt(percentile(sorted, 0.95))}  max=${fmt(sorted.at(-1) ?? NaN)}`);
console.log(`messages received/s: ${(received / ((performance.now() - t0) / 1000)).toFixed(0)}`);
