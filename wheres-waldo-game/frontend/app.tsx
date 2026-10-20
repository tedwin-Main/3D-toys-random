// Screen router + round HUD. Every authoritative fact (scores, clock, hit/miss)
// arrives from the server; the client only generates the scene from the seed.

import { useEffect, useMemo, useRef, useState } from 'react';
import { WORLD_H, WORLD_W } from '../backend/scene-geometry.ts';
import type { LobbyView, ServerMsg } from '../backend/message-types.ts';
import { ROUND_MS, WRONG_GRACE, validatePlacement } from '../backend/game-rules.ts';
import { generateScene, stampTarget } from '../backend/crowd-scene.ts';
import { getTheme, type ThemeId } from '../backend/map-themes.ts';
import { isMuted, setMuted, sfx, unlockAudio } from './components/play-sound.ts';
import { net } from './components/socket-client.ts';
import { SceneView } from './components/scene-view.tsx';
import { Home } from './pages/home.tsx';
import { RoundClock } from './components/round-clock.tsx';
import { LobbyRoom } from './pages/lobby-room.tsx';
import { TargetCard } from './components/target-card.tsx';

interface RoundInfo {
  seed: number;
  theme: ThemeId;
  decoyRatio: number;
  density: number;
  targetAt: { x: number; y: number } | null;
  endsAt: number;
  round: number;
}

