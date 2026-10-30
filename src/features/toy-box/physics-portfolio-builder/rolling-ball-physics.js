// Simulates deterministic rolling-ball physics for pool and marble breaks.

// Ported from 8Ball_Studio pool-break-physics.js: per-ball radius and mass, closed walls, no pockets
// (pocketed ball = lost project), settles on its own instead of fixed milestone.

const EPSILON = 1e-9
const CONTACT_EPSILON = 2e-6
const clamp = ( value, min = 0, max = 1 ) => Math.min( max, Math.max( min, value ) )
const magnitude2 = ( x, z ) => Math.hypot( x, z )

const normalize2 = ( x, z, fallbackX = 1, fallbackZ = 0 ) => {
  const length = magnitude2( x, z )
  if ( length <= EPSILON ) return { x: fallbackX, z: fallbackZ }
  return { x: x / length, z: z / length }
}

export const DEFAULT_ROLLING_PHYSICS = Object.freeze( {
  timestep: 1 / 240,
  fps: 60,
  gravity: 9.81,
  collisionIterations: 16,
  restitution: 0.94,
  friction: 0.03,
  slidingFriction: 0.24,
  // stronger than real cloth so table settles in seconds, not 15 s of dead scroll
  rollingDeceleration: 0.42,
  cushionRestitution: 0.82,
  minDuration: 1.5,
  maxDuration: 8,
  settleSpeed: 0.004,
  // body counts as hit once it moves this fast
  hitSpeed: 0.02,
} )

// Run engine: quaternion helpers, world-space angular velocity
const multiplyQuaternion = ( left, right ) => ( {
  x: left.w * right.x + left.x * right.w + left.y * right.z - left.z * right.y,
  y: left.w * right.y - left.x * right.z + left.y * right.w + left.z * right.x,
  z: left.w * right.z + left.x * right.y - left.y * right.x + left.z * right.w,
  w: left.w * right.w - left.x * right.x - left.y * right.y - left.z * right.z,
} )

const normalizeQuaternion = ( quaternion ) => {
  const length = Math.hypot( quaternion.x, quaternion.y, quaternion.z, quaternion.w ) || 1
  quaternion.x /= length
  quaternion.y /= length
  quaternion.z /= length
  quaternion.w /= length
}

const integrateQuaternion = ( quaternion, wx, wy, wz, duration ) => {
  const speed = Math.hypot( wx, wy, wz )
  if ( speed <= EPSILON || duration <= 0 ) return
  const halfAngle = speed * duration * 0.5
  const scale = Math.sin( halfAngle ) / speed
  const delta = { x: wx * scale, y: wy * scale, z: wz * scale, w: Math.cos( halfAngle ) }
  Object.assign( quaternion, multiplyQuaternion( delta, quaternion ) )
  normalizeQuaternion( quaternion )
}

const inertiaOf = ( ball ) => 0.4 * ball.m * ball.r * ball.r

const kineticEnergy = ( ball ) => 0.5 * ball.m * ( ball.vx * ball.vx + ball.vz * ball.vz )
  + 0.5 * inertiaOf( ball ) * ( ball.wx * ball.wx + ball.wy * ball.wy + ball.wz * ball.wz )

// float error must never add energy: scale colliding bodies back down
const capEnergy = ( balls, beforeEnergy ) => {
  const afterEnergy = balls.reduce( ( total, ball ) => total + kineticEnergy( ball ), 0 )
  if ( afterEnergy <= beforeEnergy + 1e-10 || afterEnergy <= EPSILON ) return
  const scale = Math.sqrt( beforeEnergy / afterEnergy )
  balls.forEach( ( ball ) => {
    ball.vx *= scale
    ball.vz *= scale
    ball.wx *= scale
    ball.wy *= scale
    ball.wz *= scale
  } )
}

// Run engine: closed rectangle of cushion segments
const createWalls = ( { halfWidth, halfLength } ) => [
  { ax: -halfWidth, az: -halfLength, bx: halfWidth, bz: -halfLength },
  { ax: halfWidth, az: -halfLength, bx: halfWidth, bz: halfLength },
  { ax: halfWidth, az: halfLength, bx: -halfWidth, bz: halfLength },
  { ax: -halfWidth, az: halfLength, bx: -halfWidth, bz: -halfLength },
]

