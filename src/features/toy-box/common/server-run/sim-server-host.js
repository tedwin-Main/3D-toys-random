// Runs a classic room game's match on the relay server at 60 Hz: lobby host starts / stops it, guests send latest input, JSON snapshots go to everyone.

import { createFixedSteps } from '../party-royale/fixed-steps.js';

const SNAP_EVERY = 3; // ticks: 20 Hz snapshots, same bytes as the old browser host

/**
 * room: server view of the relay room ({ lobbyHost, players, send(data, { to, sticky }) }).
 * createSim({ onEnd }) => { startMatch({ seed, humans, bots }), applyInput(id, msg), syncRoster(humans), step(), snapshot() }
 * Lobby host sends { g: 'run', bots, seed } / { g: 'stop' }; guests send { g: 'i', ... }; match end sends { g: 'done' }.
 */
export function createSimServerHost(room, { createSim }) {
  let sim = null, tickNo = 0, stepsDue = createFixedSteps();

  function run({ bots, seed }) {
    sim = createSim({ onEnd: finish });
    sim.startMatch({ seed: Number(seed) | 0, humans: room.players, bots: Math.max(0, Math.floor(Number(bots)) || 0) });
    tickNo = 0;
    stepsDue = createFixedSteps();
  }

  function finish() {
    sim = null;
    room.send({ g: 'done' });
  }

  function step() {
    sim.step(); // may end the match (finish clears sim)
    if (sim && ++tickNo % SNAP_EVERY === 0) room.send(sim.snapshot());
  }

  return {
    get running() { return !!sim; },
    // relay-stats: no jitter queue here (latest input wins)
    takeQueueStats: () => null,
    onData(data, from) {
      if (data?.g === 'i') return sim?.applyInput(from, data);
      if (from !== room.lobbyHost) return;
      if (data?.g === 'run') run(data);
      else if (data?.g === 'stop') sim = null;
    },
    onRoster() { sim?.syncRoster(room.players); },
    tick(nowMs) {
      for (let n = stepsDue(nowMs); n > 0 && sim; n--) step();
    },
    close() { sim = null; },
  };
}
