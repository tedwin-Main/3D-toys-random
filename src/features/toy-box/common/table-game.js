// Runs the shared host loop for turn-based and secret-pick party games: lobby, state sync, bots, roster, attract mode.

import { createLobby } from './room-lobby.js';
import { startTicker } from './room-client.js';
import { createTurnSync } from './turn-sync.js';

export const BOT_COLORS = ['#9b5de5', '#00bbf9', '#00f5d4', '#f15bb5', '#fee440', '#8ac926', '#ff924c', '#6a4c93', '#e76f51', '#2a9d8f', '#b5179e', '#577590', '#ef476f', '#06d6a0'];

// keys starting with "_" are host-only (secret picks, hidden codes, decks): never published, never in the change signature
const strip = (k, v) => (k[0] === '_' ? undefined : v);
const sigOf = (S) => JSON.stringify(S, (k, v) => (k === 'tt' || k[0] === '_' ? undefined : v));

/**
 * cfg: {
 *   lobby: createLobby options (game, title, emoji, accent, blurb, note, settings, maxBots, defaultBots, minPlayers),
 *   botNames: string[], hz (default 20), publishGap (s, min gap between publishes, default 0),
 *   newPlayer(id, nick, color, bot) -> player ({ id, nick, color, bot, score, ... }),
 *   newMatch(settings, P) -> S (host, match start; P already built),
 *   attract() -> S (local demo behind the lobby; P = bots),
 *   tick(S, dt) host rules (also runs attract), action(S, from, a) host,
 *   promote(S) a guest became host mid-match: ask again for secrets the old host held,
 *   joined(S, p) / left(S, ids) optional roster hooks (host, match),
 *   change(prev, cur) view update on any state change (prev = last public state or null),
 *   private(view) this player's private view (role, hand, hint), stream(from, d) live data from a peer,
 * }
 * S shape the kit relies on: { mode: 'match'|'attract', ph, tt, P: [players] }
 */
export function createTableGame(cfg) {
  const hz = cfg.hz ?? 20;
  let S = null, prevS = null, lastSig = '', started = false, sinceSent = 99, dirty = false;
  const game = {
    get S() { return S; },
    get room() { return lobby.room; },
    get me() { return lobby.room?.me; },
    get isHost() { return !!lobby.room?.isHost; },
    get started() { return started; },
    get inMatch() { return S?.mode === 'match'; },
    player: (id) => S?.P.find((p) => p.id === id),
    mine() { return S?.mode === 'match' ? S.P.find((p) => p.id === lobby.room?.me) : null; },
    // input from this tab: host runs it at once, guests send it to the host
    act(a) { if (S?.mode === 'match') sync.act(a); },
    // host: private view to one player (bots ignored); attract mode keeps it local
    tell(id, view) { if (S?.mode === 'match' && id > 0) sync.tell(id, view); },
    stream(d) { if (S?.mode === 'match') sync.stream(d); },
    // host: force a publish next tick even if only the clock changed
    touch() { lastSig = ''; },
    backToLobby() { lobby.backToLobby(); },
  };

  const sync = createTurnSync({
    onState(s) { if (started) apply(s); },
    onAction(from, a) { if (S?.mode === 'match') cfg.action(S, from, a); },
    onPrivate(v) { cfg.private?.(v); },
    onStream(from, d) { cfg.stream?.(from, d); },
  });

  function apply(s) {
    const prev = S?.mode === 'match' ? JSON.parse(sigOf(S)) : null;
    S = { ...s, mode: 'match' };
    cfg.change(prev, S);
  }

  function hostTick(dt) {
    cfg.tick(S, dt);
    sinceSent += dt;
    const s = sigOf(S);
    if (s !== lastSig) { lastSig = s; dirty = true; cfg.change(prevS, S); prevS = JSON.parse(s); }
    if (dirty && sinceSent >= (cfg.publishGap ?? 0)) {
      dirty = false; sinceSent = 0;
      if (S.mode === 'match' && lobby.room?.isHost) sync.publish(JSON.parse(JSON.stringify(S, strip)));
    }
  }

  function startAttract() {
    S = cfg.attract();
    S.mode = 'attract';
    prevS = null; lastSig = '';
    cfg.change(null, S);
  }

  function onRoster(players) {
    if (S?.mode !== 'match' || !lobby.room.isHost) return;
    const ids = new Set(players.map((p) => p.id));
    const gone = S.P.filter((p) => !p.bot && !ids.has(p.id)).map((p) => p.id);
    if (gone.length) { S.P = S.P.filter((p) => !gone.includes(p.id)); cfg.left?.(S, gone); }
    for (const p of players) if (!game.player(p.id)) {
      // room is full of bots: the weakest bot gives up its seat
      if (S.P.length >= 14) { const bot = S.P.filter((q) => q.bot).sort((a, c) => a.score - c.score)[0]; if (bot) { S.P.splice(S.P.indexOf(bot), 1); cfg.left?.(S, [bot.id]); } }
      const np = cfg.newPlayer(p.id, p.nick, p.color, false);
      S.P.push(np);
      cfg.joined?.(S, np);
    }
  }

  const lobby = createLobby({
    ...cfg.lobby,
    maxBots: cfg.lobby.maxBots ?? 13,
    onJoin(room) {
      document.getElementById('code').textContent = room.code;
      sync.attach(room);
      room.on('roster', onRoster);
      room.on('host', (isHost) => {
        syncTop();
        if (isHost && S?.mode === 'match') { lastSig = ''; prevS = JSON.parse(sigOf(S)); cfg.promote?.(S); }
      });
    },
    onStart({ bots, isHost, settings }) {
      started = true;
      showHud(true);
      syncTop();
      if (!isHost) { if (sync.state) apply(sync.state); return; }
      const P = lobby.room.players.map((p) => cfg.newPlayer(p.id, p.nick, p.color, false));
      for (let i = 0; i < bots; i++) P.push(cfg.newPlayer(-1 - i, `${cfg.botNames[i % cfg.botNames.length]} bot`, BOT_COLORS[i % BOT_COLORS.length], true));
      S = cfg.newMatch(settings, P);
      S.mode = 'match';
      prevS = null; lastSig = ''; sinceSent = 99;
    },
    onLobby() { started = false; sync.reset(); showHud(false); cfg.lobbyShown?.(); startAttract(); },
  });
  game.lobby = lobby;

  function showHud(on) {
    for (const el of document.querySelectorAll('[data-hud]')) el.style.display = on ? (el.dataset.hud || 'block') : 'none';
  }
  function syncTop() { const b = document.getElementById('lobbyBtn'); if (b) b.style.display = lobby.room?.isHost ? '' : 'none'; }
  document.getElementById('lobbyBtn')?.addEventListener('click', () => lobby.backToLobby());

  // Run engine > host / attract tick from a worker (a hidden host tab keeps the room going); guests only run the clock
  game.start = () => {
    startAttract();
    startTicker(hz, (dt) => {
      if (!S) return;
      if (S.mode === 'attract' || (lobby.room?.isHost && started)) hostTick(dt);
      else S.tt -= dt;
    });
  };
  return game;
}
