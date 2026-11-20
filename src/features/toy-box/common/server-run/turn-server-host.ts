// Runs a turn or secret-pick room game on the relay server at 10 Hz: lobby host starts / stops it, players send actions, the public state goes out only when it changes.

const TICK_MS = 100;
const MAX_TICK_MS = 500; // after a stall the clock moves at most this far in one tick
// drawn here, not taken from the lobby host: whoever knows the seed could work out hidden picks, dice and buried tiles
const secretSeed = () => Math.floor(Math.random() * 2 ** 31);

/**
 * room: server view of the relay room ({ lobbyHost, players, send(data, { to, sticky }) => frame bytes }).
 * createGame({ onEnd }) => { startMatch({ seed, humans, bots, settings }), act(id, action), syncRoster(humans), tick(dt), state }
 * act / syncRoster / tick return true when the public state changed. state holds no secret picks: those stay inside the game module.
 * viewFor(id) (optional): that seat's own secret (dice, hand, boats); sent only to them as { g: 'Y', v, s } whenever it changes.
 * Lobby host sends { g: 'run', bots, settings } / { g: 'stop' }; players send { g: 'A', q: seq, a: action }; match end sends { g: 'done' }.
 * States go out sticky as { g: 'T', v, s }; s = null once the match is over, so a late joiner never draws a finished match.
 */
export function createTurnServerHost(room, { createGame }) {
  const lastActionSeq = new Map();
  // last private view JSON sent per seat: unchanged views stay off the wire
  const sentViews = new Map();
  // counts up for the life of the room: guests drop v <= the last one they saw
  let game = null, version = 0, lastMs = null;

  // private views ride the current public version; never sticky, never to anyone but their seat
  function sendViews() {
    if (!game?.viewFor) return;
    for (const p of room.players) {
      const view = game.viewFor(p.id) ?? null, key = JSON.stringify(view);
      if (sentViews.get(p.id) === key) continue;
      sentViews.set(p.id, key);
      room.send({ g: 'Y', v: version, s: view }, { to: p.id });
    }
  }

  function publish() {
    room.send({ g: 'T', v: ++version, s: game?.state ?? null }, { sticky: true });
    sendViews();
  }

  function run({ bots, settings }) {
    game = createGame({ onEnd: finish });
    sentViews.clear();
    game.startMatch({ seed: secretSeed(), humans: room.players, bots: Math.max(0, Math.floor(Number(bots)) || 0), settings: settings ?? {} });
    lastMs = null;
    publish();
  }

  function stop() {
    if (!game) return;
    game = null;
    sentViews.clear();
    publish();
  }

  function finish() {
    stop();
    room.send({ g: 'done' });
  }

  // websocket keeps order; seq drops replays after a reconnect
  function isReplay(from, seq) {
    if (!(seq > (lastActionSeq.get(from) ?? 0))) return true;
    lastActionSeq.set(from, seq);
    return false;
  }

  function act(from, data) {
    if (!game || isReplay(from, Number(data.q))) return;
    if (game.act(from, data.a ?? {})) publish();
    else sendViews();
  }

  return {
    get running() { return !!game; },
    // relay-stats: no jitter queue here (actions are one-off)
    takeQueueStats: () => null,
    onData(data, from) {
      if (data?.g === 'A') return act(from, data);
      if (from !== room.lobbyHost) return;
      if (data?.g === 'run') run(data);
      else if (data?.g === 'stop') stop();
    },
    onRoster() {
      const here = new Set(room.players.map((p) => p.id));
      for (const id of [...lastActionSeq.keys()]) if (!here.has(id)) lastActionSeq.delete(id);
      for (const id of [...sentViews.keys()]) if (!here.has(id)) sentViews.delete(id);
      if (game?.syncRoster(room.players)) publish();
      else sendViews();
    },
    tick(nowMs) {
      if (!game) return;
      lastMs ??= nowMs;
      const elapsedMs = nowMs - lastMs;
      if (elapsedMs < TICK_MS) return;
      lastMs = nowMs;
      // may end the match (finish clears game); a private view may change on its own (new hand dealt mid-phase)
      if (game.tick(Math.min(elapsedMs, MAX_TICK_MS) / 1000) && game) publish();
      else sendViews();
    },
    close() { game = null; },
  };
}
