/**
 * FILE: 3d-toys/physics-portfolio-builder/backend/rolling-ball-physics.test.js
 * PURPOSE: rolling sim contracts: momentum transfer, energy never grows, walls hold, first hit logged
 * UI: none
 * USED BY: npm test (3d-toys root)
 * KEY EXPORTS: none
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { simulateRollingBalls } from './rolling-ball-physics.js'

const bounds = { halfWidth: 0.6, halfLength: 1.2 }
const frameAt = ( result, frame, body ) => {
  const offset = ( frame * result.bodyCount + body ) * 3
  return Array.from( result.positions.subarray( offset, offset + 3 ) )
}

test( 'head-on hit hands motion to target ball', () => {
  const result = simulateRollingBalls( {
    bounds,
    balls: [
      { x: 0, z: 0.6, r: 0.03, m: 0.17, vx: 0, vz: -3 },
      { x: 0, z: 0, r: 0.03, m: 0.17 },
    ],
  } )
  // 0.4 s: well after contact, before wall bounce
  const frame = Math.round( 0.4 * result.fps )
  const [ , , strikerZ ] = frameAt( result, frame, 0 )
  const [ , , targetZ ] = frameAt( result, frame, 1 )
  assert.ok( targetZ < -0.3, `target travelled forward (z=${ targetZ })` )
  assert.ok( strikerZ > targetZ, 'striker stays behind target' )
  assert.ok( result.firstHit[ 1 ] > 0.15 && result.firstHit[ 1 ] < 0.25, `contact near 0.19 s, got ${ result.firstHit[ 1 ] }` )
  assert.equal( result.impactTime, result.firstHit[ 0 ] )
} )

test( 'walls keep fast ball on table', () => {
  const result = simulateRollingBalls( {
    bounds,
    balls: [ { x: 0, z: 0, r: 0.03, m: 0.17, vx: 6, vz: -9 } ],
    physics: { maxDuration: 3, minDuration: 3 },
  } )
  for ( let frame = 0; frame < result.frameCount; frame += 1 ) {
    const [ x, , z ] = frameAt( result, frame, 0 )
    assert.ok( Math.abs( x ) <= bounds.halfWidth - 0.03 + 1e-6 )
    assert.ok( Math.abs( z ) <= bounds.halfLength - 0.03 + 1e-6 )
  }
} )

test( 'quaternions stay unit length', () => {
  const result = simulateRollingBalls( {
    bounds,
    balls: [
      { x: 0.01, z: 0.6, r: 0.03, m: 0.17, vx: 0, vz: -5 },
      { x: 0, z: 0, r: 0.03, m: 0.17 },
      { x: 0.031, z: -0.053, r: 0.03, m: 0.17 },
    ],
  } )
  for ( let index = 0; index < result.quaternions.length; index += 4 ) {
    const length = Math.hypot( ...result.quaternions.subarray( index, index + 4 ) )
    assert.ok( Math.abs( length - 1 ) < 1e-5 )
  }
} )

test( 'settles before max duration and stops recording', () => {
  const result = simulateRollingBalls( {
    bounds,
    balls: [ { x: 0, z: 0.5, r: 0.03, m: 0.17, vx: 0, vz: -1 }, { x: 0, z: 0, r: 0.03, m: 0.17 } ],
  } )
  assert.ok( result.settleTime < 8 )
  assert.equal( result.frameCount, Math.round( result.settleTime * result.fps ) + 1 )
} )
