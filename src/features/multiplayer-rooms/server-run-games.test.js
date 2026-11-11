// Tests classic room games the relay runs (kart party, turbo ball, bumper sumo): lobby-host control, JSON snapshots, guest input, leavers, match end.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRelayCore } from './room-relay-core.js';
import { hostedGames } from './hosted-games.js';
import { encodeSend, decodeFrame, SERVER_PEER } from '../toy-box/common/relay-wire.js';

const TICK_MS = 1000 / 60;
// rows: snapshot key of the per-player rows; live: phase where input moves a player; input + moved: a steering input and the row column it drives (two columns = speed along any heading)
// ownDriveTest: input steers by turns or one-off shots, so the every-guest drive test does not fit (own tests below)
const DRIVE = { g2: 0, s: 1, d: 0, it: 0, r: 0, b: 0 };
const GAMES = {
  'kart-party': { rows: 'K', live: 'count', input: DRIVE, moved: 6 },
  'turbo-ball': { rows: 'P', live: 'play', input: DRIVE, moved: 6 },
  'bumper-sumo': { rows: 'P', live: 'fight', input: { x: 1, z: 0, d: 0 }, moved: 3 },
  'hot-potato': { rows: 'P', live: 'play', input: { x: 1, z: 0, d: 0 }, moved: 3 },
  'crown-keep': { rows: 'P', live: 'play', input: { x: 1, z: 0, d: 0 }, moved: 4 },
  'chair-scramble': { rows: 'P', live: 'music', input: { mx: 1, mz: 0, dq: 0 }, moved: 3 },
  'balloon-battle': { rows: 'P', live: 'play', input: { x: 1, z: 0, d: 0 }, moved: [3, 4] },
  'sheepdog-rush': { rows: 'P', live: 'play', input: { x: 1, z: 0, b: 0 }, moved: 3 },
  'splat-turf': { rows: 'P', live: 'play', input: { x: 1, z: 0, b: 0 }, moved: 3 },
  'hex-drop': { rows: 'P', live: 'play', input: { x: 1, z: 0, j: 0 }, moved: 4 },
  'floor-is-lava': { rows: 'P', live: 'play', input: { x: 1, z: 0, j: 0 }, moved: [4, 6] },
  'cannon-cove': { rows: 'P', live: 'play', input: { a: 1, b: 0, l: 0, r: 0 }, moved: 4 },
  'tank-brawl': { rows: 'T', live: 'play', input: { t: 1, r: 0, a: 0, f: 0 }, moved: 10 },
  'snowball-brawl': { rows: 'P', live: 'play', input: { mx: 1, mz: 0, ax: 0, az: 0, q: [] }, moved: 4 },
  'penguin-curling': { rows: 'P', live: 'aim', input: { x: 0, h: 0 }, ownDriveTest: true },
  'mini-golf': { rows: 'B', live: 'play', input: { shot: [0, 0.5], q: 1 }, ownDriveTest: true },
  'light-cycles': { rows: 'P', live: 'play', input: { b: 0, tn: 0, q: [] }, ownDriveTest: true },
};

function join(core, game, room = '') {
  const inbox = [];
  const conn = core.connect({ send: (frame) => inbox.push(decodeFrame(String(frame))), close() {}, isOpen: () => true });
  core.message(conn, JSON.stringify({ t: 'join', game, nick: 'p', room, cap: 14 }));
  const joined = inbox.find((m) => m.t === 'joined');
  return { conn, inbox, id: joined.id, code: joined.room, data: (g) => inbox.filter((m) => m.t === 'data' && m.data.g === g) };
}

function room(game) {
  const core = createRelayCore({ hostedGames });
  const host = join(core, game);
  const guests = [join(core, game, host.code), join(core, game, host.code)];
  let now = 0;
  const run = (ticks) => { for (let i = 0; i < ticks; i++) core.tickHosted((now += TICK_MS)); };
  const toServer = (p, data) => core.message(p.conn, encodeSend(JSON.stringify(data), { to: SERVER_PEER }));
  const lastSnap = (p) => p.data('s').at(-1)?.data;
  return { core, host, guests, run, toServer, lastSnap };
}