const sweepCircleCircle = ( first, second, maximumTime ) => {
  const reach = first.r + second.r
  const px = second.x - first.x
  const pz = second.z - first.z
  const vx = second.vx - first.vx
  const vz = second.vz - first.vz
  const distanceTerm = px * px + pz * pz - reach * reach
  const closing = px * vx + pz * vz
  if ( distanceTerm <= CONTACT_EPSILON * reach ) return closing < -EPSILON ? 0 : null
  const speedSquared = vx * vx + vz * vz
  if ( speedSquared <= EPSILON || closing >= 0 ) return null
  const discriminant = closing * closing - speedSquared * distanceTerm
  if ( discriminant < 0 ) return null
  const time = ( -closing - Math.sqrt( discriminant ) ) / speedSquared
  return time >= -EPSILON && time <= maximumTime + EPSILON ? Math.max( 0, time ) : null
}

const sweepPointCircle = ( ball, centerX, centerZ, radius, maximumTime ) => {
  const px = ball.x - centerX
  const pz = ball.z - centerZ
  const distanceTerm = px * px + pz * pz - radius * radius
  if ( distanceTerm <= 0 ) return 0
  const speedSquared = ball.vx * ball.vx + ball.vz * ball.vz
  const direction = px * ball.vx + pz * ball.vz
  if ( speedSquared <= EPSILON || direction >= 0 ) return null
  const discriminant = direction * direction - speedSquared * distanceTerm
  if ( discriminant < 0 ) return null
  const time = ( -direction - Math.sqrt( discriminant ) ) / speedSquared
  return time >= -EPSILON && time <= maximumTime + EPSILON ? Math.max( 0, time ) : null
}

const closestPointOnSegment = ( x, z, segment ) => {
  const sx = segment.bx - segment.ax
  const sz = segment.bz - segment.az
  const lengthSquared = sx * sx + sz * sz
  const amount = lengthSquared > EPSILON
    ? clamp( ( ( x - segment.ax ) * sx + ( z - segment.az ) * sz ) / lengthSquared )
    : 0
  return { x: segment.ax + sx * amount, z: segment.az + sz * amount }
}

// wall as capsule: face plus both rounded ends, swept continuously
const sweepCircleSegment = ( ball, segment, maximumTime ) => {
  const sx = segment.bx - segment.ax
  const sz = segment.bz - segment.az
  const length = magnitude2( sx, sz )
  if ( length <= EPSILON ) return null
  const tx = sx / length
  const tz = sz / length
  const nx = -tz
  const nz = tx
  const distance = ( ball.x - segment.ax ) * nx + ( ball.z - segment.az ) * nz
  const normalSpeed = ball.vx * nx + ball.vz * nz
  let best = null

  if ( Math.abs( normalSpeed ) > EPSILON ) {
    for ( const side of [ -1, 1 ] ) {
      const time = ( side * ball.r - distance ) / normalSpeed
      if ( time < -EPSILON || time > maximumTime + EPSILON ) continue
      const hitX = ball.x + ball.vx * Math.max( 0, time )
      const hitZ = ball.z + ball.vz * Math.max( 0, time )
      const along = ( hitX - segment.ax ) * tx + ( hitZ - segment.az ) * tz
      const approachSpeed = ball.vx * side * nx + ball.vz * side * nz
      if ( along < -CONTACT_EPSILON || along > length + CONTACT_EPSILON || approachSpeed >= -EPSILON ) continue
      const candidate = { time: Math.max( 0, time ), nx: side * nx, nz: side * nz }
      if ( !best || candidate.time < best.time ) best = candidate
    }
  }

  for ( const [ ex, ez ] of [ [ segment.ax, segment.az ], [ segment.bx, segment.bz ] ] ) {
    const time = sweepPointCircle( ball, ex, ez, ball.r, maximumTime )
    if ( time === null || ( best && time >= best.time ) ) continue
    const normal = normalize2( ball.x + ball.vx * time - ex, ball.z + ball.vz * time - ez )
    if ( ball.vx * normal.x + ball.vz * normal.z < -EPSILON ) best = { time, nx: normal.x, nz: normal.z }
  }
  return best
}

