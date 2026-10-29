/**
 * FILE: 3d-toys/eight-ball-pool/backend/pool-bot.js
 * PURPOSE: 8-ball bot: ghost-ball pot candidates, clear-path checks, simulate best few, score with real rules, then miss on purpose by difficulty
 * UI: Play > vs Bot (bot turn)
 * USED BY: pool-shot-worker.js, pool-bot.test.js
 * KEY EXPORTS: BOT_LEVELS, chooseShot, potCandidates
 */

import {
  GAME_CONFIG, HEAD_STRING_Z, FOOT_SPOT, TABLE,
  isPlacementValid, placeCueBall, powerForSpeed, simulateShot,
} from './pool-game-physics.js'
import { applyShot, legalTargets } from './pool-game-rules.js'

const RADIUS = GAME_CONFIG.ball.radius
const DIAMETER = RADIUS * 2
const ROLL_DECEL = GAME_CONFIG.ball.rollingDeceleration
// stun hit slides first; rolling speed settles near 5/7 of launch
const ROLL_SHARE = 5 / 7
const MAX_CUT = ( 80 * Math.PI ) / 180

// aim: execution error sd (rad); power: relative sd; evaluate: simulated candidates
export const BOT_LEVELS = Object.freeze( {
  easy: { aim: ( 1.2 * Math.PI ) / 180, power: 0.15, evaluate: 4 },
  pro: { aim: ( 0.15 * Math.PI ) / 180, power: 0.04, evaluate: 14 },
} )

const gaussian = ( random ) => {
  const u = Math.max( 1e-9, random() )
  return Math.sqrt( -2 * Math.log( u ) ) * Math.cos( 2 * Math.PI * random() )
}

// Run engine: no live ball within clearance of segment from..to
const pathClear = ( balls, from, to, ignore, clearance = DIAMETER ) => {
  const dx = to.x - from.x
  const dz = to.z - from.z
  const lengthSquared = dx * dx + dz * dz || 1e-12
  return balls.every( ( ball ) => {
    if ( ball.pocketed || ignore.includes( ball.id ) ) return true
    const amount = Math.max( 0, Math.min( 1, ( ( ball.x - from.x ) * dx + ( ball.z - from.z ) * dz ) / lengthSquared ) )
    return Math.hypot( ball.x - ( from.x + dx * amount ), ball.z - ( from.z + dz * amount ) ) >= clearance - 1e-6
  } )
}

// aim point a bit inside table from pocket centre so ball clears jaws
const pocketMouth = ( pocket ) => {
  const inward = Math.hypot( pocket.x, pocket.z ) || 1
  return { x: pocket.x - ( pocket.x / inward ) * RADIUS * 0.6, z: pocket.z - ( pocket.z / inward ) * RADIUS * 0.6 }
}

// Run engine: every makeable-looking pot from cue position, best heuristic first
export function potCandidates( balls, targets, cue = balls[ 0 ] ) {
  const list = []
  for ( const id of targets ) {
    const ball = balls[ id ]
    if ( !ball || ball.pocketed ) continue
    TABLE.pockets.forEach( ( pocket, pocketIndex ) => {
      const mouth = pocketMouth( pocket )
      const toPocketX = mouth.x - ball.x
      const toPocketZ = mouth.z - ball.z
      const pocketDistance = Math.hypot( toPocketX, toPocketZ )
      const nx = toPocketX / pocketDistance
      const nz = toPocketZ / pocketDistance
      // side pockets refuse balls running nearly parallel to rail
      if ( pocket.z === 0 && Math.abs( nx ) < 0.45 ) return
      const ghost = { x: ball.x - nx * DIAMETER, z: ball.z - nz * DIAMETER }
      const aimX = ghost.x - cue.x
      const aimZ = ghost.z - cue.z
      const cueDistance = Math.hypot( aimX, aimZ )
      if ( cueDistance < 1e-4 ) return
      const cosCut = ( aimX * nx + aimZ * nz ) / cueDistance
      if ( cosCut < Math.cos( MAX_CUT ) ) return
      if ( !pathClear( balls, cue, ghost, [ 0, id ] ) ) return
      if ( !pathClear( balls, ball, mouth, [ 0, id ] ) ) return
      // object ball needs enough pace to reach pocket; cue loses pace to slide + cut
      const objectSpeed = Math.sqrt( 2 * ROLL_DECEL * pocketDistance * 1.3 + 0.35 ** 2 ) / ROLL_SHARE
      const cueContact = objectSpeed / Math.max( 0.25, cosCut * 0.97 )
      const launch = Math.sqrt( cueContact ** 2 + 2 * ROLL_DECEL * cueDistance ) / ROLL_SHARE
      list.push( {
        targetId: id,
        pocketIndex,
        angle: Math.atan2( aimZ, aimX ),
        power: Math.min( 0.92, Math.max( 0.06, powerForSpeed( launch ) ) ),
        cut: Math.acos( Math.min( 1, cosCut ) ),
        score: cosCut * cosCut / ( cueDistance + pocketDistance + 0.3 ),
      } )
    } )
  }
  return list.sort( ( a, b ) => b.score - a.score )
}