for (const [game, { rows, live, input, moved, ownDriveTest }] of Object.entries(GAMES)) {
  test(`${game}: only the lobby host starts it; snapshots reach every human from the server`, () => {
    const { host, guests, run, toServer, lastSnap } = room(game);
    toServer(guests[0], { g: 'run', bots: 4, seed: 7 });
    run(10);
    assert.equal(host.data('s').length, 0, 'guest cannot start');
    toServer(host, { g: 'run', bots: 4, seed: 7 });
    run(30);
    for (const p of [host, ...guests]) {
      assert.ok(p.data('s').length >= 28, '60 Hz snapshots in a small room');
      assert.equal(p.data('s')[0].from, SERVER_PEER);
      assert.equal(lastSnap(p)[rows].length, 7, '3 humans + 4 bots');
      assert.ok(!p.data('run').length, 'control frame stays on the server');
    }
  });

  if (ownDriveTest) continue;
  test(`${game}: guest input drives its own row; a leaver drops out`, () => {
    const { core, host, guests, run, toServer, lastSnap } = room(game);
    toServer(host, { g: 'run', bots: 2, seed: 7 });
    for (let t = 0; t < 600 && lastSnap(host)?.ph !== live; t++) run(1);
    toServer(guests[0], { g: 'i', ...input });
    run(12);
    const row = (p, id) => lastSnap(p)[rows].find((r) => r[0] === id);
    const drive = (r) => (Array.isArray(moved) ? Math.hypot(...moved.map((col) => r[col])) : r[moved]);
    assert.ok(drive(row(host, guests[0].id)) > 0.5, 'input applied');
    assert.equal(drive(row(host, guests[1].id)), 0, 'no input, no movement');
    core.close(guests[1].conn);
    run(6);
    assert.equal(row(host, guests[1].id), undefined, 'leaver removed');
  });
}

test(`${Object.keys(GAMES).join(' + ')}: snapshots ack each guest's last input seq`, () => {
  for (const game of Object.keys(GAMES)) {
    const { host, guests, run, toServer, lastSnap } = room(game);
    toServer(host, { g: 'run', bots: 0, seed: 7 });
    run(3);
    assert.equal(lastSnap(host).A, undefined, 'no input yet, no acks');
    toServer(guests[0], { g: 'i', n: 41, ...GAMES[game].input });
    toServer(guests[1], { g: 'i', n: 4096 + 7, ...GAMES[game].input });
    run(3);
    assert.deepEqual(lastSnap(host).A, [guests[0].id, 41, guests[1].id, 7], 'id, seq pairs; seq wraps at 4096');
  }
});

test('kart-party: slow fields ride only when they change, and a late joiner gets them at once', () => {
  const { core, host, run, toServer } = room('kart-party');
  toServer(host, { g: 'run', bots: 11, seed: 7 });
  run(4);
  const [first, second] = host.data('s').map((m) => m.data);
  assert.equal(first.S.length, 14, 'first snapshot carries every slow row');
  assert.equal(first.seed, 7);
  assert.equal(second.S, undefined, 'nothing changed one tick later');
  assert.equal(second.seed, undefined);
  assert.equal(second.K.length, 14, 'fast rows every time');
  const late = join(core, 'kart-party', host.code);
  run(4);
  assert.equal(late.data('s')[0].data.S.length, 14, 'roster change resends slow rows');
});

