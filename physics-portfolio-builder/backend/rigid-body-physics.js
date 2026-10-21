/**
 * FILE: 3d-toys/physics-portfolio-builder/backend/rigid-body-physics.js
 * PURPOSE: deterministic 3D rigid-body bake (dominoes) on Rapier WASM, same output shape as rolling sim
 * UI: none (baked in builder worker, sampled by viewer)
 * USED BY: scene-presets.js
 * KEY EXPORTS: simulateRigidBodies
 */

// browser worker ignores import maps: full CDN url; node tests use npm package (3d-toys devDependency)
const RAPIER_URL = 'https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.21.0/+esm'

let RAPIER = null
let rapierReady = null
const loadRapier = () => {
  rapierReady ??= import( globalThis.process?.versions?.node ? '@dimforge/rapier3d-compat' : RAPIER_URL ).then( ( module ) => {
    RAPIER = module.default ?? module
    return RAPIER.init()
  } )
  return rapierReady
}

const DEFAULTS = Object.freeze( {
  timestep: 1 / 120,
  fps: 60,
  minDuration: 1.5,
  maxDuration: 10,
  settleSpeed: 0.01,
  hitSpeed: 0.05,
} )

const yawQuaternion = ( yaw ) => ( { x: 0, y: Math.sin( yaw / 2 ), z: 0, w: Math.cos( yaw / 2 ) } )

// Run engine: bake bodies on flat ground. bodies[0] is striker ball. Returns flat Float32 frames.
export async function simulateRigidBodies( { bodies, ground, settings = {} } ) {
  await loadRapier()
  const options = { ...DEFAULTS, ...settings }
  const world = new RAPIER.World( { x: 0, y: -9.81, z: 0 } )
  world.timestep = options.timestep

  const floor = world.createRigidBody( RAPIER.RigidBodyDesc.fixed().setTranslation( 0, -0.05, 0 ) )
  world.createCollider(
    RAPIER.ColliderDesc.cuboid( ground.halfWidth, 0.05, ground.halfLength ).setFriction( 0.7 ).setRestitution( 0.05 ),
    floor,
  )

  const handles = bodies.map( ( body ) => {
    const [ x, y, z ] = body.position
    const description = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation( x, y, z )
      .setRotation( yawQuaternion( body.yaw ?? 0 ) )
      .setLinearDamping( body.linearDamping ?? 0.05 )
      .setAngularDamping( body.angularDamping ?? 0.05 )
      .setCcdEnabled( true )
    if ( body.velocity ) description.setLinvel( ...body.velocity )
    const handle = world.createRigidBody( description )
    const collider = body.kind === 'ball'
      ? RAPIER.ColliderDesc.ball( body.radius )
      : RAPIER.ColliderDesc.cuboid( body.size[ 0 ] / 2, body.size[ 1 ] / 2, body.size[ 2 ] / 2 )
    world.createCollider( collider.setDensity( body.density ?? 700 ).setFriction( body.friction ?? 0.45 ).setRestitution( 0.08 ), handle )
    // roll spin matches launch velocity so ball does not skid first
    if ( body.kind === 'ball' && body.velocity ) {
      const [ vx, , vz ] = body.velocity
      handle.setAngvel( { x: vz / body.radius, y: 0, z: -vx / body.radius }, true )
    }
    return handle
  } )

  const positions = []
  const quaternions = []
  const firstHit = bodies.map( () => -1 )
  const pushFrame = () => {
    for ( const handle of handles ) {
      const t = handle.translation()
      const q = handle.rotation()
      positions.push( t.x, t.y, t.z )
      quaternions.push( q.x, q.y, q.z, q.w )
    }
  }

  const stepsPerFrame = Math.max( 1, Math.round( 1 / ( options.timestep * options.fps ) ) )
  const maxSteps = Math.round( options.maxDuration / options.timestep )
  let settleTime = options.maxDuration
  pushFrame()
  for ( let step = 1; step <= maxSteps; step += 1 ) {
    world.step()
    const time = step * options.timestep
    let resting = true
    handles.forEach( ( handle, index ) => {
      const v = handle.linvel()
      const w = handle.angvel()
      const reach = bodies[ index ].kind === 'ball' ? bodies[ index ].radius : bodies[ index ].size[ 1 ] / 2
      const speed = Math.hypot( v.x, v.y, v.z ) + Math.hypot( w.x, w.y, w.z ) * reach
      if ( index > 0 && firstHit[ index ] < 0 && speed > options.hitSpeed ) firstHit[ index ] = time
      if ( speed > options.settleSpeed && !handle.isSleeping() ) resting = false
    } )
    if ( step % stepsPerFrame !== 0 ) continue
    pushFrame()
    if ( resting && time >= options.minDuration ) {
      settleTime = time
      break
    }
  }

  const later = firstHit.slice( 1 ).filter( ( time ) => time >= 0 )
  const impactTime = later.length ? Math.min( ...later ) : settleTime
  firstHit[ 0 ] = impactTime
  world.free()

  return {
    fps: options.fps,
    bodyCount: bodies.length,
    frameCount: positions.length / ( bodies.length * 3 ),
    positions: Float32Array.from( positions ),
    quaternions: Float32Array.from( quaternions ),
    firstHit,
    impactTime,
    settleTime,
  }
}
