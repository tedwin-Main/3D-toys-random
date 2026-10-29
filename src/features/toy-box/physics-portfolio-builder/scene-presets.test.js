/**
 * FILE: src/features/toy-box/physics-portfolio-builder/scene-presets.test.js
 * PURPOSE: every preset bakes deterministic, contained, fully hit, non-overlapping breaks
 * UI: none
 * USED BY: npm test (3d-toys root)
 * KEY EXPORTS: none
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { bakePreset, bodyCountFor } from './scene-presets.js'
import { PRESET_IDS, PRESET_INFO } from './preset-info.js'

const lastFramePosition = ( recording, body ) => {
  const offset = ( ( recording.frameCount - 1 ) * recording.bodyCount + body ) * 3
  return recording.positions.subarray( offset, offset + 3 )
}

for ( const presetId of PRESET_IDS ) {
  test( `${ presetId }: same seed bakes identical frames`, async () => {
    const first = await bakePreset( presetId, { projectCount: 6, seed: 42 } )
    const second = await bakePreset( presetId, { projectCount: 6, seed: 42 } )
    assert.deepEqual( Array.from( first.positions ), Array.from( second.positions ) )
    assert.deepEqual( Array.from( first.quaternions ), Array.from( second.quaternions ) )
  } )

  test( `${ presetId }: different seeds give different breaks`, async () => {
    const first = await bakePreset( presetId, { projectCount: 6, seed: 1 } )
    const second = await bakePreset( presetId, { projectCount: 6, seed: 2 } )
    assert.notDeepEqual( Array.from( first.positions.slice( -30 ) ), Array.from( second.positions.slice( -30 ) ) )
  } )

  for ( const projectCount of [ 1, 5, PRESET_INFO[ presetId ].maxProjects ] ) {
    test( `${ presetId } x${ projectCount }: every body hit, settles, stays on surface`, async () => {
      const recording = await bakePreset( presetId, { projectCount, seed: 9 } )
      assert.equal( recording.bodyCount, bodyCountFor( presetId, projectCount ) )
      assert.ok( recording.impactTime > 0, 'impact after roll-in' )
      assert.ok( recording.settleTime > recording.impactTime )
      recording.firstHit.forEach( ( time, body ) => assert.ok( time >= 0, `body ${ body } never hit` ) )
      for ( let body = 0; body < recording.bodyCount; body += 1 ) {
        const [ x, , z ] = lastFramePosition( recording, body )
        assert.ok( Math.abs( x ) <= recording.bounds.halfWidth + 0.01, `body ${ body } off surface x=${ x }` )
        assert.ok( Math.abs( z ) <= recording.bounds.halfLength + 0.01, `body ${ body } off surface z=${ z }` )
      }
    } )
  }
}

test( 'rolling presets: settled balls never overlap', async () => {
  for ( const presetId of [ 'pool', 'marbles' ] ) {
    const recording = await bakePreset( presetId, { projectCount: PRESET_INFO[ presetId ].maxProjects, seed: 3 } )
    for ( let a = 0; a < recording.bodyCount; a += 1 ) {
      for ( let b = a + 1; b < recording.bodyCount; b += 1 ) {
        const pa = lastFramePosition( recording, a )
        const pb = lastFramePosition( recording, b )
        const reach = recording.bodies[ a ].radius + recording.bodies[ b ].radius
        assert.ok( Math.hypot( pa[ 0 ] - pb[ 0 ], pa[ 2 ] - pb[ 2 ] ) >= reach - 1e-4, `${ presetId } ${ a }/${ b } overlap` )
      }
    }
  }
} )

test( 'dominoes: every tile topples', async () => {
  const recording = await bakePreset( 'dominoes', { projectCount: 20, seed: 5 } )
  for ( let body = 1; body < recording.bodyCount; body += 1 ) {
    const offset = ( ( recording.frameCount - 1 ) * recording.bodyCount + body ) * 4
    const [ x, , z ] = recording.quaternions.subarray( offset, offset + 4 )
    // world-y of tile's local up axis
    const upY = 1 - 2 * ( x * x + z * z )
    assert.ok( upY < 0.6, `tile ${ body } still standing (up.y=${ upY.toFixed( 2 ) })` )
  }
} )

test( 'unknown preset throws', async () => {
  await assert.rejects( () => bakePreset( 'bowling', { projectCount: 3 } ), /Unknown preset/ )
} )
