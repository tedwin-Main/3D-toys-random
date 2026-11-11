// Runs Waldo Hunt rounds on the relay server: lobby host starts / stops / skips ahead, players send clicks and hide spots, round messages go to one seat or everyone.

import { createWaldoRounds } from './waldo-rounds.js';

const TICK_MS = 200;

/**
 * room: server view of the relay room ({ lobbyHost, players, send(data, { to }) }).
 * Lobby host sends { g: 'run', bots, settings } / { g: 'stop' } / { g: 'next' }; players send { g: 'c', t: 'click' | 'place', x, y } and { g: 'hello' } (catch up).
 * Round messages go out as { g: 'm', m }.
 */
export function createWaldoServerHost(room) {
  let rounds = null, lastTickMs = 0;

  const send = (to, m) => room.send({ g: 'm', m }, to == null ? {} : { to });

  function onLobbyHostData(data) {
    if (data.g === 'run') {
      rounds = createWaldoRounds({ send });
      rounds.start({ settings: data.settings ?? {}, humans: room.players, bots: Math.max(0, Math.floor(Number(data.bots)) || 0) });
    } else if (data.g === 'stop') rounds = null;
    else if (data.g === 'next') rounds?.next();
  }

  return {
    get running() { return !!rounds; },
    // relay-stats: no jitter queue here (clicks are one-off)
    takeQueueStats: () => null,
    onData(data, from) {
      if (!data) return;
      if (from === room.lobbyHost) onLobbyHostData(data);
      if (data.g === 'c') rounds?.act(from, data);
      else if (data.g === 'hello') rounds?.catchUp(from);
    },
    onRoster() { rounds?.syncRoster(room.players); },
    tick(nowMs) {
      if (!rounds || nowMs - lastTickMs < TICK_MS) return;
      lastTickMs = nowMs;
      rounds.tick();
    },
    close() { rounds = null; },
  };
}
