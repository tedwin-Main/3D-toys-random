// Picks input and snapshot send rates that fit the free relay instance's egress and frame budgets.

// Free-tier budgets per room. Relay egress: 400 KB/s ≈ 69 h of play a month on Render's 100 GB quota.
// Relay frames: 960/s (32-player worst case, Render CPU peak 0.035 of 0.15).
export const BUDGET = { relayBytes: 400e3, relayFrames: 960 };
const SNAP_TICKS = [1, 2, 3, 4]; // 60 / 30 / 20 / 15 Hz

/** ticks between snapshots to `guests` humans: the fastest rate inside both budgets (15 Hz floor) */
export function snapEvery({ bytes, guests }) {
  const fits = (ticks) => {
    const hz = 60 / ticks;
    return bytes * guests * hz <= BUDGET.relayBytes && guests * hz <= BUDGET.relayFrames;
  };
  return SNAP_TICKS.find(fits) ?? SNAP_TICKS.at(-1);
}

// guest input seq is acked modulo this: 4 digits at most in every snapshot, ~68 s of ticks
export const INPUT_SEQ_WRAP = 4096;

// up to a typical full room (12-14 friends) every input goes out at once
const EVERY_TICK_GUESTS = 14;

/**
 * Ticks per guest input message. Relay CPU grows with message count, not bytes. Live on Render, 14 humans + 18 bots:
 * every tick confirm p50 51 / p95 74 ms at 72-83 ms/s CPU; every 2 ticks p50 64 / p95 117 ms at 58-65 ms/s (free limit 150).
 */
export const inputEvery = (guests) => (guests <= EVERY_TICK_GUESTS ? 1 : 2);
