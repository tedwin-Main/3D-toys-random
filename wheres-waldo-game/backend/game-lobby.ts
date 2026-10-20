// Authoritative lobby state. In-memory only -- no database, nothing persisted
// past the last player leaving. A lobby is a 4-letter code, a player list, and
// one round's worth of state.

import { randomInt, randomUUID } from 'node:crypto';
import { WORLD_H, WORLD_W } from './scene-geometry.ts';
import {
  generateScene, stampTarget, targetPosition, type Scene
} from './crowd-scene.ts';
import {
  RACE_ROUNDS, ROUND_MS, WRONG_COOLDOWN_MS, WRONG_GRACE, decoyRatioFor, densityFor,
  hiderScore, isHit, seekerScore, validatePlacement,
  type Difficulty, type Mode
} from './game-rules.ts';
import type { LobbyView, PlayerView, ServerMsg, ThemeChoice } from './message-types.ts';
import { THEME_IDS, type ThemeId } from './map-themes.ts';

/** Ambiguous characters (I/O/0/1) are left out so codes can be read aloud. */
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** How long the hider gets to choose a spot before one is auto-picked. */
const PLACE_MS = 45_000;

export type Send = (msg: ServerMsg) => void;

export interface Player {
  id: string;
  nick: string;
  score: number;
  connected: boolean;
  joinedAt: number;
  send: Send;
  /** Timestamp until which this player's clicks are ignored (misclick cooldown). */
  cooldownUntil: number;
  /** Wrong clicks this round. The first WRONG_GRACE of them are free. */
  misses: number;
  foundAt: number | null;
}

export class Lobby {
  code: string;
  mode: Mode;
  difficulty: Difficulty;
  /** Host's map setting. 'random' tours a different map each round. */
  themeChoice: ThemeChoice = 'random';
  /** Host setting: let players pan a world bigger than the screen. Off by default. */
  panning = true;
  /** The map actually in play this round (resolved from themeChoice at round start). */
  roundTheme: ThemeId = 'kl';
  phase: LobbyView['phase'] = 'lobby';
  players = new Map<string, Player>();
  hostId = '';

  /** 0-based index of the current round. */
  roundIndex = 0;
  seed = 0;
  scene: Scene | null = null;
  targetAt: { x: number; y: number } | null = null;
  startedAt = 0;
  endsAt = 0;

  /** Hide mode: rotation order so every player hides exactly once. */
  hiderOrder: string[] = [];
  hiderId: string | null = null;

  private timer: NodeJS.Timeout | null = null;
  private onEmpty: () => void;

  constructor(code: string, mode: Mode, difficulty: Difficulty, onEmpty: () => void, theme: ThemeChoice = 'random', panning = true) {
    this.code = code;
    this.mode = mode;
    this.difficulty = difficulty;
    this.themeChoice = theme;
    this.panning = panning;
    this.onEmpty = onEmpty;
  }

  /**
   * Resolve the map for the current round. On 'random' it steps through the
   * list from a random start, so a multi-round game tours all three maps
   * instead of rolling the same one twice in a row.
   */
  private themeForRound(): ThemeId {
    if (this.themeChoice !== 'random') return this.themeChoice;
    if (this.themeOffset < 0) this.themeOffset = randomInt(THEME_IDS.length);
    return THEME_IDS[(this.themeOffset + this.roundIndex) % THEME_IDS.length];
  }

  /** -1 until the first round picks a starting point for the 'random' rotation. */
  private themeOffset = -1;

  static makeCode(): string {
    let out = '';
    for (let i = 0; i < 4; i++) out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
    return out;
  }

  get totalRounds(): number {
    // Race is a fixed best-of-5; hide rotates once per player, so the player
    // count sets the round count.
    return this.mode === 'race' ? RACE_ROUNDS : Math.max(1, this.hiderOrder.length || this.players.size);
  }

  // ---------------------------------------------------------------- membership

  addPlayer(nick: string, send: Send): Player {
    const player: Player = {
      id: randomUUID(),
      nick: nick.slice(0, 16) || 'player',
      score: 0,
      connected: true,
      joinedAt: Date.now(),
      send,
      cooldownUntil: 0,
      misses: 0,
      foundAt: null
    };
    this.players.set(player.id, player);
    if (!this.hostId) this.hostId = player.id;
    this.broadcastLobby();
    return player;
  }

  disconnect(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;
    player.connected = false;

    // The hider vanishing mid-round makes the round unwinnable, so it is voided
    // and replayed with a fresh seed rather than silently scored.
    if (this.hiderId === playerId && (this.phase === 'placing' || this.phase === 'playing')) {
      this.endRound('voided');
    }

    if (this.hostId === playerId) this.migrateHost();

    if ([...this.players.values()].every((p) => !p.connected)) {
      this.clearTimer();
      this.onEmpty();
      return;
    }
    this.broadcastLobby();
    this.maybeFinishRound();
  }

