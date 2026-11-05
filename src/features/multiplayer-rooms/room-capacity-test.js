// Measures relay CPU, bandwidth and latency per party size with real party royale snapshots, to pick the seat cap.
// Run: npm run capacity-test [seconds per size] [sizes, e.g. 14,24,32,40,50]

import { fork } from 'node:child_process';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import WebSocket from 'ws';
import { encodeSend, encodeSendBytes, decodeFrame } from '../toy-box/common/relay-wire.js';
import { inputEvery } from '../toy-box/common/party-royale/input-sync.js';
import { createRoomRelay } from './room-relay.js';

const SELF = fileURLToPath(import.meta.url);
const RENDER_FREE_CPU_MS = 100; // Render free plan = 0.1 CPU = 100 ms of CPU per second

if (process.argv[2] === '--clients') await runClients(process.argv[3], Number(process.argv[4]), Number(process.argv[5]));
else await runRelay(Number(process.argv[2] ?? 10), (process.argv[3] ?? '14,24,32,40,50').split(',').map(Number));

// Relay side > in-process relay (seat ceiling lifted to measure past 32); load clients run in a child so their CPU is not counted
async function runRelay(seconds, sizes) {
  const relay = createRoomRelay({ maxSeats: 64 });
  const server = http.createServer();
  server.on('upgrade', (req, socket, head) => relay.handleUpgrade(req, socket, head));
  await new Promise((r) => server.listen(0, r));
  const url = `ws://127.0.0.1:${server.address().port}`;
  console.log(`players | snapshot B @ Hz | relay CPU ms/s (free plan budget ${RENDER_FREE_CPU_MS}) | relay out KB/s | guest in KB/s | host in msg/s | RTT p50 / p95 ms`);
  for (const n of sizes) {
    const r = await measure(url, n, seconds);
    console.log(`${String(n).padStart(7)} | ${String(r.snapBytes).padStart(6)} @ ${r.snapHz} | ${r.cpuMs.toFixed(1).padStart(6)} (${Math.round((r.cpuMs / RENDER_FREE_CPU_MS) * 100)}% of free) | ${r.relayOutKB.toFixed(0).padStart(6)} | ${r.guestInKB.toFixed(1).padStart(6)} | ${r.hostInMsgs.toFixed(0).padStart(5)} | ${r.rtt50.toFixed(1)} / ${r.rtt95.toFixed(1)}`);
  }
  server.close();
  process.exit(0);
}

function measure(url, n, seconds) {
  return new Promise((resolve, reject) => {
    const child = fork(SELF, ['--clients', url, String(n), String(seconds)]);
    let cpu0, t0;
    child.on('message', (m) => {
      if (m.ready) { cpu0 = process.cpuUsage(); t0 = performance.now(); }
      if (m.done) {
        const cpu = process.cpuUsage(cpu0), wall = (performance.now() - t0) / 1000;
        resolve({ ...m.done, cpuMs: (cpu.user + cpu.system) / 1000 / wall });
      }
    });
    child.on('error', reject);
  });
}

// Client side > 1 host sending real snapshots + n-1 guests sending input bundles and pings
async function runClients(url, n, seconds) {
  const { snap, every } = await partySnapshot(n);
  const snapHz = 60 / every, snapBytes = snap.length;
  const stats = { bytes: 0, guestBytes: 0, hostMsgs: 0, rtts: [] };
  const host = await joinPlayer(url, '', n, stats, true);
  const guests = [];
  for (let i = 1; i < n; i++) guests.push(await joinPlayer(url, host.code, n, stats, false));
  // worst case: every guest on the relay (no direct links)
  const inputTicks = inputEvery({ fast: false, guests: n - 1 });
  const bundle = { g: 'i', s: 1, rk: '3-1234567890', I: Array(inputTicks).fill([0.71, -0.71, 3, 1, 0]) };
  process.send({ ready: true });
  Object.assign(stats, { bytes: 0, guestBytes: 0, hostMsgs: 0, rtts: [] });
  const t0 = performance.now();
  const timers = [
    setInterval(() => host.ws.send(encodeSendBytes(snap)), 1000 / snapHz),
    setInterval(() => guests.forEach((g) => send(g, bundle, g.host)), (1000 / 60) * inputTicks),
    setInterval(() => guests.forEach((g) => send(g, { g: 'ping', ts: performance.now() }, g.host)), 500),
  ];
  await new Promise((r) => setTimeout(r, seconds * 1000));
  timers.forEach(clearInterval);
  const wall = (performance.now() - t0) / 1000, sorted = stats.rtts.sort((a, b) => a - b);
  const pct = (q) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))] ?? NaN;
  process.send({ done: { snapBytes, snapHz, relayOutKB: stats.bytes / wall / 1024, guestInKB: stats.guestBytes / (n - 1) / wall / 1024, hostInMsgs: stats.hostMsgs / wall, rtt50: pct(0.5), rtt95: pct(0.95) } });
  [host, ...guests].forEach((p) => p.ws.close());
  setTimeout(() => process.exit(0), 200);
}

function joinPlayer(url, room, cap, stats, isHost) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url), me = { ws, id: null, host: null, code: null };
    ws.on('open', () => ws.send(JSON.stringify({ t: 'join', game: 'capacity-test', nick: 'bot', room, cap })));
    ws.on('error', reject);
    ws.on('message', (raw, binary) => {
      const len = raw.length ?? Buffer.byteLength(String(raw));
      stats.bytes += len;
      if (!isHost) stats.guestBytes += len; else stats.hostMsgs++;
      if (binary) return; // snapshot bytes: counted, not parsed
      const m = decodeFrame(String(raw));
      if (m.t === 'joined') { Object.assign(me, { id: m.id, host: m.host, code: m.room }); resolve(me); }
      else if (m.t === 'roster') me.host = m.host;
      else if (m.t === 'error') reject(new Error(m.message));
      else if (m.t === 'data' && m.data.g === 'ping' && isHost) send(me, { g: 'pong', ts: m.data.ts }, m.from);
      else if (m.t === 'data' && m.data.g === 'pong') stats.rtts.push(performance.now() - m.data.ts);
    });
  });
}

function send(p, data, to) { p.ws.send(encodeSend(JSON.stringify(data), { to })); }

// mid-race Spinner Gauntlet snapshot with n beans (real row sizes, events included)
async function partySnapshot(n) {
  const { createRoundSim } = await import('../toy-box/common/party-royale/round-sim.js');
  const { packSnapshot, encodeSnapshot, snapEvery } = await import('../toy-box/common/party-royale/round-snapshot.js');
  const { default: round } = await import('../toy-box/common/party-royale/rounds/spinner-gauntlet.js');
  const roster = Array.from({ length: n }, (_, i) => ({ id: i + 1, nick: `p${i + 1}`, color: '#fff', bot: i > 0 }));
  const sim = createRoundSim({ round, seed: 7, roster, keep: Math.ceil(n * 0.7) });
  for (let i = 0; i < 60 * 8; i++) { sim.step(); if (i % 4 === 0) sim.events.length = 0; }
  const snap = encodeSnapshot(packSnapshot(sim, () => 1234, '3-1234567890'));
  // worst case: every guest on the relay
  return { snap, every: snapEvery({ bytes: snap.length, relayGuests: n - 1, directGuests: 0 }) };
}
