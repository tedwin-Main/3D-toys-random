/**
 * FILE: src/features/toy-box/physics-portfolio-builder/scene-recording.test.js
 * PURPOSE: recording pack/unpack precision, sampler interpolation, scroll timeline shape
 * UI: none
 * USED BY: npm test (3d-toys root)
 * KEY EXPORTS: none
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { bakePreset } from './scene-presets.js'
import { decodeRecording, encodeRecording, sampleRecording, timelineState, TIMELINE } from './scene-recording.js'

test( 'encode/decode round trip within 0.2 mm and survives JSON', async () => {
  const recording = await bakePreset( 'pool', { projectCount: 15, seed: 4 } )
  const decoded = decodeRecording( JSON.parse( JSON.stringify( encodeRecording( recording ) ) ) )
  assert.equal( decoded.frameCount, recording.frameCount )
  let worstPosition = 0
  recording.positions.forEach( ( value, index ) => { worstPosition = Math.max( worstPosition, Math.abs( value - decoded.positions[ index ] ) ) } )
  let worstRotation = 0
  recording.quaternions.forEach( ( value, index ) => { worstRotation = Math.max( worstRotation, Math.abs( value - decoded.quaternions[ index ] ) ) } )
  assert.ok( worstPosition < 2e-4, `position error ${ worstPosition }` )
  assert.ok( worstRotation < 1e-4, `rotation error ${ worstRotation }` )
} )

test( 'decode rejects unknown version', () => {
  assert.throws( () => decodeRecording( { version: 99 } ), /Unsupported/ )
} )

test( 'sampler hits exact frames and blends between them', async () => {
  const recording = await bakePreset( 'marbles', { projectCount: 4, seed: 2 } )
  const frame = 20
  const exact = sampleRecording( recording, frame / recording.fps )
  const stored = recording.positions.subarray( frame * recording.bodyCount * 3, ( frame + 1 ) * recording.bodyCount * 3 )
  assert.deepEqual( Array.from( exact.positions ), Array.from( stored ) )

  const half = sampleRecording( recording, ( frame + 0.5 ) / recording.fps )
  const next = recording.positions.subarray( ( frame + 1 ) * recording.bodyCount * 3, ( frame + 2 ) * recording.bodyCount * 3 )
  half.positions.forEach( ( value, index ) => {
    assert.ok( Math.abs( value - ( stored[ index ] + next[ index ] ) / 2 ) < 1e-6 )
  } )
  for ( let body = 0; body < recording.bodyCount; body += 1 ) {
    assert.ok( Math.abs( Math.hypot( ...half.quaternions.subarray( body * 4, body * 4 + 4 ) ) - 1 ) < 1e-5 )
  }
} )

test( 'sampler clamps outside recording', async () => {
  const recording = await bakePreset( 'pool', { projectCount: 3, seed: 1 } )
  const before = sampleRecording( recording, -5 )
  const after = sampleRecording( recording, 999 )
  assert.deepEqual( Array.from( before.positions ), Array.from( recording.positions.subarray( 0, recording.bodyCount * 3 ) ) )
  assert.deepEqual( Array.from( after.positions ), Array.from( recording.positions.subarray( -recording.bodyCount * 3 ) ) )
} )

test( 'timeline: roll, impact, settle, hold', () => {
  const recording = { impactTime: 0.2, settleTime: 4 }
  assert.equal( timelineState( recording, 0 ).time, 0 )
  assert.ok( Math.abs( timelineState( recording, TIMELINE.approachShare ).time - 0.2 ) < 1e-9 )
  assert.ok( Math.abs( timelineState( recording, TIMELINE.settleShare ).time - 4 ) < 1e-9 )
  assert.equal( timelineState( recording, 1 ).time, 4 )
  assert.equal( timelineState( recording, 0.5 ).settled, false )
  assert.equal( timelineState( recording, 0.9 ).settled, true )
  assert.equal( timelineState( recording, 0 ).cameraBlend, 0 )
  assert.equal( timelineState( recording, 1 ).cameraBlend, 1 )
  let previous = -1
  for ( let p = 0; p <= 1; p += 0.01 ) {
    const { time } = timelineState( recording, p )
    assert.ok( time >= previous, 'time never runs backwards as scroll advances' )
    previous = time
  }
} )
