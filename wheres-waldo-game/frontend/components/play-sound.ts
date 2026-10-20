// Tiny procedural sound engine: every sound here is oscillators run through
// the Web Audio API, built at runtime. No audio files, same "no asset
// files" approach the visuals take -- it keeps the whole game shippable as
// pure code.
//
// Sound effects only -- there is deliberately no background music loop: the
// droning pad read as "stuck" and added nothing.
//
// Browsers block audio until a user gesture, so nothing plays until
// unlockAudio() is called from a click handler (app.tsx does this on the
// first pointerdown anywhere).

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxGain: GainNode | null = null;

const MUTE_KEY = 'waldo_muted';

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    // storage unavailable (private mode etc.) -- muting still applies live
  }
  if (master) master.gain.value = muted ? 0 : 1;
}

function getCtx(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = isMuted() ? 0 : 1;
    master.connect(ctx.destination);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.55;
    sfxGain.connect(master);
  }
  return ctx;
}

/** Call from a real user gesture -- browsers keep the context suspended until then. */
export function unlockAudio(): void {
  const c = getCtx();
  if (c.state === 'suspended') c.resume();
}

/** One short tone on the sfx bus. */
function tone(
  freq: number,
  start: number,
  dur: number,
  opts: { type?: OscillatorType; gain?: number; glideTo?: number; attack?: number } = {}
): void {
  const dest = sfxGain;
  if (!ctx || !dest) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = opts.type ?? 'sine';
  osc.frequency.setValueAtTime(freq, start);
  if (opts.glideTo) osc.frequency.exponentialRampToValueAtTime(opts.glideTo, start + dur);
  const peak = opts.gain ?? 0.3;
  const attack = opts.attack ?? 0.01;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.linearRampToValueAtTime(peak, start + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g);
  g.connect(dest);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

// ----------------------------------------------------------------- effects

export const sfx = {
  /** Every tap/click, right or wrong, gets this -- raw input feedback. */
  click(): void {
    const c = getCtx();
    tone(520, c.currentTime, 0.05, { type: 'triangle', gain: 0.18 });
  },
  /** Found Waldo. */
  correct(): void {
    const c = getCtx();
    const t = c.currentTime;
    tone(660, t, 0.1, { type: 'triangle', gain: 0.35 });
    tone(880, t + 0.08, 0.16, { type: 'triangle', gain: 0.35 });
    tone(1180, t + 0.16, 0.22, { type: 'triangle', gain: 0.3 });
  },
  /** A real miss, during the round. */
  wrong(): void {
    const c = getCtx();
    tone(180, c.currentTime, 0.22, { type: 'sawtooth', gain: 0.25, glideTo: 90 });
  },
  /** A rejected action -- invalid hide spot, bad lobby code, etc. Shorter and drier than `wrong`. */
  error(): void {
    const c = getCtx();
    tone(140, c.currentTime, 0.12, { type: 'square', gain: 0.2 });
  },
  /** Countdown heartbeat in the last seconds of a round. */
  tick(urgent = false): void {
    const c = getCtx();
    tone(urgent ? 1000 : 760, c.currentTime, 0.06, { type: 'sine', gain: urgent ? 0.3 : 0.15 });
  },
  roundStart(): void {
    const c = getCtx();
    const t = c.currentTime;
    [523, 659, 784, 1046].forEach((f, i) => tone(f, t + i * 0.07, 0.18, { type: 'triangle', gain: 0.3 }));
  },
  roundEnd(reason: 'win' | 'time' | 'voided' = 'time'): void {
    const c = getCtx();
    const t = c.currentTime;
    if (reason === 'voided') {
      tone(200, t, 0.3, { type: 'sawtooth', gain: 0.2, glideTo: 120 });
      return;
    }
    const notes = reason === 'win' ? [784, 988, 1174, 1568] : [784, 659, 523];
    notes.forEach((f, i) => tone(f, t + i * 0.1, 0.3, { type: 'triangle', gain: 0.3 }));
  }
};
