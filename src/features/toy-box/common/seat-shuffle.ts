// Shuffles seat or spawn order in place so join order never decides start slots or turn order.

// Fisher-Yates; rng() in [0, 1), host-side Math.random by default
export function shuffleInPlace(list, rng = Math.random) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}
