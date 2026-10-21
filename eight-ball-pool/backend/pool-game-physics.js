/**
 * FILE: 3d-toys/eight-ball-pool/backend/pool-game-physics.js
 * PURPOSE: playable 8-ball table on top of pool-table-physics: rack, cue strike, shot recording, aim ray, ball-in-hand checks
 * UI: Play > table, Play > aim overlay
 * USED BY: pool-bot.js, pool-shot-worker.js, pool-table-scene.js, play-page.jsx, pool-game-physics.test.js
 * KEY EXPORTS: GAME_CONFIG, TABLE, BALL_IDS, createRack, simulateShot, shotSpeed, aimRay, isPlacementValid, placeCueBall, respotBall, findFreeSpot, cloneBalls
 */

import { createTableGeometry, mergeConfig, simulateStep } from './pool-table-physics.js'
import { createRandom } from './seeded-random.js'

// faster roll-out than break hero (0.115): shots settle in seconds, not tens of seconds
export const GAME_CONFIG = mergeConfig( { ball: { rollingDeceleration: 0.2 } } )
export const TABLE = createTableGeometry( GAME_CONFIG )
export const BALL_IDS = Object.freeze( Array.from( { length: 16 }, ( _, id ) => id ) )

const RADIUS = GAME_CONFIG.ball.radius
const DIAMETER = RADIUS * 2
const FPS = 60
const STEPS_PER_FRAME = Math.round( 1 / ( GAME_CONFIG.timestep * FPS ) )
const MAX_SHOT_SECONDS = 20
// pocketed ball keeps falling this long so drop reads before shot ends
const POCKET_DROP_SECONDS = 0.35
export const FRAME_STRIDE = 7
export const FOOT_SPOT = Object.freeze( { x: 0, z: -TABLE.halfLength / 2 } )
export const HEAD_STRING_Z = TABLE.halfLength / 2
export const MAX_SPEED = 8
// cue tip can put ~1.25x natural roll on ball
const SPIN_LIMIT = 1.25

// Run engine: one engine ball at rest
const makeBall = ( id, x, z ) => ( {
  id,
  x,
  y: RADIUS,
  z,
  mass: GAME_CONFIG.ball.mass,
  vx: 0,
  vz: 0,
  wx: 0,
  wy: 0,
  wz: 0,
  quaternion: { x: 0, y: 0, z: 0, w: 1 },
  pocketed: false,
  pocketIndex: -1,
  pocketTime: 0,
  pocketDepth: 0,
  // break hero's 8-ball check-up hack would kill draw and follow
  checksUp: false,
} )

export const cloneBalls = ( balls ) => balls.map( ( ball ) => ( { ...ball, quaternion: { ...ball.quaternion } } ) )

// Run engine: standard 8-ball rack: apex on foot spot, 8 centre, one solid + one stripe in back corners
export function createRack( seed = 1 ) {
  const random = createRandom( seed )
  const spacing = DIAMETER + 0.0002
  const rowSpacing = spacing * Math.sqrt( 3 ) / 2
  const slots = []
  for ( let row = 0; row < 5; row += 1 ) {
    for ( let column = 0; column <= row; column += 1 ) {
      slots.push( { x: FOOT_SPOT.x + ( column - row / 2 ) * spacing, z: FOOT_SPOT.z - row * rowSpacing } )
    }
  }
  const shuffle = ( list ) => {
    for ( let index = list.length - 1; index > 0; index -= 1 ) {
      const swap = Math.floor( random() * ( index + 1 ) )
      ;[ list[ index ], list[ swap ] ] = [ list[ swap ], list[ index ] ]
    }
    return list
  }
  const solids = shuffle( [ 1, 2, 3, 4, 5, 6, 7 ] )
  const stripes = shuffle( [ 9, 10, 11, 12, 13, 14, 15 ] )
  const order = new Array( 15 )
  // slot 4 = row 3 middle; slots 10/14 = back corners
  order[ 4 ] = 8
  const solidLeft = random() < 0.5
  order[ 10 ] = solidLeft ? solids.pop() : stripes.pop()
  order[ 14 ] = solidLeft ? stripes.pop() : solids.pop()
  const rest = shuffle( [ ...solids, ...stripes ] )
  for ( let slot = 0; slot < 15; slot += 1 ) if ( order[ slot ] === undefined ) order[ slot ] = rest.pop()

  const balls = BALL_IDS.map( ( id ) => makeBall( id, 0, 0 ) )
  Object.assign( balls[ 0 ], { x: 0, z: HEAD_STRING_Z + 0.2 } )
  order.forEach( ( id, slot ) => {
    // sub-mm seating variance: every break opens differently
    const jitter = slot === 0 ? 0 : 0.0003
    balls[ id ].x = slots[ slot ].x + random.signed() * jitter
    balls[ id ].z = slots[ slot ].z + random.signed() * jitter
  } )
  return balls
}

