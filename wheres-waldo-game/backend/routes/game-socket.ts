// Doorway for game clients: /ws websocket, parses ClientMsg and drives Lobby.

import type { Server } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import { Lobby } from '../game-lobby.ts';
import type { ClientMsg, ServerMsg } from '../message-types.ts';

interface Session {
  lobby: Lobby | null;
  playerId: string | null;
}

function send(ws: WebSocket, msg: ServerMsg): void {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
}

// Game > websocket: standalone server owns /ws directly
export function attachWs(http: Server, lobbies: Map<string, Lobby>): void {
  const wss = createWaldoWss(lobbies);
  http.on('upgrade', (req, socket, head) => {
    if ((req.url ?? '').split('?')[0] !== '/ws') return socket.destroy();
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
  });
}

// Game > websocket: one session per socket, routes client msgs to lobby.
// noServer so a host process (3d-toys server) can mount it under any path.
export function createWaldoWss(lobbies: Map<string, Lobby>): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws) => {
    const session: Session = { lobby: null, playerId: null };

    ws.on('message', (raw) => {
      let msg: ClientMsg;
      try {
        msg = JSON.parse(String(raw));
      } catch {
        return send(ws, { t: 'error', message: 'Bad message.' });
      }

      switch (msg.t) {
        case 'create': {
          let code = Lobby.makeCode();
          while (lobbies.has(code)) code = Lobby.makeCode();
          const lobby = new Lobby(code, msg.mode, msg.difficulty, () => lobbies.delete(code), msg.theme ?? 'random', msg.panning ?? true);
          lobbies.set(code, lobby);
          const player = lobby.addPlayer(msg.nick, (m) => send(ws, m));
          session.lobby = lobby;
          session.playerId = player.id;
          return;
        }
        case 'join': {
          const lobby = lobbies.get(msg.code.toUpperCase().trim());
          if (!lobby) return send(ws, { t: 'error', message: 'No lobby with that code.' });
          // A dropped player reclaims their seat (and score) by reusing their nick.
          const slot = lobby.reconnectSlotFor(msg.nick);
          if (slot) {
            slot.connected = true;
            slot.send = (m) => send(ws, m);
            session.lobby = lobby;
            session.playerId = slot.id;
            lobby.broadcastLobby();
            return;
          }
          const player = lobby.addPlayer(msg.nick, (m) => send(ws, m));
          session.lobby = lobby;
          session.playerId = player.id;
          return;
        }
        default:
          break;
      }

      const { lobby, playerId } = session;
      if (!lobby || !playerId) return send(ws, { t: 'error', message: 'Join a lobby first.' });

      switch (msg.t) {
        case 'config':
          lobby.configure(msg.mode, msg.difficulty, msg.theme, msg.panning);
          break;
        case 'start': {
          const err = lobby.start(playerId);
          if (err) send(ws, { t: 'error', message: err });
          break;
        }
        case 'place': {
          const err = lobby.place(playerId, msg.x, msg.y);
          if (err) send(ws, { t: 'error', message: err });
          break;
        }
        case 'click':
          lobby.click(playerId, msg.x, msg.y);
          break;
        case 'next': {
          const err = lobby.next(playerId);
          if (err) send(ws, { t: 'error', message: err });
          break;
        }
      }
    });

    ws.on('close', () => {
      if (session.lobby && session.playerId) session.lobby.disconnect(session.playerId);
    });
  });
  return wss;
}
