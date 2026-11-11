// Measures relay CPU, bandwidth and input confirm time per room size with the relay running real matches (party royale round, or a server-run classic game), to pick seat caps and send rates.
// Run: npm run capacity-test [seconds per size] [human counts, e.g. 14,24,32] [bots filling the rest of 32 seats: 0 / fill] [--game=<room game from hosted-games.js>, e.g. kart-party]

import { fork } from 'node:child_process';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import WebSocket from 'ws';
import { encodeSend, decodeFrame, SERVER_PEER } from '../toy-box/common/relay-wire.js';
import { inputEvery, INPUT_SEQ_WRAP } from '../toy-box/common/server-run/relay-budget.js';
import { createSnapshotReader } from '../toy-box/common/party-royale/round-snapshot.js';
import { createRoomRelay } from './room-relay.js';

const SELF = fileURLToPath(import.meta.url);
const RENDER_FREE_CPU_MS = 150; // Render free instance cpu_limit reads 0.15 = 150 ms of CPU per second
const ROUND = 'spinner-gauntlet'; // single-round page: replays the round with everyone, no eliminations between rounds

// Client side > what differs per game: room name, first message, input message, how a frame is read
const PARTY_CLIENT = {
  game: ROUND,
  introMs: 4000,
  run: (bots) => ({ g: 'run', bots }),
  ready: (p) => !!p.round,
  input: (p, firstSeq, every) => ({ g: 'i', s: firstSeq, rk: p.round.rk, I: Array(every).fill([0.71, -0.71, 3, 1, 0]) }),
  ackSeq: (lastSeq) => lastSeq,
  onJson(me, data) { if (data.g === 'r') { me.round = data; me.reader = createSnapshotReader(data.R.map(([id]) => id)); } },
  onBinary: readPartySnapshot,
};
// Classic games > what a busy human sends: stick sweeping a slow circle (x, z), a button press every 2 s, so rows carry real moving numbers and not zeros
const pressCount = (seq) => Math.floor(seq / 120);
const DRIVE = () => ({ g2: 1, s: 0.4, d: 0, it: 0, r: 0, b: 1 });
const walkAndDash = (x, z, seq) => ({ x, z, d: pressCount(seq) });
const CLASSIC_STICK = {
  'kart-party': DRIVE,
  'turbo-ball': DRIVE,
  'bumper-sumo': walkAndDash,
  'hot-potato': walkAndDash,
  'crown-keep': walkAndDash,
  'balloon-battle': walkAndDash,
  'chair-scramble': (x, z, seq) => ({ mx: x, mz: z, dq: pressCount(seq) }),
  'sheepdog-rush': (x, z, seq) => ({ x, z, b: pressCount(seq) }),
  'hex-drop': (x, z, seq) => ({ x, z, j: pressCount(seq) }),
  'floor-is-lava': (x, z, seq) => ({ x, z, j: pressCount(seq) }),
  'splat-turf': (x, z, seq) => ({ x, z, b: pressCount(seq) }),
  // steer on the stick, SLIDE held for 2 s then released for 2 s (worst case: every human sends every tick)
  'penguin-curling': (x, z, seq) => ({ x, h: pressCount(seq) % 2 }),
  // every human tries a putt every tick (far above real play: one message per putt); only the one on turn counts
  'mini-golf': (x, z, seq) => ({ shot: [+(x * 3).toFixed(2), 0.5], q: seq }),
  // a turn every 0.5 s (left / right in turn), boost held 2 s on, 2 s off
  'light-cycles': (x, z, seq) => ({ b: pressCount(seq) % 2, tn: Math.floor(seq / 30), q: [[Math.floor(seq / 30) % 2 ? 1 : -1, -1]] }),
  // sails + helm on the stick, alternating broadsides every 2 s
  'cannon-cove': (x, z, seq) => ({ a: x, b: z, l: pressCount(seq), r: pressCount(seq + 60) }),
  // throttle + turn on the stick, turret sweeping, one shell every 0.5 s
  'tank-brawl': (x, z, seq) => ({ t: x, r: z, a: +(seq / 60).toFixed(2), f: Math.floor(seq / 30) }),
  // one throw at the arena center every 0.5 s
  'snowball-brawl': (x, z, seq) => ({ mx: x, mz: z, ax: 0, az: 0, q: [[Math.floor(seq / 30) + 1, 0, 0]] }),
};
function classicInput(game, p, lastSeq) {
  const stick = CLASSIC_STICK[game];
  if (!stick) throw new Error(`capacity-test: no input shape for --game=${game}`);
  const angle = lastSeq / 90 + p.id;
  return { g: 'i', n: lastSeq % INPUT_SEQ_WRAP, ...stick(+Math.cos(angle).toFixed(2), +Math.sin(angle).toFixed(2), lastSeq) };
}
// server-run classic games: JSON snapshots, A = [id, seq, ...] acks, one input message per send
const classicClient = (game) => ({
  game,
  introMs: 5000, // countdown
  run: (bots) => ({ g: 'run', bots, seed: 7 }),
  ready: () => true,
  input: (p, firstSeq, every) => classicInput(game, p, firstSeq + every - 1),
  ackSeq: (lastSeq) => lastSeq % INPUT_SEQ_WRAP,
  onJson(me, data, stats, bytes) {
    if (data.g !== 's' || !me.watched) return;
    stats.snaps++; stats.snapBytes += bytes;
    const at = data.A?.indexOf(me.id) ?? -1;
    if (at >= 0 && at % 2 === 0) me.onAck?.(data.A[at + 1]);
  },
  onBinary() {},
});
const gameArg = process.argv.find((a) => a.startsWith('--game='))?.slice(7);
const CLIENT = gameArg ? classicClient(gameArg) : PARTY_CLIENT;
const args = process.argv.slice(2).filter((a) => !a.startsWith('--game='));

