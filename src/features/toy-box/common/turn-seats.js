// Re-seats the turn after a roster change in turn-based games.

// Multiplayer > Turn seats
// before/after: seat arrays (same player objects); keeps turn with current player, else whoever sat next after them
export function reseatTurn(before, turn, after) {
  const kept = after.indexOf(before[turn]);
  if (kept >= 0) return { turn: kept, left: false };
  const next = [...before.slice(turn + 1), ...before.slice(0, turn)].find((p) => after.includes(p));
  return { turn: Math.max(0, after.indexOf(next)), left: true };
}
