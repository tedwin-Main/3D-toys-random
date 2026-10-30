/**
 * FILE: src/features/toy-box/common/turn-sync.js
 * PURPOSE: state sync for turn-based / simultaneous-pick toys: host publishes whole game state only when it changes (versioned, sticky for late joiners), guests send numbered actions; a promoted guest keeps going from the last state it saw
 * UI: turn-based multiplayer toys (dice, board, artillery)
 * USED BY: bank-or-bust, fence-fields, siege-hills
 * KEY EXPORTS: createTurnSync
 */

// Multiplayer > Turn sync
// onState(state): guest got a newer state; onAction(fromId, action): host got an action (host's own included)
export function createTurnSync({ onState, onAction }) {
  let room = null, ver = 0, seq = 0, last = null;
  const seen = new Map();
  const api = {
    // lobby onJoin: start listening on this room
    attach(r) {
      room = r;
      r.on('data', (d, from) => {
        if (!d || d._lobby) return;
        if (d.g === 'T' && !r.isHost && d.v > ver) { ver = d.v; last = d.s; onState(d.s); }
        if (d.g === 'A' && r.isHost) {
          // websocket keeps order; seq drops replays after a reconnect
          if ((seen.get(from) ?? 0) >= d.q) return;
          seen.set(from, d.q);
          onAction(from, d.a);
        }
      });
    },
    // host: send full state to everyone (late joiners get it from the relay's sticky slot)
    publish(state) {
      if (!room?.isHost) return;
      last = state;
      room.send({ g: 'T', v: ++ver, s: state }, { sticky: true });
    },
    // anyone: host runs it at once, guests send it to host
    act(action) {
      if (!room) return;
      if (room.isHost) onAction(room.me, action);
      else room.toHost({ g: 'A', q: ++seq, a: action });
    },
    // last state seen or published (a guest promoted to host resumes from it)
    get state() { return last; },
    reset() { last = null; seen.clear(); },
  };
  return api;
}