test('kart-party: a full 14-human room fits 30 Hz inside the relay byte budget', () => {
  const core = createRelayCore({ hostedGames });
  const players = [join(core, 'kart-party')];
  while (players.length < 13) players.push(join(core, 'kart-party', players[0].code));
  const frames = [];
  const watcher = core.connect({ send: (frame) => frames.push(frame.length), close() {}, isOpen: () => true });
  core.message(watcher, JSON.stringify({ t: 'join', game: 'kart-party', nick: 'w', room: players[0].code }));
  core.message(players[0].conn, encodeSend(JSON.stringify({ g: 'run', bots: 0, seed: 5 }), { to: SERVER_PEER }));
  let now = 0;
  players.forEach((p, i) => core.message(p.conn, encodeSend(JSON.stringify({ g: 'i', n: 4000 + i, g2: 1, s: 0.5, d: 0, it: 0, r: 0 }), { to: SERVER_PEER })));
  for (let i = 0; i < 600; i++) core.tickHosted((now += TICK_MS));
  frames.length = 0;
  for (let i = 0; i < 600; i++) core.tickHosted((now += TICK_MS));
  const avg = frames.reduce((a, b) => a + b, 0) / frames.length;
  assert.equal(frames.length, 300, '30 Hz');
  assert.ok(avg < 950, `avg snapshot ${Math.round(avg)} B under 950`);
});

test('kart-party: race ends on the server and tells the lobby host it is done', () => {
  const { core, host, run, toServer } = room('kart-party');
  toServer(host, { g: 'run', bots: 3, seed: 11 });
  for (let t = 0; t < 60 * 60 * 6 && !host.data('done').length; t += 600) run(600);
  assert.equal(host.data('done').length, 1, 'match done');
  assert.ok(!core.rooms.values().next().value.server.running);
});

test('bumper-sumo: bots play a whole match to a champion on the server', () => {
  const { core, host, run, toServer, lastSnap } = room('bumper-sumo');
  toServer(host, { g: 'run', bots: 11 });
  for (let t = 0; t < 60 * 60 * 20 && !host.data('done').length; t += 600) run(600);
  assert.equal(host.data('done').length, 1, 'match done');
  const final = host.data('s').map((m) => m.data).findLast((d) => d.ph === 'matchEnd');
  assert.equal(final.P.find((r) => r[0] === final.win)[9], 3, 'champion has 3 round wins');
  assert.equal(lastSnap(host).P.length, 14, '3 humans + 11 bots');
  assert.ok(!core.rooms.values().next().value.server.running);
});

test('hot-potato: bots play all rounds to the final on the server', () => {
  const { core, host, run, toServer } = room('hot-potato');
  toServer(host, { g: 'run', bots: 11 });
  for (let t = 0; t < 60 * 60 * 20 && !host.data('done').length; t += 600) run(600);
  assert.equal(host.data('done').length, 1, 'match done');
  const final = host.data('s').map((m) => m.data).findLast((d) => d.ph === 'final');
  assert.equal(final.rd, 3, 'three rounds played');
  assert.ok(final.P.some((r) => r[8] > 0), 'someone won a round');
  assert.ok(!core.rooms.values().next().value.server.running);
});

test('crown-keep: bots play to a winner or time-up on the server', () => {
  const { core, host, run, toServer } = room('crown-keep');
  toServer(host, { g: 'run', bots: 11 });
  for (let t = 0; t < 60 * 60 * 6 && !host.data('done').length; t += 600) run(600);
  assert.equal(host.data('done').length, 1, 'match done');
  const final = host.data('s').map((m) => m.data).findLast((d) => d.ph === 'final');
  assert.ok(final.P.some((r) => r[8] > 0), 'points were scored');
  assert.ok(final.lf <= 0 || final.P.some((r) => r[8] >= 60), 'ended on the clock or the 60-point target');
  assert.ok(!core.rooms.values().next().value.server.running);
});

test('chair-scramble: bots scramble down to one winner on the server; chairs ride only when they change', () => {
  const { core, host, run, toServer } = room('chair-scramble');
  toServer(host, { g: 'run', bots: 11 });
  for (let t = 0; t < 60 * 60 * 10 && !host.data('done').length; t += 600) run(600);
  assert.equal(host.data('done').length, 1, 'match done');
  const snaps = host.data('s').map((m) => m.data), final = snaps.findLast((d) => d.ph === 'final');
  assert.equal(final.P.filter((r) => !(r[7] & 1)).length, 1, 'one dancer left in');
  assert.equal(final.P.find((r) => r[0] === final.wn)[9], 1, 'winner placed first');
  const withChairs = snaps.filter((d) => d.C).length;
  assert.ok(withChairs > 0 && withChairs < snaps.length / 4, `chairs in ${withChairs} of ${snaps.length} snapshots`);
  assert.ok(!core.rooms.values().next().value.server.running);
});

