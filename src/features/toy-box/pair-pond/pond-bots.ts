// Keeps Pair Pond bot memory (which pads each bot saw, and what was under them) and picks bot flips from it.

/** rng(): [0, 1) source; memory lives here, never in the published state */
export function createPondMemory(rng: () => number) {
  // bot id > Map(pad index > face)
  const seen = new Map();

  const memOf = (id) => {
    if (!seen.has(id)) seen.set(id, new Map());
    return seen.get(id);
  };

  // a face shown to the whole table: each bot keeps it with its skill as the odds (bad memories drop most)
  function see(seats, i: number, f: number) {
    for (const p of seats) if (p.bot && rng() < p.skill) memOf(p.id).set(i, f);
  }

  // claimed pads leave every memory
  function forget(i: number) {
    for (const mem of seen.values()) mem.delete(i);
  }

  function reset() { seen.clear(); }

  function dropMissing(seats) {
    const ids = new Set(seats.map((p) => p.id));
    for (const id of [...seen.keys()]) if (!ids.has(id)) seen.delete(id);
  }

  const pickAny = (list) => list[Math.floor(rng() * list.length)];

  /** next pad for bot p: free = indices it may flip; up = [{ i, f }] already face up this turn */
  function choose(p, free: number[], up) {
    const mem = memOf(p.id), known = free.filter((i) => mem.has(i)), unknown = free.filter((i) => !mem.has(i));
    if (up.length === 1) {
      const match = known.find((i) => mem.get(i) === up[0].f);
      if (match != null) return match;
      return unknown.length ? pickAny(unknown) : pickAny(free);
    }
    const byFace = new Map();
    for (const i of known) {
      const f = mem.get(i);
      if (byFace.has(f)) return byFace.get(f);
      byFace.set(f, i);
    }
    // open a fresh pad first: if it matches a remembered one the second flip cashes it
    return unknown.length ? pickAny(unknown) : pickAny(free);
  }

  return { see, forget, reset, dropMissing, choose };
}