// Run engine: ball in hand: put cue straight behind best pot, else first clear spot
const chooseCuePlacement = ( balls, state, targets, random ) => {
  if ( state.ballInHand === 'kitchen' ) return { x: random.signed ? random.signed() * 0.15 : 0, z: HEAD_STRING_Z + 0.2 }
  let best = null
  for ( const id of targets ) {
    const ball = balls[ id ]
    if ( ball.pocketed ) continue
    for ( const pocket of TABLE.pockets ) {
      const mouth = pocketMouth( pocket )
      const length = Math.hypot( mouth.x - ball.x, mouth.z - ball.z )
      const nx = ( mouth.x - ball.x ) / length
      const nz = ( mouth.z - ball.z ) / length
      for ( const back of [ 0.3, 0.2, 0.45 ] ) {
        const spot = { x: ball.x - nx * ( DIAMETER + back ), z: ball.z - nz * ( DIAMETER + back ) }
        if ( !isPlacementValid( spot, balls ) ) continue
        if ( !pathClear( balls, ball, mouth, [ 0, id ] ) || !pathClear( balls, spot, ball, [ 0, id ] ) ) continue
        const score = 1 / ( length + back )
        if ( !best || score > best.score ) best = { spot, score }
        break
      }
    }
  }
  if ( best ) return best.spot
  for ( let z = HEAD_STRING_Z; z > -TABLE.halfLength; z -= DIAMETER ) {
    for ( const x of [ 0, 0.2, -0.2, 0.4, -0.4 ] ) if ( isPlacementValid( { x, z }, balls ) ) return { x, z }
  }
  return { x: 0, z: HEAD_STRING_Z }
}

// Run engine: how good table looks for `turn` with cue where it stopped
const positionValue = ( balls, state, turn ) => {
  const candidates = potCandidates( balls, legalTargets( state, turn ) )
  return Math.min( 5, candidates.filter( ( candidate ) => candidate.cut < Math.PI / 3 ).length ) * 20
    + ( candidates[ 0 ]?.score ?? 0 ) * 60
}

const scoreOutcome = ( state, result, botTurn ) => {
  const { state: next, events } = applyShot( { ...state, ballInHand: null }, result )
  if ( next.phase === 'over' ) return next.winner === botTurn ? 1e5 : -1e5
  const fouled = events.some( ( event ) => event.type === 'foul' )
  if ( fouled ) return -800
  const nextBalls = result.balls
  if ( next.turn === botTurn ) {
    const pots = events.filter( ( event ) => event.type === 'pot' ).length
    return 400 + pots * 40 + positionValue( nextBalls, next, botTurn )
  }
  // miss: leave opponent as little as possible
  return -positionValue( nextBalls, next, next.turn )
}

// Play > vs Bot > bot turn: pick shot (+ cue spot when ball in hand), then add human-ish error
export function chooseShot( { balls: inputBalls, state, difficulty = 'easy', random = Math.random } ) {
  const level = BOT_LEVELS[ difficulty ] || BOT_LEVELS.easy
  const targets = legalTargets( state )
  let balls = inputBalls
  let cuePosition = null
  if ( state.ballInHand ) {
    cuePosition = chooseCuePlacement( balls, state, targets, random )
    balls = placeCueBall( balls, cuePosition )
  }
  const cue = balls[ 0 ]

  let shot
  if ( state.phase === 'break' ) {
    // break: full pace into apex, tiny offset so spreads differ
    const apex = targets.map( ( id ) => balls[ id ] )
      .reduce( ( best, ball ) => ( Math.hypot( ball.x - FOOT_SPOT.x, ball.z - FOOT_SPOT.z ) < Math.hypot( best.x - FOOT_SPOT.x, best.z - FOOT_SPOT.z ) ? ball : best ) )
    shot = { angle: Math.atan2( apex.z - cue.z, apex.x - cue.x ) + gaussian( random ) * 0.003, power: 1, spin: 0 }
    return { ...shot, cuePosition }
  }

  const pots = potCandidates( balls, targets )
  const trial = []
  for ( const candidate of pots.slice( 0, Math.ceil( level.evaluate / 2 ) ) ) {
    trial.push( { ...candidate, spin: 0 } )
    trial.push( { ...candidate, power: Math.min( 1, candidate.power * 1.25 ), spin: candidate.cut < 0.3 ? -0.4 : 0.3 } )
  }
  // safeties: firm-ish centre-ball hit on any legal ball with clear line
  for ( const id of targets ) {
    const ball = balls[ id ]
    if ( ball.pocketed || !pathClear( balls, cue, ball, [ 0, id ] ) ) continue
    trial.push( { angle: Math.atan2( ball.z - cue.z, ball.x - cue.x ), power: 0.32, spin: 0, safety: true } )
    if ( trial.length >= level.evaluate + 4 ) break
  }

  let best = null
  for ( const candidate of trial ) {
    const result = simulateShot( balls, candidate )
    const score = scoreOutcome( state, result, state.turn ) + ( candidate.safety ? -1 : 0 )
    if ( !best || score > best.score ) best = { ...candidate, score }
  }
  if ( !best ) {
    // snookered: hit nearest legal ball and hope
    const nearest = targets.map( ( id ) => balls[ id ] ).filter( ( ball ) => !ball.pocketed )
      .sort( ( a, b ) => Math.hypot( a.x - cue.x, a.z - cue.z ) - Math.hypot( b.x - cue.x, b.z - cue.z ) )[ 0 ]
    best = { angle: nearest ? Math.atan2( nearest.z - cue.z, nearest.x - cue.x ) : 0, power: 0.5, spin: 0, score: -Infinity }
  }
  return {
    angle: best.angle + gaussian( random ) * level.aim,
    power: Math.min( 1, Math.max( 0.04, best.power * ( 1 + gaussian( random ) * level.power ) ) ),
    spin: best.spin ?? 0,
    cuePosition,
    planned: { angle: best.angle, power: best.power, score: best.score, targetId: best.targetId ?? null },
  }
}
