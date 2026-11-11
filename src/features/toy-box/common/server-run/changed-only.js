// Sends slow snapshot fields only when they change, with a full copy every few snapshots so late joiners heal.

const REFRESH_EVERY = 15; // snapshots: 0.5 s at 30 Hz

/** Host > pick(fields): entries whose value changed since they last went out; every entry on a refresh. */
export function createChangedOnly({ refreshEvery = REFRESH_EVERY } = {}) {
  const sent = new Map();
  let sinceRefresh = refreshEvery;
  return {
    pick(fields) {
      const full = ++sinceRefresh >= refreshEvery;
      if (full) sinceRefresh = 0;
      const out = {};
      for (const [key, value] of Object.entries(fields)) {
        const json = JSON.stringify(value);
        if (!full && sent.get(key) === json) continue;
        sent.set(key, json);
        out[key] = value;
      }
      return out;
    },
    // next pick sends everything (roster change, new match)
    reset() { sent.clear(); sinceRefresh = refreshEvery; },
  };
}
