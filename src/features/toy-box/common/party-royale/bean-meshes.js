// Draws beans: capsule body with eyes and name tag, dive / stumble poses, tails, team bands, crown, grab hands.

import * as THREE from 'three';
import { DIVE, STUMBLE, MOVE } from './bean-physics.js';
import { makeCrown } from './course-meshes.js';
import { TEAM_COLORS } from './rounds/egg-haul.js';

const bodyGeo = new THREE.CapsuleGeometry(0.45, 0.55, 6, 16).translate(0, 0.73, 0);
const eyeGeo = new THREE.SphereGeometry(0.13, 12, 10), pupilGeo = new THREE.SphereGeometry(0.065, 10, 8);
const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }), pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
const handGeo = new THREE.SphereGeometry(0.14, 10, 8);
const tailGeo = new THREE.ConeGeometry(0.22, 0.9, 10).rotateX(-Math.PI / 2 - 0.5).translate(0, 0.55, -0.62);
const tailMat = new THREE.MeshStandardMaterial({ color: 0xff8a2a, roughness: 0.8 });
const bandGeo = new THREE.TorusGeometry(0.47, 0.08, 8, 24).rotateX(Math.PI / 2).translate(0, 0.62, 0);

export function createBeanMeshes(scene) {
  const meshes = new Map();
  const v = new THREE.Vector3();
  return {
    pos: (id) => meshes.get(id)?.position ?? null,
    // place one bean at target pose; ease 1 = snap (host / own bean), else smoothing share this frame
    draw(b, target, { dt, time, ease = 1, visible = true, crowned = 0 }) {
      let g = meshes.get(b.id);
      if (!g) { g = makeBean(b); meshes.set(b.id, g); scene.add(g); g.position.set(target.x, target.y, target.z); }
      g.visible = visible;
      if (!visible) return;
      if (g.position.distanceTo(v.set(target.x, target.y, target.z)) > 6) g.position.copy(v);
      else g.position.lerp(v, ease);
      let dh = target.face - g.rotation.y;
      dh = Math.atan2(Math.sin(dh), Math.cos(dh));
      g.rotation.y += dh * Math.min(1, dt * 14);
      pose(g.userData, b, time);
      dress(g.userData, b, time, crowned);
    },
    // drop beans that left the round
    prune(ids) { for (const [id, g] of meshes) if (!ids.has(id)) { scene.remove(g); meshes.delete(id); } },
    clear() { for (const g of meshes.values()) scene.remove(g); meshes.clear(); },
  };
}

function makeBean(b) {
  const g = new THREE.Group(), body = new THREE.Group();
  const skin = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.45 }));
  skin.castShadow = true;
  body.add(skin);
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(eyeGeo, eyeMat); e.position.set(s * 0.17, 1.0, 0.36);
    const pu = new THREE.Mesh(pupilGeo, pupilMat); pu.position.set(s * 0.17, 1.0, 0.47);
    body.add(e, pu);
  }
  const hands = [-1, 1].map((s) => { const h = new THREE.Mesh(handGeo, eyeMat); h.position.set(s * 0.3, 0.85, 0.55); body.add(h); return h; });
  const tail = new THREE.Mesh(tailGeo, tailMat);
  const band = new THREE.Mesh(bandGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }));
  const crown = makeCrown(0.8);
  crown.position.y = 1.62;
  body.add(tail, band, crown);
  const tag = nameTag(b.nick, b.color);
  g.add(body, tag);
  g.userData = { body, tag, hands, tail, band, crown };
  return g;
}

// dive = flat forward, stumble = wobbly tumble, run = squash + waddle
function pose(u, b, time) {
  const sp = Math.hypot(b.vx, b.vz);
  if (b.mode === DIVE) { u.body.rotation.set(1.35, 0, 0); u.body.position.y = 0.35; u.body.scale.set(1, 1, 1); return; }
  if (b.mode === STUMBLE) { u.body.rotation.set(Math.sin(time * 11 + b.id) * 0.9, 0, Math.cos(time * 9 + b.id) * 0.6); u.body.position.y = 0.2; return; }
  const st = b.gnd >= 0 ? 1 - Math.min(sp / MOVE.speed, 1) * 0.05 * (1 + Math.sin(time * 18)) : 1 + Math.min(Math.abs(b.vy) * 0.015, 0.15);
  u.body.scale.set(1 / Math.sqrt(st), st, 1 / Math.sqrt(st));
  u.body.rotation.set(0, 0, b.gnd >= 0 ? Math.sin(time * 14 + b.id) * Math.min(sp / MOVE.speed, 1) * 0.12 : 0);
  u.body.position.y = 0;
}

// round extras: tail (blinks while immune), team band, crown, grab hands forward
function dress(u, b, time, crowned) {
  u.tail.visible = !!b.tail && (!(b.immune > 0) || Math.sin(time * 30) > 0);
  u.band.visible = b.team != null;
  if (b.team != null) u.band.material.color.setHex(TEAM_COLORS[b.team]);
  u.crown.visible = crowned === b.id;
  const grabbing = b.grabbing || b.holding != null || b.grab;
  for (const h of u.hands) h.position.z = grabbing ? 0.75 : 0.42;
}

function nameTag(nick, color) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  g.font = 'bold 28px ui-rounded, system-ui, sans-serif';
  const w = Math.min(240, g.measureText(nick).width + 30);
  g.fillStyle = 'rgba(24,14,44,0.72)'; g.beginPath(); g.roundRect(128 - w / 2, 10, w, 44, 22); g.fill();
  g.fillStyle = color; g.beginPath(); g.arc(128 - w / 2 + 19, 32, 7, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(nick, 136, 33, 200);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true }));
  s.scale.set(2.4, 0.6, 1); s.position.y = 2.25; s.renderOrder = 5;
  return s;
}
