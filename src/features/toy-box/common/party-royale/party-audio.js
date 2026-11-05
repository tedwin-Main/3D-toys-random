// Plays party royale sound effects for round events (jumps, dives, hits, qualify, out, steals, crown).

import { createGameAudio } from '../game-audio.js';

// audio context unlocks itself on first key / pointer press (game-audio)
export function createPartyAudio() {
  const audio = createGameAudio({ noiseSeconds: 0 });
  const { tone } = audio;
  const fanfare = () => [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.2, 0.1, 'square', i * 0.11));
  // event type > sound; mine = event about my own bean
  const SOUNDS = {
    j: (mine) => tone(300, 620, 0.14, mine ? 0.09 : 0.025, 'triangle'),
    d: (mine) => tone(500, 220, 0.18, mine ? 0.08 : 0.02, 'sawtooth'),
    h: (mine) => tone(180, 70, 0.22, mine ? 0.12 : 0.03, 'square'),
    l: (mine) => { if (mine) tone(140, 90, 0.07, 0.06, 'sine'); },
    q: (mine) => (mine ? fanfare() : tone(880, 1320, 0.12, 0.03, 'triangle')),
    o: (mine) => tone(900, 120, 0.9, mine ? 0.14 : 0.03, 'sine'),
    r: (mine) => { if (mine) tone(400, 800, 0.25, 0.06, 'sine'); },
    tail: (mine) => tone(700, 1100, 0.12, mine ? 0.1 : 0.03, 'triangle'),
    egg: (mine) => tone(600, 900, 0.1, mine ? 0.08 : 0.02, 'triangle'),
    gate: () => tone(220, 110, 0.2, 0.05, 'square'),
    tile: () => tone(160, 60, 0.3, 0.04, 'sine'),
    crown: () => fanfare(),
    go: () => tone(880, 880, 0.45, 0.11, 'square'),
  };
  return {
    beep: () => tone(440, 440, 0.16, 0.1, 'square'),
    play(events, me) {
      for (const [type, id] of events) SOUNDS[type]?.(id === me);
    },
  };
}
