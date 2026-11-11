// Keeps the Block Party plate on the relay server: applies every builder's edits in arrival order, sends them back in chunks with author + new-block credit, hands late joiners the whole plate.

import { createBuildBoard, isValidOp, OPS_PER_MESSAGE } from './build-board.js';

const FLUSH_MS = 60;

/**
 * room: server view of the relay room ({ lobbyHost, players, send(data, { to }) }).
 * Lobby host sends { g: 'run' } (fresh plate) / { g: 'stop' } / { g: 'clear' } / { g: 'load', o: flat plate }.
 * Any builder sends { g: 'op', o: [[x, y, z, color], ...] } and { g: 'hello' } (asks for the plate).
 * Server sends { g: 'ops', o: [[x, y, z, color, author, isNewBlock 0/1], ...] } and { g: 'full', o: flat plate, pl: [[id, blocks], ...] }.
 */
export function createBuildServerHost(room) {
  let board = null, outbox = [], lastFlushMs = 0;

  const fullPlate = () => ({ g: 'full', o: board.encode(), pl: [...board.placed] });

  function applyOps(ops, author) {
    if (!Array.isArray(ops)) return;
    for (const op of ops.slice(0, OPS_PER_MESSAGE)) {
      if (!isValidOp(op)) continue;
      const [x, y, z, color] = op, prev = board.set(x, y, z, color);
      if (prev === undefined || prev === color) continue;
      const fresh = board.isNewBlock(x, y, z, color, prev);
      if (fresh) board.credit(author);
      outbox.push([x, y, z, color, author, fresh ? 1 : 0]);
    }
  }

  // whole plate replaced: queued edits are stale, everyone gets the new plate
  function replacePlate(flat) {
    board.load(flat);
    outbox = [];
    room.send(fullPlate());
  }

  function onLobbyHostData(data) {
    if (data.g === 'run') { board = createBuildBoard(); outbox = []; room.send(fullPlate()); }
    else if (data.g === 'stop') board = null;
    else if (!board) return;
    else if (data.g === 'clear') replacePlate([]);
    else if (data.g === 'load') replacePlate(data.o);
  }

  function flush() {
    while (outbox.length) room.send({ g: 'ops', o: outbox.splice(0, OPS_PER_MESSAGE) });
  }

  return {
    get running() { return !!board; },
    // relay-stats: no jitter queue here (edits apply in arrival order)
    takeQueueStats: () => null,
    onData(data, from) {
      if (from === room.lobbyHost && data) onLobbyHostData(data);
      if (!board) return;
      if (data?.g === 'op') applyOps(data.o, from);
      else if (data?.g === 'hello') room.send(fullPlate(), { to: from });
    },
    onRoster() {},
    tick(nowMs) {
      if (!board || nowMs - lastFlushMs < FLUSH_MS) return;
      lastFlushMs = nowMs;
      flush();
    },
    close() { board = null; },
  };
}