test('balloon-battle: bots pop to a winner or time-up on the server; pickups ride only when they change', () => {
  const { core, host, run, toServer } = room('balloon-battle');
  toServer(host, { g: 'run', bots: 11 });
  for (let t = 0; t < 60 * 60 * 6 && !host.data('done').length; t += 600) run(600);
  assert.equal(host.data('done').length, 1, 'match done');
  const snaps = host.data('s').map((m) => m.data), final = snaps.findLast((d) => d.ph === 'final');
  assert.ok(final.P.some((r) => r[8] > 0), 'balloons were popped');
  assert.ok(final.lf <= 0 || final.P.some((r) => r[8] >= 20), 'ended on the clock or the 20-pop target');
  const withPicks = snaps.filter((d) => d.K).length;
  assert.ok(withPicks > 0 && withPicks < snaps.length / 2, `pickups in ${withPicks} of ${snaps.length} snapshots`);
  assert.ok(!core.rooms.values().next().value.server.running);
});

test('sheepdog-rush: bots pen sheep to a winner or time-up on the server; every dog keeps its own pen', () => {
  const { core, host, run, toServer } = room('sheepdog-rush');
  toServer(host, { g: 'run', bots: 11 });
  for (let t = 0; t < 60 * 60 * 6 && !host.data('done').length; t += 600) run(600);
  assert.equal(host.data('done').length, 1, 'match done');
  const final = host.data('s').map((m) => m.data).findLast((d) => d.ph === 'final');
  assert.ok(final.P.some((r) => r[7] > 0), 'sheep were penned');
  assert.ok(final.lf <= 0 || final.P.some((r) => r[7] >= 30), 'ended on the clock or the 30-sheep target');
  assert.deepEqual(final.P.map((r) => r[8]).sort((a, b) => a - b), final.P.map((_, k) => k), 'pens 0..n-1, one each');
  assert.equal(final.S.length % 3, 0, 'flock packed as triples');
  assert.ok(!core.rooms.values().next().value.server.running);
});

test('snowball-brawl: bots brawl to the clock on the server; a guest throw fires once however often its packet repeats', () => {
  const { core, host, guests, run, toServer, lastSnap } = room('snowball-brawl');
  toServer(host, { g: 'run', bots: 9 });
  for (let t = 0; t < 600 && lastSnap(host)?.ph !== 'play'; t++) run(1);
  const thrower = guests[0], ammo = () => lastSnap(host).P.find((r) => r[0] === thrower.id)[8];
  toServer(thrower, { g: 'i', mx: 0, mz: 0, ax: 0, az: 0, q: [] }); // first packet syncs the throw counter
  run(3);
  const before = ammo();
  for (let k = 0; k < 3; k++) { toServer(thrower, { g: 'i', mx: 0, mz: 0, ax: 0, az: 0, q: [[1, 0, 0], 'junk'] }); run(3); }
  assert.equal(ammo(), before - 1, 'one snowball left the hand');
  for (let t = 0; t < 60 * 60 * 4 && !host.data('done').length; t += 600) run(600);
  assert.equal(host.data('done').length, 1, 'match done');
  const snaps = host.data('s').map((m) => m.data), final = snaps.findLast((d) => d.ph === 'final');
  assert.equal(final.ck, 0, 'ended on the clock');
  assert.ok(snaps.findLast((d) => d.S).S.some((r) => r[2] > 0), 'someone froze a rival');
  const withScores = snaps.filter((d) => d.S).length;
  assert.ok(withScores > 0 && withScores < snaps.length / 2, `scores in ${withScores} of ${snaps.length} snapshots`);
  assert.ok(!core.rooms.values().next().value.server.running);
});

