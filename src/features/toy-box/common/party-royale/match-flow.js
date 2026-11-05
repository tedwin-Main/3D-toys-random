// Runs the authoritative match on the host (or locally for attract mode): rounds, results, show progression, champion.

import { createRoundSim, ACTIVE } from './round-sim.js';
import { adoptMirror } from './round-snapshot.js';
import { ROUNDS, nextRound, keepFor } from './show-director.js';

const RESULTS_SECONDS = 5, CHAMPION_SECONDS = 8;
const SHARE = { race: 0.7, final: 0 };

/**
 * show: chain rounds down to one winner; else replay roundId with everyone each time.
 * rosterNow() => [{ id, nick, color, bot }] seats for a fresh match / single-round replay
 * send(msg, sticky): broadcast to room (noop offline); hooks: onRound(sim, msg), onResults(sim, msg), onChampion(bean), onDone()
 */
export function createMatchFlow({ show, roundId, rosterNow, send, onRound, onResults, onChampion, onDone, resultsSeconds = RESULTS_SECONDS }) {
  const flow = { sim: null, msg: null, stage: 'idle', t: 0, roster: [], no: 0, played: [] };
  const rng = Math.random;

  function plan() {
    if (show) return nextRound({ remaining: flow.roster.length, roundNo: flow.no, played: flow.played, rng });
    const round = ROUNDS[roundId], n = flow.roster.length;
    return { id: roundId, round, keep: round.kind === 'final' ? 1 : keepFor(n, SHARE[round.kind] ?? 0.55), final: round.kind === 'final' };
  }

  function beginRound(p) {
    const seed = Math.floor(rng() * 2 ** 31);
    const msg = { g: 'r', rk: `${flow.no}-${seed}`, id: p.id, seed, keep: p.keep, final: p.final, show, no: flow.no, played: [...flow.played], R: flow.roster.map((r) => [r.id, r.nick, r.color, r.bot]) };
    flow.sim = createRoundSim({ round: p.round, seed, roster: flow.roster, keep: p.keep });
    flow.msg = msg; flow.stage = 'round';
    send(msg, true);
    onRound(flow.sim, msg);
  }

  function next() {
    if (show) flow.roster = flow.roster.filter((r) => flow.sim.qualified.includes(r.id));
    else flow.roster = rosterNow();
    flow.played.push(flow.msg.id); flow.no++;
    const p = flow.roster.length >= 1 ? plan() : null;
    if (p) return beginRound(p);
    const champ = flow.sim.beans.get(flow.roster[0]?.id);
    flow.stage = 'champion'; flow.t = CHAMPION_SECONDS;
    send({ g: 'champ', id: champ?.id ?? 0 }, false);
    onChampion(champ);
  }

  Object.assign(flow, {
    start() {
      flow.roster = rosterNow(); flow.no = 0; flow.played = [];
      beginRound(plan());
    },
    // round over (sim.phase 'end'): results card, then next round / champion
    finishRound() {
      flow.stage = 'results'; flow.t = resultsSeconds;
      const msg = { g: 'res', rk: flow.msg.rk, q: flow.sim.qualified, out: flow.sim.out };
      send(msg, false);
      onResults(flow.sim, msg);
    },
    wait(dt) {
      if ((flow.t -= dt) > 0) return;
      if (flow.stage === 'results') next();
      else if (flow.stage === 'champion') { flow.stage = 'idle'; onDone(); }
    },
    // a human left mid-round: out of this round and of the show
    dropPlayer(id) {
      const b = flow.sim?.beans.get(id);
      if (b?.status === ACTIVE && flow.stage === 'round') flow.sim.eliminate(b);
      flow.roster = flow.roster.filter((r) => r.id !== id);
    },
    // host migration: promoted guest's mirror becomes the live round, show state from the last round message
    adopt(mirror, msg) {
      flow.sim = adoptMirror(mirror); flow.msg = msg;
      flow.no = msg.no; flow.played = [...msg.played];
      flow.roster = msg.R.map(([id, nick, color, bot]) => ({ id, nick, color, bot }));
      flow.stage = mirror.phase === 'end' ? 'results' : 'round'; flow.t = 2;
    },
  });
  return flow;
}