// Run engine: cloth friction, sliding first, then rolling decel
const applyClothFriction = ( ball, physics, duration ) => {
  const { slidingFriction, rollingDeceleration, gravity } = physics
  const slipX = ball.vx + ball.wz * ball.r
  const slipZ = ball.vz - ball.wx * ball.r
  const slipSpeed = magnitude2( slipX, slipZ )

  if ( slipSpeed > 0.002 ) {
    const velocityChange = Math.min( slidingFriction * gravity * duration, slipSpeed / 3.5 )
    const changeX = -slipX / slipSpeed * velocityChange
    const changeZ = -slipZ / slipSpeed * velocityChange
    ball.vx += changeX
    ball.vz += changeZ
    ball.wx -= 2.5 * changeZ / ball.r
    ball.wz += 2.5 * changeX / ball.r
    return
  }

  const speed = magnitude2( ball.vx, ball.vz )
  if ( speed <= 0.0005 ) {
    ball.vx = 0
    ball.vz = 0
    ball.wx = 0
    ball.wz = 0
    ball.wy *= Math.max( 0, 1 - duration * 0.6 )
    return
  }
  const scale = Math.max( 0, speed - rollingDeceleration * duration ) / speed
  ball.vx *= scale
  ball.vz *= scale
  ball.wx = ball.vz / ball.r
  ball.wz = -ball.vx / ball.r
  ball.wy *= Math.max( 0, 1 - duration * 0.08 )
}

const advanceBalls = ( balls, duration, clock ) => {
  if ( duration <= 0 ) return
  for ( const ball of balls ) {
    ball.x += ball.vx * duration
    ball.z += ball.vz * duration
    integrateQuaternion( ball.q, ball.wx, ball.wy, ball.wz, duration )
  }
  clock.time += duration
}

// striker checks up at contact: spin above no-slip value for its new speed dropped
const dropOverSpin = ( ball ) => {
  const speed = magnitude2( ball.vx, ball.vz )
  if ( magnitude2( ball.wx, ball.wz ) <= speed / ball.r ) return
  ball.wx = ball.vz / ball.r
  ball.wz = -ball.vx / ball.r
}

const markHit = ( ball, clock ) => {
  if ( ball.firstHit < 0 ) ball.firstHit = clock.time
}

const resolveBallCollision = ( first, second, nx, nz, physics, clock ) => {
  const relativeX = second.vx - first.vx
  const relativeZ = second.vz - first.vz
  const normalSpeed = relativeX * nx + relativeZ * nz
  if ( normalSpeed >= -EPSILON ) return false

  const beforeEnergy = kineticEnergy( first ) + kineticEnergy( second )
  const inverseMass = 1 / first.m + 1 / second.m
  const normalImpulse = -( 1 + physics.restitution ) * normalSpeed / inverseMass
  first.vx -= normalImpulse * nx / first.m
  first.vz -= normalImpulse * nz / first.m
  second.vx += normalImpulse * nx / second.m
  second.vz += normalImpulse * nz / second.m

  // Coulomb-capped tangential impulse gives side spin
  const tx = -nz
  const tz = nx
  const tangentSpeed = relativeX * tx + relativeZ * tz + first.wy * first.r + second.wy * second.r
  const firstInertia = inertiaOf( first )
  const secondInertia = inertiaOf( second )
  const tangentInverseMass = inverseMass + first.r * first.r / firstInertia + second.r * second.r / secondInertia
  const tangentImpulse = clamp(
    -tangentSpeed / tangentInverseMass,
    -physics.friction * normalImpulse,
    physics.friction * normalImpulse,
  )
  first.vx -= tangentImpulse * tx / first.m
  first.vz -= tangentImpulse * tz / first.m
  second.vx += tangentImpulse * tx / second.m
  second.vz += tangentImpulse * tz / second.m
  first.wy += first.r * tangentImpulse / firstInertia
  second.wy += second.r * tangentImpulse / secondInertia

  if ( first.checksUp ) dropOverSpin( first )
  if ( second.checksUp ) dropOverSpin( second )
  markHit( first, clock )
  markHit( second, clock )
  capEnergy( [ first, second ], beforeEnergy )
  return true
}

