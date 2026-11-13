// Connects a classic room game page to a match the relay server runs: lobby host starts / stops it, every page sends input and reads snapshots.

import { SERVER_PEER } from '../relay-wire.js';
import { inputEvery, INPUT_SEQ_WRAP } from './relay-budget.js';

const CONFIRM_KEEP = 2000; // press-to-ack samples kept for ?debug

export function createServerMatchClient(lobby, { now = () => performance.now() } = {}) {
  const sentAt = new Map(), stats = { confirmMs: [] };
  let tickNo = 0, seq = 0, acked = -1;

  // own ack in a snapshot > ms since that input left (once per new ack)
  function recordConfirm(ack) {
    if (ack === acked) return;
    acked = ack;
    const at = sentAt.get(ack);
    if (at != null && stats.confirmMs.length < CONFIRM_KEEP) stats.confirmMs.push(now() - at);
  }

  const api = {
    stats,
    // lobby host asks the relay to run the match; every page (host included) then plays it as a guest
    start({ bots, seed, settings }) {
      tickNo = 0; seq = 0; acked = -1;
      sentAt.clear();
      if (lobby.room?.isHost) lobby.room.send({ g: 'run', bots, seed, settings }, { to: SERVER_PEER });
    },
    stop() { if (lobby.room?.isHost) lobby.room.send({ g: 'stop' }, { to: SERVER_PEER }); },
    fromServer: (from) => from === SERVER_PEER,
    // server says the match is over: the lobby host takes the room back to the lobby
    finish() { if (lobby.room?.isHost) lobby.backToLobby(); },
    // call once per sim tick; sends the input built by makeInput() at the input rate for the room size, true when it went out
    tickInput(makeInput) {
      const room = lobby.room;
      if (!room || ++tickNo % inputEvery(room.players.length)) return false;
      seq = (seq + 1) % INPUT_SEQ_WRAP;
      sentAt.set(seq, now());
      room.send({ g: 'i', n: seq, ...makeInput() }, { to: SERVER_PEER });
      return true;
    },
    // one-off input outside the tickInput rate (a golf shot, a cycle turn); key n is taken by the acked input seq, so data must not carry it
    sendAction(data) { lobby.room?.send({ g: 'i', ...data }, { to: SERVER_PEER }); },
    // call for every snapshot: reads A = [id, seq, ...] for this page's own ack
    onSnapshot(snap) {
      const acks = snap.A, me = lobby.room?.me;
      if (!acks) return;
      for (let i = 0; i < acks.length; i += 2) if (acks[i] === me) recordConfirm(acks[i + 1]);
    },
  };
  // ?debug: expose for smoke tests
  if (typeof location !== 'undefined' && /[?&]debug\b/.test(location.search)) globalThis.__serverMatch = api;
  return api;
}
