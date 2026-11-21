// Shuffles seat, spawn or per-tick order so join order never decides start slots, turn order or who resolves first.

// Fisher-Yates; rng() in [0, 1), host-side Math.random by default
export function shuffleInPlace(list, rng = Math.random) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

// fresh random copy each tick: Map / join order never picks who moves, bumps, grabs or hits the ball first
export const tickOrder = (items, rng = Math.random) => shuffleInPlace([...items], rng);
