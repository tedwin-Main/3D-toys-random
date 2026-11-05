// Draws the current round each frame: course props, beans (predicted, extrapolated or live) and the chase camera.

import { createPartyScene } from './party-scene.js';
import { createCourseMeshes } from './course-meshes.js';
import { createBeanMeshes } from './bean-meshes.js';
import { createSnapPacing } from '../snap-pacing.js';
import { MOVE } from './bean-physics.js';
import { ACTIVE, QUALIFIED, OUT } from './round-sim.js';

const COAST_CAP = 0.25, SPECTATE_SECONDS = 5, TURN_SPEED = 2;
const ARENA_KINDS = new Set(['survival', 'logic', 'hunt', 'team']);

export function createPartyView() {
  const stage = createPartyScene();
  const course = createCourseMeshes(stage.scene);
  const beans = createBeanMeshes(stage.scene);
  const pacing = createSnapPacing({ interval: 60 });
  const focus = { x: 0, y: 0, z: 0 };
  let sim = null, snapAt = 0, camYaw = 0, snapCam = true, specIdx = 0, specT = 0;

  return {
    get camYaw() { return camYaw; },
    get pacing() { return pacing; },
    // new round (host sim, guest mirror or attract sim)
    load(next) {
      sim = next;
      course.load(sim); beans.clear();
      stage.setTheme(sim.round.theme);
      camYaw = 0; snapCam = true;
    },
    snapshotArrived() { snapAt = pacing.arrived(); },
    /** me: my bean id (0 = spectator); guest: createGuestRound handle or null (host / local) */
    frame({ dt, time, me, guest, turn }) {
      if (!sim) { stage.render(); return; }
      camYaw += turn * TURN_SPEED * dt;
      const age = guest ? Math.min((performance.now() - snapAt) / 1000, pacing.cap(COAST_CAP)) : 0;
      const t = guest ? (guest.predicting ? guest.clock : sim.clock + age) : sim.clock;
      sim.course.update(t);
      course.update(sim, t, beans.pos);
      guest?.pred.decay(dt);
      const ease = guest ? 1 - Math.exp(-dt * pacing.rate(16)) : 1;
      const ids = new Set();
      for (const b of sim.list) {
        ids.add(b.id);
        const own = guest && b.id === me && guest.predicting;
        const target = own ? predicted(guest.pred) : guest ? coast(b, age) : b;
        beans.draw(own ? guest.pred.bean : b, target, { dt, time, ease: own ? 1 : ease, visible: isShown(sim, b), crowned: sim.data.crowned ?? 0 });
      }
      beans.prune(ids);
      aimCamera(dt, me);
      stage.render();
    },
  };

  function aimCamera(dt, me) {
    const mine = sim.beans.get(me), arena = ARENA_KINDS.has(sim.round.kind);
    let f = mine?.status === ACTIVE ? beans.pos(me) : null;
    if (!f) {
      const live = sim.list.filter((b) => b.status === ACTIVE);
      if ((specT -= dt) <= 0) { specT = SPECTATE_SECONDS; specIdx++; }
      const pick = sim.round.kind === 'race' ? live.reduce((a, b) => (!a || b.z < a.z ? b : a), null) : live[specIdx % Math.max(1, live.length)];
      f = pick ? beans.pos(pick.id) : null;
    }
    Object.assign(focus, f ? { x: f.x, y: f.y, z: f.z } : { x: 0, y: 0, z: 0 });
    stage.follow(focus, camYaw, dt, { dist: arena ? 13 : 11, height: arena ? 10 : 7, snap: snapCam });
    snapCam = false;
  }
}

// own bean: predicted state plus fading correction offset
function predicted(pred) {
  const b = pred.bean, o = pred.offset;
  return { x: b.x + o.x, y: b.y + o.y, z: b.z + o.z, face: b.face };
}

// remote bean: last snapshot coasted on its velocity (ballistic when airborne)
function coast(b, age) {
  const y = b.gnd >= 0 ? b.y : b.y + b.vy * age - 0.5 * MOVE.gravity * age * age;
  return { x: b.x + b.vx * age, y, z: b.z + b.vz * age, face: b.face };
}

// race finishers leave the course; fallen beans vanish below the kill line
function isShown(sim, b) {
  if (b.status === QUALIFIED && sim.round.kind === 'race') return false;
  if (b.status === OUT && b.y < sim.course.killYAt(sim.clock) + 1) return false;
  return true;
}
