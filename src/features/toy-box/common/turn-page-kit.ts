// Builds shared turn-game page pieces: HTML escape, floating name tags, emoji textures, scoreboard rows and the big banner.

import * as THREE from 'three';

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** sprite pill with a color dot and the nick, 2 x 0.5 world units */
export function nameTag(nick: string, color: string, bg = 'rgba(10,14,36,0.8)') {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  g.font = 'bold 28px ui-rounded, system-ui, sans-serif';
  const w = Math.min(240, g.measureText(nick).width + 30);
  g.fillStyle = bg; g.beginPath(); g.roundRect(128 - w / 2, 10, w, 44, 22); g.fill();
  g.fillStyle = color; g.beginPath(); g.arc(128 - w / 2 + 19, 32, 7, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(nick, 136, 33, 200);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true }));
  s.scale.set(2, 0.5, 1); s.renderOrder = 5;
  return s;
}

const emojiCache = new Map();
/** square texture: emoji (or short text) centered on an optional rounded background; cached per key */
export function emojiTexture(emoji: string, { bg = '', fg = '#fff', size = 128 } = {}) {
  const key = `${emoji}|${bg}|${fg}|${size}`;
  if (emojiCache.has(key)) return emojiCache.get(key);
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  if (bg) { g.fillStyle = bg; g.beginPath(); g.roundRect(size * 0.04, size * 0.04, size * 0.92, size * 0.92, size * 0.18); g.fill(); }
  g.fillStyle = fg; g.font = `900 ${Math.round(size * 0.62)}px ui-rounded, system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(emoji, size / 2, size * 0.54);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  emojiCache.set(key, t);
  return t;
}

/**
 * Scoreboard html. rows: players in display order; me: own id; turnId: seat to highlight;
 * right(p): html for the right column; mark(p): prefix before the nick; cls(p): extra row class.
 */
export function boardHtml(rows, { me, turnId = null, right, mark = (_p) => '', cls = (_p) => '' }) {
  return rows.map((p, i) => `<div class="row ${p.id === me ? 'me' : ''} ${p.id === turnId ? 'turn' : ''} ${cls(p)}"><b>${i + 1}</b><i style="background:${p.color}"></i><span>${mark(p)}${esc(p.nick)}</span><em>${right(p)}</em></div>`).join('');
}

/** big center banner: set(html) shows steady text, flash(html, secs) holds a one-off line; tick(dt) true while a flash is up */
export function createBanner(el: HTMLElement) {
  let text = '', hold = 0;
  const show = (html) => { if (html !== text) { text = html; el.innerHTML = html; } };
  return {
    set(html) { if (hold <= 0) show(html); },
    flash(html, secs = 2) { show(html); hold = secs; },
    clear() { hold = 0; show(''); },
    tick(dt) { hold -= dt; return hold > 0; },
  };
}
