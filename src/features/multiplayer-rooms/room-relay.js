// Provides Node WebSocket transport for room relay with heartbeat checks.

import { WebSocketServer } from 'ws';
import { createRelayCore } from './room-relay-core.js';

// Relay CPU is mostly one writev syscall per frame: cork a socket on its first frame this event-loop turn,
// uncork all at the end of the turn, so a burst (31 guests' inputs to the host) leaves in one write. No added delay.
function createTurnBatcher() {
  const corked = new Set();
  const flush = () => { for (const sock of corked) sock.uncork(); corked.clear(); };
  return (ws, frame) => {
    const sock = ws._socket;
    if (sock && !corked.has(sock)) {
      if (!corked.size) setImmediate(flush);
      sock.cork();
      corked.add(sock);
    }
    ws.send(frame, { binary: false });
  };
}

export function createRoomRelay(opts) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 256 * 1024 });
  const core = createRelayCore(opts);
  const sendBatched = createTurnBatcher();

  wss.on('connection', (ws) => {
    ws.isAlive = true;
    const conn = core.connect({ send: (frame) => sendBatched(ws, frame), close: () => ws.terminate(), isOpen: () => ws.readyState === ws.OPEN });
    ws.on('pong', () => (ws.isAlive = true));
    ws.on('message', (raw) => core.message(conn, raw));
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

  return {
    handleUpgrade(req, socket, head) { wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req)); },
    rooms: core.rooms,
  };
}