// Play > power bar: 0..1 to m/s; curve gives fine control on soft shots
export const shotSpeed = ( power ) => 0.3 + ( MAX_SPEED - 0.3 ) * Math.max( 0, Math.min( 1, power ) ) ** 1.6

// Play > power bar: inverse of shotSpeed, bot picks power from wanted speed
export const powerForSpeed = ( speed ) => Math.max( 0, Math.min( 1, ( ( speed - 0.3 ) / ( MAX_SPEED - 0.3 ) ) ) ) ** ( 1 / 1.6 )

const isResting = ( ball ) => ball.pocketed
  ? ball.pocketTime >= POCKET_DROP_SECONDS
  : ball.vx === 0 && ball.vz === 0

const writeFrame = ( frames, balls ) => {
  for ( const ball of balls ) {
    frames.push( ball.x, ball.y, ball.z, ball.quaternion.x, ball.quaternion.y, ball.quaternion.z, ball.quaternion.w )
  }
}

// Run engine: strike cue ball, step to rest, record 60 fps frames + rule facts
export function simulateShot( inputBalls, { angle, power, spin = 0 } ) {
  const balls = cloneBalls( inputBalls )
  const cue = balls[ 0 ]
  const speed = shotSpeed( power )
  const dirX = Math.cos( angle )
  const dirZ = Math.sin( angle )
  cue.vx = dirX * speed
  cue.vz = dirZ * speed
  // natural roll is omega = (vz / R, 0, -vx / R); spin 0 = stun (centre hit), +1 follow, -1 draw
  const spinScale = Math.max( -1, Math.min( 1, spin ) ) * SPIN_LIMIT
  cue.wx = spinScale * cue.vz / RADIUS
  cue.wz = -spinScale * cue.vx / RADIUS
  cue.wy = 0

  const diagnostics = {
    contacts: [],
    cushionHits: [],
    ballImpacts: 0,
    cushionImpacts: 0,
    invalidCushionRebounds: 0,
    pocketCaptures: 0,
    maxCorrectedOverlap: 0,
    maxEnergyCorrection: 0,
  }
  const frames = []
  const pocketed = []
  const wasPocketed = balls.map( ( ball ) => ball.pocketed )
  writeFrame( frames, balls )
  const maxSteps = Math.round( MAX_SHOT_SECONDS / GAME_CONFIG.timestep )
  let step = 0
  while ( step < maxSteps ) {
    simulateStep( balls, TABLE, GAME_CONFIG, diagnostics )
    step += 1
    for ( const ball of balls ) {
      if ( ball.pocketed && !wasPocketed[ ball.id ] ) {
        wasPocketed[ ball.id ] = true
        pocketed.push( ball.id )
      }
    }
    if ( step % STEPS_PER_FRAME === 0 ) writeFrame( frames, balls )
    if ( balls.every( isResting ) ) break
  }
  if ( step % STEPS_PER_FRAME !== 0 ) writeFrame( frames, balls )

  // first ball cue touches decides most fouls
  let firstContact = null
  for ( let index = 0; index < diagnostics.contacts.length; index += 2 ) {
    const [ a, b ] = [ diagnostics.contacts[ index ], diagnostics.contacts[ index + 1 ] ]
    if ( a === 0 || b === 0 ) {
      firstContact = a === 0 ? b : a
      break
    }
  }
  // settle state for next shot: nothing moving, pocketed balls parked
  for ( const ball of balls ) {
    ball.vx = 0
    ball.vz = 0
    ball.wx = 0
    ball.wy = 0
    ball.wz = 0
  }
  return {
    fps: FPS,
    ballCount: balls.length,
    frameCount: frames.length / ( balls.length * FRAME_STRIDE ),
    frames: Float32Array.from( frames ),
    duration: step * GAME_CONFIG.timestep,
    firstContact,
    pocketed,
    cushionHits: [ ...new Set( diagnostics.cushionHits ) ],
    balls,
  }
}

