// Builds the shared 3D stage, pawns, name tags and HUD cards for table-style party games.

import * as THREE from 'three';

const BASE_CSS = `
:root { --ink: #fff; --card: rgba(12, 16, 30, 0.76); }
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; overflow: hidden; font-family: ui-rounded, "SF Pro Rounded", system-ui, sans-serif; color: var(--ink); touch-action: none; }
canvas { display: block; }
.card { position: fixed; background: var(--card); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.14); border-radius: 14px; user-select: none; }
#info { top: 14px; left: 14px; padding: 10px 14px; display: none; max-width: 300px; }
#info .h { font-size: 20px; font-weight: 900; }
#info .m { font-size: 13px; margin-top: 3px; opacity: 0.9; }
#board { top: 62px; right: 14px; padding: 8px 10px; font-size: 12.5px; display: none; min-width: 190px; max-height: calc(100vh - 260px); overflow: auto; }
#board .row { display: flex; gap: 6px; align-items: center; padding: 1px 0; }
#board .row b { width: 16px; opacity: 0.6; }
#board .row i { width: 10px; height: 10px; border-radius: 50%; flex: none; }
#board .row span { flex: 1; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#board .row em { font-style: normal; font-variant-numeric: tabular-nums; min-width: 54px; text-align: right; }
#board .row.me span { color: var(--accent); font-weight: 800; }
#board .row.out { opacity: 0.45; }
#board .row small { opacity: 0.55; font-weight: 600; margin-left: 3px; }
#big { position: fixed; top: 20%; left: 50%; transform: translate(-50%, -50%); font-size: clamp(26px, 6vw, 58px); font-weight: 900; text-shadow: 0 4px 0 rgba(0,0,0,0.4); pointer-events: none; text-align: center; white-space: nowrap; z-index: 5; }
#big small { display: block; font-size: 0.32em; font-weight: 700; }
#dock { position: fixed; bottom: 14px; left: 50%; transform: translateX(-50%); padding: 10px; display: none; width: min(620px, calc(100% - 20px)); text-align: center; z-index: 6; }
#dock .s { font-size: 12.5px; opacity: 0.88; margin-top: 8px; }
.btns { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
.btns button, button.pill { font: inherit; font-size: 15px; font-weight: 800; color: #10131f; background: #e8ecff; border: 0; border-radius: 11px; padding: 9px 12px; cursor: pointer; box-shadow: 0 3px 0 #8a93c9; }
.btns button.on, button.pill.on { background: var(--accent); box-shadow: 0 3px 0 rgba(0,0,0,0.35); }
.btns button:disabled { opacity: 0.4; cursor: default; }
#hint { bottom: 14px; left: 14px; padding: 8px 12px; font-size: 12.5px; opacity: 0.85; max-width: 270px; }
#top { top: 14px; right: 14px; padding: 6px; display: none; gap: 6px; align-items: center; font-size: 13px; }
#top b { padding: 0 6px; letter-spacing: 0.15em; color: var(--accent); }
#top button { font: inherit; font-weight: 700; color: inherit; background: rgba(255,255,255,0.12); border: 0; padding: 6px 10px; border-radius: 9px; cursor: pointer; }
/* HUD > drawn status marks instead of emojis: tick = locked in, dot = thinking, out = gone, chip = colored word */
.mk { display: inline-block; width: 11px; height: 11px; border-radius: 50%; vertical-align: -1px; margin-right: 4px; }
.mk.tick { background: #7cf0b4; position: relative; }
.mk.tick::after { content: ''; position: absolute; left: 3.5px; top: 1.5px; width: 3px; height: 6px; border: solid #0d1230; border-width: 0 2px 2px 0; transform: rotate(45deg); }
.mk.dot { background: #ffcf5a; }
.mk.out { border: 2px solid #8a8fa8; background: transparent; }
.mk.win { background: #ffd23f; box-shadow: 0 0 6px #ffd23f; }
.chip { display: inline-block; font-size: 0.78em; font-weight: 800; padding: 1px 6px; border-radius: 6px; background: rgba(255,255,255,0.14); letter-spacing: 0.02em; margin-right: 4px; vertical-align: 1px; }
@media (pointer: coarse), (max-width: 1000px) { #hint { display: none; } }
@media (max-width: 700px) { #big { top: 24%; } #board { top: auto; bottom: 200px; right: 10px; font-size: 11.5px; min-width: 150px; max-height: 34vh; } #info { max-width: 200px; } }
`;

