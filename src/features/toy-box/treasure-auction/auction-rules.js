// Runs Treasure Auction rules (lots, sealed bids, tie-cancel wins, curses, bots, round clock) with no rendering, for page attract mode and the relay server host.

import { createSeededRng } from '../common/seeded-rng.js';
import { seatAttractBots, seatMatch, syncSeats, clockFreeKey, dropUnseatedPicks } from '../common/turn-table.js';

export const START_COINS = 40;
const INTRO = 2.5, SHOW_T = 2.4, BID_T = 15, RESULT_T = 4.5, FINAL_T = 12;
const ATTRACT_BOTS = 6, ATTRACT_ROUNDS = 6, DEFAULT_ROUNDS = 8;
// kind: [name, lowest value, highest value]
const LOTS = { gem: ['Sky Gem', 4, 8], chalice: ['Royal Chalice', 8, 13], crown: ['Sun Crown', 13, 20], idol: ['Cursed Idol', -12, -4] };
const TREASURE_MIX = ['gem', 'gem', 'chalice', 'chalice', 'crown'];
const CURSE_ODDS = 0.25;
const BOT_NAMES = ['Baroness', 'Count Coin', 'Gilda', 'Sir Bidsalot', 'Madame Mint', 'Old Ledger', 'Rubyface', 'Duke Dollop', 'Lady Lux', 'Hammerhand', 'Magpie', 'Penny Pound', 'Viscount V', 'Goldtooth'];
export const scoreOf = (p) => p.coins + p.loot;

/**
 * onEnd(): final scores ran out (match over).
 * state: { mode, ph, tt, rd, rounds, lot: { kind, name, v }, res: { bids: {id: bid}, win: [ids], unsold } (result only), P: [{ id, nick, color, bot, coins, loot, lock, skill, at }] }
 */
