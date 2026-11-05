// Runs a party royale match on the relay server, one hop from every player: same match flow and host net as a browser host.

import { DT } from './course-colliders.js';
import { createMatchFlow } from './match-flow.js';
import { createHostNet } from './party-netplay.js';
import { MAX_BEANS, botRoster } from './bot-roster.js';
import { createFixedSteps } from './fixed-steps.js';

/**
 * room: server view of the relay room ({ me, lobbyHost, players, send(data, { to, sticky }) }).
 * Lobby host browser sends { g: 'run', bots } / { g: 'stop' }; guests send input bundles ({ g: 'i' }).
 * Match end broadcasts { g: 'done' } so the lobby host takes everyone back to the lobby.
 */
export function createPartyServerHost(room, { show, roundId }) {
  const net = createHostNet(room);
  let flow = null, stepsDue = createFixedSteps();

  function run(bots) {
    const botCount = Math.max(0, Math.min(MAX_BEANS - 1, Math.floor(Number(bots)) || 0));
    flow = createMatchFlow({
      show, roundId,
      rosterNow: () => [...room.players.map(({ id, nick, color }) => ({ id, nick, color, bot: false })), ...botRoster(botCount)].slice(0, MAX_BEANS),
      send: (msg, sticky) => room.send(msg, { sticky }),
      onRound: (sim, msg) => net.begin(msg.rk),
      onResults: () => {},
      onChampion: () => {},
      onDone: () => { stop(); room.send({ g: 'done' }); },
    });
    stepsDue = createFixedSteps();
    flow.start();
  }

  function stop() { flow = null; }

  // one 60 Hz host tick: the browser host loop minus local input, HUD and sound
  function step() {
    if (flow.stage !== 'round') return flow.wait(DT);
    const sim = flow.sim;
    net.applyInputs(sim);
    sim.step();
    if (net.sendSnapshot(sim)) sim.events = [];
    if (sim.phase === 'end') flow.finishRound();
  }

  return {
    get running() { return !!flow; },
    // jitter queue since the last call: depth before take p10 / p50 / mean (ticks), share of takes that starved
    takeQueueStats() {
      const { depths, starves } = net.stats, sorted = [...depths].sort((a, b) => a - b);
      const at = (q) => sorted[Math.floor(sorted.length * q)] ?? null;
      const summary = { takes: sorted.length, p10: at(0.1), p50: at(0.5), mean: sorted.length ? +(sorted.reduce((a, b) => a + b, 0) / sorted.length).toFixed(2) : null, starvePct: sorted.length ? +((100 * starves) / sorted.length).toFixed(1) : null };
      depths.length = 0; net.stats.starves = 0;
      return summary;
    },
    onData(data, from) {
      if (data?.g === 'i') return flow && net.onInput(from, data);
      if (from !== room.lobbyHost) return;
      if (data?.g === 'run') run(data.bots);
      else if (data?.g === 'stop') stop();
    },
    // a human left: out of this round and of the show
    onRoster() {
      if (!flow) return;
      const here = new Set(room.players.map((p) => p.id));
      for (const r of [...flow.roster]) if (!r.bot && !here.has(r.id)) flow.dropPlayer(r.id);
    },
    // fixed 60 Hz steps from wall time (same clock as browser guests)
    tick(nowMs) {
      if (!flow) return;
      for (let n = stepsDue(nowMs); n > 0 && flow; n--) step();
    },
    close: stop,
  };
}