// HUD > base cards: #info, #board, #big, #dock, #hint, #top (data-hud marks cards shown only in a match)
export function hudShell({ accent, hint = '', bg = '#101426' }) {
  const st = document.createElement('style');
  st.textContent = BASE_CSS + `:root { --accent: ${accent}; } html, body { background: ${bg}; }`;
  document.head.prepend(st);
  document.body.insertAdjacentHTML('afterbegin', `
<div id="info" class="card" data-hud><div class="h" id="roundName"></div><div class="m" id="roundMeta"></div></div>
<div id="board" class="card" data-hud></div>
<div id="big"></div>
<div id="dock" class="card"></div>
${hint ? `<div id="hint" class="card">${hint}</div>` : ''}
<div id="top" class="card" data-hud="flex"><span>Room</span><b id="code"></b><button id="lobbyBtn">Lobby</button></div>`);
  const bigEl = document.getElementById('big');
  let bigText = '', flashT = 0;
  const hud = {
    dock: document.getElementById('dock'),
    big(html) { if (html !== bigText) { bigText = html; bigEl.innerHTML = html; } },
    flash(html, s = 3) { hud.big(html); flashT = s; },
    // per frame: clears a flash when it runs out; returns true while a flash is showing
    flashing(dt) { flashT -= dt; if (flashT <= 0 && flashT > -dt * 1.5) hud.big(''); return flashT > 0; },
    info(name, meta) { document.getElementById('roundName').textContent = name; document.getElementById('roundMeta').innerHTML = meta; },
    // rows: [{ p, right, tag?, out? }] already sorted
    board(rows, me) {
      document.getElementById('board').innerHTML = rows.map(({ p, right, tag = '', out }, i) => `<div class="row ${p.id === me ? 'me' : ''} ${out ? 'out' : ''}"><b>${i + 1}</b><i style="background:${p.color}"></i><span>${tag}${esc(p.nick)}</span><em>${right}</em></div>`).join('');
    },
  };
  return hud;
}

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Scene > renderer, scene, camera, hemisphere + shadowed key light, resize
export function createStage({ bg = 0x101426, fog = [30, 80], fov = 42, shadowBox = 16 } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(bg);
  if (fog) scene.fog = new THREE.Fog(bg, fog[0], fog[1]);
  const camera = new THREE.PerspectiveCamera(fov, innerWidth / innerHeight, 0.1, 200);
  const hemi = new THREE.HemisphereLight(0xdfe6ff, 0x20242e, 0.9);
  const key = new THREE.DirectionalLight(0xffffff, 1.7);
  key.position.set(5, 16, 9);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -shadowBox, right: shadowBox, top: shadowBox, bottom: -shadowBox, far: 60 });
  scene.add(hemi, key);
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
  return { renderer, scene, camera, hemi, key };
}

// Players > floating name tag sprite with a color dot
export function nameTag(nick, color) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  g.font = 'bold 28px ui-rounded, system-ui, sans-serif';
  const w = Math.min(240, g.measureText(nick).width + 30);
  g.fillStyle = 'rgba(10,14,30,0.82)'; g.beginPath(); g.roundRect(128 - w / 2, 10, w, 44, 22); g.fill();
  g.fillStyle = color; g.beginPath(); g.arc(128 - w / 2 + 19, 32, 7, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(nick, 136, 33, 200);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true }));
  s.scale.set(2, 0.5, 1); s.renderOrder = 5;
  return s;
}

