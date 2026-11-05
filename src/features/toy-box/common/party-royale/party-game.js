// Boots a party royale page: lobby (up to 32 beans), attract mode, host / guest loops, HUD and show flow.

import { createLobby } from '../room-lobby.js';
import { startTicker } from '../room-client.js';
import { INTRO, ACTIVE, QUALIFIED } from './round-sim.js';
import { ROUNDS } from './show-director.js';
import { createMatchFlow } from './match-flow.js';
import { createHostNet, createGuestRound } from './party-netplay.js';
import { decodeSnapshot } from './round-snapshot.js';
import { createPartyView } from './party-view.js';
import { createPartyHud, esc } from './party-hud.js';
import { createPartyInput } from './party-input.js';
import { createPartyAudio } from './party-audio.js';
import { SYMBOL_EMOJI } from './course-meshes.js';
import { SYMBOLS } from './rounds/pattern-panic.js';
import { TEAM_COLORS, teamScores } from './rounds/egg-haul.js';

export const MAX_BEANS = 32;
const ATTRACT_BOTS = 12;
const SHOW_META = { title: 'Bean Royale Show', emoji: '🫘', blurb: 'A full show for up to 32 beans: a race opener, survival, logic, hunt and team rounds knock the field down, then a final crowns one winner.' };
const BOT_NAMES = ['Jelly', 'Wobbles', 'Squish', 'Hopper', 'Noodle', 'Gumdrop', 'Pip', 'Marsh', 'Boing', 'Taffy', 'Sprout', 'Fizz', 'Dumpling', 'Mochi', 'Pudding', 'Bloop', 'Sprinkle', 'Toffee', 'Nugget', 'Waffle', 'Bubbles', 'Pickle', 'Biscuit', 'Jujube', 'Peanut', 'Sherbet', 'Muffin', 'Tater', 'Wiggle', 'Dot', 'Zippy'];
const BOT_COLORS = ['#9b5de5', '#00bbf9', '#00f5d4', '#f15bb5', '#fee440', '#8ac926', '#ff924c', '#6a4c93', '#e76f51', '#2a9d8f', '#b5179e', '#577590', '#ef476f', '#06d6a0', '#ffb703', '#8338ec', '#3a86ff', '#fb5607', '#ff006e', '#80ed99', '#c77dff', '#48cae4', '#f4a261', '#e9c46a', '#90be6d', '#43aa8b', '#f94144', '#4d908e', '#ffafcc', '#bde0fe', '#cdb4db'];
const bots = (n, idBase = -1) => Array.from({ length: n }, (_, i) => ({ id: idBase - i, nick: `${BOT_NAMES[i % BOT_NAMES.length]} 🤖`, color: BOT_COLORS[i % BOT_COLORS.length], bot: true }));