export function createAuctionGame({ onEnd = () => {} } = {}) {
  // bids stay here until the gavel: never part of the published state
  const sealedBids = new Map();
  let rng = Math.random;
  let S = freshState('attract', ATTRACT_ROUNDS, 1);

  function freshState(mode, rounds, introTime) {
    return { mode, ph: 'intro', tt: introTime, rd: 1, rounds, lot: null, res: null, P: [] };
  }
  const player = (id) => S.P.find((p) => p.id === id);
  const newPlayer = (id, nick, color, bot) => ({ id, nick, color, bot, coins: START_COINS, loot: 0, lock: false, skill: 0.4 + rng() * 0.5, at: 0 });

  // last lot is always a crown; otherwise one in four is cursed
  function newLot(rd) {
    const kind = rd === S.rounds ? 'crown' : rng() < CURSE_ODDS ? 'idol' : TREASURE_MIX[Math.floor(rng() * TREASURE_MIX.length)];
    const [name, lo, hi] = LOTS[kind];
    return { kind, name, v: lo + Math.floor(rng() * (hi - lo + 1)) };
  }

  function startLot(rd) {
    sealedBids.clear();
    for (const p of S.P) p.lock = false;
    Object.assign(S, { rd, ph: 'show', tt: SHOW_T, lot: newLot(rd), res: null });
  }

  function openBidding() {
    Object.assign(S, { ph: 'bid', tt: BID_T });
    for (const p of S.P) p.at = 1.5 + rng() * 9;
  }

  // a (re)bid before the reveal; true when accepted
  function placeBid(id, bid) {
    const p = player(id);
    if (!p || S.ph !== 'bid' || !Number.isInteger(bid) || bid < 0 || bid > p.coins) return false;
    sealedBids.set(id, bid); p.lock = true;
    return true;
  }

  // ties cancel: the highest bid nobody else made wins and pays
  function sellTreasure(bids, res) {
    const count = new Map();
    for (const bid of Object.values(bids)) count.set(bid, (count.get(bid) ?? 0) + 1);
    const top = Math.max(-1, ...[...count].filter(([bid, n]) => n === 1 && bid > 0).map(([bid]) => bid));
    const winner = top > 0 && S.P.find((p) => bids[p.id] === top);
    if (!winner) { res.unsold = true; return; }
    winner.coins -= top; winner.loot += S.lot.v;
    res.win = [winner.id];
  }

  // curse: everyone pays what they bid, lowest bid (all tied) takes it
  function handOutCurse(bids, res) {
    for (const p of S.P) p.coins -= bids[p.id];
    const low = Math.min(...S.P.map((p) => bids[p.id]));
    for (const p of S.P) if (bids[p.id] === low) { p.loot += S.lot.v; res.win.push(p.id); }
  }

  function resolveLot() {
    const bids = {};
    for (const p of S.P) bids[p.id] = sealedBids.get(p.id) ?? 0;
    const res = { bids, win: [], unsold: false };
    if (S.lot.v > 0) sellTreasure(bids, res);
    else handOutCurse(bids, res);
    Object.assign(S, { ph: 'result', tt: RESULT_T, res });
  }

  // bots: treasure = bid a share of its value (odd numbers dodge ties); curse = pay a little to dodge
  function botBid(p) {
    const value = S.lot.v;
    let bid;
    if (value > 0) {
      const want = value * (0.3 + p.skill * 0.45 + (rng() - 0.5) * 0.3);
      bid = rng() < 0.12 ? 0 : Math.round(want) + (rng() < 0.5 ? 1 : 0);
    } else bid = rng() < 0.25 ? 0 : 1 + Math.floor(rng() * Math.min(4, -value / 3));
    return Math.max(0, Math.min(p.coins, bid));
  }

  function tickBid() {
    for (const p of S.P) if (p.bot && !p.lock && BID_T - S.tt >= p.at) placeBid(p.id, botBid(p));
    if (S.tt <= 0 || S.P.every((p) => p.lock)) resolveLot();
  }

  function afterResult() {
    if (S.rd < S.rounds) startLot(S.rd + 1);
    else if (S.mode === 'attract') { for (const p of S.P) Object.assign(p, { coins: START_COINS, loot: 0 }); startLot(1); }
    else Object.assign(S, { ph: 'final', tt: FINAL_T });
  }

  function advancePhase() {
    if (S.ph === 'bid') tickBid();
    else if (S.tt > 0) return;
    else if (S.ph === 'intro') startLot(1);
    else if (S.ph === 'show') openBidding();
    else if (S.ph === 'result') afterResult();
    else if (S.ph === 'final') onEnd();
  }

  return {
    get state() { return S; },
    startAttract() {
      rng = Math.random;
      sealedBids.clear();
      S = freshState('attract', ATTRACT_ROUNDS, 1);
      S.P = seatAttractBots(ATTRACT_BOTS, BOT_NAMES, newPlayer);
    },
    startMatch({ seed, humans, bots, settings = {} }) {
      rng = createSeededRng(seed);
      sealedBids.clear();
      S = freshState('match', Number(settings.rounds) || DEFAULT_ROUNDS, INTRO);
      S.P = seatMatch({ humans, bots, botNames: BOT_NAMES, newSeat: newPlayer });
    },
    // a changed bid before the gavel replaces the first: no public change then
    act(id, action) {
      const wasLocked = player(id)?.lock;
      return action.t === 'bid' && placeBid(id, action.v) && !wasLocked;
    },
    // late joiner starts fresh with the opening purse
    syncRoster(humans) {
      S.P = syncSeats(S.P, humans, { scoreOf, seatJoiner: (h) => newPlayer(h.id, h.nick, h.color, false) });
      dropUnseatedPicks(sealedBids, S.P);
      return true;
    },
    tick(dt) {
      const before = clockFreeKey(S);
      S.tt -= dt;
      advancePhase();
      return clockFreeKey(S) !== before;
    },
  };
}