export default function App() {
  const [lobby, setLobby] = useState<LobbyView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [round, setRound] = useState<RoundInfo | null>(null);
  const [placeParams, setPlaceParams] = useState<{ seed: number; theme: ThemeId; decoyRatio: number; density: number } | null>(null);
  const [waitingFor, setWaitingFor] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [reveal, setReveal] = useState<{ x: number; y: number } | null>(null);
  const [roundReason, setRoundReason] = useState<string | null>(null);
  const [feed, setFeed] = useState<string[]>([]);
  const [now, setNow] = useState(Date.now());
  const [muted, setMutedState] = useState(isMuted());
  const myScore = useRef(0);
  const myNick = useRef<string | null>(null);
  const lastTickSecond = useRef(-1);

  // One shared ticker drives the clock and the cooldown pill.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, []);

  // Countdown heartbeat: one tick per second in the last 10s, higher-pitched in
  // the last 3s. Must live ABOVE the early returns below -- hooks have to run
  // in the same order on every render, and the early returns are conditional.
  useEffect(() => {
    if (!round) return;
    const secondsLeft = Math.ceil(Math.max(0, round.endsAt - now) / 1000);
    if (secondsLeft <= 10 && secondsLeft >= 1 && secondsLeft !== lastTickSecond.current) {
      lastTickSecond.current = secondsLeft;
      sfx.tick(secondsLeft <= 3);
    }
  }, [now, round]);

  // Audio needs a real user gesture before it's allowed to play. The first
  // pointerdown anywhere unlocks it and starts the ambient loop, then this
  // listener removes itself.
  useEffect(() => {
    const unlock = () => {
      unlockAudio();
      window.removeEventListener('pointerdown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  useEffect(() => {
    net.connect();
    return net.on((msg: ServerMsg) => {
      switch (msg.t) {
        case 'lobby': {
          setLobby(msg.lobby);
          const me = msg.lobby.players.find((p) => p.id === msg.lobby.youId);
          if (me) myNick.current = me.nick;
          if (msg.lobby.phase === 'lobby') {
            setRound(null);
            setPlaceParams(null);
            setReveal(null);
            setWaitingFor(null);
          }
          break;
        }
        case 'error':
          sfx.error();
          setError(msg.message);
          setTimeout(() => setError(null), 4000);
          break;
        case 'placePrompt':
          setPlaceParams({ seed: msg.seed, theme: msg.theme, decoyRatio: msg.decoyRatio, density: msg.density });
          setRound(null);
          setWaitingFor(null);
          setReveal(null);
          break;
        case 'waitingForHider':
          setWaitingFor(msg.hiderNick);
          setPlaceParams(null);
          setRound(null);
          setReveal(null);
          break;
        case 'roundStart':
          sfx.roundStart();
          lastTickSecond.current = -1;
          setRound({
            seed: msg.seed, theme: msg.theme, decoyRatio: msg.decoyRatio, density: msg.density,
            targetAt: msg.targetAt, endsAt: msg.endsAt, round: msg.round
          });
          setPlaceParams(null);
          setWaitingFor(null);
          setReveal(null);
          setRoundReason(null);
          setCooldownUntil(0);
          setFeed([]);
          break;
        case 'found':
          sfx[msg.nick === myNick.current ? 'correct' : 'click']();
          setFeed((f) => [`${msg.nick} found Waldo (+${msg.score})  ${msg.foundCount}/${msg.seekerCount}`, ...f].slice(0, 5));
          break;
        case 'wrong':
          sfx.wrong();
          setCooldownUntil(Date.now() + msg.cooldownMs);
          break;
        case 'roundEnd':
          sfx.roundEnd(msg.reason === 'voided' ? 'voided' : msg.reason === 'allFound' ? 'win' : 'time');
          setReveal(msg.target);
          setRoundReason(
            msg.reason === 'voided' ? 'Round voided — the hider dropped.'
              : msg.reason === 'allFound' ? 'Everyone found him.'
              : 'Time!'
          );
          setPlaceParams(null);
          setWaitingFor(null);
          break;
        case 'gameEnd':
          setLobby(msg.lobby);
          setRound(null);
          break;
      }
    });
  }, []);

  // The scene is a pure function of the seed, so it is memoised, not stored.
  const scene = useMemo(() => {
    if (placeParams) {
      return generateScene(placeParams, false);
    }
    if (round) {
      const base = generateScene(
        { seed: round.seed, theme: round.theme, decoyRatio: round.decoyRatio, density: round.density },
        round.targetAt === null
      );
      return round.targetAt ? stampTarget(base, round.targetAt.x, round.targetAt.y) : base;
    }
    return null;
  }, [placeParams, round]);

  if (!lobby) return <Home error={error} />;

  const you = lobby.players.find((p) => p.id === lobby.youId);
  myScore.current = you?.score ?? 0;

  if (lobby.phase === 'lobby') return <LobbyRoom lobby={lobby} />;

  if (lobby.phase === 'gameEnd') {
    return (
      <div className="panel">
        <h1>Final</h1>
        <ol className="standings">
          {lobby.players.map((p, i) => (
            <li key={p.id} className={i === 0 ? 'win' : ''}>
              <span>{p.nick}</span>
              <b>{p.score}</b>
            </li>
          ))}
        </ol>
        {you?.isHost && <button className="primary" onClick={() => net.send({ t: 'start' })}>Play again</button>}
      </div>
    );
  }

  const cooling = cooldownUntil > now;
  const remaining = round ? Math.max(0, round.endsAt - now) : ROUND_MS;
  const isHider = !!you?.hiding;
  const canClick = !!round && !isHider && !you?.found && !cooling && lobby.phase === 'playing';

  const handlePick = (x: number, y: number) => {
    sfx.click();
    if (placeParams && scene) {
      const check = validatePlacement(scene, x, y, { w: WORLD_W, h: WORLD_H });
      if (!check.ok) {
        sfx.error();
        setError(check.reason ?? 'Invalid spot.');
        setTimeout(() => setError(null), 2500);
        return;
      }
      net.send({ t: 'place', x, y });
      return;
    }
    if (canClick) net.send({ t: 'click', x, y });
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  return (
    <div className="game">
      <header className="hud">
        <div className="hudLeft">
          <span className="pill">{lobby.code}</span>
          <span className="pill">Round {lobby.round}/{lobby.totalRounds}</span>
          <span className="pill">{lobby.mode === 'race' ? 'Race' : 'Hide & seek'}</span>
          {/* which Malaysian map this round is set in */}
          {round && <span className="pill map">{getTheme(round.theme).name}</span>}
          {round && <RoundClock remaining={remaining} total={ROUND_MS} />}
          <button className="pill muteBtn" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
        <div className="hudRight">
          {lobby.players.map((p) => (
            <span key={p.id} className={`score ${p.found ? 'found' : ''} ${p.hiding ? 'hiding' : ''}`}>
              {p.nick} {p.score}{p.hiding ? ' 🙈' : ''}{p.found ? ' ✓' : ''}
            </span>
          ))}
        </div>
      </header>

      {scene ? (
        <SceneView
          scene={scene}
          hideTarget={!!placeParams}
          placing={!!placeParams}
          revealAt={reveal}
          panning={lobby.panning}
          occupants={lobby.difficulty === 'hard'}
          cooldownUntil={cooldownUntil}
          now={now}
          disabled={!canClick && !placeParams}
          onPick={handlePick}
        />
      ) : (
        <div className="panel mid">
          <h2>{waitingFor ? `${waitingFor} is hiding Waldo…` : 'Loading round…'}</h2>
        </div>
      )}

      <aside className="side">
        <TargetCard look={scene?.look} />
        {placeParams && <p className="hint">You are the hider. Click a spot in the crowd. Edges, empty ground and behind-scenery spots are rejected — and you score nothing if nobody finds you.</p>}
        {isHider && round && <p className="hint">Sit tight. You score the average time it takes them.</p>}
        {!isHider && round && you?.found && <p className="hint">Found. Waiting for the rest.</p>}
        {!isHider && round && !you?.found && (
          <p className="hint">
            {lobby.panning ? 'Drag or use WASD / arrows to pan. ' : 'Whole map is on screen. '}
            First {WRONG_GRACE} wrong clicks are free; after that each costs 2 seconds.
          </p>
        )}
        {roundReason && (
          <div className="roundEnd">
            <p>{roundReason}</p>
            {you?.isHost && <button className="primary" onClick={() => net.send({ t: 'next' })}>Next round</button>}
          </div>
        )}
        <ul className="feed">
          {feed.map((line, i) => <li key={i}>{line}</li>)}
        </ul>
        {error && <p className="error">{error}</p>}
      </aside>
    </div>
  );
}
