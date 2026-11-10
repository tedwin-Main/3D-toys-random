// Picks a match leader by score without letting join order break ties.

/**
 * list: players; score(p): higher is better; tiebreak(a, b): optional, > 0 when a ranks above b.
 * Returns { winner, tied }: winner = sole leader or null; tied = every player sharing the top spot.
 */
export function pickLeader(list, score, tiebreak = () => 0) {
  let tied = [];
  for (const p of list) {
    const top = tied[0];
    if (!top) { tied = [p]; continue; }
    const d = score(p) - score(top) || tiebreak(p, top);
    if (d > 0) tied = [p];
    else if (d === 0) tied.push(p);
  }
  return { winner: tied.length === 1 ? tied[0] : null, tied };
}