  reconnectSlotFor(nick: string): Player | undefined {
    return [...this.players.values()].find((p) => !p.connected && p.nick === nick);
  }

  /** Host migrates to the longest-connected remaining player. */
  private migrateHost(): void {
    const next = [...this.players.values()]
      .filter((p) => p.connected)
      .sort((a, b) => a.joinedAt - b.joinedAt)[0];
    this.hostId = next ? next.id : '';
  }

  // -------------------------------------------------------------------- rounds

  configure(mode: Mode | undefined, difficulty: Difficulty | undefined, theme?: ThemeChoice, panning?: boolean): void {
    if (this.phase !== 'lobby') return;
    if (mode) this.mode = mode;
    if (difficulty) this.difficulty = difficulty;
    if (theme) this.themeChoice = theme;
    if (panning !== undefined) this.panning = panning;
    this.broadcastLobby();
  }

  start(byPlayerId: string): string | null {
    if (byPlayerId !== this.hostId) return 'Only the host can start.';
    if (this.phase !== 'lobby' && this.phase !== 'gameEnd') return 'Game already running.';
    const connected = [...this.players.values()].filter((p) => p.connected);
    if (this.mode === 'hide' && connected.length < 2) return 'Hide mode needs at least 2 players.';
    for (const p of this.players.values()) p.score = 0;
    this.hiderOrder = connected.map((p) => p.id);
    this.roundIndex = 0;
    this.beginRound();
    return null;
  }

  private params() {
    return {
      seed: randomInt(1, 2 ** 31 - 1),
      theme: this.themeForRound(),
      decoyRatio: decoyRatioFor(this.difficulty, this.roundIndex),
      density: densityFor(this.difficulty, this.roundIndex)
    };
  }

  private beginRound(): void {
    const { seed, theme, decoyRatio, density } = this.params();
    this.seed = seed;
    this.roundTheme = theme;
    for (const p of this.players.values()) {
      p.foundAt = null;
      p.cooldownUntil = 0;
      p.misses = 0;
    }

    if (this.mode === 'race') {
      this.scene = generateScene({ seed, theme, decoyRatio, density }, true);
      this.targetAt = targetPosition(this.scene);
      this.hiderId = null;
      this.goLive(decoyRatio, density);
      return;
    }

    // Hide mode: build the crowd now, let the hider stamp Waldo into it.
    this.scene = generateScene({ seed, theme, decoyRatio, density }, false);
    this.targetAt = null;
    this.hiderId = this.hiderOrder[this.roundIndex % this.hiderOrder.length] ?? null;
    this.phase = 'placing';

    const hider = this.hiderId ? this.players.get(this.hiderId) : undefined;
    for (const p of this.players.values()) {
      if (!p.connected) continue;
      if (p.id === this.hiderId) p.send({ t: 'placePrompt', seed, theme, decoyRatio, density });
      else p.send({ t: 'waitingForHider', hiderNick: hider?.nick ?? 'someone' });
    }
    this.broadcastLobby();

    // If the hider dawdles, place for them so the lobby never stalls.
    this.setTimer(() => this.autoPlace(decoyRatio, density), PLACE_MS);
  }

  /** Pick the first valid spot a seeded sweep finds -- only used on hider timeout. */
  private autoPlace(decoyRatio: number, density: number): void {
    if (this.phase !== 'placing' || !this.scene) return;
    for (let i = 0; i < 400; i++) {
      const x = randomInt(80, WORLD_W - 80);
      const y = randomInt(80, WORLD_H - 80);
      if (validatePlacement(this.scene, x, y, { w: WORLD_W, h: WORLD_H }).ok) {
        this.scene = stampTarget(this.scene, x, y);
        this.targetAt = { x, y };
        this.goLive(decoyRatio, density);
        return;
      }
    }
    this.endRound('voided');
  }

  place(playerId: string, x: number, y: number): string | null {
    if (this.phase !== 'placing') return 'Not placing right now.';
    if (playerId !== this.hiderId) return 'You are not the hider.';
    if (!this.scene) return 'No scene.';
    const check = validatePlacement(this.scene, x, y, { w: WORLD_W, h: WORLD_H });
    if (!check.ok) return check.reason ?? 'Invalid spot.';

    this.scene = stampTarget(this.scene, x, y);
    this.targetAt = { x, y };
    this.goLive(decoyRatioFor(this.difficulty, this.roundIndex), densityFor(this.difficulty, this.roundIndex));
    return null;
  }

  private goLive(decoyRatio: number, density: number): void {
    this.phase = 'playing';
    this.startedAt = Date.now();
    this.endsAt = this.startedAt + ROUND_MS;
    const msg: ServerMsg = {
      t: 'roundStart',
      seed: this.seed,
      theme: this.roundTheme,
      decoyRatio,
      density,
      // Race clients derive the position from the seed; hide clients need it sent.
      targetAt: this.mode === 'hide' ? this.targetAt : null,
      endsAt: this.endsAt,
      round: this.roundIndex + 1
    };
    this.broadcast(msg);
    this.broadcastLobby();
    this.setTimer(() => this.endRound('timeout'), ROUND_MS + 250);
  }