/** opts: { round: id } for a single-round page, or { show: true } for the full show */
export function bootPartyRoyale({ round: roundId, show = false }) {
  const meta = show ? SHOW_META : { title: ROUNDS[roundId].title, emoji: ROUNDS[roundId].emoji, blurb: ROUNDS[roundId].goal };
  const view = createPartyView();
  const audio = createPartyAudio();
  const controls = createPartyInput();
  const hud = createPartyHud({ onLobby: () => lobby.backToLobby() });
  const game = { mode: 'attract', flow: null, net: null, guest: null, lastMsg: null, botCount: 0, pressed: { j: 0, d: 0 } };
  const isHost = () => !!lobby.room?.isHost;
  const me = () => (game.mode === 'match' ? lobby.room?.me ?? 0 : 0);
  const viewSim = () => game.guest?.mirror ?? game.flow?.sim ?? null;

  // Match > host or attract flow; guests only mirror what the host sends
  function createFlow(online) {
    return createMatchFlow({
      show, roundId,
      rosterNow: () => (online ? [...lobby.room.players.map((p) => ({ id: p.id, nick: p.nick, color: p.color, bot: false })), ...bots(game.botCount)] : bots(ATTRACT_BOTS)).slice(0, MAX_BEANS),
      send: (msg, sticky) => { if (online) lobby.room.send(msg, { sticky }); },
      onRound: (sim, msg) => { game.lastMsg = msg; game.net?.begin(msg.rk); loadRound(sim, msg); },
      onResults: (sim) => showResults(sim, sim.qualified),
      onChampion: (b) => crown(b),
      onDone: () => (online ? lobby.backToLobby() : game.flow.start()),
      resultsSeconds: online ? 5 : 2.5,
    });
  }

  function startAttract() {
    Object.assign(game, { mode: 'attract', guest: null, net: null, lastMsg: null });
    hud.leaveRoom();
    game.flow = createFlow(false);
    game.flow.start();
  }

  function loadRound(sim, msg) {
    view.load(sim);
    hud.results(null); hud.call(null);
    const line = msg.final ? 'Final round: one winner' : `${sim.list.length} beans · ${sim.keep} go through`;
    hud.intro(sim.round, show ? `Round ${msg.no + 1} · ${line}` : line);
  }

  function showResults(sim, qualified) {
    hud.intro(null);
    const q = new Set(qualified), mine = me();
    const rows = sim.list.map((b) => ({ nick: b.nick, color: b.color, out: !q.has(b.id), me: b.id === mine })).sort((a, b) => a.out - b.out);
    hud.results(`${sim.round.emoji} ${esc(sim.round.title)} · ${q.size} through`, rows);
  }

  function crown(b) {
    hud.results(null);
    hud.big(`<small>${b?.id === me() ? 'you won the show!' : 'show champion'}</small>👑 ${esc(b?.nick ?? '')}`, 8);
  }

  // Lobby > 2-32 beans, bots fill seats; late joiners spectate until the next round (or next show)
  const lobby = createLobby({
    game: show ? 'bean-royale-show' : roundId, title: meta.title, emoji: meta.emoji, accent: '#ffd23f', blurb: meta.blurb,
    maxBots: MAX_BEANS - 1, defaultBots: show ? 23 : 13, minPlayers: 2, maxTotal: MAX_BEANS, fastLinks: true,
    note: 'Up to 32 beans per room (humans + bots). The host runs the round; everyone else sends inputs and predicts their own bean, so jumps land where you see them even at 250 ms ping.',
    onJoin(room) {
      room.on('data', onData);
      room.on('roster', onRoster);
      room.on('host', onHostChange);
    },
    onStart({ bots: botCount, isHost: host, late }) {
      const running = late ? game.lastMsg : null; // sticky round message arrived with the seat
      Object.assign(game, { mode: 'match', botCount, guest: null, flow: null, net: null, lastMsg: null });
      hud.room(lobby.room.code, host);
      if (running) return joinRound(running);
      if (!host) { hud.intro(null); hud.big('<small>waiting for the host</small>…', 2); return; }
      game.net = createHostNet(lobby.room);
      game.flow = createFlow(true);
      game.flow.start();
    },
    onLobby() { hud.big(''); hud.results(null); startAttract(); },
  });

  function onRoster(players) {
    if (game.mode !== 'match' || !isHost() || !game.flow) return;
    const here = new Set(players.map((p) => p.id));
    for (const r of [...game.flow.roster]) if (!r.bot && !here.has(r.id)) game.flow.dropPlayer(r.id);
  }

  // host left: promoted guest turns its mirror into the live round and carries on
  function onHostChange(nowHost) {
    hud.room(lobby.room.code, nowHost);
    if (!nowHost || game.mode !== 'match' || !game.guest) return;
    game.net = createHostNet(lobby.room);
    game.flow = createFlow(true);
    game.flow.adopt(game.guest.mirror, game.lastMsg);
    game.net.begin(game.lastMsg.rk);
    game.guest = null;
    onRoster(lobby.room.players);
  }

  function joinRound(msg) {
    game.lastMsg = msg;
    game.guest = createGuestRound(lobby.room, msg, ROUNDS[msg.id]);
    loadRound(game.guest.mirror, msg);
  }

  // Net > guest side: round message, snapshots, results, champion; host side: input bundles
  function onData(raw, from) {
    const d = raw instanceof Uint8Array ? decodeSnapshot(raw) : raw; // binary frames = snapshots
    if (!d || d._lobby) return;
    if (game.mode !== 'match') { if (d.g === 'r') game.lastMsg = d; return; }
    if (isHost()) { if (d.g === 'i') game.net?.onInput(from, d); return; }
    if (d.g === 'r') joinRound(d);
    else if (d.g === 's') {
      const events = game.guest?.onSnapshot(d);
      if (events) { view.snapshotArrived(); handleEvents(events, true); }
    }
    else if (d.g === 'res' && game.guest?.key === d.rk) showResults(game.guest.mirror, d.q);
    else if (d.g === 'champ' && game.guest) crown(game.guest.mirror.beans.get(d.id));
  }

  // Events > sounds + banners about me; guests already played their own jump / dive locally
  function handleEvents(events, remote) {
    const mine = me();
    audio.play(remote ? events.filter(([t, id]) => !(id === mine && (t === 'j' || t === 'd'))) : events, mine);
    for (const [type, id, other] of events) {
      if (type === 'go') hud.big('GO!', 0.8);
      if (!mine) continue;
      if (type === 'tail' && other === mine) hud.big('<small>tail stolen!</small>😱', 1);
      if (id !== mine) continue;
      if (type === 'q') hud.big('<small>you made it</small>QUALIFIED!', 2.2);
      else if (type === 'o') hud.big('<small>better luck next time</small>ELIMINATED', 2.5);
      else if (type === 'tail') hud.big('<small>tail grabbed</small>🦊', 1);
      else if (type === 'crown') hud.big('👑', 2);
    }
  }

  // Run engine > 60 Hz: host / local steps the round; guest logs + predicts own input
  let lastCount = 0;
  startTicker(60, (dt) => {
    const input = controls.read(view.camYaw);
    if (game.guest) return guestTick(input);
    const flow = game.flow;
    if (!flow) return;
    if (flow.stage !== 'round') return flow.wait(dt);
    const sim = flow.sim, mine = sim.beans.get(me());
    if (mine?.status === ACTIVE) Object.assign(mine, input);
    game.net?.applyInputs(sim);
    sim.step();
    countdown(sim);
    if (!game.net || game.net.sendSnapshot(sim)) { handleEvents(sim.events, false); sim.events = []; }
    if (sim.phase === 'end') flow.finishRound();
  });

  function guestTick(input) {
    const g = game.guest, b = g.pred.bean;
    if (b && input.jumpSeq !== game.pressed.j && b.gnd >= 0) audio.play([['j', me()]], me());
    if (b && input.diveSeq !== game.pressed.d) audio.play([['d', me()]], me());
    game.pressed.j = input.jumpSeq; game.pressed.d = input.diveSeq;
    g.tick(input);
    countdown(g.mirror);
  }

  function countdown(sim) {
    const left = sim.phase === 'intro' ? Math.ceil(INTRO - sim.clock) : 0;
    if (left !== lastCount && left > 0 && left <= 3) { audio.beep(); hud.big(String(left), 0.9); }
    if (left === 0 && lastCount > 0) hud.intro(null);
    lastCount = left;
  }

  // HUD > status line per round kind, timer, symbol call
  let hudT = 0;
  function updateHud(dt) {
    hud.tick(dt);
    const sim = viewSim();
    if (!sim || (hudT -= dt) > 0) return;
    hudT = 0.15;
    const playing = sim.phase === 'play';
    hud.timer(playing ? sim.round.duration - sim.playTime : null);
    const board = sim.round.symbols?.(sim.course, game.guest?.clock ?? sim.clock);
    hud.call(playing && board?.call >= 0 ? SYMBOL_EMOJI[SYMBOLS[board.call]] : null);
    hud.status(statusLine(sim));
  }

  function statusLine(sim) {
    const live = sim.list.filter((b) => b.status === ACTIVE), mine = sim.beans.get(me());
    const tag = mine ? (mine.status === QUALIFIED ? ' · <b style="font-size:14px">you\'re through</b>' : mine.status === ACTIVE ? '' : ' · spectating') : game.mode === 'attract' ? ' · demo' : '';
    const kind = sim.round.kind;
    if (kind === 'race') return `<b>${sim.list.filter((b) => b.status === QUALIFIED).length}</b> / ${sim.keep} qualified${tag}`;
    if (kind === 'hunt') return `<b>${live.filter((b) => b.tail).length}</b> tails · ${mine?.tail ? 'you have one, run!' : 'grab a tail!'}${tag}`;
    if (kind === 'team') return teamScores(sim).map((s, k) => `<b style="color:#${TEAM_COLORS[k].toString(16).padStart(6, '0')}">${s}</b>`).join(' · ') + ` eggs${mine?.team != null ? ` · your team <b style="color:#${TEAM_COLORS[mine.team].toString(16).padStart(6, '0')}">●</b>` : ''}${tag}`;
    if (kind === 'final' && sim.round.id === 'crown-summit') return `<b>👑</b> first to grab the crown wins${tag}`;
    return `<b>${live.length}</b> left · ${sim.keep} go through${tag}`;
  }

  // Run engine > render loop
  let last = performance.now();
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    view.frame({ dt, time: now / 1000, me: me(), guest: game.guest, turn: controls.turn });
    updateHud(dt);
    requestAnimationFrame(loop);
  }
  startAttract();
  requestAnimationFrame(loop);

  // ?debug: state for smoke tests
  if (/[?&]debug\b/.test(location.search)) globalThis.__party = { game, get room() { return lobby.room; }, get sim() { return viewSim(); }, get role() { return game.guest ? 'guest' : isHost() ? 'host' : 'local'; } };
}
