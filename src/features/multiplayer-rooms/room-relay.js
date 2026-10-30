/**
 * FILE: src/features/multiplayer-rooms/room-relay.js
 * PURPOSE: Node websocket transport for room relay (Render): upgrades sockets, ping/pong dead-socket check, hands messages to relay core
 * UI: every multiplayer toy (via toy-box/common/room-client.js)
 * USED BY: start-server.js, studio-server/start-server.js
 * KEY EXPORTS: createRoomRelay
 */
import { WebSocketServer } from 'ws';
import { createRelayCore } from './room-relay-core.js';

export function createRoomRelay() {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 256 * 1024 });
  const core = createRelayCore();

  wss.on('connection', (ws) => {
    ws.isAlive = true;
    const conn = core.connect({ send: (str) => ws.send(str), close: () => ws.terminate(), isOpen: () => ws.readyState === ws.OPEN });
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
