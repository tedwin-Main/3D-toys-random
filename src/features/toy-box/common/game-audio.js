/**
 * FILE: src/features/toy-box/common/game-audio.js
 * PURPOSE: shared Web Audio synth for toys: lazy AudioContext unlocked on first tap/key, swept tone + filtered noise bursts
 * UI: sound effects in multiplayer toys
 * USED BY: balloon-battle, bank-or-bust, bomb-tag-arena, bumper-sumo-arena, fence-fields, hex-drop-survival, kart-race-online, king-of-the-hill, lava-rise-climb, light-cycle-arena, mini-golf-party, paint-territory, penguin-curling, pirate-cannon-clash, rocket-ball-soccer, sheepdog-rush, siege-hills, snowball-fight-arena, tank-battle-maze, voxel-build-together
 * KEY EXPORTS: createGameAudio
 */

// Sound > unlock: browsers only start audio after a user gesture
const UNLOCK_EVENTS = ['pointerdown', 'keydown'];

function whiteNoiseBuffer(ctx, seconds) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

// Exponential fade from vol to near-silence over len seconds
function fadeOut(gain, vol, t, len) {
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + len);
}

/**
 * Creates game sound kit. AudioContext made on first pointerdown/keydown (or unlock()).
 * opts.noiseSeconds: noise buffer length, 0 = none (tone-only games)
 * opts.noiseFilter / opts.noiseQ: default filter for noise() bursts
 * opts.minNoiseVol: skip noise() bursts quieter than this
 * opts.onUnlock(ctx, noiseBuf): build looping engine/hum/rumble nodes once context exists
 */
export function createGameAudio({ noiseSeconds = 1, noiseFilter = 'lowpass', noiseQ = null, minNoiseVol = 0, onUnlock } = {}) {
  let ctx = null;
  let noiseBuf = null;

  // Idempotent; returns context
  function unlock() {
    if (ctx) return ctx;
    ctx = new AudioContext();
    if (noiseSeconds > 0) noiseBuf = whiteNoiseBuffer(ctx, noiseSeconds);
    onUnlock?.(ctx, noiseBuf);
    return ctx;
  }
  for (const type of UNLOCK_EVENTS) addEventListener(type, unlock, { once: true });

  // Oscillator sweep f0 to f1 Hz over len seconds
  function tone(f0, f1, len, vol, type = 'sine', delay = 0) {
    if (!ctx) return;
    const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + len);
    fadeOut(g, vol, t, len);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + len);
  }

  // Noise burst through filter swept f0 to f1 Hz over len seconds
  function noise(len, vol, f0, f1, type = noiseFilter, delay = 0) {
    if (!ctx || vol < minNoiseVol) return;
    const t = ctx.currentTime + delay, s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; fl.type = type;
    if (noiseQ !== null) fl.Q.value = noiseQ;
    fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + len);
    fadeOut(g, vol, t, len);
    s.connect(fl).connect(g).connect(ctx.destination); s.start(t); s.stop(t + len);
  }

  return {
    get ctx() { return ctx; },
    get noiseBuf() { return noiseBuf; },
    unlock,
    tone,
    noise,
  };
}