// Play > aim overlay + bot path check: sweep cue-sized circle along aim, first ball or cushion it meets
export function aimRay( balls, origin, angle, ignore = [ 0 ] ) {
  const dirX = Math.cos( angle )
  const dirZ = Math.sin( angle )
  let best = { distance: Infinity, ballId: null }
  for ( const ball of balls ) {
    if ( ball.pocketed || ignore.includes( ball.id ) ) continue
    const relX = ball.x - origin.x
    const relZ = ball.z - origin.z
    const along = relX * dirX + relZ * dirZ
    if ( along <= 0 ) continue
    const perpSquared = relX * relX + relZ * relZ - along * along
    if ( perpSquared >= DIAMETER * DIAMETER ) continue
    const distance = along - Math.sqrt( DIAMETER * DIAMETER - perpSquared )
    if ( distance < best.distance ) best = { distance: Math.max( 0, distance ), ballId: ball.id }
  }
  // cushions as inset rectangle; pockets ignored, line still reads right on screen
  const limitX = TABLE.halfWidth - RADIUS
  const limitZ = TABLE.halfLength - RADIUS
  const wallX = Math.abs( dirX ) > 1e-9 ? ( Math.sign( dirX ) * limitX - origin.x ) / dirX : Infinity
  const wallZ = Math.abs( dirZ ) > 1e-9 ? ( Math.sign( dirZ ) * limitZ - origin.z ) / dirZ : Infinity
  const wall = Math.max( 0, Math.min( wallX, wallZ ) )
  if ( wall < best.distance ) {
    const point = { x: origin.x + dirX * wall, z: origin.z + dirZ * wall }
    const reflect = wallX < wallZ ? { x: -dirX, z: dirZ } : { x: dirX, z: -dirZ }
    return { distance: wall, ballId: null, point, cushionDir: reflect }
  }
  const point = { x: origin.x + dirX * best.distance, z: origin.z + dirZ * best.distance }
  const target = balls[ best.ballId ]
  const normalLength = Math.hypot( target.x - point.x, target.z - point.z ) || 1
  const objectDir = { x: ( target.x - point.x ) / normalLength, z: ( target.z - point.z ) / normalLength }
  // stun-shot tangent line: cue keeps velocity part perpendicular to contact normal
  const dot = dirX * objectDir.x + dirZ * objectDir.z
  const tangentX = dirX - dot * objectDir.x
  const tangentZ = dirZ - dot * objectDir.z
  const tangentLength = Math.hypot( tangentX, tangentZ )
  const cueDir = tangentLength > 1e-6 ? { x: tangentX / tangentLength, z: tangentZ / tangentLength } : null
  return { distance: best.distance, ballId: best.ballId, point, objectDir, cueDir, cut: Math.acos( Math.min( 1, Math.max( -1, dot ) ) ) }
}

// Play > ball in hand: inside cushions, clear of every ball, behind head string when kitchenOnly
export function isPlacementValid( position, balls, { kitchenOnly = false, ignoreId = 0 } = {} ) {
  if ( Math.abs( position.x ) > TABLE.halfWidth - RADIUS ) return false
  if ( Math.abs( position.z ) > TABLE.halfLength - RADIUS ) return false
  if ( kitchenOnly && position.z < HEAD_STRING_Z ) return false
  return balls.every( ( ball ) => ball.id === ignoreId || ball.pocketed
    || Math.hypot( ball.x - position.x, ball.z - position.z ) >= DIAMETER + 0.001 )
}

// Play > ball in hand: put cue back on table at rest
export function placeCueBall( balls, position ) {
  const next = cloneBalls( balls )
  next[ 0 ] = makeBall( 0, position.x, position.z )
  return next
}

// Run engine: ball back on foot spot; taken spot slides toward foot rail, then up table
export function respotBall( balls, id ) {
  const next = cloneBalls( balls )
  const step = DIAMETER + 0.001
  const candidates = []
  for ( let offset = 0; FOOT_SPOT.z - offset > -TABLE.halfLength + RADIUS; offset += step ) candidates.push( FOOT_SPOT.z - offset )
  for ( let offset = step; FOOT_SPOT.z + offset < TABLE.halfLength - RADIUS; offset += step ) candidates.push( FOOT_SPOT.z + offset )
  const z = candidates.find( ( value ) => isPlacementValid( { x: 0, z: value }, next, { ignoreId: id } ) ) ?? FOOT_SPOT.z
  next[ id ] = makeBall( id, 0, z )
  return next
}

// Play > ball in hand: preferred spot if free, else nearest free spot scanning up table from head string
export function findFreeSpot( balls, preferred = { x: 0, z: HEAD_STRING_Z + 0.2 }, { kitchenOnly = false } = {} ) {
  if ( isPlacementValid( preferred, balls, { kitchenOnly } ) ) return preferred
  const step = DIAMETER + 0.002
  for ( let ring = 1; ring < 60; ring += 1 ) {
    for ( let index = 0; index < ring * 6; index += 1 ) {
      const angle = ( index / ( ring * 6 ) ) * Math.PI * 2
      const spot = { x: preferred.x + Math.cos( angle ) * ring * step, z: preferred.z + Math.sin( angle ) * ring * step }
      if ( isPlacementValid( spot, balls, { kitchenOnly } ) ) return spot
    }
  }
  return preferred
}