const resolveWallCollision = ( ball, nx, nz, physics ) => {
  const incomingSpeed = ball.vx * nx + ball.vz * nz
  if ( incomingSpeed >= -EPSILON ) return
  const beforeEnergy = kineticEnergy( ball )
  const impulseSpeed = -( 1 + physics.cushionRestitution ) * incomingSpeed
  ball.vx += impulseSpeed * nx
  ball.vz += impulseSpeed * nz
  capEnergy( [ ball ], beforeEnergy )
}

const wallNormal = ( ball, segment ) => {
  const closest = closestPointOnSegment( ball.x, ball.z, segment )
  const deltaX = ball.x - closest.x
  const deltaZ = ball.z - closest.z
  const fallback = normalize2( -( segment.bz - segment.az ), segment.bx - segment.ax )
  return { distance: magnitude2( deltaX, deltaZ ), normal: normalize2( deltaX, deltaZ, fallback.x, fallback.z ) }
}

const resolveCurrentContacts = ( balls, walls, physics, clock ) => {
  for ( let firstIndex = 0; firstIndex < balls.length; firstIndex += 1 ) {
    const first = balls[ firstIndex ]
    for ( let secondIndex = firstIndex + 1; secondIndex < balls.length; secondIndex += 1 ) {
      const second = balls[ secondIndex ]
      const deltaX = second.x - first.x
      const deltaZ = second.z - first.z
      if ( magnitude2( deltaX, deltaZ ) > first.r + second.r + CONTACT_EPSILON ) continue
      const normal = normalize2( deltaX, deltaZ, firstIndex % 2 === 0 ? 1 : -1, 0 )
      resolveBallCollision( first, second, normal.x, normal.z, physics, clock )
    }
    for ( const segment of walls ) {
      const { distance, normal } = wallNormal( first, segment )
      if ( distance <= first.r + CONTACT_EPSILON ) resolveWallCollision( first, normal.x, normal.z, physics )
    }
  }
}

const correctOverlaps = ( balls, walls ) => {
  let maximumOverlap = 0
  for ( let firstIndex = 0; firstIndex < balls.length; firstIndex += 1 ) {
    const first = balls[ firstIndex ]
    for ( let secondIndex = firstIndex + 1; secondIndex < balls.length; secondIndex += 1 ) {
      const second = balls[ secondIndex ]
      const deltaX = second.x - first.x
      const deltaZ = second.z - first.z
      const overlap = first.r + second.r - magnitude2( deltaX, deltaZ )
      if ( overlap <= 1e-7 ) continue
      const normal = normalize2( deltaX, deltaZ, firstIndex % 2 === 0 ? 1 : -1, 0 )
      // heavier body moves less
      const share = second.m / ( first.m + second.m )
      const correction = overlap * 1.01
      first.x -= normal.x * correction * share
      first.z -= normal.z * correction * share
      second.x += normal.x * correction * ( 1 - share )
      second.z += normal.z * correction * ( 1 - share )
      maximumOverlap = Math.max( maximumOverlap, overlap )
    }
    for ( const segment of walls ) {
      const { distance, normal } = wallNormal( first, segment )
      const overlap = first.r - distance
      if ( overlap <= 1e-7 ) continue
      first.x += normal.x * ( overlap + 1e-7 )
      first.z += normal.z * ( overlap + 1e-7 )
      maximumOverlap = Math.max( maximumOverlap, overlap )
    }
  }
  return maximumOverlap
}

const findEarliestEvent = ( balls, walls, maximumTime ) => {
  let earliest = Infinity
  for ( const ball of balls ) {
    for ( const segment of walls ) {
      const hit = sweepCircleSegment( ball, segment, maximumTime )
      if ( hit && hit.time < earliest ) earliest = hit.time
    }
  }
  for ( let firstIndex = 0; firstIndex < balls.length; firstIndex += 1 ) {
    for ( let secondIndex = firstIndex + 1; secondIndex < balls.length; secondIndex += 1 ) {
      const time = sweepCircleCircle( balls[ firstIndex ], balls[ secondIndex ], maximumTime )
      if ( time !== null && time < earliest ) earliest = time
    }
  }
  return earliest === Infinity ? null : earliest
}

