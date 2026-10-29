/**
 * FILE: src/features/toy-box/physics-portfolio-builder/scene-presets.js
 * PURPOSE: three break scenes (pool, marbles, dominoes): layout per project count, seeded jitter, bake to recording
 * UI: Builder > Style > Scene picker, Builder > Preview
 * USED BY: frontend bake-worker.js, tests
 * KEY EXPORTS: PRESETS, bakePreset, bodyCountFor
 */

import { simulateRollingBalls } from './rolling-ball-physics.js'
import { simulateRigidBodies } from './rigid-body-physics.js'
import { createRecording } from './scene-recording.js'
import { createRandom } from './seeded-random.js'
import { PRESET_INFO } from './preset-info.js'

// Run engine: pool rack, triangle rows growing away from striker
const triangleRack = ( count, radius, apexZ, random ) => {
  const spacing = radius * 2 + 0.00004
  const rowSpacing = spacing * Math.sqrt( 3 ) / 2
  const positions = []
  for ( let row = 0; positions.length < count; row += 1 ) {
    for ( let column = 0; column <= row && positions.length < count; column += 1 ) {
      // apex seated exact; rest get sub-mm seating variance so pack opens unevenly
      const jitter = positions.length === 0 ? 0 : 0.0003
      positions.push( {
        x: ( column - row / 2 ) * spacing + random.signed() * jitter,
        z: apexZ - row * rowSpacing + random.signed() * jitter,
      } )
    }
  }
  return positions
}

// Run engine: marbles, hex spiral cluster, densest first
const hexCluster = ( count, radius, center, random ) => {
  const spacing = radius * 2 + 0.0004
  const cells = [ { q: 0, r: 0 } ]
  const directions = [ [ 1, 0 ], [ 0, 1 ], [ -1, 1 ], [ -1, 0 ], [ 0, -1 ], [ 1, -1 ] ]
  for ( let ring = 1; cells.length < count; ring += 1 ) {
    let q = -ring
    let r = ring
    for ( const [ dq, dr ] of directions ) {
      for ( let step = 0; step < ring; step += 1 ) {
        cells.push( { q, r } )
        q += dq
        r += dr
      }
    }
  }
  return cells.slice( 0, count ).map( ( { q, r } ) => ( {
    x: center.x + spacing * ( q + r / 2 ) + random.signed() * 0.0008,
    z: center.z + spacing * r * Math.sqrt( 3 ) / 2 + random.signed() * 0.0008,
  } ) )
}

// Run engine: domino S-curve, resampled to equal arc length
const dominoPath = ( count, spacing, amplitude, wavelength ) => {
  const length = Math.max( spacing, ( count - 1 ) * spacing )
  const dense = []
  const steps = 2000
  for ( let index = 0; index <= steps; index += 1 ) {
    const t = ( index / steps ) * length * 1.6
    dense.push( { x: amplitude * Math.sin( ( 2 * Math.PI * t ) / wavelength ), z: -t } )
  }
  const points = []
  let travelled = 0
  let target = 0
  for ( let index = 1; index < dense.length && points.length < count; index += 1 ) {
    const a = dense[ index - 1 ]
    const b = dense[ index ]
    const segment = Math.hypot( b.x - a.x, b.z - a.z )
    while ( travelled + segment >= target && points.length < count ) {
      const amount = ( target - travelled ) / segment
      const x = a.x + ( b.x - a.x ) * amount
      const z = a.z + ( b.z - a.z ) * amount
      points.push( { x, z, yaw: Math.atan2( b.x - a.x, b.z - a.z ) } )
      target += spacing
    }
    travelled += segment
  }
  // centre path on origin
  const midZ = ( points[ 0 ].z + points[ points.length - 1 ].z ) / 2
  return points.map( ( point ) => ( { ...point, z: point.z - midZ } ) )
}

