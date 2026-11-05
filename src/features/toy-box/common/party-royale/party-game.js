// Boots a party royale page: lobby (up to 32 beans), attract mode, guest loop against the relay-run host, HUD and show flow.

import { createLobby } from '../room-lobby.js';
import { startTicker } from '../room-client.js';
import { INTRO, ACTIVE, QUALIFIED } from './round-sim.js';
import { ROUNDS } from './show-director.js';
import { createMatchFlow } from './match-flow.js';
import { createGuestRound } from './party-netplay.js';
import { createFixedSteps } from './fixed-steps.js';
import { DT } from './course-colliders.js';
import { MAX_BEANS, botRoster } from './bot-roster.js';
import { SERVER_PEER } from '../relay-wire.js';
import { createPartyView } from './party-view.js';
import { createPartyHud, esc } from './party-hud.js';
import { createPartyInput } from './party-input.js';
import { createPartyAudio } from './party-audio.js';
import { SYMBOL_EMOJI } from './course-meshes.js';
import { SYMBOLS } from './rounds/pattern-panic.js';
import { TEAM_COLORS, teamScores } from './rounds/egg-haul.js';

const ATTRACT_BOTS = 12;
const SHOW_META = { title: 'Bean Royale Show', emoji: '🫘', blurb: 'A full show for up to 32 beans: a race opener, survival, logic, hunt and team rounds knock the field down, then a final crowns one winner.' };

/** opts: { round: id } for a single-round page, or { show: true } for the full show */
export function bootPartyRoyale({ round: roundId, show = false }) {
  const meta = show ? SHOW_META : { title: ROUNDS[roundId].title, emoji: ROUNDS[roundId].emoji, blurb: ROUNDS[roundId].goal };
  const view = createPartyView();
  const audio = createPartyAudio();
  const controls = createPartyInput();
  const hud = createPartyHud({ onLobby: () => lobby.backToLobby() });
  const game = { mode: 'attract', flow: null, guest: null, lastMsg: null, pressed: { j: 0, d: 0 } };
  const isHost = () => !!lobby.room?.isHost;
  const me = () => (game.mode === 'match' ? lobby.room?.me ?? 0 : 0);
  const viewSim = () => game.guest?.mirror ?? game.flow?.sim ?? null;

  // Attract > all-bot show run locally on the page; online matches run on the relay server (party-server-host.js)
  function createAttractFlow() {
    return createMatchFlow({
      show, roundId,
      rosterNow: () => botRoster(ATTRACT_BOTS),
      send: () => {},
      onRound: (sim, msg) => loadRound(sim, msg),
      onResults: (sim) => showResults(sim, sim.qualified),
      onChampion: (b) => crown(b),
      onDone: () => game.flow.start(),
      resultsSeconds: 2.5,
    });
  }

  function startAttract() {
    Object.assign(game, { mode: 'attract', guest: null, lastMsg: null });
    hud.leaveRoom();
    game.flow = createAttractFlow();
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
    maxBots: MAX_BEANS - 1, defaultBots: show ? 23 : 13, minPlayers: 2, maxTotal: MAX_BEANS,
    note: 'Up to 32 beans per room (humans + bots). The room server runs the round one hop from everyone; you send inputs and predict your own bean, so jumps land where you see them even at 250 ms ping.',
    onJoin(room) {
      room.on('data', onData);
      room.on('host', (nowHost) => hud.room(room.code, nowHost));
    },
    // lobby host asks the relay to run the match; every page (host included) plays it as a guest
    onStart({ bots, isHost: host, late }) {
      const running = late ? game.lastMsg : null; // sticky round message arrived with the seat
      Object.assign(game, { mode: 'match', guest: null, flow: null, lastMsg: null });
      hud.room(lobby.room.code, host);
      if (running) return joinRound(running);
      if (host) lobby.room.send({ g: 'run', bots }, { to: SERVER_PEER });
      hud.intro(null); hud.big('<small>starting</small>…', 2);
    },
    onLobby() {
      if (isHost()) lobby.room.send({ g: 'stop' }, { to: SERVER_PEER });
      hud.big(''); hud.results(null); startAttract();
    },
  });

  function joinRound(msg) {
    game.lastMsg = msg;
    game.guest = createGuestRound(lobby.room, msg, ROUNDS[msg.id]);
    loadRound(game.guest.mirror, msg);
  }

  // Net > from the relay-run host: round message, snapshots, results, champion, match done
  function onData(raw) {
    const d = raw instanceof Uint8Array ? decodeGuestSnapshot(raw) : raw; // binary frames = snapshots
    if (!d || d._lobby) return;
    if (game.mode !== 'match') { if (d.g === 'r') game.lastMsg = d; return; }
    if (d.g === 'done') { if (isHost()) lobby.backToLobby(); return; }
    if (d.g === 'r') joinRound(d);
    else if (d.g === 's') {
      const events = game.guest?.onSnapshot(d);
      if (events) { view.snapshotArrived(); handleEvents(events, true); }
    }
    else if (d.g === 'lead' && game.guest) shiftTicks(game.guest.leadShift(d));
    else if (d.g === 'res' && game.guest?.key === d.rk) showResults(game.guest.mirror, d.q);
    else if (d.g === 'champ' && game.guest) crown(game.guest.mirror.beans.get(d.id));
  }

  // Net > binary snapshot rows map onto my mirror's beans; none without a guest round
  function decodeGuestSnapshot(bytes) {
    return game.guest?.read(bytes) ?? null;
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

  // Run engine > fixed 60 Hz steps on wall time (worker timers drift off 60 Hz; the server host must see one input per its tick)
  let lastCount = 0;
  const stepsDue = createFixedSteps();
  const ticker = startTicker(60, () => {
    for (let n = stepsDue(performance.now()); n > 0; n--) step();
  });
  // Net > land my inputs just before the server tick takes them (server measures their wait)
  function shiftTicks(ms) {
    if (!ms) return;
    ticker.shift(ms); stepsDue.shift(ms);
  }

  // one tick: attract steps its local round; a guest logs + predicts own input
  function step() {
    const input = controls.read(view.camYaw);
    if (game.guest) return guestTick(input);
    const flow = game.flow;
    if (!flow) return;
    if (flow.stage !== 'round') return flow.wait(DT);
    const sim = flow.sim;
    sim.step();
    countdown(sim);
    handleEvents(sim.events, false); sim.events = [];
    if (sim.phase === 'end') flow.finishRound();
  }

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
  if (/[?&]debug\b/.test(location.search)) globalThis.__party = { game, get room() { return lobby.room; }, get sim() { return viewSim(); }, get role() { return game.guest ? 'guest' : 'local'; } };
}
