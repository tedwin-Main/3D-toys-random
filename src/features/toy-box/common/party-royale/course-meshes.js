// Draws a party royale course from its colliders, plus round props: goo, nests, eggs, crown, symbol tiles.

import * as THREE from 'three';
import { SYMBOLS } from './rounds/pattern-panic.js';

export const SYMBOL_EMOJI = { star: '⭐', moon: '🌙', heart: '❤️', drop: '💧', leaf: '🍀', bolt: '⚡' };
const EGG_POOL = 24;

export function createCourseMeshes(scene) {
  const root = new THREE.Group();
  scene.add(root);
  const goo = new THREE.Mesh(new THREE.PlaneGeometry(500, 500).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x7dff6a, emissive: 0x2a9a1a, transparent: true, opacity: 0.82, roughness: 0.2 }));
  const crown = makeCrown();
  const eggs = Array.from({ length: EGG_POOL }, () => new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12).scale(1, 1.3, 1), new THREE.MeshStandardMaterial({ color: 0xfff6e0, roughness: 0.35 })));
  eggs.forEach((e) => (e.castShadow = true));
  let parts = [], symbolTiles = [], symbolTex = null;

  return {
    // build meshes for a fresh course (round start or attract switch)
    load(sim) {
      root.clear();
      const { course, round } = sim;
      parts = course.cols.map((c) => { const p = colliderMesh(c); root.add(p.group); place(p, c.p); return p; });
      symbolTiles = round.symbols ? parts.filter((p) => p.col.tile != null) : [];
      if (symbolTiles.length) symbolTex ??= symbolTextures(SYMBOLS);
      if (course.view?.goo) root.add(goo);
      for (const n of course.view?.nests ?? []) root.add(nestMesh(n));
      if (round.id === 'egg-haul') eggs.forEach((e) => root.add(e));
      if (course.view?.crown) root.add(crown);
    },
    // per frame: kinematic poses at render clock t, toggled colliders, round props
    update(sim, t, beanPos) {
      const { course, round } = sim;
      for (const p of parts) {
        const c = p.col, look = round.look?.(c, t);
        p.group.visible = !c.off && c.p.y > -150;
        if (c.move || look) place(p, c.p);
        if (look) shade(p, look, t);
      }
      if (symbolTiles.length) paintSymbols(round.symbols(course, t));
      if (course.view?.goo) goo.position.y = course.killYAt(t);
      if (round.id === 'egg-haul') placeEggs(sim.data.eggs ?? [], beanPos);
      if (course.view?.crown) placeCrown(round.crownAt(t), !sim.data.crowned, t);
    },
  };

  function paintSymbols(board) {
    for (const p of symbolTiles) {
      const s = board.tiles[p.col.tile], map = s >= 0 ? symbolTex[s] : null;
      if (p.top.map !== map) { p.top.map = map; p.top.needsUpdate = true; }
    }
  }
  function placeEggs(list, beanPos) {
    eggs.forEach((m, k) => {
      const e = list[k];
      m.visible = !!e;
      if (!e) return;
      const carrier = e.carrier && beanPos(e.carrier);
      if (carrier) m.position.set(carrier.x, carrier.y + 2.1, carrier.z);
      else m.position.set(e.x, 0.42, e.z);
    });
  }
  function placeCrown(pose, free, t) {
    crown.visible = free;
    crown.position.set(pose.x, pose.y, pose.z);
    crown.rotation.y = t * 1.5;
  }
}

// Mesh > one collider: yaw group, tilted child (matches collider pose convention)
function colliderMesh(c) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: c.color, roughness: 0.55, transparent: c.tag === 'goal', opacity: c.tag === 'goal' ? 0.85 : 1 });
  let geo, top = null;
  if (c.kind === 'box') geo = new THREE.BoxGeometry(c.hx * 2, c.hy * 2, c.hz * 2);
  else if (c.kind === 'cyl') geo = new THREE.CylinderGeometry(c.r, c.r, c.hy * 2, Math.max(16, Math.round(c.r * 10)));
  else geo = new THREE.SphereGeometry(c.r, 20, 14);
  let material = mat;
  if (c.tile != null) { top = mat.clone(); material = [mat, mat, top, mat, mat, mat]; }
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = c.tag !== 'floor' || !!c.move;
  mesh.receiveShadow = true;
  group.add(mesh);
  if (c.kind === 'cyl' && c.move && c.hy < 1) group.add(spinStripe(c)); // shows a spinning disc turning
  return { col: c, group, mesh, mat, top, base: new THREE.Color(c.color) };
}

function spinStripe(c) {
  const s = new THREE.Mesh(new THREE.BoxGeometry(c.r * 1.9, 0.02, 0.5), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }));
  s.position.y = c.hy + 0.01;
  return s;
}

function place(p, pose) {
  p.group.position.set(pose.x, pose.y, pose.z);
  p.group.rotation.y = pose.yaw;
  p.mesh.rotation.x = pose.tilt;
}

// round look hook: { color, shake } for states like shaking tiles
const _c = new THREE.Color();
function shade(p, { color, shake = 0 }, t) {
  p.mat.color.copy(color == null ? p.base : _c.set(color));
  if (shake) p.group.position.x += Math.sin(t * 70 + p.col.idx) * shake;
}

function nestMesh({ x, z, r, color }) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.25, 10, 40).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color, roughness: 0.5 }));
  const pad = new THREE.Mesh(new THREE.CircleGeometry(r, 40).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.35 }));
  ring.position.y = 0.2; pad.position.y = 0.02;
  g.add(ring, pad);
  g.position.set(x, 0, z);
  return g;
}

export function makeCrown(scale = 1) {
  const gold = new THREE.MeshStandardMaterial({ color: 0xffc83a, metalness: 0.6, roughness: 0.25, emissive: 0x553300 });
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.4, 0.3, 20, 1, true), gold));
  for (let k = 0; k < 5; k++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.32, 8), gold), a = (k / 5) * Math.PI * 2;
    spike.position.set(Math.sin(a) * 0.42, 0.28, Math.cos(a) * 0.42);
    g.add(spike);
  }
  g.scale.setScalar(scale);
  return g;
}

function symbolTextures(names) {
  return names.map((name) => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    g.fillStyle = '#fff6ff'; g.fillRect(0, 0, 128, 128);
    g.font = '84px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(SYMBOL_EMOJI[name], 64, 70);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  });
}
