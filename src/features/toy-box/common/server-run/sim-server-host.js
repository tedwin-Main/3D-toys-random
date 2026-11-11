// Runs a classic room game's match on the relay server at 60 Hz: lobby host starts / stops it, guests send latest input, JSON snapshots go to everyone.

import { createFixedSteps } from '../party-royale/fixed-steps.js';
import { snapEvery, INPUT_SEQ_WRAP } from './relay-budget.js';

const FIRST_SNAP_BYTES = 1000; // estimate until the first snapshot is measured
const BYTES_EMA = 0.1;
const SPEED_UP_MARGIN = 1.1; // go back to a faster rate only with 10% byte headroom, so the rate does not flap at a budget edge

/**
 * room: server view of the relay room ({ lobbyHost, players, send(data, { to, sticky }) => frame bytes }).
 * createSim({ onEnd }) => { startMatch({ seed, humans, bots, settings }), applyInput(id, msg), syncRoster(humans), step(), snapshot() }
 * Lobby host sends { g: 'run', bots, seed, settings } / { g: 'stop' }; guests send { g: 'i', n: seq, ... }; match end sends { g: 'done' }.
 * Snapshots go out at the fastest of 60 / 30 / 20 / 15 Hz inside the relay budgets and carry A = [id, seq, ...]: last input applied per human.
 */
export function createSimServerHost(room, { createSim }) {
  const acks = new Map();
  let sim = null, tickNo = 0, avgBytes = 0, snapTicks = 1, stepsDue = createFixedSteps();

  function run({ bots, seed, settings }) {
    sim = createSim({ onEnd: finish });
    sim.startMatch({ seed: Number(seed) | 0, humans: room.players, bots: Math.max(0, Math.floor(Number(bots)) || 0), settings: settings ?? {} });
    tickNo = 0; avgBytes = 0; snapTicks = 1;
    acks.clear();
    stepsDue = createFixedSteps();
  }

  function finish() {
    sim = null;
    room.send({ g: 'done' });
  }

  function step() {
    sim.step(); // may end the match (finish clears sim)
    if (sim && ++tickNo % pickSnapTicks() === 0) sendSnapshot();
  }

  // slower at once when the budget asks for it; faster only with headroom
  function pickSnapTicks() {
    const bytes = avgBytes || FIRST_SNAP_BYTES, guests = room.players.length;
    snapTicks = Math.max(snapEvery({ bytes, guests }), Math.min(snapTicks, snapEvery({ bytes: bytes * SPEED_UP_MARGIN, guests })));
    return snapTicks;
  }

  function sendSnapshot() {
    const snap = sim.snapshot();
    if (acks.size) snap.A = [...acks].flat();
    const bytes = room.send(snap);
    // first frame is the fattest (names, slow fields, grid keyframe): it nudges the average, never seeds it
    const before = avgBytes || FIRST_SNAP_BYTES;
    avgBytes = before + (bytes - before) * BYTES_EMA;
  }

  function applyInput(from, data) {
    if (!sim) return;
    sim.applyInput(from, data);
    if (Number.isInteger(data.n)) acks.set(from, data.n % INPUT_SEQ_WRAP);
  }

  return {
    get running() { return !!sim; },
    // relay-stats: no jitter queue here (latest input wins)
    takeQueueStats: () => null,
    onData(data, from) {
      if (data?.g === 'i') return applyInput(from, data);
      if (from !== room.lobbyHost) return;
      if (data?.g === 'run') run(data);
      else if (data?.g === 'stop') sim = null;
    },
    onRoster() {
      const here = new Set(room.players.map((p) => p.id));
      for (const id of [...acks.keys()]) if (!here.has(id)) acks.delete(id);
      sim?.syncRoster(room.players);
    },
    tick(nowMs) {
      for (let n = stepsDue(nowMs); n > 0 && sim; n--) step();
    },
    close() { sim = null; },
  };
}
