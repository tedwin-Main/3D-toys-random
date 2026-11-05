// Provides Node WebSocket transport for room relay with heartbeat checks.

import { WebSocketServer } from 'ws';
import { createRelayCore } from './room-relay-core.js';
import { createRelayStats } from './relay-stats.js';
import { hostedGames } from './hosted-games.js';

const HOSTED_TICK_MS = 1000 / 60;

// Relay CPU is mostly one writev syscall per frame: cork a socket on its first frame this event-loop turn,
// uncork all at the end of the turn, so a burst (31 guests' inputs to the host) leaves in one write. No added delay.
function createTurnBatcher() {
  const corked = new Set();
  const flush = () => { for (const sock of corked) sock.uncork(); corked.clear(); };
  return (ws, frame, binary) => {
    const sock = ws._socket;
    if (sock && !corked.has(sock)) {
      if (!corked.size) setImmediate(flush);
      sock.cork();
      corked.add(sock);
    }
    ws.send(frame, { binary });
  };
}

export function createRoomRelay(opts) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 256 * 1024 });
  const core = createRelayCore({ hostedGames, ...opts });
  const sendBatched = createTurnBatcher();
  const stats = createRelayStats();

  wss.on('connection', (ws) => {
    ws.isAlive = true;
    const send = (frame, binary = false) => { stats.sent(); sendBatched(ws, frame, binary); };
    const conn = core.connect({ send, close: () => ws.terminate(), isOpen: () => ws.readyState === ws.OPEN });
    ws.on('pong', () => (ws.isAlive = true));
    ws.on('message', (raw, binary) => stats.timed(() => core.message(conn, raw, binary)));
    ws.on('close', () => core.close(conn));
  });

  // heartbeat: protocol ping drops dead sockets; core sweep drops silent (frozen/bfcached) pages
  const beat = setInterval(() => {
    for (const ws of wss.clients) {
      if (!ws.isAlive) { ws.terminate(); continue; }
      ws.isAlive = false;
      ws.ping();
    }
    core.sweep();
  }, 5000);
  beat.unref();
  // server-run hosts (party royale) count fixed 60 Hz steps from wall time; idle rooms return at once
  startGridTimer(HOSTED_TICK_MS, () => stats.hosted(() => core.tickHosted(performance.now())));

  return {
    handleUpgrade(req, socket, head) { wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req)); },
    rooms: core.rooms,
    // GET /3d-toys/relay-stats: last 10 s window plus live counts (no player data)
    stats: () => ({ ...stats.latest(), rooms: core.rooms.size, conns: core.size, hostedQueues: core.hostedQueues() }),
  };
}

// Calls fn on an exact period grid (setInterval rounds 16.67 ms to whole ms and drifts, so some calls ran 2 steps at once
// and guests could not line their inputs up with the tick); after a stall the grid restarts instead of bursting.
function startGridTimer(periodMs, fn) {
  let next = performance.now() + periodMs;
  const beat = () => {
    fn();
    next += periodMs;
    const now = performance.now();
    if (now - next > 5 * periodMs) next = now;
    setTimeout(beat, Math.max(0, next - now)).unref();
  };
  setTimeout(beat, periodMs).unref();
}
