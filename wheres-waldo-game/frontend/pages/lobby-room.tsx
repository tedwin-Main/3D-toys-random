// Pre-game room: share the code, host tweaks mode/difficulty, host starts.

import type { LobbyView } from '../../backend/message-types.ts';
import { THEMES, THEME_IDS } from '../../backend/map-themes.ts';
import type { Difficulty, Mode } from '../../backend/game-rules.ts';
import { net } from '../components/socket-client.ts';

export function LobbyRoom({ lobby }: { lobby: LobbyView }) {
  const you = lobby.players.find((p) => p.id === lobby.youId);
  const isHost = !!you?.isHost;

  return (
    <div className="panel">
      <h1>
        Lobby <span className="codeBig">{lobby.code}</span>
      </h1>
      <p className="sub">Share that code. {lobby.players.length} player(s) in.</p>

      {isHost ? (
        <>
          <div className="seg">
            {(['race', 'hide'] as Mode[]).map((m) => (
              <button key={m} className={lobby.mode === m ? 'on' : ''} onClick={() => net.send({ t: 'config', mode: m })}>
                {m === 'race' ? 'Race' : 'Hide & seek'}
              </button>
            ))}
          </div>
          <div className="seg">
            {(['easy', 'normal', 'hard'] as Difficulty[]).map((d) => (
              <button key={d} className={lobby.difficulty === d ? 'on' : ''} onClick={() => net.send({ t: 'config', difficulty: d })}>
                {d}
              </button>
            ))}
          </div>
          <div className="seg maps">
            <button className={lobby.themeChoice === 'random' ? 'on' : ''} onClick={() => net.send({ t: 'config', theme: 'random' })}>
              Tour
            </button>
            {THEME_IDS.map((id) => (
              <button key={id} className={lobby.themeChoice === id ? 'on' : ''} onClick={() => net.send({ t: 'config', theme: id })}>
                {THEMES[id].name.split(' ')[0]}
              </button>
            ))}
          </div>
          <p className="hint">
            {lobby.themeChoice === 'random' ? 'Tour: a different Malaysian map each round.' : THEMES[lobby.themeChoice].blurb}
          </p>
          <label className="check">
            <input
              type="checkbox"
              checked={lobby.panning}
              onChange={(e) => net.send({ t: 'config', panning: e.target.checked })}
            />
            Allow panning
          </label>
        </>
      ) : (
        <p className="hint">
          Mode: <b>{lobby.mode === 'race' ? 'Race' : 'Hide & seek'}</b> · Difficulty: <b>{lobby.difficulty}</b> · Map:{' '}
          <b>{lobby.themeChoice === 'random' ? 'Tour' : THEMES[lobby.themeChoice].name}</b> · Panning:{' '}
          <b>{lobby.panning ? 'on' : 'off'}</b>
        </p>
      )}

      <ul className="players">
        {lobby.players.map((p) => (
          <li key={p.id} className={p.connected ? '' : 'gone'}>
            <span>{p.nick}</span>
            {p.isHost && <em>host</em>}
            {p.id === lobby.youId && <em>you</em>}
          </li>
        ))}
      </ul>

      {isHost ? (
        <button className="primary" onClick={() => net.send({ t: 'start' })}>Start game</button>
      ) : (
        <p className="hint">Waiting for the host to start…</p>
      )}
    </div>
  );
}
