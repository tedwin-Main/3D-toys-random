// Connects a classic room game page to a match the relay server runs: lobby host starts / stops it, every page sends input and reads snapshots.

import { SERVER_PEER } from '../relay-wire.js';

const INPUT_EVERY = 2; // sim ticks: 30 Hz input at a 60 Hz ticker

export function createServerMatchClient(lobby) {
  let tickNo = 0;
  return {
    // lobby host asks the relay to run the match; every page (host included) then plays it as a guest
    start({ bots, seed }) {
      tickNo = 0;
      if (lobby.room?.isHost) lobby.room.send({ g: 'run', bots, seed }, { to: SERVER_PEER });
    },
    stop() { if (lobby.room?.isHost) lobby.room.send({ g: 'stop' }, { to: SERVER_PEER }); },
    fromServer: (from) => from === SERVER_PEER,
    // server says the match is over: the lobby host takes the room back to the lobby
    finish() { if (lobby.room?.isHost) lobby.backToLobby(); },
    // call once per sim tick; sends the input built by makeInput() at the input rate
    tickInput(makeInput) {
      if (++tickNo % INPUT_EVERY) return;
      lobby.room?.send({ g: 'i', ...makeInput() }, { to: SERVER_PEER });
    },
  };
}
