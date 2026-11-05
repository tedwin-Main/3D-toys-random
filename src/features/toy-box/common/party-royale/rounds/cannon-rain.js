// Builds Cannon Rain survival: rim cannons fire small balls (jump them) and big balls (dodge them) across a round arena.

import { ball, createCourse, mulberry32 } from '../course-colliders.js';
import { CANDY, discFloor, ringSpawn, latestStarted, PARKED } from '../course-kit.js';
import { steerTo, wander, pressJump } from '../bean-bots.js';
import { INTRO } from '../round-sim.js';
import { RUN } from '../bean-physics.js';

const R = 12, RIM = R + 3;
const SHOTS = { small: { r: 0.55, speed: 13, pool: 12, knock: 0.9 }, big: { r: 1.5, speed: 8, pool: 4, knock: 1.2 } };

export default {
  id: 'cannon-rain', title: 'Cannon Rain', emoji: '💣', kind: 'survival', duration: 120,
  goal: 'Cannons on the rim fire across the arena. Jump the small balls, dodge the big ones, stay on.',
  theme: { sky: [0x8ab4ff, 0xffd0d0], fog: 0xd8e0ff },
  build(seed) {
    const shots = shotSchedule(mulberry32(seed));
    const cols = [discFloor({ r: R })];
    for (const [kind, spec] of Object.entries(SHOTS)) {
      const mine = shots.filter((s) => s.kind === kind);
      for (let k = 0; k < spec.pool; k++) {
        cols.push(ball({ ...PARKED, r: spec.r, tag: 'hit', knock: spec.knock, knockUp: kind === 'big' ? 6 : 5, color: kind === 'big' ? CANDY.post : CANDY.hit, shots: mine.filter((_, i) => i % spec.pool === k), move: shotMove }));
      }
    }
    return createCourse({ cols, shots, killY: -8, spawn: ringSpawn({ r: R * 0.6 }), view: { arena: R, cannons: RIM } });
  },
  // Bots > step off the line of a big ball, hop small ones just before impact, else drift mid-arena
  bot(sim, b) {
    const threat = incoming(sim, b, 0.5 + b.skill * 0.9); // skill: how early a shot is noticed
    if (!threat) { wander(sim, b, R * 0.5); return true; }
    const { shot, eta, side } = threat, br = b.brain;
    if (br.shot !== shot) { br.shot = shot; br.jumpAt = 0.26 + (sim.rng() - 0.5) * (1.1 - b.skill) * 0.5; } // skill: jump timing error
    if (shot.kind === 'small') {
      wander(sim, b, R * 0.5);
      if (eta < br.jumpAt && b.gnd >= 0 && b.mode === RUN) pressJump(b);
    } else {
      const away = SHOTS.big.r + 1.6, dir = side || (Math.hypot(b.x, b.z) > R * 0.6 ? -1 : 1);
      steerTo(b, b.x + shot.dz * dir * away, b.z - shot.dx * dir * away);
    }
    return true;
  },
};

// Schedules > a shot every 1.2 s easing to 0.3 s; one in four is big; each crosses from a rim cannon toward the far side
function shotSchedule(rng) {
  const out = [];
  let t = INTRO + 1.5, i = 0;
  while (t < INTRO + 125) {
    const kind = i % 4 === 3 ? 'big' : 'small', a = rng() * Math.PI * 2, aim = (rng() - 0.5) * 0.9;
    const dx = -Math.sin(a + aim), dz = -Math.cos(a + aim), spec = SHOTS[kind];
    out.push({ kind, start: t, x0: Math.sin(a) * RIM, z0: Math.cos(a) * RIM, dx, dz, speed: spec.speed, life: (RIM * 2 + 2) / spec.speed });
    t += Math.max(0.3, 1.2 - (t - INTRO) * 0.016) + rng() * 0.25; i++;
  }
  return out;
}

// Motion > straight roll across at floor height; parked between shots
function shotMove(t, c) {
  const s = latestStarted(c.shots, t);
  if (!s || t - s.start > s.life) return PARKED;
  const d = s.speed * (t - s.start);
  return { x: s.x0 + s.dx * d, y: c.r, z: s.z0 + s.dz * d, yaw: 0, tilt: 0 };
}

// soonest shot whose line passes close to the bean within horizon s: eta + which side of its line we are on
function incoming(sim, b, horizon) {
  const t = sim.clock;
  let best = null;
  for (const s of sim.course.shots) {
    if (s.start > t) break;
    const age = t - s.start;
    if (age > s.life) continue;
    const px = s.x0 + s.dx * s.speed * age, pz = s.z0 + s.dz * s.speed * age;
    const rx = b.x - px, rz = b.z - pz, along = rx * s.dx + rz * s.dz, off = rx * s.dz - rz * s.dx;
    const eta = along / s.speed, reach = SHOTS[s.kind].r + 0.9;
    if (eta < -0.05 || eta > horizon || Math.abs(off) > reach) continue;
    if (!best || eta < best.eta) best = { shot: s, eta, side: Math.sign(off) };
  }
  return best;
}