if (args[0] === '--clients') await runClients(args[1], Number(args[2]), Number(args[3]), Number(args[4]));
else await runRelay(Number(args[0] ?? 10), (args[1] ?? '14,24,32').split(',').map(Number), args[2] === 'fill');

// Relay side > in-process relay running the rounds; load clients run in a child so their CPU is not counted
async function runRelay(seconds, sizes, fillBots) {
  const relay = createRoomRelay();
  const server = http.createServer();
  server.on('upgrade', (req, socket, head) => relay.handleUpgrade(req, socket, head));
  await new Promise((r) => server.listen(0, r));
  const url = `ws://127.0.0.1:${server.address().port}`;
  console.log(`${CLIENT.game}: ${fillBots ? 'bots fill every room to 32 seats' : 'humans only'}`);
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
    const child = fork(SELF, ['--clients', url, String(n), String(seconds), String(bots), ...(gameArg ? [`--game=${gameArg}`] : [])]);
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

// Client side > n humans: the lobby host starts the match on the relay, everyone sends input like a browser guest
async function runClients(url, n, seconds, bots) {
  const stats = { bytes: 0, guestBytes: 0, snaps: 0, snapBytes: 0, inputs: 0, confirms: [] };
  const players = [];
  for (let i = 0; i < n; i++) players.push(await joinPlayer(url, players[0]?.code ?? '', n, stats, i === n - 1));
  send(players[0], CLIENT.run(bots));
  await new Promise((r) => setTimeout(r, CLIENT.introMs));
  const every = inputEvery(n);
  let seq = 0;
  process.send({ ready: true });
  Object.assign(stats, { bytes: 0, guestBytes: 0, snaps: 0, snapBytes: 0, inputs: 0, confirms: [] });
  const t0 = performance.now();
  const timer = setInterval(() => {
    const s = seq + 1;
    seq += every;
    sentByAck.set(CLIENT.ackSeq(seq), performance.now());
    for (const p of players) if (CLIENT.ready(p)) send(p, CLIENT.input(p, s, every));
    stats.inputs += players.length;
  }, (1000 / 60) * every);
  // acks may come back wrapped (classic games): match on the wrapped seq of what was sent
  const sentByAck = new Map();
  players.at(-1).onAck = (ack) => { const t = sentByAck.get(ack); if (t != null) { stats.confirms.push(performance.now() - t); sentByAck.delete(ack); } };
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
    const ws = new WebSocket(url), me = { ws, id: null, code: null, round: null, onAck: null, watched };
    ws.on('open', () => ws.send(JSON.stringify({ t: 'join', game: CLIENT.game, nick: 'bot', room, cap })));
    ws.on('error', reject);
    ws.on('message', (raw, binary) => {
      stats.bytes += raw.length;
      if (watched) stats.guestBytes += raw.length;
      if (binary) return watched && CLIENT.onBinary(me, raw, stats);
      const m = decodeFrame(String(raw));
      if (m.t === 'joined') { Object.assign(me, { id: m.id, code: m.room }); resolve(me); }
      else if (m.t === 'error') reject(new Error(m.message));
      else if (m.t === 'data') CLIENT.onJson(me, m.data, stats, raw.length);
    });
  });
}

function readPartySnapshot(me, raw, stats) {
  const bar = raw.indexOf('|'.charCodeAt(0)), bytes = new Uint8Array(raw.subarray(bar + 1));
  stats.snaps++; stats.snapBytes += bytes.length;
  const snap = me.reader?.read(bytes);
  const mine = snap?.P.find((row) => row[0] === me.id);
  if (mine?.[12]) me.onAck?.(mine[12]);
}

function send(p, data) { p.ws.send(encodeSend(JSON.stringify(data), { to: SERVER_PEER })); }