test('tank-brawl: bots fight to the kill cap or the clock on the server in the lobby-seeded maze', () => {
  const { core, host, run, toServer } = room('tank-brawl');
  toServer(host, { g: 'run', bots: 11, seed: 4242 });
  for (let t = 0; t < 60 * 60 * 5 && !host.data('done').length; t += 600) run(600);
  assert.equal(host.data('done').length, 1, 'match done');
  const snaps = host.data('s').map((m) => m.data), end = snaps.findLast((d) => d.ph === 'end');
  assert.equal(snaps.find((d) => d.seed != null).seed, 4242, 'maze seed from the start packet');
  assert.ok(end.T.some((r) => r[6] > 0), 'someone scored a kill');
  assert.equal(end.T.find((r) => r[0] === end.win)[6], Math.max(...end.T.map((r) => r[6])), 'winner has the most kills');
  const withSeed = snaps.filter((d) => d.seed != null).length;
  assert.ok(withSeed < snaps.length / 4, `seed in ${withSeed} of ${snaps.length} snapshots`);
  assert.ok(!core.rooms.values().next().value.server.running);
});

test('cannon-cove: bots sail to the sink target or the clock on the server; cannonballs ride as fire events only', () => {
  const { core, host, run, toServer } = room('cannon-cove');
  toServer(host, { g: 'run', bots: 11 });
  for (let t = 0; t < 60 * 60 * 5 && !host.data('done').length; t += 600) run(600);
  assert.equal(host.data('done').length, 1, 'match done');
  const snaps = host.data('s').map((m) => m.data), final = snaps.findLast((d) => d.ph === 'final');
  assert.ok(final.lf <= 0 || final.P.some((r) => r[8] >= 8), 'ended on the clock or the 8-sink target');
  assert.ok(snaps.some((d) => d.ev?.some((e) => e[0] === 'f')), 'broadsides fired');
  const withBarrels = snaps.filter((d) => d.B).length;
  assert.ok(withBarrels > 0 && withBarrels < snaps.length / 2, `barrels in ${withBarrels} of ${snaps.length} snapshots`);
  assert.ok(!core.rooms.values().next().value.server.running);
});

test('hex-drop: bots drop through 3 rounds on the server; floors ride as trigger indexes plus a keyframe each second', () => {
  const { core, host, run, toServer } = room('hex-drop');
  toServer(host, { g: 'run', bots: 11 });
  for (let t = 0; t < 60 * 60 * 15 && !host.data('done').length; t += 600) run(600);
  assert.equal(host.data('done').length, 1, 'match done');
  const snaps = host.data('s').map((m) => m.data), final = snaps.findLast((d) => d.ph === 'final');
  assert.equal(final.rd, 3, 'three rounds played');
  assert.ok(snaps.findLast((d) => d.S).S.some((r) => r[1] > 0), 'points were scored');
  assert.ok(snaps.some((d) => d.tr?.length), 'stepped-on tiles reported');
  const keyframes = snaps.filter((d) => d.K);
  assert.equal(keyframes[0].K.length, 507, 'one state digit per tile, 3 floors of 169');
  assert.ok(keyframes.length < snaps.length / 8, `keyframes in ${keyframes.length} of ${snaps.length} snapshots`);
  assert.ok(!core.rooms.values().next().value.server.running);
});

test('floor-is-lava: bots climb on the server until the crown or the lava ends it; every tab gets the tower seed', () => {
  const { core, host, run, toServer } = room('floor-is-lava');
  toServer(host, { g: 'run', bots: 11 });
  for (let t = 0; t < 60 * 60 * 6 && !host.data('done').length; t += 600) run(600);
  assert.equal(host.data('done').length, 1, 'match done');
  const snaps = host.data('s').map((m) => m.data), final = snaps.findLast((d) => d.ph === 'final');
  assert.ok(final, 'final standings reached');
  assert.ok(new Set(snaps.map((d) => d.sd)).size === 1 && snaps[0].sd > 0, 'one tower seed for the whole match');
  assert.ok(snaps.some((d) => d.ev?.some((e) => e[0] === 'j')), 'bots jumped');
  assert.ok(snaps.some((d) => d.ev?.some((e) => e[0] === 'b' || e[0] === 'w')), 'someone burned or won');
  assert.ok(Math.max(...final.P.map((r) => r[10])) > 10, 'bots climbed past the base');
  assert.ok(!core.rooms.values().next().value.server.running);
});

