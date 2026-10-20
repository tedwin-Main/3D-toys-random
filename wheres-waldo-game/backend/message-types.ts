// Wire protocol. One websocket per player; the server is authoritative for the
// target coordinate, the clock, and every score.

import type { Difficulty, Mode } from './game-rules.ts';
import type { ThemeId } from './map-themes.ts';

/** 'random' tours the maps -- a different one each round. */
export type ThemeChoice = ThemeId | 'random';

export interface PlayerView {
  id: string;
  nick: string;
  score: number;
  connected: boolean;
  isHost: boolean;
  /** Has this player found the target in the current round. */
  found: boolean;
  /** Is this player the hider this round (hide mode only). */
  hiding: boolean;
}

export interface LobbyView {
  code: string;
  mode: Mode;
  difficulty: Difficulty;
  /** What the host picked; the per-round map is announced in roundStart. */
  themeChoice: ThemeChoice;
  /** Host setting: on by default -- the world is bigger than the screen. */
  panning: boolean;
  phase: 'lobby' | 'placing' | 'playing' | 'roundEnd' | 'gameEnd';
  round: number;        // 1-based
  totalRounds: number;
  players: PlayerView[];
  youId: string;
}

export type ClientMsg =
  | { t: 'create'; nick: string; mode: Mode; difficulty: Difficulty; theme?: ThemeChoice; panning?: boolean }
  | { t: 'join'; code: string; nick: string }
  | { t: 'config'; mode?: Mode; difficulty?: Difficulty; theme?: ThemeChoice; panning?: boolean }
  | { t: 'start' }
  | { t: 'place'; x: number; y: number }
  | { t: 'click'; x: number; y: number }
  | { t: 'next' };

export type ServerMsg
  = { t: 'lobby'; lobby: LobbyView }
  | { t: 'error'; message: string }
  /** Hide mode: you are the hider, place your Waldo in this crowd. */
  | { t: 'placePrompt'; seed: number; theme: ThemeId; decoyRatio: number; density: number }
  /** Hide mode, non-hiders: sit tight while the hider places. */
  | { t: 'waitingForHider'; hiderNick: string }
  /**
   * `targetAt` is null in race mode (the generator places Waldo, so every client
   * derives the same position from the seed) and carries the hider's coordinate
   * in hide mode, because clients cannot draw a sprite they do not know about.
   * Either way the answer ends up client-side -- that was a deliberate call:
   * the server still validates every click, so a devtools peek is a social
   * problem, not an exploitable one.
   */
  | { t: 'roundStart'; seed: number; theme: ThemeId; decoyRatio: number; density: number; targetAt: { x: number; y: number } | null; endsAt: number; round: number }
  /** Someone found it. Only a count leaks -- never a position. */
  | { t: 'found'; playerId: string; nick: string; foundCount: number; seekerCount: number; score: number }
  /** `freeLeft` is how many more misses this round are still free (0 once the penalty bites). */
  | { t: 'wrong'; cooldownMs: number; freeLeft: number }
  | { t: 'roundEnd'; target: { x: number; y: number } | null; reason: 'allFound' | 'timeout' | 'voided'; lobby: LobbyView }
  | { t: 'gameEnd'; lobby: LobbyView };
