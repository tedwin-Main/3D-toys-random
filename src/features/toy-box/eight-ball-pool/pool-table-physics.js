/**
 * FILE: src/features/toy-box/eight-ball-pool/pool-table-physics.js
 * PURPOSE: pool table engine core copied from 8Ball_Studio pool-break-physics.js: 6 pockets + jaws, swept ball/cushion contacts, cloth friction, spin
 * UI: Play > table (via pool-game-physics.js)
 * USED BY: pool-game-physics.js
 * KEY EXPORTS: DEFAULT_TABLE_CONFIG, mergeConfig, createTableGeometry, simulateStep
 */

// No DOM or renderer import: runs in node tests and in the shot worker.
const clamp = ( value, min = 0, max = 1 ) => Math.min( max, Math.max( min, value ) )
const EPSILON = 1e-9
const CONTACT_EPSILON = 2e-6

// SI units. Ball radius 35 mm (bigger than real 28.6 mm) so balls read on phone screens.
export const DEFAULT_TABLE_CONFIG = Object.freeze( {
  timestep: 1 / 240,
  // extra contact passes stop tight rack separating in one visible jump
  collisionIterations: 16,
  gravity: 9.81,
  ball: Object.freeze( {
    mass: 0.17,
    radius: 0.035,
    restitution: 0.94,
    friction: 0.03,
    slidingFriction: 0.24,
    rollingDeceleration: 0.115,
  } ),
  table: Object.freeze( {
    width: 1.27,
    length: 2.54,
    cushionRestitution: 0.86,
    cornerPocketRadius: 0.068,
    sidePocketRadius: 0.061,
  } ),
} )

export const mergeConfig = ( config = {} ) => ( {
  ...DEFAULT_TABLE_CONFIG,
  ...config,
  ball: { ...DEFAULT_TABLE_CONFIG.ball, ...config.ball },
  table: { ...DEFAULT_TABLE_CONFIG.table, ...config.table },
} )

const magnitude2 = ( x, z ) => Math.hypot( x, z )

const normalize2 = ( x, z, fallbackX = 1, fallbackZ = 0 ) =>
{
  const length = magnitude2( x, z )
  if ( length <= EPSILON ) return { x: fallbackX, z: fallbackZ }
  return { x: x / length, z: z / length }
}

const multiplyQuaternion = ( left, right ) => ( {
  x: left.w * right.x + left.x * right.w + left.y * right.z - left.z * right.y,
  y: left.w * right.y - left.x * right.z + left.y * right.w + left.z * right.x,
  z: left.w * right.z + left.x * right.y - left.y * right.x + left.z * right.w,
  w: left.w * right.w - left.x * right.x - left.y * right.y - left.z * right.z,
} )

const normalizeQuaternion = ( quaternion ) =>
{
  const length = Math.hypot(
    quaternion.x,
    quaternion.y,
    quaternion.z,
    quaternion.w,
  ) || 1
  quaternion.x /= length
  quaternion.y /= length
  quaternion.z /= length
  quaternion.w /= length
}

// World-space angular velocity is premultiplied so scroll playback matches real rolling axes.
const integrateQuaternion = ( quaternion, angularVelocity, duration ) =>
{
  const speed = Math.hypot( angularVelocity.x, angularVelocity.y, angularVelocity.z )
  if ( speed <= EPSILON || duration <= 0 ) return

  const halfAngle = speed * duration * 0.5
  const scale = Math.sin( halfAngle ) / speed
  const delta = {
    x: angularVelocity.x * scale,
    y: angularVelocity.y * scale,
    z: angularVelocity.z * scale,
    w: Math.cos( halfAngle ),
  }
  const result = multiplyQuaternion( delta, quaternion )
  Object.assign( quaternion, result )
  normalizeQuaternion( quaternion )
}

const kineticEnergy = ( ball, config ) =>
{
  const { radius } = config.ball
  const mass = ball.mass ?? config.ball.mass
  const inertia = ( 2 / 5 ) * mass * radius * radius
  const linear = 0.5 * mass * ( ball.vx * ball.vx + ball.vz * ball.vz )
  const angular = 0.5 * inertia * (
    ball.wx * ball.wx + ball.wy * ball.wy + ball.wz * ball.wz
  )
  return linear + angular
}