test('floor-is-lava: a jump press counter jumps once per new press; the countdown ignores movement', () => {
  const { host, guests, run, toServer, lastSnap } = room('floor-is-lava');
  toServer(host, { g: 'run', bots: 0 });
  run(2);
  const row = () => lastSnap(host).P.find((r) => r[0] === guests[0].id);
  toServer(guests[0], { g: 'i', x: 1, z: 0, j: 0 });
  run(10);
  assert.equal(lastSnap(host).ph, 'count');
  assert.equal(row()[4], 0, 'no running during the countdown');
  for (let t = 0; t < 600 && lastSnap(host).ph !== 'play'; t++) run(1);
  toServer(guests[0], { g: 'i', x: 0, z: 0, j: 1 });
  run(3);
  assert.ok(row()[5] > 5, 'press jumped');
  // single jump airtime 2·JUMP/G ≈ 0.9 s
  run(70);
  assert.ok(row()[8] & 4, 'landed again');
  toServer(guests[0], { g: 'i', x: 0, z: 0, j: 1 });
  run(5);
  assert.ok(row()[8] & 4, 'same counter, no second jump');
});

test('splat-turf: bots paint to the clock on the server; grid rides as deltas plus a keyframe every 2 s', () => {
  const { core, host, run, toServer } = room('splat-turf');
  toServer(host, { g: 'run', bots: 11, seed: 99 });
  for (let t = 0; t < 60 * 60 * 4 && !host.data('done').length; t += 600) run(600);
  assert.equal(host.data('done').length, 1, 'match done');
  const snaps = host.data('s').map((m) => m.data), end = snaps.findLast((d) => d.ph === 'end');
  assert.ok(end.win != null || end.P.length > 0, 'results reached');
  const keyframes = snaps.filter((d) => d.K), lastKey = keyframes.at(-1);
  assert.equal(lastKey.K.length, 48 * 48, 'one owner char per tile');
  assert.ok(new Set(lastKey.K).size > 6, 'many colors on the floor');
  assert.equal(lastKey.pal.length, 15, 'bare floor + 14 blob colors');
  assert.ok(snaps.some((d) => d.D?.length), 'paint deltas sent');
  assert.ok(keyframes.length < snaps.length / 20, `keyframes in ${keyframes.length} of ${snaps.length} snapshots`);
  assert.ok(!core.rooms.values().next().value.server.running);
});

// Late join > 3 humans + 11 bots fill all 14 seats; a 4th human arriving mid-match takes a bot's seat (Turbo Ball seats fewer, by team)
const FULL_AT_14 = Object.entries(GAMES).filter(([game]) => game !== 'turbo-ball');
for (const [game, { rows, live }] of FULL_AT_14) {
  test(`${game}: a human joining a full room mid-match replaces one bot and gets a row`, () => {
    const { core, host, run, toServer, lastSnap } = room(game);
    toServer(host, { g: 'run', bots: 11, seed: 7 });
    for (let t = 0; t < 600 && lastSnap(host)?.ph !== live; t++) run(1);
    assert.equal(lastSnap(host)[rows].length, 14, 'room starts full');
    const late = join(core, game, host.code);
    run(4);
    const seats = lastSnap(late)[rows].map((r) => r[0]);
    assert.equal(seats.length, 14, 'still 14 seats');
    assert.ok(seats.includes(late.id), 'joiner has a row');
    assert.equal(seats.filter((id) => id < 0).length, 10, 'one bot gave up its seat');
  });
}

test('sheepdog-rush: a late joiner into a full room takes over the replaced bot pen, pens stay one each', () => {
  const { core, host, run, toServer, lastSnap } = room('sheepdog-rush');
  toServer(host, { g: 'run', bots: 11 });
  for (let t = 0; t < 600 && lastSnap(host)?.ph !== 'play'; t++) run(1);
  join(core, 'sheepdog-rush', host.code);
  run(4);
  assert.deepEqual(lastSnap(host).P.map((r) => r[8]).sort((a, b) => a - b), Array.from({ length: 14 }, (_, k) => k), 'pens 0..13');
});

