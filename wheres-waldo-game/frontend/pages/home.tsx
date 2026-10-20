// Nickname + 4-letter lobby code. No accounts, nothing persisted.

import { useState } from 'react';
import type { Difficulty, Mode } from '../../backend/game-rules.ts';
import { isMuted, setMuted } from '../components/play-sound.ts';
import type { ThemeChoice } from '../../backend/message-types.ts';
import { THEMES, THEME_IDS } from '../../backend/map-themes.ts';
import { net } from '../components/socket-client.ts';

export function Home({ error }: { error: string | null }) {
  const [nick, setNick] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<Mode>('race');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [theme, setTheme] = useState<ThemeChoice>('random');
  // on by default: the world is bigger than the screen and panning is the skill
  const [panning, setPanning] = useState(true);
  const [muted, setMutedState] = useState(isMuted());

  const name = nick.trim() || 'player';

  return (
    <div className="panel home">
      <button
        className="muteBtn corner"
        onClick={() => { setMuted(!muted); setMutedState(!muted); }}
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? '🔇' : '🔊'}
      </button>
      <h1>Waldo Hunt</h1>
      <p className="sub">Same crowd, everyone searching. Or take turns hiding.</p>

      <label>
        Nickname
        <input value={nick} maxLength={16} placeholder="player" onChange={(e) => setNick(e.target.value)} />
      </label>

      <div className="row">
        <div className="col">
          <h3>Host a lobby</h3>
          <div className="seg">
            <button className={mode === 'race' ? 'on' : ''} onClick={() => setMode('race')}>Race</button>
            <button className={mode === 'hide' ? 'on' : ''} onClick={() => setMode('hide')}>Hide &amp; seek</button>
          </div>
          <p className="hint">
            {mode === 'race'
              ? 'Best of 5. Everyone hunts the same Waldo, faster finds score more.'
              : 'Each player hides Waldo once. Hiders score the average time it took to find them.'}
          </p>
          <div className="seg">
            {(['easy', 'normal', 'hard'] as Difficulty[]).map((d) => (
              <button key={d} className={difficulty === d ? 'on' : ''} onClick={() => setDifficulty(d)}>{d}</button>
            ))}
          </div>
          <p className="hint">Difficulty sets where the decoy ramp starts — lookalikes climb every round. Hard also fills the windows and doorways with people.</p>

          {/* Map picker. 'Tour' is the default: a different Malaysian map each round. */}
          <div className="seg maps">
            <button className={theme === 'random' ? 'on' : ''} onClick={() => setTheme('random')}>Tour</button>
            {THEME_IDS.map((id) => (
              <button key={id} className={theme === id ? 'on' : ''} onClick={() => setTheme(id)}>
                {THEMES[id].name.split(' ')[0]}
              </button>
            ))}
          </div>
          <p className="hint">
            {theme === 'random' ? 'A different map every round — KL, kampung, pasar malam.' : THEMES[theme].blurb}
          </p>

          <label className="check">
            <input type="checkbox" checked={panning} onChange={(e) => setPanning(e.target.checked)} />
            Allow panning
          </label>
          <p className="hint">
            {panning
              ? 'The world is bigger than the screen — drag or use WASD to pan, with a minimap.'
              : 'Whole map on one screen instead. No panning, no zooming, everyone sees the same picture.'}
          </p>

          <button className="primary" onClick={() => net.send({ t: 'create', nick: name, mode, difficulty, theme, panning })}>
            Create lobby
          </button>
        </div>

        <div className="col">
          <h3>Join a lobby</h3>
          <input
            className="code"
            value={code}
            maxLength={4}
            placeholder="CODE"
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <button
            className="primary"
            disabled={code.length !== 4}
            onClick={() => net.send({ t: 'join', code, nick: name })}
          >
            Join
          </button>
          <p className="hint">Rejoin with the same nickname to reclaim your score after a drop.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
