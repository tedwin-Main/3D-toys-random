// Syncs and caches player name table across host and guests.

const REFRESH_EVERY = 20; // snapshots; 1 s at 20 Hz, heals late joiners

// Cloud Sync > snapshot names: host stamp(), guest read() + name()
export function createNameSync() {
  const names = new Map();
  let lastIds = '', sinceStamp = REFRESH_EVERY;
  return {
    // host: attach N = [[id, nick, color], ...] when ids change or refresh is due
    stamp(snap, players) {
      const list = [...players];
      const ids = list.map((p) => p.id).join(',');
      if (ids !== lastIds || ++sinceStamp >= REFRESH_EVERY) {
        snap.N = list.map((p) => [p.id, p.nick, p.color]);
        lastIds = ids; sinceStamp = 0;
      }
      return snap;
    },
    // guest: merge name table from snapshot
    read(snap) { if (snap.N) for (const [id, nick, color] of snap.N) names.set(id, [nick, color]); },
    // guest: [nick, color] or null until first table arrives
    name(id) { return names.get(id) ?? null; },
    reset() { names.clear(); lastIds = ''; sinceStamp = REFRESH_EVERY; },
  };
}
