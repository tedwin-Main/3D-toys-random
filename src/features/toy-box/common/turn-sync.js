// Synchronizes state for turn-based and simultaneous-pick multiplayer games.

// Multiplayer > Turn sync
// onState(state): guest got a newer state; onAction(fromId, action): host got an action (host's own included)
// onPrivate(view): this player got a private view from the host (role, hand, hint); onStream(fromId, data): someone streamed live data (ink strokes)
export function createTurnSync({ onState, onAction, onPrivate, onStream }) {
  let room = null, ver = 0, seq = 0, last = null;
  const seen = new Map();
  const api = {
    // lobby onJoin: start listening on this room
    attach(r) {
      room = r;
      r.on('data', (d, from) => {
        if (!d || d._lobby) return;
        if (d.g === 'T' && !r.isHost && d.v > ver) { ver = d.v; last = d.s; onState(d.s); }
        if (d.g === 'A' && r.isHost) {
          // websocket keeps order; seq drops replays after a reconnect
          if ((seen.get(from) ?? 0) >= d.q) return;
          seen.set(from, d.q);
          onAction(from, d.a);
        }
        if (d.g === 'P' && from === r.host) onPrivate?.(d.p);
        if (d.g === 'X') onStream?.(from, d.d);
      });
    },
    // host: send full state to everyone (late joiners get it from the relay's sticky slot)
    publish(state) {
      if (!room?.isHost) return;
      last = state;
      room.send({ g: 'T', v: ++ver, s: state }, { sticky: true });
    },
    // anyone: host runs it at once, guests send it to host
    act(action) {
      if (!room) return;
      if (room.isHost) onAction(room.me, action);
      else room.toHost({ g: 'A', q: ++seq, a: action });
    },
    // host: private view for one player only (the host's own view is handled locally)
    tell(id, view) {
      if (!room?.isHost) return;
      if (id === room.me) onPrivate?.(view);
      else room.send({ g: 'P', p: view }, { to: id });
    },
    // anyone: live data straight to every other player, one hop, no host round trip
    stream(data) { room?.send({ g: 'X', d: data }); },
    // last state seen or published (a guest promoted to host resumes from it)
    get state() { return last; },
    reset() { last = null; seen.clear(); },
  };
  return api;
}
