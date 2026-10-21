/**
 * FILE: 3d-toys/components/touch-joystick.js
 * PURPOSE: phone controls: virtual joystick bottom-left, round action buttons bottom-right; hidden on mouse/trackpad screens
 * UI: touch controls on driving / walking toys (drift kart, kart party, light cycles, lawn stripes, pelican, tiny planet)
 * USED BY: drift-kart-racing, kart-race-online, light-cycle-arena, lawn-mower-stripes, pelican-on-bicycle, tiny-planet-world
 * KEY EXPORTS: createTouchPad
 */

const CSS = `
.tp-wrap { position: fixed; inset: 0; pointer-events: none; display: none; z-index: 20; }
@media (pointer: coarse) { .tp-wrap { display: block; } }
.tp-stick { position: absolute; left: 22px; width: 136px; height: 136px; border-radius: 50%; background: rgba(10, 14, 24, 0.22); border: 2px solid rgba(255, 255, 255, 0.6); box-shadow: 0 2px 14px rgba(0, 0, 0, 0.25); pointer-events: auto; touch-action: none; }
.tp-knob { position: absolute; left: 41px; top: 41px; width: 54px; height: 54px; border-radius: 50%; background: rgba(255, 255, 255, 0.9); box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3); }
.tp-btns { position: absolute; right: 18px; display: flex; flex-direction: row-reverse; align-items: flex-end; gap: 12px; pointer-events: none; }
.tp-btn { width: 80px; height: 80px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.45); color: #fff; font: 900 15px ui-rounded, "SF Pro Rounded", system-ui, sans-serif; pointer-events: auto; touch-action: none; user-select: none; -webkit-user-select: none; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5); }
.tp-btn:nth-child(even) { margin-bottom: 52px; }
.tp-btn.on { transform: scale(0.92); filter: brightness(1.3); }
`;

/**
 * opts: { buttons: [{ id, label, color }], bottom (px from screen bottom, default 24), onStart() (first touch, e.g. audio unlock), onMove(x, y) (every stick change) }
 * returns live state: { x, y (-1..1, y up = +1), held: { [id]: bool }, onPress(id, fn) }
 */
export function createTouchPad({ buttons = [], bottom = 24, onStart, onMove } = {}) {
  if (!document.getElementById('tp-style')) {
    const st = document.createElement('style');
    st.id = 'tp-style'; st.textContent = CSS;
    document.head.appendChild(st);
  }
  const pad = { x: 0, y: 0, held: {}, press: {}, onPress(id, fn) { (pad.press[id] ??= []).push(fn); } };
  const wrap = document.createElement('div');
  wrap.className = 'tp-wrap';
  wrap.innerHTML = `<div class="tp-stick" style="bottom:${bottom}px"><div class="tp-knob"></div></div><div class="tp-btns" style="bottom:${bottom + 4}px"></div>`;
  document.body.appendChild(wrap);
  let started = false;
  const start = () => { if (!started) { started = true; onStart?.(); } };

  // Touch > Joystick: drag knob, clamp to ring, 0.15 dead zone
  const stick = wrap.querySelector('.tp-stick'), knob = stick.firstElementChild;
  let stickId = null;
  function moveStick(e) {
    const r = stick.getBoundingClientRect(), R = r.width / 2;
    let dx = e.clientX - (r.left + R), dy = e.clientY - (r.top + R);
    const d = Math.hypot(dx, dy), max = R - 14;
    if (d > max) { dx *= max / d; dy *= max / d; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    const nx = dx / max, ny = -dy / max;
    const dead = Math.hypot(nx, ny) < 0.15;
    pad.x = dead ? 0 : nx; pad.y = dead ? 0 : ny;
    onMove?.(pad.x, pad.y);
  }
  function release() { stickId = null; pad.x = pad.y = 0; knob.style.transform = ''; onMove?.(0, 0); }
  stick.addEventListener('pointerdown', (e) => { e.preventDefault(); start(); stickId = e.pointerId; stick.setPointerCapture(e.pointerId); moveStick(e); });
  stick.addEventListener('pointermove', (e) => { if (e.pointerId === stickId) moveStick(e); });
  for (const ev of ['pointerup', 'pointercancel']) stick.addEventListener(ev, (e) => { if (e.pointerId === stickId) release(); });

  // Touch > Action buttons: held flag while pressed, press callbacks on down
  const box = wrap.querySelector('.tp-btns');
  for (const b of buttons) {
    const el = document.createElement('button');
    el.className = 'tp-btn'; el.textContent = b.label;
    el.style.background = b.color ?? 'rgba(255, 255, 255, 0.22)';
    // emoji labels need a bigger glyph than word labels
    if ([...b.label].length <= 2) el.style.fontSize = '28px';
    pad.held[b.id] = false;
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault(); start();
      el.setPointerCapture(e.pointerId);
      pad.held[b.id] = true; el.classList.add('on');
      for (const fn of pad.press[b.id] ?? []) fn();
    });
    for (const ev of ['pointerup', 'pointercancel']) el.addEventListener(ev, () => { pad.held[b.id] = false; el.classList.remove('on'); });
    box.appendChild(el);
  }
  return pad;
}
