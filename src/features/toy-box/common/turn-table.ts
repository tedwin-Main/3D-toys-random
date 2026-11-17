// Seats humans and bots at a turn-game table, keeps seats in step with the room roster, and spots public state changes.

export const MAX_SEATS = 14;
export const BOT_COLORS = ['#9b5de5', '#00bbf9', '#00f5d4', '#f15bb5', '#fee440', '#8ac926', '#ff924c', '#6a4c93', '#e76f51', '#2a9d8f', '#b5179e', '#577590', '#ef476f', '#06d6a0'];

/** attract table: bots only, plain names; newSeat(id, nick, color, bot) => seat */
export function seatAttractBots(count, botNames, newSeat) {
  return Array.from({ length: count }, (_, i) => newSeat(-1 - i, botNames[i], BOT_COLORS[i], true));
}

/** match table: every human, then bots while seats last */
export function seatMatch({ humans, bots, botNames, newSeat }) {
  const seats = humans.map((h) => newSeat(h.id, h.nick, h.color, false));
  const botCount = Math.max(0, Math.min(bots, MAX_SEATS - seats.length));
  for (let i = 0; i < botCount; i++) seats.push(newSeat(-1 - i, `${botNames[i]} 🤖`, BOT_COLORS[i], true));
  return seats;
}

/**
 * Roster changed: leavers lose their seat, late joiners get one (in a full room the lowest-scoring bot gives up its own).
 * scoreOf(seat) ranks bots; seatJoiner(human, seats) => seat. Returns the new seat list.
 */
export function syncSeats(seats, humans, { scoreOf, seatJoiner }) {
  const here = new Set(humans.map((h) => h.id));
  const kept = seats.filter((seat) => seat.bot || here.has(seat.id));
  for (const human of humans) {
    if (kept.some((seat) => seat.id === human.id)) continue;
    if (kept.length >= MAX_SEATS) dropLowestBot(kept, scoreOf);
    kept.push(seatJoiner(human, kept));
  }
  return kept;
}

function dropLowestBot(seats, scoreOf) {
  const bot = seats.filter((seat) => seat.bot).sort((a, b) => scoreOf(a) - scoreOf(b))[0];
  if (bot) seats.splice(seats.indexOf(bot), 1);
}

/** state as text without the phase clock tt: two equal keys = nothing a guest must hear about */
export const clockFreeKey = (state) => JSON.stringify(state, (key, value) => (key === 'tt' ? undefined : value));

/** sealed picks of anyone no longer seated are thrown away */
export function dropUnseatedPicks(sealedPicks, seats) {
  const seated = new Set(seats.map((seat) => seat.id));
  for (const id of [...sealedPicks.keys()]) if (!seated.has(id)) sealedPicks.delete(id);
}