test('splat-turf: a late joiner gets the grid keyframe and palette at once, reusing the replaced bot paint slot', () => {
  const { core, host, run, toServer, lastSnap } = room('splat-turf');
  toServer(host, { g: 'run', bots: 11, seed: 7 });
  for (let t = 0; t < 600 && lastSnap(host)?.ph !== 'play'; t++) run(1);
  const late = join(core, 'splat-turf', host.code);
  run(2);
  const first = late.data('s')[0].data;
  assert.equal(first.K.length, 48 * 48, 'grid keyframe in the first snapshot');
  assert.equal(first.pal.length, 15, 'bare floor + 14 slots, none added');
  const slots = first.P.map((r) => r[6]).sort((a, b) => a - b);
  assert.deepEqual(slots, Array.from({ length: 14 }, (_, k) => k + 1), 'slots 1..14, one each');
});

test('penguin-curling: only the thrower can launch; hold then release SLIDE sends the penguin down the ice', () => {
  const { host, guests, run, toServer, lastSnap } = room('penguin-curling');
  const LAUNCHED = 2;
  toServer(host, { g: 'run', bots: 0, seed: 7 });
  for (let t = 0; t < 600 && lastSnap(host)?.ph !== 'aim'; t++) run(1);
  const humans = [host, ...guests], thrower = humans.find((p) => p.id === lastSnap(host).tu), waiting = humans.find((p) => p !== thrower);
  const row = (p) => lastSnap(host).P.find((r) => r[0] === p.id);
  for (const p of [thrower, waiting]) toServer(p, { g: 'i', x: 0, h: 0 });
  run(2);
  for (const p of [thrower, waiting]) toServer(p, { g: 'i', x: 0, h: 1 });
  run(30);
  for (const p of [thrower, waiting]) toServer(p, { g: 'i', x: 0, h: 0 });
  run(3);
  assert.ok(row(thrower)[7] & LAUNCHED, 'thrower launched');
  assert.ok(row(thrower)[4] < -1, 'sliding toward the house');
  assert.equal(row(waiting)[7] & LAUNCHED, 0, 'waiting penguin stays behind the hack');
});

test('penguin-curling: round facts ride only when they change; bots play a whole match to the end', () => {
  const { core, host, run, toServer } = room('penguin-curling');
  toServer(host, { g: 'run', bots: 11, seed: 7 });
  run(4);
  const [first, second] = host.data('s').map((m) => m.data);
  assert.equal(first.o.length, 14, 'first snapshot carries the throw order');
  assert.equal(second.o, undefined, 'nothing changed one tick later');
  assert.equal(second.P.length, 14, 'penguin rows every time');
  for (let t = 0; t < 60 * 60 * 30 && !host.data('done').length; t += 600) run(600);
  assert.equal(host.data('done').length, 1, 'match done');
  assert.ok(host.data('s').some((m) => m.data.ph === 'final'), 'final standings shown');
  assert.ok(!core.rooms.values().next().value.server.running);
});

test('mini-golf: only the golfer on turn can putt; a resent shot seq is dropped; shot clock comes from the lobby setting', () => {
  const { host, guests, run, toServer, lastSnap } = room('mini-golf');
  toServer(host, { g: 'run', bots: 0, settings: { clock: 30 } });
  run(2);
  assert.equal(host.data('s')[0].data.ck, 30, 'lobby shot clock');
  for (let t = 0; t < 900 && lastSnap(host)?.tn == null; t++) run(1);
  const humans = [host, ...guests], putter = humans.find((p) => p.id === lastSnap(host).tn), waiting = humans.find((p) => p !== putter);
  const row = (p) => lastSnap(host).B.find((r) => r[0] === p.id);
  toServer(waiting, { g: 'i', shot: [0, 0.5], q: 1 });
  toServer(putter, { g: 'i', shot: [0, 0.5], q: 1 });
  run(3);
  assert.equal(row(waiting)[6], 0, 'not their turn: no stroke');
  assert.equal(row(putter)[6], 1, 'putter took a stroke');
  assert.ok(Math.hypot(row(putter)[3], row(putter)[4]) > 1, 'ball rolling');
  for (let t = 0; t < 3000 && lastSnap(host).tn !== putter.id; t++) {
    const up = humans.find((p) => p.id === lastSnap(host).tn);
    if (up && !lastSnap(host).rl) toServer(up, { g: 'i', shot: [1, 0.3], q: 100 + t });
    run(1);
  }
  const before = row(putter)[6];
  toServer(putter, { g: 'i', shot: [0, 0.5], q: 1 });
  run(3);
  assert.equal(row(putter)[6], before, 'same shot seq again: dropped');
});