// Sprites > round badge with a drawn mark: 'tick' (locked in), 'dot' (thinking), 'ring' (out), 'cross', 'star' (winner), or a short word
export function badgeTex(mark, fill = '#7cf0b4', ink = '#0d1230') {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = fill; g.beginPath(); g.arc(32, 32, 28, 0, Math.PI * 2); g.fill();
  g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = 7; g.lineCap = g.lineJoin = 'round';
  g.beginPath();
  if (mark === 'tick') { g.moveTo(19, 33); g.lineTo(28, 42); g.lineTo(45, 23); g.stroke(); }
  else if (mark === 'cross') { g.moveTo(21, 21); g.lineTo(43, 43); g.moveTo(43, 21); g.lineTo(21, 43); g.stroke(); }
  else if (mark === 'dot') { for (const x of [20, 32, 44]) { g.moveTo(x + 4, 33); g.arc(x, 33, 4, 0, Math.PI * 2); } g.fill(); }
  else if (mark === 'ring') { g.arc(32, 32, 13, 0, Math.PI * 2); g.stroke(); }
  else if (mark === 'star') { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 8 : 18; g.lineTo(32 + Math.cos(a) * r, 33 + Math.sin(a) * r); } g.closePath(); g.fill(); }
  else { g.font = `900 ${mark.length > 2 ? 20 : 30}px ui-rounded, system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(mark, 32, 34, 54); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
export function badge(tex, size = 0.5) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false, transparent: true }));
  s.scale.setScalar(size); s.renderOrder = 6;
  return s;
}

// Sprites > short text label (word, number, emoji) on a transparent canvas
export function textSprite(text, { color = '#fff', font = '900 72px ui-rounded, system-ui, sans-serif', w = 256, h = 128, scale = 1, bg = null } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  if (bg) { g.fillStyle = bg; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 24); g.fill(); }
  g.fillStyle = color; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 4, w - 16);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true }));
  s.scale.set(scale * w / h, scale, 1);
  return s;
}

// Players > bean pawn: body group (bob/tilt), name tag, badge slot; keyed by player id, removed when they leave
export function createPawns(scene, { height = 1, onMake } = {}) {
  const map = new Map();
  return {
    map,
    get(p) {
      let g = map.get(p.id);
      if (g) return g;
      g = new THREE.Group();
      const body = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.4 });
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * height, 0.38 * height, 0.8 * height, 18), mat); torso.position.y = 0.4 * height;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.27 * height, 18, 12), mat); head.position.y = 1.02 * height;
      const eyeM = new THREE.MeshBasicMaterial({ color: 0x111111 });
      for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.045 * height, 8, 6), eyeM); e.position.set(s * 0.1 * height, 1.06 * height, 0.24 * height); body.add(e); }
      torso.castShadow = head.castShadow = true;
      body.add(torso, head);
      const tag = nameTag(p.nick, p.color); tag.position.y = 1.65 * height;
      const slot = new THREE.Group(); slot.position.y = 2.2 * height;
      g.add(body, tag, slot);
      g.userData = { body, tag, slot, mat, head, torso };
      onMake?.(g, p);
      scene.add(g);
      map.set(p.id, g);
      return g;
    },
    // drop pawns whose players left
    prune(P) {
      const ids = new Set(P.map((p) => p.id));
      for (const [id, g] of map) if (!ids.has(id)) { scene.remove(g); map.delete(id); }
    },
    clear() { for (const g of map.values()) scene.remove(g); map.clear(); },
  };
}

// Layout > n spots on an arc or ring around the table, facing the center
export function ringSpots(n, { r = 7, arc = Math.PI * 2, center = Math.PI / 2, y = 0 } = {}) {
  const full = arc >= Math.PI * 2 - 1e-6, out = [];
  for (let i = 0; i < n; i++) {
    const a = full ? center + (i / n) * arc : center - arc / 2 + (n > 1 ? (i / (n - 1)) * arc : arc / 2);
    out.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, y, face: Math.atan2(-Math.cos(a), -Math.sin(a)) });
  }
  return out;
}

// Rules > seeded RNG (mulberry32) so every tab can build the same board from a published seed
export function seeded(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const shuffle = (a, rng = Math.random) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const pickOne = (a, rng = Math.random) => a[Math.floor(rng() * a.length)];
