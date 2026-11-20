// Defines Basket Draft picnic cards: the deck mix, round scoring, cheese majority and the greedy card value bots use.

export const KINDS = ['apple', 'pie', 'sandwich', 'cheese', 'ant', 'blanket'];
// cards per 20 in a fresh deck
const MIX = { apple: 5, pie: 4, sandwich: 4, cheese: 3, ant: 3, blanket: 1 };
export const PIE_PAIR = 5, SANDWICH_SET = 10, ANT = -2, SPARE_BLANKET = 1, CHEESE_MOST = 6, CHEESE_SECOND = 3;

/** hand size by table size: 8 up to 4 seats, 7 up to 8, 6 beyond */
export const handFor = (seats: number) => (seats <= 4 ? 8 : seats <= 8 ? 7 : 6);

/** count cards of the mix, shuffled with rng */
export function mixedDeck(count: number, rng: () => number) {
  const bag = Object.entries(MIX).flatMap(([k, n]) => Array(n).fill(k));
  return Array.from({ length: count }, () => bag[Math.floor(rng() * bag.length)]);
}

const tally = (tab: string[]) => Object.fromEntries(KINDS.map((k) => [k, tab.filter((c) => c === k).length]));

/** one round's points for a tableau (cheese waits for the end of the match) */
export function scoreTableau(tab: string[]) {
  const c = tally(tab), bitten = Math.max(0, c.ant - c.blanket), spare = Math.max(0, c.blanket - c.ant);
  const parts = { apple: c.apple, pie: Math.floor(c.pie / 2) * PIE_PAIR, sandwich: Math.floor(c.sandwich / 3) * SANDWICH_SET, ant: bitten * ANT, blanket: spare * SPARE_BLANKET };
  return { ...parts, total: Object.values(parts).reduce((a, b) => a + b, 0) };
}

/** end-of-match cheese bonus { id: points }: most cheese 6, second 3; ties split (rounded down); no cheese, no bonus */
export function cheeseBonus(seats: { id: number; cheese: number }[]) {
  const out = Object.fromEntries(seats.map((p) => [p.id, 0]));
  const levels = [...new Set(seats.map((p) => p.cheese).filter((c) => c > 0))].sort((a, b) => b - a);
  const top = seats.filter((p) => p.cheese === levels[0]);
  if (!top.length) return out;
  if (top.length > 1) { for (const p of top) out[p.id] = Math.floor((CHEESE_MOST + CHEESE_SECOND) / top.length); return out; }
  out[top[0].id] = CHEESE_MOST;
  const second = seats.filter((p) => p.cheese === levels[1]);
  for (const p of second) out[p.id] = Math.floor(CHEESE_SECOND / second.length);
  return out;
}

/** greedy worth of adding kind to tab with picksLeft picks (this one included) still to come this round */
export function cardValue(kind: string, tab: string[], picksLeft: number) {
  const c = tally(tab), later = picksLeft - 1;
  if (kind === 'apple') return 1;
  if (kind === 'pie') return c.pie % 2 ? PIE_PAIR : later >= 1 ? 2.4 * Math.min(1, later / 3) : 0;
  if (kind === 'sandwich') {
    const have = c.sandwich % 3;
    if (have === 2) return SANDWICH_SET;
    return later >= 2 - have ? (have ? 4 : 2.6) * Math.min(1, later / 4) : 0;
  }
  if (kind === 'cheese') return 2;
  if (kind === 'ant') return c.blanket > c.ant ? -SPARE_BLANKET : ANT;
  return c.ant > c.blanket ? -ANT : SPARE_BLANKET;
}