test('mini-golf: scorecard rides only when it changes; bots play all six holes to the end without a long relay tick', () => {
  const { core, host, run, toServer } = room('mini-golf');
  toServer(host, { g: 'run', bots: 11 });
  run(4);
  const [first, second] = host.data('s').map((m) => m.data);
  assert.equal(first.od.length, 14, 'first snapshot carries the tee order');
  assert.equal(second.od, undefined, 'nothing changed one tick later');
  assert.equal(second.B.length, 14, 'ball rows every time');
  // room.server.running, not the inbox: scanning every snapshot so far on each tick would swamp the timing
  const { server } = core.rooms.values().next().value;
  const tickMs = [];
  for (let t = 0; t < 60 * 60 * 40 && server.running; t++) {
    const startedAt = performance.now();
    run(1);
    tickMs.push(performance.now() - startedAt);
  }
  assert.equal(host.data('done').length, 1, 'match done');
  assert.ok(host.data('s').some((m) => m.data.ph === 'final'), 'final scorecard shown');
  // 5th slowest, not the max: a lone GC pause is noise, while a search done in one tick would stall every bot putt (hundreds)
  const fifthSlowest = tickMs.sort((a, b) => b - a)[4];
  assert.ok(fifthSlowest < 12, `5th slowest tick ${fifthSlowest.toFixed(1)} ms: bot putt search stays spread over ticks`);
});

test('light-cycles: a guest turn applies once however often its packet repeats; boost rides every packet; the ack is the turn count', () => {
  const { host, guests, run, toServer, lastSnap } = room('light-cycles');
  const [rider, idle] = guests, DIR = 3, ACK = 9;
  toServer(host, { g: 'run', bots: 0 });
  for (let t = 0; t < 600 && lastSnap(host)?.ph !== 'play'; t++) run(1);
  const row = (p) => lastSnap(host).P.find((r) => r[0] === p.id);
  for (const p of guests) toServer(p, { g: 'i', b: 0, tn: 0, q: [] });
  run(1);
  const startDir = row(rider)[DIR];
  const turnRight = { b: 1, tn: 1, q: [[1, -1]] };
  toServer(rider, turnRight);
  toServer(rider, turnRight);
  run(2);
  toServer(rider, { g: 'i', n: 5, ...turnRight });
  run(2);
  assert.equal(row(rider)[DIR], (startDir + 1) % 4, 'one right turn, repeats dropped');
  assert.equal(row(rider)[ACK], 1, 'turn count acked');
  assert.ok(row(rider)[4] & 4, 'boosting');
  assert.equal(row(idle)[ACK], 0);
});

test('light-cycles: corners ride as a keyframe about once a second; bots ride all rounds to the end', () => {
  const { core, host, run, toServer } = room('light-cycles');
  toServer(host, { g: 'run', bots: 11 });
  run(4);
  const [first, second] = host.data('s').map((m) => m.data);
  assert.equal(first.K.length, 14, 'first snapshot carries every trail');
  assert.equal(second.K, undefined, 'no keyframe one tick later');
  const { server } = core.rooms.values().next().value;
  for (let t = 0; t < 60 * 60 * 10 && server.running; t += 600) run(600);
  assert.equal(host.data('done').length, 1, 'match done');
  assert.ok(host.data('s').some((m) => m.data.ph === 'final'), 'final standings shown');
});
