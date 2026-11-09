// Runs many bot-only races and matches of the relay-run games in node and checks them against genre targets.

// Usage: node src/features/balance-audit/server-sim-audit.js [races=240] [matches=200]
// Kart (Mario Kart-style): join order must not predict finish; leaders draw defensive items, back markers draw boosts.
// Turbo ball (Rocket League-style): blue and orange sides score and win equally.
import { createKartSim } from '../toy-box/kart-race-online/kart-sim.js';
import { createTurboSim } from '../toy-box/rocket-ball-soccer/turbo-sim.js';

const RACES = +(process.argv[2] ?? 240), MATCHES = +(process.argv[3] ?? 200);
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const share = (bag, k) => (100 * (bag[k] ?? 0)) / Object.values(bag).reduce((x, y) => x + y, 0);

function runKartRace(seed, byJoin, items) {
  let done = false;
  const sim = createKartSim({ onEnd: () => (done = true) });
  sim.startMatch({ seed, humans: [], bots: 14 });
  const ids = [...sim.world.karts.keys()], prevItem = new Map();
  for (let t = 0; t < 60 * 400 && !done; t++) {
    sim.step(); sim.events.length = 0;
    for (const p of sim.world.karts.values()) {
      const bag = p.place <= 4 ? items.front : p.place >= 11 ? items.back : null;
      if (bag && p.item && !prevItem.get(p.id)) bag[p.item] = (bag[p.item] ?? 0) + 1;
      prevItem.set(p.id, p.item);
    }
    // bots-only race ends at first finisher: keep racing until the whole field is home
    if (sim.world.phase === 'end') { if (sim.world.order.length >= 14) break; sim.world.phase = 'race'; }
  }
  ids.forEach((id, j) => { const k = sim.world.order.indexOf(id); if (k >= 0) byJoin[j].push(k + 1); });
}

function runTurboMatch(tally) {
  let done = false;
  const sim = createTurboSim({ onEnd: () => (done = true) });
  sim.startMatch({ humans: [], bots: 8 });
  for (let t = 0; t < 60 * 400 && !done; t++) { sim.step(); sim.events.length = 0; }
  const [b, o] = sim.world.score;
  tally.goals[0] += b; tally.goals[1] += o; tally.wins[b > o ? 0 : o > b ? 1 : 2]++;
}

const byJoin = Array.from({ length: 14 }, () => []), items = { front: {}, back: {} };
for (let seed = 1; seed <= RACES; seed++) runKartRace(seed, byJoin, items);
const tally = { goals: [0, 0], wins: [0, 0, 0] };
for (let m = 0; m < MATCHES; m++) runTurboMatch(tally);

const first4 = mean(byJoin.slice(0, 4).flat()), last4 = mean(byJoin.slice(-4).flat());
const decided = tally.wins[0] + tally.wins[1], z = (tally.wins[0] - decided / 2) / Math.sqrt(decided / 4);
const goalGap = Math.abs(tally.goals[0] - tally.goals[1]) / (tally.goals[0] + tally.goals[1]);
const checks = [
  [`kart: first 4 vs last 4 joiners avg finish gap ≤ 0.5 (${RACES} races)`, Math.abs(first4 - last4) <= 0.5, `${first4.toFixed(2)} vs ${last4.toFixed(2)}`],
  ['kart: top-4 boost share ≤ 25%', share(items.front, 'boost') <= 25, share(items.front, 'boost').toFixed(0) + '%'],
  ['kart: bottom-4 boost share ≥ 50%', share(items.back, 'boost') >= 50, share(items.back, 'boost').toFixed(0) + '%'],
  ['kart: leaders draw bananas most', (items.front.banana ?? 0) >= Math.max(items.front.shell ?? 0, items.front.boost ?? 0), JSON.stringify(items.front)],
  [`turbo: goal share gap ≤ 10% (${MATCHES} matches)`, goalGap <= 0.1, `${tally.goals.join('/')} (${(100 * goalGap).toFixed(1)}%)`],
  ['turbo: side win bias |z| ≤ 2.58', Math.abs(z) <= 2.58, `wins ${tally.wins.join('/')} z ${z.toFixed(2)}`],
];
for (const [name, ok, v] of checks) console.log(ok ? 'PASS' : 'FAIL', name, '=', v);
process.exitCode = checks.every((c) => c[1]) ? 0 : 1;
