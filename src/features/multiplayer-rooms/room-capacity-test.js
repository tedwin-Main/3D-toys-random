// Measures relay CPU, bandwidth and input confirm time per party size with the relay running real party royale rounds, to pick the seat cap.
// Run: npm run capacity-test [seconds per size] [human counts, e.g. 14,24,32] [bots filling the rest of 32 seats: 0 / fill]

import { fork } from 'node:child_process';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import WebSocket from 'ws';
import { encodeSend, decodeFrame, SERVER_PEER } from '../toy-box/common/relay-wire.js';
import { inputEvery } from '../toy-box/common/party-royale/input-sync.js';
import { decodeSnapshot } from '../toy-box/common/party-royale/round-snapshot.js';
import { createRoomRelay } from './room-relay.js';

const SELF = fileURLToPath(import.meta.url);
const RENDER_FREE_CPU_MS = 150; // Render free instance cpu_limit reads 0.15 = 150 ms of CPU per second
const ROUND = 'spinner-gauntlet'; // single-round page: replays the round with everyone, no eliminations between rounds

if (process.argv[2] === '--clients') await runClients(process.argv[3], Number(process.argv[4]), Number(process.argv[5]), Number(process.argv[6]));
else await runRelay(Number(process.argv[2] ?? 10), (process.argv[3] ?? '14,24,32').split(',').map(Number), process.argv[4] === 'fill');

// Relay side > in-process relay running the rounds; load clients run in a child so their CPU is not counted
async function runRelay(seconds, sizes, fillBots) {
  const relay = createRoomRelay();
  const server = http.createServer();
  server.on('upgrade', (req, socket, head) => relay.handleUpgrade(req, socket, head));
  await new Promise((r) => server.listen(0, r));
  const url = `ws://127.0.0.1:${server.address().port}`;
  console.log(fillBots ? 'bots fill every room to 32 beans' : 'humans only');
  console.log(`players | snapshot B @ Hz | relay CPU ms/s incl. sim (free limit ${RENDER_FREE_CPU_MS}) | relay out KB/s | guest in KB/s | inputs in /s | confirm p50 / p95 ms`);
  for (const n of sizes) {
    const r = await measure(url, n, seconds, fillBots ? 32 - n : 0);
    console.log(`${String(n).padStart(7)} | ${String(r.snapBytes).padStart(6)} @ ${r.snapHz} | ${r.cpuMs.toFixed(1).padStart(6)} (${Math.round((r.cpuMs / RENDER_FREE_CPU_MS) * 100)}% of free) | ${r.relayOutKB.toFixed(0).padStart(6)} | ${r.guestInKB.toFixed(1).padStart(6)} | ${r.inputsIn.toFixed(0).padStart(5)} | ${r.confirm50.toFixed(1)} / ${r.confirm95.toFixed(1)}`);
  }
  server.close();
  process.exit(0);
}

function measure(url, n, seconds, bots) {
  return new Promise((resolve, reject) => {
    const child = fork(SELF, ['--clients', url, String(n), String(seconds), String(bots)]);
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

// Client side > n humans: the lobby host starts the round on the relay, everyone sends input bundles like a browser guest
async function runClients(url, n, seconds, bots) {
  const stats = { bytes: 0, guestBytes: 0, snaps: 0, snapBytes: 0, inputs: 0, confirms: [] };
  const players = [];
  for (let i = 0; i < n; i++) players.push(await joinPlayer(url, players[0]?.code ?? '', n, stats, i === n - 1));
  send(players[0], { g: 'run', bots });
  await new Promise((r) => setTimeout(r, 4000)); // round intro
  const every = inputEvery(n), sentAt = new Map();
  let seq = 0;
  process.send({ ready: true });
  Object.assign(stats, { bytes: 0, guestBytes: 0, snaps: 0, snapBytes: 0, inputs: 0, confirms: [] });
  const t0 = performance.now();
  const timer = setInterval(() => {
    const s = seq + 1;
    seq += every;
    sentAt.set(seq, performance.now());
    for (const p of players) if (p.round) send(p, { g: 'i', s, rk: p.round.rk, I: Array(every).fill([0.71, -0.71, 3, 1, 0]) });
    stats.inputs += players.length;
  }, (1000 / 60) * every);
  players.at(-1).onAck = (ack) => { const t = sentAt.get(ack); if (t != null) { stats.confirms.push(performance.now() - t); sentAt.delete(ack); } };
  await new Promise((r) => setTimeout(r, seconds * 1000));
  clearInterval(timer);
  const wall = (performance.now() - t0) / 1000, sorted = stats.confirms.sort((a, b) => a - b);
  const pct = (q) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))] ?? NaN;
  const rate = stats.snaps / wall, snapHz = [60, 30, 20, 15].reduce((a, b) => (Math.abs(b - rate) < Math.abs(a - rate) ? b : a));
  process.send({ done: { snapBytes: Math.round(stats.snapBytes / Math.max(1, stats.snaps)), snapHz, relayOutKB: stats.bytes / wall / 1024, guestInKB: stats.guestBytes / wall / 1024, inputsIn: stats.inputs / wall, confirm50: pct(0.5), confirm95: pct(0.95) } });
  players.forEach((p) => p.ws.close());
  setTimeout(() => process.exit(0), 200);
}

// one human; `watched` also counts its snapshots and reads its own ack from them
function joinPlayer(url, room, cap, stats, watched) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url), me = { ws, id: null, code: null, round: null, onAck: null };
    ws.on('open', () => ws.send(JSON.stringify({ t: 'join', game: ROUND, nick: 'bot', room, cap })));
    ws.on('error', reject);
    ws.on('message', (raw, binary) => {
      stats.bytes += raw.length;
      if (watched) stats.guestBytes += raw.length;
      if (binary) return watched && readSnapshot(me, raw, stats);
      const m = decodeFrame(String(raw));
      if (m.t === 'joined') { Object.assign(me, { id: m.id, code: m.room }); resolve(me); }
      else if (m.t === 'error') reject(new Error(m.message));
      else if (m.t === 'data' && m.data.g === 'r') me.round = m.data;
    });
  });
}

function readSnapshot(me, raw, stats) {
  const bar = raw.indexOf('|'.charCodeAt(0)), bytes = new Uint8Array(raw.subarray(bar + 1));
  stats.snaps++; stats.snapBytes += bytes.length;
  const snap = me.round && decodeSnapshot(bytes, me.round.R.map(([id]) => id));
  const mine = snap?.P.find((row) => row[0] === me.id);
  if (mine?.[12]) me.onAck?.(mine[12]);
}

function send(p, data) { p.ws.send(encodeSend(JSON.stringify(data), { to: SERVER_PEER })); }