export const PRESETS = Object.freeze( {
  pool: Object.freeze( {
    ...PRESET_INFO.pool,
    bake: ( { projectCount, seed } ) => {
      const random = createRandom( seed )
      // 36 mm (real 28.5): balls read from overview camera
      const radius = 0.036
      const bounds = { halfWidth: 0.635, halfLength: 1.27 }
      const rack = triangleRack( projectCount, radius, -0.45, random )
      const aimX = random.signed() * 0.004
      const startZ = 0.8
      const speed = 7.2 + random() * 1.2
      const dz = rack[ 0 ].z + radius * 2 - startZ
      const length = Math.hypot( aimX, dz )
      const balls = [
        { x: 0, z: startZ, r: radius, m: 0.17, vx: ( aimX / length ) * speed, vz: ( dz / length ) * speed },
        ...rack.map( ( position ) => ( { ...position, r: radius, m: 0.17 } ) ),
      ]
      const simulation = simulateRollingBalls( { balls, bounds } )
      return { bounds, simulation, bodies: balls.map( ( ball ) => ( { kind: 'ball', radius: ball.r } ) ) }
    },
  } ),
  marbles: Object.freeze( {
    ...PRESET_INFO.marbles,
    bake: ( { projectCount, seed } ) => {
      const random = createRandom( seed )
      const radius = 0.024
      const bounds = { halfWidth: 0.75, halfLength: 0.75 }
      const cluster = hexCluster( projectCount, radius, { x: 0, z: -0.12 }, random )
      const front = Math.max( ...cluster.map( ( position ) => position.z ) )
      const startZ = 0.6
      const speed = 4.6 + random() * 0.8
      const aimX = random.signed() * 0.01
      const dz = front - startZ
      const length = Math.hypot( aimX, dz )
      const balls = [
        { x: 0, z: startZ, r: 0.034, m: 0.06, vx: ( aimX / length ) * speed, vz: ( dz / length ) * speed },
        ...cluster.map( ( position ) => ( { ...position, r: radius, m: 0.02 } ) ),
      ]
      const simulation = simulateRollingBalls( {
        balls,
        bounds,
        physics: { restitution: 0.9, rollingDeceleration: 0.5, cushionRestitution: 0.65 },
      } )
      return { bounds, simulation, bodies: balls.map( ( ball ) => ( { kind: 'ball', radius: ball.r } ) ) }
    },
  } ),
  dominoes: Object.freeze( {
    ...PRESET_INFO.dominoes,
    bake: async ( { projectCount, seed } ) => {
      const random = createRandom( seed )
      const size = [ 0.12, 0.24, 0.035 ]
      const path = dominoPath( projectCount, 0.15, 0.22 + random() * 0.08, 1.5 + random() * 0.4 )
      const first = path[ 0 ]
      // dense small ball: topples first tile, then stops near it instead of bouncing away
      const ballRadius = 0.1
      const back = 0.5
      const speed = 1.2 + random() * 0.2
      // striker approaches along first tile's facing, from behind
      const ball = {
        kind: 'ball',
        radius: ballRadius,
        position: [ first.x - Math.sin( first.yaw ) * back, ballRadius, first.z - Math.cos( first.yaw ) * back ],
        velocity: [ Math.sin( first.yaw ) * speed, 0, Math.cos( first.yaw ) * speed ],
        density: 800,
        linearDamping: 0.4,
        angularDamping: 0.4,
      }
      const tiles = path.map( ( point ) => ( {
        kind: 'box',
        size,
        position: [ point.x, size[ 1 ] / 2, point.z ],
        yaw: point.yaw + random.signed() * 0.01,
      } ) )
      const xs = [ ball.position[ 0 ], ...path.map( ( point ) => point.x ) ]
      const zs = [ ball.position[ 2 ], ...path.map( ( point ) => point.z ) ]
      const bounds = {
        halfWidth: Math.max( 0.8, Math.max( ...xs.map( Math.abs ) ) + 0.5 ),
        halfLength: Math.max( 0.8, Math.max( ...zs.map( Math.abs ) ) + 0.5 ),
      }
      const simulation = await simulateRigidBodies( { bodies: [ ball, ...tiles ], ground: { halfWidth: bounds.halfWidth + 2, halfLength: bounds.halfLength + 2 } } )
      return {
        bounds,
        simulation,
        bodies: [ { kind: 'ball', radius: ballRadius }, ...tiles.map( () => ( { kind: 'box', size } ) ) ],
      }
    },
  } ),
} )

// Run engine: body count = striker + one per project, at least 3 so empty draft still breaks
export const bodyCountFor = ( presetId, projectCount ) =>
  1 + Math.min( PRESET_INFO[ presetId ].maxProjects, Math.max( 3, projectCount ) )

// Run engine: bake preset into recording (async: dominoes load Rapier WASM)
export async function bakePreset( presetId, { projectCount, seed = 1 } ) {
  const preset = PRESETS[ presetId ]
  if ( !preset ) throw new Error( `Unknown preset ${ presetId }` )
  const count = bodyCountFor( presetId, projectCount ) - 1
  const { bounds, simulation, bodies } = await preset.bake( { projectCount: count, seed } )
  return createRecording( { preset: presetId, seed, bodies, bounds, simulation } )
}