// Numerical guards scale only the colliding bodies if floating-point error adds energy.
const capEnergy = ( balls, beforeEnergy, config ) =>
{
  const afterEnergy = balls.reduce( ( total, ball ) => total + kineticEnergy( ball, config ), 0 )
  if ( afterEnergy <= beforeEnergy + 1e-10 || afterEnergy <= EPSILON ) return 0

  const scale = Math.sqrt( beforeEnergy / afterEnergy )
  balls.forEach( ( ball ) =>
  {
    ball.vx *= scale
    ball.vz *= scale
    ball.wx *= scale
    ball.wy *= scale
    ball.wz *= scale
  } )
  return afterEnergy - beforeEnergy
}

// A fixed hash keeps rack seating variance deterministic across every cached build.
export const createTableGeometry = ( config ) =>
{
  const halfWidth = config.table.width / 2
  const halfLength = config.table.length / 2
  const cornerGap = config.table.cornerPocketRadius * 1.72
  const sideGap = config.table.sidePocketRadius * 1.35
  const jawOutset = config.ball.radius * 1.25
  const segments = []

  const addSegment = ( ax, az, bx, bz, type = 'cushion' ) =>
  {
    segments.push( { ax, az, bx, bz, type } )
  }

  // Straight cushion runs stop before each pocket mouth.
  addSegment( -halfWidth + cornerGap, -halfLength, halfWidth - cornerGap, -halfLength )
  addSegment( -halfWidth + cornerGap, halfLength, halfWidth - cornerGap, halfLength )
  addSegment( -halfWidth, -halfLength + cornerGap, -halfWidth, -sideGap )
  addSegment( -halfWidth, sideGap, -halfWidth, halfLength - cornerGap )
  addSegment( halfWidth, -halfLength + cornerGap, halfWidth, -sideGap )
  addSegment( halfWidth, sideGap, halfWidth, halfLength - cornerGap )

    // Short angled jaws guide valid trajectories into open throats instead of closing each gap.
    ;[ -1, 1 ].forEach( ( xSign ) =>
    {
      ;[ -1, 1 ].forEach( ( zSign ) =>
      {
        addSegment(
          xSign * ( halfWidth - cornerGap ),
          zSign * halfLength,
          xSign * ( halfWidth - cornerGap * 0.43 ),
          zSign * ( halfLength + jawOutset ),
          'corner-jaw',
        )
        addSegment(
          xSign * halfWidth,
          zSign * ( halfLength - cornerGap ),
          xSign * ( halfWidth + jawOutset ),
          zSign * ( halfLength - cornerGap * 0.43 ),
          'corner-jaw',
        )
      } )

      addSegment(
        xSign * halfWidth,
        -sideGap,
        xSign * ( halfWidth + jawOutset ),
        -sideGap * 0.38,
        'side-jaw',
      )
      addSegment(
        xSign * halfWidth,
        sideGap,
        xSign * ( halfWidth + jawOutset ),
        sideGap * 0.38,
        'side-jaw',
      )
    } )

  const pockets = [
    { x: -halfWidth - 0.006, z: -halfLength - 0.006, radius: config.table.cornerPocketRadius },
    { x: halfWidth + 0.006, z: -halfLength - 0.006, radius: config.table.cornerPocketRadius },
    { x: -halfWidth - 0.008, z: 0, radius: config.table.sidePocketRadius },
    { x: halfWidth + 0.008, z: 0, radius: config.table.sidePocketRadius },
    { x: -halfWidth - 0.006, z: halfLength + 0.006, radius: config.table.cornerPocketRadius },
    { x: halfWidth + 0.006, z: halfLength + 0.006, radius: config.table.cornerPocketRadius },
  ]

  return { segments, pockets, halfWidth, halfLength }
}

const sweepCircleCircle = ( first, second, diameter, maximumTime ) =>
{
  const px = second.x - first.x
  const pz = second.z - first.z
  const vx = second.vx - first.vx
  const vz = second.vz - first.vz
  const distanceTerm = px * px + pz * pz - diameter * diameter
  const closing = px * vx + pz * vz

  if ( distanceTerm <= CONTACT_EPSILON * diameter )
  {
    return closing < -EPSILON ? 0 : null
  }

  const speedSquared = vx * vx + vz * vz
  if ( speedSquared <= EPSILON || closing >= 0 ) return null

  const discriminant = closing * closing - speedSquared * distanceTerm
  if ( discriminant < 0 ) return null

  const time = ( -closing - Math.sqrt( discriminant ) ) / speedSquared
  return time >= -EPSILON && time <= maximumTime + EPSILON ? Math.max( 0, time ) : null
}

