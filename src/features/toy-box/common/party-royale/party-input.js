// Reads party royale controls (keys + touch pad) into camera-relative bean input with press counters.

import { createTouchPad } from '../touch-joystick.js';
import { keyId, trackKeys } from '../key-state.js';

const MOVE_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
const PREVENT = new Set([...MOVE_KEYS, 'Space', 'ShiftLeft', 'ShiftRight']);

/** Returns { input, read(camYaw), turn }; input = { mx, mz, jumpSeq, diveSeq, grab } */
export function createPartyInput() {
  const keys = trackKeys();
  const input = { mx: 0, mz: 0, jumpSeq: 0, diveSeq: 0, grab: false };
  const pad = createTouchPad({
    buttons: [{ id: 'jump', label: 'JUMP', color: 'rgba(255, 210, 63, 0.85)' }, { id: 'dive', label: 'DIVE', color: 'rgba(70, 214, 255, 0.8)' }, { id: 'grab', label: 'GRAB', color: 'rgba(255, 122, 198, 0.8)' }],
  });
  pad.onPress('jump', () => input.jumpSeq++);
  pad.onPress('dive', () => input.diveSeq++);

  addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement) return;
    if (!e.repeat && e.code === 'Space') input.jumpSeq++;
    if (!e.repeat && (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || keyId(e) === 'KeyF')) input.diveSeq++;
    if (PREVENT.has(e.code)) e.preventDefault();
  });
  addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse' && e.button === 0 && e.target.tagName === 'CANVAS') keys.Mouse = true; });
  addEventListener('pointerup', () => (keys.Mouse = false));

  return {
    input,
    // camera yaw 0 looks down -z: stick up = away from camera
    read(camYaw) {
      const right = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + pad.x;
      const fwd = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) + pad.y;
      const c = Math.cos(camYaw), s = Math.sin(camYaw);
      let mx = right * c - fwd * s, mz = -right * s - fwd * c;
      const len = Math.hypot(mx, mz);
      if (len > 1) { mx /= len; mz /= len; }
      input.mx = mx; input.mz = mz;
      input.grab = !!(keys.KeyE || keys.Mouse || pad.held.grab);
      return input;
    },
    // Q / R turn the camera (E is grab)
    get turn() { return (keys.KeyR ? 1 : 0) - (keys.KeyQ ? 1 : 0); },
  };
}
