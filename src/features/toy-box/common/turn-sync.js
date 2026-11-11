// Connects a turn-based or simultaneous-pick game page to the match the relay server runs: states in, actions out.

import { SERVER_PEER } from './relay-wire.js';

// Multiplayer > Turn sync
// The relay server runs the rules (server-run/turn-server-host.js); every tab, the lobby host included, is a guest of it.
// onState(state): got a newer public state; onDone(): the server ended the match
export function createTurnSync({ onState, onDone = () => {} }) {
  let room = null, version = 0, actionSeq = 0, last = null;

  // s = null: match over, nothing to draw
  function onServerState(data) {
    if (!Number.isFinite(data.v) || data.v <= version) return;
    version = data.v; last = data.s;
    if (data.s) onState(data.s);
  }

  return {
    // lobby onJoin: start listening on this room
    attach(joinedRoom) {
      room = joinedRoom;
      // new room (or relay restart): its server counts versions from 1 again
      version = 0; last = null;
      room.on('data', (data, from) => {
        // only the server's word counts: a player spoofing a state or the match end is ignored
        if (!data || data._lobby || from !== SERVER_PEER) return;
        if (data.g === 'T') onServerState(data);
        else if (data.g === 'done') onDone();
      });
    },
    // seq lets the server drop replays after a reconnect
    act(action) { room?.send({ g: 'A', q: ++actionSeq, a: action }, { to: SERVER_PEER }); },
    // last state seen (late joiners get it from the relay's sticky slot before the lobby start packet)
    get state() { return last; },
  };
}