const sweepPointCircle = ( ball, centerX, centerZ, radius, maximumTime ) =>
{
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

const closestPointOnSegment = ( x, z, segment ) =>
{
  const sx = segment.bx - segment.ax
  const sz = segment.bz - segment.az
  const lengthSquared = sx * sx + sz * sz
  const amount = lengthSquared > EPSILON
    ? clamp( ( ( x - segment.ax ) * sx + ( z - segment.az ) * sz ) / lengthSquared )
    : 0
  return {
    x: segment.ax + sx * amount,
    z: segment.az + sz * amount,
    amount,
  }
}

// A rail is treated as a capsule, covering its face and both rounded endpoints continuously.
const sweepCircleSegment = ( ball, radius, segment, maximumTime ) =>
{
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

  if ( Math.abs( normalSpeed ) > EPSILON )
  {
    ;[ -1, 1 ].forEach( ( side ) =>
    {
      const time = ( side * radius - distance ) / normalSpeed
      if ( time < -EPSILON || time > maximumTime + EPSILON ) return

      const hitX = ball.x + ball.vx * Math.max( 0, time )
      const hitZ = ball.z + ball.vz * Math.max( 0, time )
      const along = ( hitX - segment.ax ) * tx + ( hitZ - segment.az ) * tz
      const approachSpeed = ball.vx * side * nx + ball.vz * side * nz
      if ( along < -CONTACT_EPSILON || along > length + CONTACT_EPSILON || approachSpeed >= -EPSILON ) return

      const candidate = { time: Math.max( 0, time ), nx: side * nx, nz: side * nz }
      if ( !best || candidate.time < best.time ) best = candidate
    } )
  }

  ;[ [ segment.ax, segment.az ], [ segment.bx, segment.bz ] ].forEach( ( endpoint ) =>
  {
    const time = sweepPointCircle( ball, endpoint[ 0 ], endpoint[ 1 ], radius, maximumTime )
    if ( time === null || ( best && time >= best.time ) ) return

    const hitX = ball.x + ball.vx * time
    const hitZ = ball.z + ball.vz * time
    const normal = normalize2( hitX - endpoint[ 0 ], hitZ - endpoint[ 1 ] )
    if ( ball.vx * normal.x + ball.vz * normal.z < -EPSILON )
    {
      best = { time, nx: normal.x, nz: normal.z }
    }
  } )

  return best
}

const applyClothFriction = ( ball, config, duration ) =>
{
  if ( ball.pocketed ) return

  const { radius, slidingFriction, rollingDeceleration } = config.ball
  const slipX = ball.vx + ball.wz * radius
  const slipZ = ball.vz - ball.wx * radius
  const slipSpeed = magnitude2( slipX, slipZ )

  if ( slipSpeed > 0.002 )
  {
    // Sliding friction moves both translation and spin toward the no-slip rolling state.
    const velocityChange = Math.min(
      slidingFriction * config.gravity * duration,
      slipSpeed / 3.5,
    )
    const changeX = -slipX / slipSpeed * velocityChange
    const changeZ = -slipZ / slipSpeed * velocityChange
    ball.vx += changeX
    ball.vz += changeZ
    ball.wx -= 2.5 * changeZ / radius
    ball.wz += 2.5 * changeX / radius
    return
  }

  const speed = magnitude2( ball.vx, ball.vz )
  if ( speed <= 0.0005 )
  {
    ball.vx = 0
    ball.vz = 0
    ball.wx = 0
    ball.wz = 0
    ball.wy *= Math.max( 0, 1 - duration * 0.6 )
    return
  }

  const nextSpeed = Math.max( 0, speed - rollingDeceleration * duration )
  const scale = nextSpeed / speed
  ball.vx *= scale
  ball.vz *= scale
  ball.wx = ball.vz / radius
  ball.wz = -ball.vx / radius
  ball.wy *= Math.max( 0, 1 - duration * 0.08 )
}

const advanceBalls = ( balls, duration, config ) =>
{
  if ( duration <= 0 ) return

  balls.forEach( ( ball ) =>
  {
    if ( ball.pocketed )
    {
      const damping = 6
      const velocityScale = Math.exp( -damping * duration )
      const distanceScale = ( 1 - velocityScale ) / damping
      ball.x += ball.vx * distanceScale
      ball.z += ball.vz * distanceScale
      ball.vx *= velocityScale
      ball.vz *= velocityScale
      ball.wx *= velocityScale
      ball.wy *= velocityScale
      ball.wz *= velocityScale
      ball.pocketTime += duration
      ball.pocketDepth = 0.5 * config.gravity * ball.pocketTime * ball.pocketTime
      ball.y = config.ball.radius - ball.pocketDepth
      integrateQuaternion( ball.quaternion, {
        x: ball.wx,
        y: ball.wy,
        z: ball.wz,
      }, duration )
      return
    }

    ball.x += ball.vx * duration
    ball.z += ball.vz * duration
    integrateQuaternion( ball.quaternion, {
      x: ball.wx,
      y: ball.wy,
      z: ball.wz,
    }, duration )
  } )
}

// Roll spin faster than the no-slip value for the ball's speed (|v| / R) drops to that value. It only ever removes
// spin energy, so it never adds energy. Slower spin is left for cloth friction to settle. Side spin (wy) is kept.
const dropOverSpin = ( ball, radius ) =>
{
  const speed = magnitude2( ball.vx, ball.vz )
  if ( magnitude2( ball.wx, ball.wz ) <= speed / radius ) return
  ball.wx = ball.vz / radius
  ball.wz = -ball.vx / radius
}

const resolveBallCollision = ( first, second, nx, nz, config, diagnostics ) =>
{
  const relativeX = second.vx - first.vx
  const relativeZ = second.vz - first.vz
  const normalSpeed = relativeX * nx + relativeZ * nz
  if ( normalSpeed >= -EPSILON ) return false

  const beforeEnergy = kineticEnergy( first, config ) + kineticEnergy( second, config )
  const { radius, restitution, friction } = config.ball
  const firstMass = first.mass ?? config.ball.mass
  const secondMass = second.mass ?? config.ball.mass
  const inverseMass = 1 / firstMass + 1 / secondMass
  const normalImpulse = -( 1 + restitution ) * normalSpeed / inverseMass

  first.vx -= normalImpulse * nx / firstMass
  first.vz -= normalImpulse * nz / firstMass
  second.vx += normalImpulse * nx / secondMass
  second.vz += normalImpulse * nz / secondMass

  // Tangential contact friction can create realistic side spin but cannot exceed Coulomb friction.
  const tx = -nz
  const tz = nx
  const tangentSpeed = relativeX * tx + relativeZ * tz + ( first.wy + second.wy ) * radius
  const firstInertia = ( 2 / 5 ) * firstMass * radius * radius
  const secondInertia = ( 2 / 5 ) * secondMass * radius * radius
  const tangentInverseMass = inverseMass
    + radius * radius / firstInertia
    + radius * radius / secondInertia
  const tangentImpulse = clamp(
    -tangentSpeed / tangentInverseMass,
    -friction * normalImpulse,
    friction * normalImpulse,
  )
  first.vx -= tangentImpulse * tx / firstMass
  first.vz -= tangentImpulse * tz / firstMass
  second.vx += tangentImpulse * tx / secondMass
  second.vz += tangentImpulse * tz / secondMass

  first.wy += radius * tangentImpulse / firstInertia
  second.wy += radius * tangentImpulse / secondInertia

  // The 8-ball checks up at contact: spin faster than its new speed allows is dropped, so it stops spinning
  // instead of spinning on while it barely moves. The rack balls keep their spin.
  if ( first.checksUp ) dropOverSpin( first, radius )
  if ( second.checksUp ) dropOverSpin( second, radius )

  // play page reads contact order for foul rules; break never sets this list
  diagnostics.contacts?.push( first.id, second.id )
  diagnostics.ballImpacts += 1
  diagnostics.maxEnergyCorrection = Math.max(
    diagnostics.maxEnergyCorrection,
    capEnergy( [ first, second ], beforeEnergy, config ),
  )
  return true
}

const resolveCushionCollision = ( ball, nx, nz, config, diagnostics ) =>
{
  const incomingSpeed = ball.vx * nx + ball.vz * nz
  if ( incomingSpeed >= -EPSILON ) return false

  const beforeEnergy = kineticEnergy( ball, config )
  const impulseSpeed = -( 1 + config.table.cushionRestitution ) * incomingSpeed
  ball.vx += impulseSpeed * nx
  ball.vz += impulseSpeed * nz
  diagnostics.cushionHits?.push( ball.id )
  diagnostics.cushionImpacts += 1
  diagnostics.invalidCushionRebounds += ball.vx * nx + ball.vz * nz <= 0 ? 1 : 0
  diagnostics.maxEnergyCorrection = Math.max(
    diagnostics.maxEnergyCorrection,
    capEnergy( [ ball ], beforeEnergy, config ),
  )
  return true
}

const capturePockets = ( balls, pockets, config, diagnostics ) =>
{
  balls.forEach( ( ball ) =>
  {
    if ( ball.pocketed ) return

    for ( let pocketIndex = 0; pocketIndex < pockets.length; pocketIndex += 1 )
    {
      const pocket = pockets[ pocketIndex ]
      if ( magnitude2( ball.x - pocket.x, ball.z - pocket.z ) > pocket.radius + CONTACT_EPSILON ) continue

      ball.pocketed = true
      ball.pocketIndex = pocketIndex
      ball.pocketTime = 0
      ball.pocketDepth = 0
      diagnostics.pocketCaptures += 1
      break
    }
  } )
}

const resolveCurrentContacts = ( balls, tableGeometry, config, diagnostics ) =>
{
  const diameter = config.ball.radius * 2

  for ( let firstIndex = 0; firstIndex < balls.length; firstIndex += 1 )
  {
    const first = balls[ firstIndex ]
    if ( first.pocketed ) continue

    for ( let secondIndex = firstIndex + 1; secondIndex < balls.length; secondIndex += 1 )
    {
      const second = balls[ secondIndex ]
      if ( second.pocketed ) continue
      const deltaX = second.x - first.x
      const deltaZ = second.z - first.z
      const distance = magnitude2( deltaX, deltaZ )
      if ( distance > diameter + CONTACT_EPSILON ) continue

      const normal = normalize2( deltaX, deltaZ, firstIndex % 2 === 0 ? 1 : -1, 0 )
      resolveBallCollision( first, second, normal.x, normal.z, config, diagnostics )
    }

    tableGeometry.segments.forEach( ( segment ) =>
    {
      const closest = closestPointOnSegment( first.x, first.z, segment )
      const deltaX = first.x - closest.x
      const deltaZ = first.z - closest.z
      const distance = magnitude2( deltaX, deltaZ )
      if ( distance > config.ball.radius + CONTACT_EPSILON ) return

      const fallback = normalize2(
        -( segment.bz - segment.az ),
        segment.bx - segment.ax,
      )
      const normal = normalize2( deltaX, deltaZ, fallback.x, fallback.z )
      resolveCushionCollision( first, normal.x, normal.z, config, diagnostics )
    } )
  }
}

const correctOverlaps = ( balls, tableGeometry, config ) =>
{
  const diameter = config.ball.radius * 2
  let maximumOverlap = 0

  for ( let firstIndex = 0; firstIndex < balls.length; firstIndex += 1 )
  {
    const first = balls[ firstIndex ]
    if ( first.pocketed ) continue

    for ( let secondIndex = firstIndex + 1; secondIndex < balls.length; secondIndex += 1 )
    {
      const second = balls[ secondIndex ]
      if ( second.pocketed ) continue
      const deltaX = second.x - first.x
      const deltaZ = second.z - first.z
      const distance = magnitude2( deltaX, deltaZ )
      const overlap = diameter - distance
      if ( overlap <= 1e-7 ) continue

      const normal = normalize2( deltaX, deltaZ, firstIndex % 2 === 0 ? 1 : -1, 0 )
      const correction = overlap * 0.505
      first.x -= normal.x * correction
      first.z -= normal.z * correction
      second.x += normal.x * correction
      second.z += normal.z * correction
      maximumOverlap = Math.max( maximumOverlap, overlap )
    }

    tableGeometry.segments.forEach( ( segment ) =>
    {
      const closest = closestPointOnSegment( first.x, first.z, segment )
      const deltaX = first.x - closest.x
      const deltaZ = first.z - closest.z
      const distance = magnitude2( deltaX, deltaZ )
      const overlap = config.ball.radius - distance
      if ( overlap <= 1e-7 ) return

      const fallback = normalize2(
        -( segment.bz - segment.az ),
        segment.bx - segment.ax,
      )
      const normal = normalize2( deltaX, deltaZ, fallback.x, fallback.z )
      first.x += normal.x * ( overlap + 1e-7 )
      first.z += normal.z * ( overlap + 1e-7 )
      maximumOverlap = Math.max( maximumOverlap, overlap )
    } )
  }

  return maximumOverlap
}

const findEarliestEvent = ( balls, tableGeometry, config, maximumTime ) =>
{
  let earliest = null
  const record = ( event ) =>
  {
    if ( event.time < -EPSILON || event.time > maximumTime + EPSILON ) return
    if ( !earliest || event.time < earliest.time - EPSILON || (
      Math.abs( event.time - earliest.time ) <= EPSILON && event.priority < earliest.priority
    ) ) earliest = event
  }

  balls.forEach( ( ball, ballIndex ) =>
  {
    if ( ball.pocketed ) return

    tableGeometry.pockets.forEach( ( pocket, pocketIndex ) =>
    {
      const time = sweepPointCircle( ball, pocket.x, pocket.z, pocket.radius, maximumTime )
      if ( time !== null ) record( { time, priority: 0, type: 'pocket', ballIndex, pocketIndex } )
    } )

    tableGeometry.segments.forEach( ( segment, segmentIndex ) =>
    {
      const hit = sweepCircleSegment( ball, config.ball.radius, segment, maximumTime )
      if ( hit ) record( {
        ...hit,
        priority: 2,
        type: 'cushion',
        ballIndex,
        segmentIndex,
      } )
    } )
  } )

  const diameter = config.ball.radius * 2
  for ( let firstIndex = 0; firstIndex < balls.length; firstIndex += 1 )
  {
    if ( balls[ firstIndex ].pocketed ) continue
    for ( let secondIndex = firstIndex + 1; secondIndex < balls.length; secondIndex += 1 )
    {
      if ( balls[ secondIndex ].pocketed ) continue
      const time = sweepCircleCircle(
        balls[ firstIndex ],
        balls[ secondIndex ],
        diameter,
        maximumTime,
      )
      if ( time !== null ) record( {
        time,
        priority: 1,
        type: 'ball',
        firstIndex,
        secondIndex,
      } )
    }
  }

  return earliest
}

export const simulateStep = ( balls, tableGeometry, config, diagnostics ) =>
{
  balls.forEach( ( ball ) => applyClothFriction( ball, config, config.timestep ) )
  let remaining = config.timestep

  // Resolve the configured event budget so dense rack contacts cannot tunnel through each other.
  for ( let iteration = 0; iteration < config.collisionIterations && remaining > EPSILON; iteration += 1 )
  {
    const event = findEarliestEvent( balls, tableGeometry, config, remaining )
    if ( !event )
    {
      advanceBalls( balls, remaining, config )
      remaining = 0
      break
    }

    const travelTime = clamp( event.time, 0, remaining )
    advanceBalls( balls, travelTime, config )
    remaining -= travelTime
    capturePockets( balls, tableGeometry.pockets, config, diagnostics )
    resolveCurrentContacts( balls, tableGeometry, config, diagnostics )
    diagnostics.maxCorrectedOverlap = Math.max(
      diagnostics.maxCorrectedOverlap,
      correctOverlaps( balls, tableGeometry, config ),
    )

    // A microscopic advance prevents a resting contact from consuming all event iterations.
    if ( travelTime <= EPSILON && remaining > EPSILON )
    {
      const nudge = Math.min( remaining, 1e-7 )
      advanceBalls( balls, nudge, config )
      remaining -= nudge
    }
  }

  if ( remaining > EPSILON ) advanceBalls( balls, remaining, config )

  // Final positional passes leave no visible overlap after the event budget is used.
  for ( let pass = 0; pass < config.collisionIterations; pass += 1 )
  {
    const overlap = correctOverlaps( balls, tableGeometry, config )
    diagnostics.maxCorrectedOverlap = Math.max( diagnostics.maxCorrectedOverlap, overlap )
    if ( overlap <= 1e-7 ) break
  }

  capturePockets( balls, tableGeometry.pockets, config, diagnostics )
}
