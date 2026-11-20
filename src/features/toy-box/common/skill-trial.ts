// Plays bots-only matches of a turn-game rules module in node and counts how often one high-skill bot wins, for bot skill tests.

import { pickLeader } from './pick-leader.ts';

const DT = 0.1;

/**
 * createGame({ onEnd }): rules factory; seats: bots per match; star / rest: skill of the one strong bot and of the others.
 * score(p, state): higher wins (default p.score); skillOf(state, i, skill): writes a seat's skill (default S.P[i].skill).
 * Returns { share, fair, matches }: share = star's win share (ties split), fair = 1 / seats.
 */
export function skillTrial({ createGame, seats = 4, matches = 60, star = 0.95, rest = 0.45, settings = {}, maxSecs = 3600, score = (p, _s) => p.score, skillOf = (s, i, skill) => { s.P[i].skill = skill; } }) {
  let wins = 0;
  for (let m = 0; m < matches; m++) {
    let over = false;
    const game = createGame({ onEnd: () => { over = true; } });
    game.startMatch({ seed: 1000 + m * 7919, humans: [], bots: seats, settings });
    const S = game.state, starAt = m % seats, starId = S.P[starAt].id;
    S.P.forEach((_p, i) => skillOf(S, i, i === starAt ? star : rest));
    for (let t = 0; !over && t < maxSecs / DT; t++) {
      // stop at the final phase: the scores there are the match result
      if (game.state.ph === 'final') break;
      game.tick(DT);
    }
    const { tied } = pickLeader(game.state.P, (p) => score(p, game.state));
    if (tied.some((p) => p.id === starId)) wins += 1 / tied.length;
  }
  return { share: wins / matches, fair: 1 / seats, matches };
}