const simulateStep = ( balls, walls, physics, clock ) => {
  for ( const ball of balls ) applyClothFriction( ball, physics, physics.timestep )
  let remaining = physics.timestep

  // event budget per step so packed rack contacts cannot tunnel
  for ( let iteration = 0; iteration < physics.collisionIterations && remaining > EPSILON; iteration += 1 ) {
    const eventTime = findEarliestEvent( balls, walls, remaining )
    if ( eventTime === null ) {
      advanceBalls( balls, remaining, clock )
      remaining = 0
      break
    }
    const travelTime = clamp( eventTime, 0, remaining )
    advanceBalls( balls, travelTime, clock )
    remaining -= travelTime
    resolveCurrentContacts( balls, walls, physics, clock )
    correctOverlaps( balls, walls )
    // resting contact must not eat whole event budget
    if ( travelTime <= EPSILON && remaining > EPSILON ) {
      const nudge = Math.min( remaining, 1e-7 )
      advanceBalls( balls, nudge, clock )
      remaining -= nudge
    }
  }
  if ( remaining > EPSILON ) advanceBalls( balls, remaining, clock )
  for ( let pass = 0; pass < physics.collisionIterations; pass += 1 ) {
    if ( correctOverlaps( balls, walls ) <= 1e-7 ) break
  }
}

// Run engine: bake one break. balls[0] is striker. Returns flat Float32 frames at physics.fps.
export function simulateRollingBalls( { balls: suppliedBalls, bounds, physics: suppliedPhysics = {} } ) {
  const physics = { ...DEFAULT_ROLLING_PHYSICS, ...suppliedPhysics }
  const walls = createWalls( bounds )
  const clock = { time: 0 }
  const balls = suppliedBalls.map( ( ball, index ) => {
    const vx = ball.vx ?? 0
    const vz = ball.vz ?? 0
    return {
      x: ball.x,
      z: ball.z,
      r: ball.r,
      m: ball.m,
      vx,
      vz,
      // launched striker starts rolling (no slip)
      wx: vz / ball.r,
      wy: 0,
      wz: -vx / ball.r,
      q: { x: 0, y: 0, z: 0, w: 1 },
      // striker moves from t=0, so its hit is first contact only (= impact)
      firstHit: -1,
      checksUp: index === 0,
    }
  } )

  const bodyCount = balls.length
  const stepsPerFrame = Math.max( 1, Math.round( 1 / ( physics.timestep * physics.fps ) ) )
  const maxSteps = Math.round( physics.maxDuration / physics.timestep )
  const positions = []
  const quaternions = []
  const pushFrame = () => {
    for ( const ball of balls ) {
      positions.push( ball.x, ball.r, ball.z )
      quaternions.push( ball.q.x, ball.q.y, ball.q.z, ball.q.w )
    }
  }

  pushFrame()
  let settleTime = physics.maxDuration
  for ( let step = 1; step <= maxSteps; step += 1 ) {
    simulateStep( balls, walls, physics, clock )
    for ( const ball of balls ) {
      // non-contact nudges (overlap push) still count as hit once ball travels
      if ( ball.firstHit < 0 && magnitude2( ball.vx, ball.vz ) > physics.hitSpeed && ball !== balls[ 0 ] ) ball.firstHit = clock.time
    }
    if ( step % stepsPerFrame !== 0 ) continue
    pushFrame()
    const resting = balls.every( ( ball ) => magnitude2( ball.vx, ball.vz ) <= physics.settleSpeed )
    if ( resting && clock.time >= physics.minDuration ) {
      settleTime = clock.time
      break
    }
  }

  const impactTime = balls[ 0 ].firstHit >= 0
    ? balls[ 0 ].firstHit
    : Math.min( ...balls.slice( 1 ).map( ( ball ) => ball.firstHit ).filter( ( time ) => time >= 0 ), settleTime )

  return {
    fps: physics.fps,
    bodyCount,
    frameCount: positions.length / ( bodyCount * 3 ),
    positions: Float32Array.from( positions ),
    quaternions: Float32Array.from( quaternions ),
    firstHit: balls.map( ( ball ) => ball.firstHit ),
    impactTime,
    settleTime,
  }
}