  // --------------------------------------------------------------------- play

  click(playerId: string, x: number, y: number): void {
    const player = this.players.get(playerId);
    if (!player || this.phase !== 'playing' || !this.targetAt) return;
    if (playerId === this.hiderId) return;         // the hider knows the answer
    if (player.foundAt !== null) return;
    const now = Date.now();
    if (now < player.cooldownUntil) {
      player.send({ t: 'wrong', cooldownMs: player.cooldownUntil - now, freeLeft: 0 });
      return;
    }

    if (!isHit(this.targetAt, { x, y })) {
      player.misses++;
      // The first couple of misses are free; after that every wrong click costs.
      const penalised = player.misses > WRONG_GRACE;
      const cooldownMs = penalised ? WRONG_COOLDOWN_MS : 0;
      if (penalised) player.cooldownUntil = now + WRONG_COOLDOWN_MS;
      player.send({ t: 'wrong', cooldownMs, freeLeft: Math.max(0, WRONG_GRACE - player.misses) });
      return;
    }

    player.foundAt = now - this.startedAt;
    const gained = seekerScore(player.foundAt);
    player.score += gained;
    this.broadcast({
      t: 'found',
      playerId: player.id,
      nick: player.nick,
      foundCount: this.foundCount(),
      seekerCount: this.seekerIds().length,
      score: gained
    });
    this.broadcastLobby();
    this.maybeFinishRound();
  }

  private seekerIds(): string[] {
    return [...this.players.values()]
      .filter((p) => p.connected && p.id !== this.hiderId)
      .map((p) => p.id);
  }

  private foundCount(): number {
    return this.seekerIds().filter((id) => this.players.get(id)!.foundAt !== null).length;
  }

  private maybeFinishRound(): void {
    if (this.phase !== 'playing') return;
    const seekers = this.seekerIds();
    if (seekers.length === 0) return this.endRound('voided');
    if (seekers.every((id) => this.players.get(id)!.foundAt !== null)) this.endRound('allFound');
  }

  private endRound(reason: 'allFound' | 'timeout' | 'voided'): void {
    if (this.phase !== 'playing' && this.phase !== 'placing') return;
    this.clearTimer();

    if (reason !== 'voided' && this.mode === 'hide' && this.hiderId) {
      const hider = this.players.get(this.hiderId);
      const times = this.seekerIds()
        .map((id) => this.players.get(id)!.foundAt)
        .filter((t): t is number => t !== null);
      if (hider) hider.score += hiderScore(times, this.seekerIds().length);
    }

    this.phase = 'roundEnd';
    const target = reason === 'voided' ? null : this.targetAt;
    this.broadcast({ t: 'roundEnd', target, reason, lobby: this.viewFor('') });
    // Each player needs its own `youId`, so the lobby snapshot is sent per socket.
    this.broadcastLobby();
  }

  next(playerId: string): string | null {
    if (playerId !== this.hostId) return 'Only the host can advance.';
    if (this.phase !== 'roundEnd') return 'Round still running.';
    this.roundIndex++;
    if (this.roundIndex >= this.totalRounds) {
      this.phase = 'gameEnd';
      for (const p of this.players.values()) if (p.connected) p.send({ t: 'gameEnd', lobby: this.viewFor(p.id) });
      return null;
    }
    this.beginRound();
    return null;
  }

  // ------------------------------------------------------------------- plumbing

  private setTimer(fn: () => void, ms: number): void {
    this.clearTimer();
    this.timer = setTimeout(fn, ms);
  }

  private clearTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  viewFor(youId: string): LobbyView {
    const players: PlayerView[] = [...this.players.values()]
      .sort((a, b) => b.score - a.score || a.joinedAt - b.joinedAt)
      .map((p) => ({
        id: p.id,
        nick: p.nick,
        score: p.score,
        connected: p.connected,
        isHost: p.id === this.hostId,
        found: p.foundAt !== null,
        hiding: p.id === this.hiderId
      }));
    return {
      code: this.code,
      mode: this.mode,
      difficulty: this.difficulty,
      themeChoice: this.themeChoice,
      panning: this.panning,
      phase: this.phase,
      round: this.roundIndex + 1,
      totalRounds: this.totalRounds,
      players,
      youId
    };
  }

  broadcast(msg: ServerMsg): void {
    for (const p of this.players.values()) if (p.connected) p.send(msg);
  }

  broadcastLobby(): void {
    for (const p of this.players.values()) if (p.connected) p.send({ t: 'lobby', lobby: this.viewFor(p.id) });
  }
}
