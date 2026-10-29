/**
 * FILE: 3d-toys/eight-ball-pool/backend/pool-game-physics.test.js
 * PURPOSE: game table contracts: legal rack, straight pot, scratch, first contact, determinism, respot, aim ray
 * UI: none
 * USED BY: npm test
 * KEY EXPORTS: none
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import {
  FOOT_SPOT, GAME_CONFIG, TABLE, aimRay, createRack, isPlacementValid, respotBall, simulateShot,
} from './pool-game-physics.js'

const RADIUS = GAME_CONFIG.ball.radius

// Run engine: keep only listed balls on table, move them where asked
const layout = ( positions ) => createRack( 1 ).map( ( ball ) => {
  const spot = positions[ ball.id ]
  return spot
    ? { ...ball, x: spot.x, z: spot.z }
    : { ...ball, pocketed: true, pocketTime: 9, y: -1 }
} )

const angleTo = ( from, to ) => Math.atan2( to.z - from.z, to.x - from.x )

test( 'rack: 15 balls, 8 in centre, back corners mixed, nothing overlaps', () => {
  const balls = createRack( 42 )
  assert.equal( balls.length, 16 )
  const rack = balls.slice( 1 ).sort( ( a, b ) => b.z - a.z || a.x - b.x )
  assert.ok( Math.abs( rack[ 0 ].x - FOOT_SPOT.x ) < 1e-3 && Math.abs( rack[ 0 ].z - FOOT_SPOT.z ) < 1e-3, 'apex on foot spot' )
  const eight = balls[ 8 ]
  const centreZ = FOOT_SPOT.z - 2 * ( RADIUS * 2 + 0.0002 ) * Math.sqrt( 3 ) / 2
  assert.ok( Math.abs( eight.x ) < 1e-3 && Math.abs( eight.z - centreZ ) < 1e-3, '8 in middle of row 3' )
  const backRow = balls.slice( 1 ).filter( ( ball ) => ball.z < FOOT_SPOT.z - 0.2 ).sort( ( a, b ) => a.x - b.x )
  assert.equal( backRow.length, 5 )
  assert.notEqual( backRow[ 0 ].id < 8, backRow[ 4 ].id < 8, 'one solid one stripe in back corners' )
  for ( let a = 0; a < 16; a += 1 ) for ( let b = a + 1; b < 16; b += 1 ) {
    assert.ok( Math.hypot( balls[ a ].x - balls[ b ].x, balls[ a ].z - balls[ b ].z ) >= RADIUS * 2 - 1e-3 )
  }
} )

test( 'straight shot pots object ball in corner, first contact logged', () => {
  const pocket = TABLE.pockets[ 0 ]
  const object = { x: pocket.x + 0.25, z: pocket.z + 0.25 }
  const cue = { x: pocket.x + 0.6, z: pocket.z + 0.6 }
  // a touch of draw: rolling cue would follow object ball in
  const result = simulateShot( layout( { 0: cue, 3: object } ), { angle: angleTo( cue, object ), power: 0.35, spin: -0.6 } )
  assert.equal( result.firstContact, 3 )
  assert.deepEqual( result.pocketed, [ 3 ] )
  assert.ok( !result.balls[ 0 ].pocketed, 'cue stays up' )
} )

test( 'cue into empty corner is scratch with no contact', () => {
  const pocket = TABLE.pockets[ 5 ]
  const cue = { x: pocket.x - 0.4, z: pocket.z - 0.4 }
  const result = simulateShot( layout( { 0: cue, 3: { x: -0.4, z: -0.8 } } ), { angle: angleTo( cue, pocket ), power: 0.35 } )
  assert.equal( result.firstContact, null )
  assert.ok( result.pocketed.includes( 0 ) )
} )

test( 'same break twice gives identical frames', () => {
  const shot = { angle: -Math.PI / 2 + 0.003, power: 1, spin: 0 }
  const first = simulateShot( createRack( 7 ), shot )
  const second = simulateShot( createRack( 7 ), shot )
  assert.equal( first.frameCount, second.frameCount )
  assert.deepEqual( first.frames, second.frames )
  assert.ok( first.duration < 20, 'break settles before cap' )
} )

test( 'draw spin brings cue back after full hit', () => {
  const cue = { x: 0, z: 0.4 }
  const object = { x: 0, z: 0 }
  const shot = { angle: angleTo( cue, object ), power: 0.3 }
  const stun = simulateShot( layout( { 0: cue, 5: object } ), { ...shot, spin: 0 } )
  const draw = simulateShot( layout( { 0: cue, 5: object } ), { ...shot, spin: -1 } )
  assert.ok( draw.balls[ 0 ].z > stun.balls[ 0 ].z + 0.05, `draw ${ draw.balls[ 0 ].z } vs stun ${ stun.balls[ 0 ].z }` )
} )

test( 'respot puts 8 on foot spot, or behind it when taken', () => {
  const free = respotBall( layout( { 0: { x: 0, z: 0.8 }, 8: { x: 0.3, z: 0.3 } } ), 8 )
  assert.ok( Math.abs( free[ 8 ].z - FOOT_SPOT.z ) < 1e-9 && !free[ 8 ].pocketed )
  const taken = respotBall( layout( { 0: { x: 0, z: 0.8 }, 2: { x: 0, z: FOOT_SPOT.z }, 8: { x: 0.3, z: 0.3 } } ), 8 )
  assert.ok( taken[ 8 ].z < FOOT_SPOT.z - RADIUS * 2 + 1e-6, 'slides toward foot rail' )
  assert.ok( isPlacementValid( { x: taken[ 8 ].x, z: taken[ 8 ].z }, taken, { ignoreId: 8 } ) )
} )

test( 'aim ray finds ball in line and splits object/cue paths', () => {
  const balls = layout( { 0: { x: 0, z: 0.5 }, 4: { x: 0.02, z: 0 } } )
  const ray = aimRay( balls, balls[ 0 ], -Math.PI / 2 )
  assert.equal( ray.ballId, 4 )
  assert.ok( ray.objectDir.x > 0 && ray.cueDir.x < 0, 'object goes right, cue left' )
  const miss = aimRay( balls, balls[ 0 ], 0 )
  assert.equal( miss.ballId, null )
  assert.ok( Math.abs( miss.point.x - ( TABLE.halfWidth - RADIUS ) ) < 1e-9 )
} )
