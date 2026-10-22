/**
 * FILE: 3d-toys/physics-portfolio-builder/frontend/components/camera-path.test.js
 * PURPOSE: camera choreography contracts for every preset and screen shape
 * UI: none
 * USED BY: npm test (3d-toys root)
 * KEY EXPORTS: none
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { bakePreset } from '../../backend/scene-presets.js'
import { blendPose, endPose, poseToCamera, startPose } from './camera-path.js'

test( 'opening shot sits behind striker, low, looking at targets', async () => {
  for ( const preset of [ 'pool', 'marbles', 'dominoes' ] ) {
    const recording = await bakePreset( preset, { projectCount: 6, seed: 1 } )
    const pose = startPose( recording )
    const { position } = poseToCamera( pose )
    const striker = recording.positions.subarray( 0, 3 )
    const toStriker = [ striker[ 0 ] - pose.target[ 0 ], striker[ 2 ] - pose.target[ 2 ] ]
    const toCamera = [ position[ 0 ] - pose.target[ 0 ], position[ 2 ] - pose.target[ 2 ] ]
    assert.ok( Math.hypot( ...toCamera ) > Math.hypot( ...toStriker ), `${ preset }: camera behind striker` )
    assert.ok( toStriker[ 0 ] * toCamera[ 0 ] + toStriker[ 1 ] * toCamera[ 1 ] > 0, `${ preset }: same side as striker` )
    assert.ok( pose.elevation < 0.5 )
  }
} )

test( 'overview puts long table axis along long screen axis', async () => {
  const recording = await bakePreset( 'pool', { projectCount: 6, seed: 1 } )
  const landscape = endPose( recording, 16 / 9, 0 )
  const portrait = endPose( recording, 9 / 16, 0 )
  assert.equal( Math.abs( landscape.azimuth ), Math.PI / 2 )
  assert.equal( portrait.azimuth, 0 )
  assert.ok( portrait.distance > 0 && landscape.distance > 0 )
} )

test( 'blend: endpoints exact, azimuth takes short way round', () => {
  const from = { target: [ 0, 0, 0 ], azimuth: 3, elevation: 0.2, distance: 2, fov: 38 }
  const to = { target: [ 1, 0, 1 ], azimuth: -3, elevation: 1, distance: 8, fov: 36 }
  assert.deepEqual( blendPose( from, to, 0 ), from )
  const end = blendPose( from, to, 1 )
  assert.ok( Math.abs( Math.cos( end.azimuth ) - Math.cos( -3 ) ) < 1e-9 )
  const mid = blendPose( from, to, 0.5 )
  assert.ok( Math.abs( Math.abs( mid.azimuth ) - Math.PI ) < 0.01, 'passes through pi, not 0' )
  assert.ok( Math.abs( mid.distance - 4 ) < 1e-9, 'log-space distance midpoint' )
} )
