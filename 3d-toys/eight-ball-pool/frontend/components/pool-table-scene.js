/**
 * FILE: 3d-toys/eight-ball-pool/frontend/components/pool-table-scene.js
 * PURPOSE: three.js 8-ball table: felt, cushions + pockets built from physics geometry, balls, cue stick, aim guide, shot playback, camera
 * UI: Play > table (menu backdrop, aiming, shot playback, ball in hand)
 * USED BY: play-page.js
 * KEY EXPORTS: createPoolTableScene, BALL_COLORS
 */

import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { FRAME_STRIDE, GAME_CONFIG, TABLE, aimRay } from '../../backend/pool-game-physics.js'
import { createRandom } from '../../backend/seeded-random.js'
import { blendPose, fitDistance, poseToCamera } from './camera-path.js'
import { cueBallTexture, poolBallTexture, surfaceTexture } from './ball-textures.js'

// ball N colour at index N - 1 (8Ball_Studio rack-layout.js); stripes 9-15 repeat solids
export const BALL_COLORS = Object.freeze( [
  '#f5b818', '#1b46a2', '#cb242a', '#59287a', '#e76317', '#126d40', '#7a1d33', '#0a0c0a',
  '#f5b818', '#1b46a2', '#cb242a', '#59287a', '#e76317', '#126d40', '#7a1d33',
] )

const RADIUS = GAME_CONFIG.ball.radius
const CUSHION_DEPTH = 0.05
const CUSHION_HEIGHT = 0.044
const RAIL_WIDTH = 0.14
const RAIL_TOP = 0.052
const RAIL_BASE = -0.08
const FELT = '#0f5e3c'
const WOOD = '#5b331c'
const OVERHEAD_ELEVATION = 1.2
const IS_TOUCH = typeof window !== 'undefined' && window.matchMedia( '(hover: none) and (pointer: coarse)' ).matches
const OUTER_X = TABLE.halfWidth + CUSHION_DEPTH + RAIL_WIDTH
const OUTER_Z = TABLE.halfLength + CUSHION_DEPTH + RAIL_WIDTH
const LEGAL_RING = '#f2f1e9'
const ILLEGAL_RING = '#ff5a4f'

const near = ( a, b ) => Math.abs( a - b ) < 1e-9

// Run engine: shape points are (x, -z) so rotateX(-90deg) lays extrusion on table with height up +y
const extrudeFlat = ( points, height, holes = [] ) => {
  const shape = new THREE.Shape( points.map( ( point ) => new THREE.Vector2( point.x, -point.z ) ) )
  for ( const hole of holes ) shape.holes.push( new THREE.Path( hole.map( ( point ) => new THREE.Vector2( point.x, -point.z ) ) ) )
  const geometry = new THREE.ExtrudeGeometry( shape, { depth: height, bevelEnabled: false, curveSegments: 4 } )
  geometry.rotateX( -Math.PI / 2 )
  return geometry
}

// Play > table: one cushion block per straight rail run, jaw ends taken from physics so visuals match collisions
const buildCushions = ( group, material ) => {
  const jaws = TABLE.segments.filter( ( segment ) => segment.type !== 'cushion' )
  for ( const segment of TABLE.segments.filter( ( item ) => item.type === 'cushion' ) ) {
    const horizontal = near( segment.az, segment.bz )
    const normal = horizontal ? { x: 0, z: Math.sign( segment.az ) } : { x: Math.sign( segment.ax ), z: 0 }
    const jawAt = ( x, z ) => jaws.find( ( jaw ) => near( jaw.ax, x ) && near( jaw.az, z ) )
    const jawA = jawAt( segment.ax, segment.az )
    const jawB = jawAt( segment.bx, segment.bz )
    const endA = jawA ? { x: jawA.bx, z: jawA.bz } : { x: segment.ax, z: segment.az }
    const endB = jawB ? { x: jawB.bx, z: jawB.bz } : { x: segment.bx, z: segment.bz }
    const outer = ( point ) => horizontal
      ? { x: point.x, z: segment.az + normal.z * CUSHION_DEPTH }
      : { x: segment.ax + normal.x * CUSHION_DEPTH, z: point.z }
    const mesh = new THREE.Mesh(
      extrudeFlat( [ endA, { x: segment.ax, z: segment.az }, { x: segment.bx, z: segment.bz }, endB, outer( endB ), outer( endA ) ], CUSHION_HEIGHT ),
      material,
    )
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add( mesh )
  }
}

// Play > table: wood rail ring; inner edge bulges round each pocket so holes read from above
const buildRail = ( group, material ) => {
  const innerX = TABLE.halfWidth + CUSHION_DEPTH
  const innerZ = TABLE.halfLength + CUSHION_DEPTH
  const corners = [ { x: -innerX, z: -innerZ }, { x: innerX, z: -innerZ }, { x: innerX, z: innerZ }, { x: -innerX, z: innerZ } ]
  const contour = []
  for ( let side = 0; side < 4; side += 1 ) {
    const from = corners[ side ]
    const to = corners[ ( side + 1 ) % 4 ]
    const steps = Math.ceil( Math.hypot( to.x - from.x, to.z - from.z ) / 0.004 )
    for ( let step = 0; step < steps; step += 1 ) {
      let point = { x: from.x + ( to.x - from.x ) * ( step / steps ), z: from.z + ( to.z - from.z ) * ( step / steps ) }
      for ( const pocket of TABLE.pockets ) {
        const notch = pocket.radius * 1.18
        const distance = Math.hypot( point.x - pocket.x, point.z - pocket.z )
        if ( distance < notch ) {
          const scale = notch / Math.max( distance, 1e-6 )
          point = { x: pocket.x + ( point.x - pocket.x ) * scale, z: pocket.z + ( point.z - pocket.z ) * scale }
        }
      }
      contour.push( point )
    }
  }
  const outer = [ { x: -OUTER_X, z: -OUTER_Z }, { x: OUTER_X, z: -OUTER_Z }, { x: OUTER_X, z: OUTER_Z }, { x: -OUTER_X, z: OUTER_Z } ]
  const rail = new THREE.Mesh( extrudeFlat( outer, RAIL_TOP - RAIL_BASE, [ contour ] ), material )
  rail.position.y = RAIL_BASE
  rail.castShadow = true
  rail.receiveShadow = true
  group.add( rail )

  // diamond sights, as on real table
  const sightMaterial = new THREE.MeshStandardMaterial( { color: '#efe6cf', roughness: 0.3, metalness: 0.3 } )
  const sightGeometry = new THREE.CircleGeometry( 0.008, 16 )
  sightGeometry.rotateX( -Math.PI / 2 )
  const middle = CUSHION_DEPTH + RAIL_WIDTH / 2
  const addSight = ( x, z ) => {
    const sight = new THREE.Mesh( sightGeometry, sightMaterial )
    sight.position.set( x, RAIL_TOP + 0.0005, z )
    group.add( sight )
  }
  for ( let step = 1; step < 8; step += 1 ) {
    if ( step === 4 ) continue
    const z = -TABLE.halfLength + ( step / 8 ) * TABLE.halfLength * 2
    addSight( -TABLE.halfWidth - middle, z )
    addSight( TABLE.halfWidth + middle, z )
  }
  for ( let step = 1; step < 4; step += 1 ) {
    const x = -TABLE.halfWidth + ( step / 4 ) * TABLE.halfWidth * 2
    addSight( x, -TABLE.halfLength - middle )
    addSight( x, TABLE.halfLength + middle )
  }
}

// Play > table: felt bed, pocket holes, cushions, rails, cabinet, floor
const buildTable = () => {
  const group = new THREE.Group()
  const felt = surfaceTexture( 'felt', FELT )
  felt.repeat.set( 3, 6 )
  const bed = new THREE.Mesh(
    new THREE.PlaneGeometry( ( TABLE.halfWidth + CUSHION_DEPTH ) * 2, ( TABLE.halfLength + CUSHION_DEPTH ) * 2 ),
    new THREE.MeshStandardMaterial( { map: felt, roughness: 0.95 } ),
  )
  bed.rotation.x = -Math.PI / 2
  bed.receiveShadow = true
  group.add( bed )

  const holeMaterial = new THREE.MeshBasicMaterial( { color: '#020302' } )
  for ( const pocket of TABLE.pockets ) {
    const hole = new THREE.Mesh( new THREE.CircleGeometry( pocket.radius * 1.18, 40 ), holeMaterial )
    hole.rotation.x = -Math.PI / 2
    hole.position.set( pocket.x, 0.0006, pocket.z )
    group.add( hole )
  }

  const cushionMaterial = new THREE.MeshStandardMaterial( { color: new THREE.Color( FELT ).multiplyScalar( 0.82 ), roughness: 0.92 } )
  buildCushions( group, cushionMaterial )
  const wood = surfaceTexture( 'wood', WOOD )
  wood.repeat.set( 1.6, 1.6 )
  buildRail( group, new THREE.MeshStandardMaterial( { map: wood, roughness: 0.38, metalness: 0.05 } ) )

  const cabinet = new THREE.Mesh(
    new THREE.BoxGeometry( OUTER_X * 2 - 0.06, 0.62, OUTER_Z * 2 - 0.06 ),
    new THREE.MeshStandardMaterial( { color: new THREE.Color( WOOD ).multiplyScalar( 0.45 ), roughness: 0.6 } ),
  )
  cabinet.position.y = RAIL_BASE - 0.31
  cabinet.receiveShadow = true
  group.add( cabinet )

  const floor = new THREE.Mesh( new THREE.PlaneGeometry( 40, 40 ), new THREE.MeshStandardMaterial( { color: '#0b100d', roughness: 1 } ) )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -0.78
  floor.receiveShadow = true
  group.add( floor )
  return group
}

// Play > aim guide: flat strip on felt, length along x before placement
const createStrip = ( color, opacity ) => {
  const geometry = new THREE.PlaneGeometry( 1, 1 )
  geometry.rotateX( -Math.PI / 2 )
  geometry.translate( 0.5, 0, 0 )
  const mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color, transparent: true, opacity, depthWrite: false } ) )
  mesh.renderOrder = 3
  return mesh
}

const placeStrip = ( strip, from, dirX, dirZ, length, width = 0.0045 ) => {
  strip.visible = length > 0.002
  strip.position.set( from.x, 0.0012, from.z )
  strip.rotation.y = Math.atan2( -dirZ, dirX )
  strip.scale.set( length, 1, width )
}

// Play > cue stick: maple shaft, ebony butt, ivory ferrule, blue tip; tip at local origin, pointing +x
const buildCue = () => {
  const group = new THREE.Group()
  const part = ( length, radiusFront, radiusBack, color, offset, roughness = 0.35 ) => {
    const geometry = new THREE.CylinderGeometry( radiusFront, radiusBack, length, 20 )
    geometry.rotateZ( -Math.PI / 2 )
    geometry.translate( -offset - length / 2, 0, 0 )
    const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial( { color, roughness, metalness: 0.05 } ) )
    mesh.castShadow = true
    group.add( mesh )
  }
  part( 0.008, 0.0062, 0.0062, '#2e5f9e', 0, 0.8 )
  part( 0.022, 0.0063, 0.0064, '#f4efe2', 0.008 )
  part( 0.86, 0.0064, 0.0098, '#e2c08a', 0.03 )
  part( 0.54, 0.0098, 0.0142, '#24140c', 0.89, 0.25 )
  return group
}

// Play > table: renderer + world; page drives it through returned methods
export function createPoolTableScene( { canvas } ) {
  const renderer = new THREE.WebGLRenderer( { canvas, antialias: true, powerPreference: 'high-performance' } )
  renderer.setPixelRatio( Math.min( window.devicePixelRatio || 1, IS_TOUCH ? 1.5 : 2 ) )
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap

  const scene = new THREE.Scene()
  scene.background = new THREE.Color( '#050806' )
  scene.fog = new THREE.Fog( '#050806', 4, 11 )
  const pmrem = new THREE.PMREMGenerator( renderer )
  const environment = pmrem.fromScene( new RoomEnvironment(), 0.04 ).texture
  scene.environment = environment
  scene.environmentIntensity = 0.32
  const camera = new THREE.PerspectiveCamera( 40, 1, 0.02, 40 )

  scene.add( new THREE.HemisphereLight( '#d6efe0', '#050806', 0.35 ) )
  const key = new THREE.DirectionalLight( '#fff1dc', 1.3 )
  key.position.set( 0.5, 3.2, 0.7 )
  key.castShadow = true
  key.shadow.mapSize.set( IS_TOUCH ? 1024 : 2048, IS_TOUCH ? 1024 : 2048 )
  Object.assign( key.shadow.camera, { left: -1.7, right: 1.7, top: 1.7, bottom: -1.7, near: 0.5, far: 6 } )
  key.shadow.camera.updateProjectionMatrix()
  key.shadow.bias = -0.0004
  key.shadow.normalBias = 0.01
  key.shadow.radius = 3
  scene.add( key, key.target )
  // twin bar lamps over table: warm pools of light, falloff toward rails
  for ( const z of [ -0.62, 0.62 ] ) {
    const lamp = new THREE.SpotLight( '#ffe3b8', 7, 0, 0.8, 0.65, 1.6 )
    lamp.position.set( 0, 1.45, z )
    lamp.target.position.set( 0, 0, z )
    scene.add( lamp, lamp.target )
  }

  scene.add( buildTable() )

  // Play > balls: shared sphere, per-ball texture; base turn so numbers start face-up at random yaw
  const fontFamily = '"Space Grotesk", sans-serif'
  const sphere = new THREE.SphereGeometry( RADIUS, IS_TOUCH ? 32 : 48, IS_TOUCH ? 20 : 32 )
  const random = createRandom( 77 )
  const ballMeshes = []
  const baseTurns = []
  for ( let id = 0; id < 16; id += 1 ) {
    const map = id === 0 ? cueBallTexture() : poolBallTexture( id, BALL_COLORS[ id - 1 ], fontFamily, () => invalidate() )
    const material = new THREE.MeshPhysicalMaterial( { map, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.04 } )
    const mesh = new THREE.Mesh( sphere, material )
    mesh.castShadow = true
    scene.add( mesh )
    ballMeshes.push( mesh )
    baseTurns.push( new THREE.Quaternion().setFromEuler( new THREE.Euler( -Math.PI / 2 + random.signed() * 0.5, random() * Math.PI * 2, 0, 'YXZ' ) ) )
  }

  // Play > aim guide pieces
  const aimGroup = new THREE.Group()
  scene.add( aimGroup )
  const aimLine = createStrip( '#f2f1e9', 0.72 )
  const objectLine = createStrip( '#f2f1e9', 0.5 )
  const cueLine = createStrip( '#9fd8ff', 0.45 )
  const bounceLine = createStrip( '#f2f1e9', 0.35 )
  const ringGeometry = new THREE.RingGeometry( RADIUS * 0.86, RADIUS, 48 )
  ringGeometry.rotateX( -Math.PI / 2 )
  const ghost = new THREE.Mesh( ringGeometry, new THREE.MeshBasicMaterial( { color: LEGAL_RING, transparent: true, opacity: 0.85, depthWrite: false } ) )
  ghost.renderOrder = 3
  aimGroup.add( aimLine, objectLine, cueLine, bounceLine, ghost )
  const cue = buildCue()
  scene.add( cue )

  // Play > legal-ball halos + ball-in-hand ring
  const haloGeometry = new THREE.RingGeometry( RADIUS * 1.25, RADIUS * 1.45, 40 )
  haloGeometry.rotateX( -Math.PI / 2 )
  const haloMaterial = new THREE.MeshBasicMaterial( { color: '#f2f1e9', transparent: true, opacity: 0.32, depthWrite: false } )
  const halos = ballMeshes.map( () => {
    const halo = new THREE.Mesh( haloGeometry, haloMaterial )
    halo.visible = false
    halo.renderOrder = 2
    scene.add( halo )
    return halo
  } )
  const handRing = new THREE.Mesh( haloGeometry, new THREE.MeshBasicMaterial( { color: '#7be08f', transparent: true, opacity: 0.9, depthWrite: false } ) )
  handRing.visible = false
  handRing.renderOrder = 2
  scene.add( handRing )

  let balls = null
  // legal: ghost ring colour; halo: rings under own group only (whole rack ringed is noise)
  let aim = { visible: false, angle: -Math.PI / 2, power: 0, legal: [], halo: [] }
  let placement = { active: false, valid: true }
  let playback = null
  let cameraMode = 'overhead'
  let aspect = 1
  let currentPose = null
  let lastTime = 0
  let frameHandle = 0
  let disposed = false

  const invalidate = () => {
    if ( disposed || frameHandle ) return
    frameHandle = requestAnimationFrame( renderFrame )
  }

  const overheadPose = () => {
    const azimuth = aspect >= 1 ? Math.PI / 2 : 0
    const fov = aspect < 1 ? 50 : 36
    const corners = []
    for ( const x of [ -OUTER_X, OUTER_X ] ) for ( const z of [ -OUTER_Z, OUTER_Z ] ) for ( const y of [ RAIL_BASE, RAIL_TOP ] ) corners.push( [ x, y, z ] )
    return { target: [ 0, 0, 0 ], azimuth, elevation: OVERHEAD_ELEVATION, distance: fitDistance( corners, azimuth, OVERHEAD_ELEVATION, fov, aspect ), fov }
  }

  // Play > cue cam: low behind cue ball, looking down aim line
  const cuePose = () => {
    const ball = balls?.[ 0 ]
    if ( !ball || ball.pocketed ) return overheadPose()
    const dirX = Math.cos( aim.angle )
    const dirZ = Math.sin( aim.angle )
    return {
      target: [ ball.x + dirX * 0.5, 0, ball.z + dirZ * 0.5 ],
      azimuth: Math.atan2( -dirX, -dirZ ),
      elevation: 0.36,
      distance: aspect < 1 ? 1.35 : 1.05,
      fov: aspect < 1 ? 58 : 44,
    }
  }

  const wantedPose = () => ( cameraMode === 'cue' && !playback ? cuePose() : overheadPose() )
  // cue cam holds its framing during shot instead of chasing balls
  let heldPose = null

  const applyPose = ( pose ) => {
    const { position, target } = poseToCamera( pose )
    camera.position.set( ...position )
    camera.lookAt( ...target )
    if ( camera.fov !== pose.fov ) {
      camera.fov = pose.fov
      camera.updateProjectionMatrix()
    }
  }

  const poseGap = ( a, b ) => Math.abs( a.azimuth - b.azimuth ) + Math.abs( a.elevation - b.elevation )
    + Math.abs( Math.log( a.distance / b.distance ) ) + Math.abs( a.fov - b.fov ) / 50
    + Math.hypot( a.target[ 0 ] - b.target[ 0 ], a.target[ 2 ] - b.target[ 2 ] )

  const placeBall = ( id, x, y, z, quaternion ) => {
    const mesh = ballMeshes[ id ]
    mesh.position.set( x, y, z )
    mesh.quaternion.set( quaternion.x, quaternion.y, quaternion.z, quaternion.w ).multiply( baseTurns[ id ] )
    // fully below felt: hide so it never pokes through cabinet
    mesh.visible = y > -RADIUS * 1.2
  }

  const showBalls = () => {
    if ( !balls ) return
    for ( const ball of balls ) {
      placeBall( ball.id, ball.x, ball.pocketed ? -1 : RADIUS, ball.z, ball.quaternion )
    }
  }

  const sampleQuaternion = new THREE.Quaternion()
  const nextQuaternion = new THREE.Quaternion()
  const showFrame = ( result, exact ) => {
    const last = result.frameCount - 1
    const frame = Math.min( last, Math.floor( exact ) )
    const next = Math.min( last, frame + 1 )
    const amount = Math.min( 1, exact - frame )
    const { frames, ballCount } = result
    for ( let id = 0; id < ballCount; id += 1 ) {
      const a = ( frame * ballCount + id ) * FRAME_STRIDE
      const b = ( next * ballCount + id ) * FRAME_STRIDE
      sampleQuaternion.set( frames[ a + 3 ], frames[ a + 4 ], frames[ a + 5 ], frames[ a + 6 ] )
      nextQuaternion.set( frames[ b + 3 ], frames[ b + 4 ], frames[ b + 5 ], frames[ b + 6 ] )
      sampleQuaternion.slerp( nextQuaternion, amount )
      placeBall(
        id,
        frames[ a ] + ( frames[ b ] - frames[ a ] ) * amount,
        frames[ a + 1 ] + ( frames[ b + 1 ] - frames[ a + 1 ] ) * amount,
        frames[ a + 2 ] + ( frames[ b + 2 ] - frames[ a + 2 ] ) * amount,
        sampleQuaternion,
      )
    }
  }

  // Play > aim guide: ray from physics helper, so guide and sim agree
  const updateAim = () => {
    const cueBall = balls?.[ 0 ]
    const show = aim.visible && cueBall && !cueBall.pocketed && !playback
    aimGroup.visible = show
    cue.visible = show || Boolean( aim.stickOnly && cueBall && !cueBall.pocketed && !playback )
    halos.forEach( ( halo, id ) => {
      const ball = balls?.[ id ]
      halo.visible = Boolean( show && ball && !ball.pocketed && aim.halo.includes( id ) )
      if ( halo.visible ) halo.position.set( ball.x, 0.0011, ball.z )
    } )
    handRing.visible = Boolean( placement.active && cueBall && !cueBall.pocketed && !playback )
    if ( handRing.visible ) {
      handRing.position.set( cueBall.x, 0.0013, cueBall.z )
      handRing.material.color.set( placement.valid ? '#7be08f' : ILLEGAL_RING )
    }
    if ( !cueBall || cueBall.pocketed ) return
    const dirX = Math.cos( aim.angle )
    const dirZ = Math.sin( aim.angle )
    // butt lifted 5 degrees, like real stroke
    const tilt = ( 5 * Math.PI ) / 180
    const along = new THREE.Vector3( dirX * Math.cos( tilt ), -Math.sin( tilt ), dirZ * Math.cos( tilt ) )
    const pull = RADIUS + 0.012 + aim.power * 0.3
    cue.position.set( cueBall.x - along.x * pull, RADIUS - along.y * pull, cueBall.z - along.z * pull )
    cue.quaternion.setFromUnitVectors( new THREE.Vector3( 1, 0, 0 ), along )
    if ( !show ) return

    const ray = aimRay( balls, cueBall, aim.angle )
    placeStrip( aimLine, cueBall, dirX, dirZ, ray.distance )
    ghost.position.set( ray.point.x, 0.0014, ray.point.z )
    if ( ray.ballId === null ) {
      ghost.scale.setScalar( 0.5 )
      ghost.material.color.set( LEGAL_RING )
      objectLine.visible = false
      cueLine.visible = false
      placeStrip( bounceLine, ray.point, ray.cushionDir.x, ray.cushionDir.z, 0.16 )
      return
    }
    ghost.scale.setScalar( 1 )
    ghost.material.color.set( aim.legal.includes( ray.ballId ) ? LEGAL_RING : ILLEGAL_RING )
    bounceLine.visible = false
    const target = balls[ ray.ballId ]
    const straightness = Math.cos( ray.cut )
    placeStrip( objectLine, target, ray.objectDir.x, ray.objectDir.z, 0.06 + 0.32 * straightness )
    if ( ray.cueDir ) placeStrip( cueLine, ray.point, ray.cueDir.x, ray.cueDir.z, 0.04 + 0.22 * Math.sin( ray.cut ) )
    else cueLine.visible = false
  }

  function renderFrame( now ) {
    frameHandle = 0
    if ( disposed ) return
    const delta = lastTime ? Math.min( 0.05, ( now - lastTime ) / 1000 ) : 1 / 60
    lastTime = now
    let active = false

    if ( playback ) {
      const elapsed = ( ( now - playback.start ) / 1000 ) * playback.speed
      const exact = elapsed * playback.result.fps
      if ( exact >= playback.result.frameCount - 1 || playback.skip ) {
        showFrame( playback.result, playback.result.frameCount - 1 )
        const done = playback.onDone
        playback = null
        updateAim()
        done?.()
      } else {
        showFrame( playback.result, exact )
        active = true
      }
    }

    const wanted = heldPose || wantedPose()
    if ( !currentPose ) currentPose = wanted
    else {
      currentPose = blendPose( currentPose, wanted, 1 - Math.exp( -delta * 6 ) )
      if ( poseGap( currentPose, wanted ) > 0.0005 ) active = true
      else currentPose = wanted
    }
    applyPose( currentPose )
    renderer.render( scene, camera )
    if ( active ) invalidate()
    else lastTime = 0
  }

  // HUD-covered edges (px); table frames inside what is left
  let insets = { top: 0, right: 0, bottom: 0, left: 0 }
  let size = { width: 1, height: 1 }

  // Run engine: camera frames inner rect; view offset extends same frustum over HUD strips
  const applyProjection = () => {
    const innerWidth = Math.max( 1, size.width - insets.left - insets.right )
    const innerHeight = Math.max( 1, size.height - insets.top - insets.bottom )
    aspect = innerWidth / innerHeight
    camera.aspect = aspect
    camera.setViewOffset( innerWidth, innerHeight, -insets.left, -insets.top, size.width, size.height )
    camera.updateProjectionMatrix()
  }

  const resize = () => {
    const parent = canvas.parentElement
    size = {
      width: Math.max( 1, parent?.clientWidth || canvas.clientWidth ),
      height: Math.max( 1, parent?.clientHeight || canvas.clientHeight ),
    }
    renderer.setSize( size.width, size.height, false )
    applyProjection()
    currentPose = null
    invalidate()
  }
  const observer = new ResizeObserver( resize )
  observer.observe( canvas.parentElement || canvas )
  resize()

  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const ballPlane = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), -RADIUS )
  const hit = new THREE.Vector3()

  return {
    // Play > table: authoritative resting layout after shot, rack, placement
    setBalls( next ) {
      balls = next
      showBalls()
      updateAim()
      invalidate()
    },
    // Play > aim guide: angle (rad), power 0..1, legal + halo target ids
    setAim( next ) {
      aim = { ...aim, ...next }
      updateAim()
      invalidate()
    },
    setPlacement( next ) {
      placement = { ...placement, ...next }
      updateAim()
      invalidate()
    },
    // Play > HUD layout: keep table clear of top bar, controls, hint
    setInsets( next ) {
      const rounded = Object.fromEntries( Object.entries( { ...insets, ...next } ).map( ( [ key, value ] ) => [ key, Math.max( 0, Math.round( value ) ) ] ) )
      if ( Object.keys( rounded ).every( ( key ) => rounded[ key ] === insets[ key ] ) ) return
      insets = rounded
      applyProjection()
      invalidate()
    },
    setCameraMode( mode ) {
      cameraMode = mode
      heldPose = null
      invalidate()
    },
    // Play > shot: play recorded frames; resolves when last frame shown
    playShot( result, { speed = 1 } = {} ) {
      return new Promise( ( resolve ) => {
        if ( cameraMode === 'cue' ) heldPose = currentPose
        playback = { result, start: performance.now(), speed, onDone: () => { heldPose = null; resolve() } }
        updateAim()
        invalidate()
      } )
    },
    skipShot() {
      if ( playback ) playback.skip = true
      invalidate()
    },
    isPlaying: () => Boolean( playback ),
    // Play > pointer: screen point to table point at ball-centre height
    pickTable( clientX, clientY ) {
      const rect = canvas.getBoundingClientRect()
      ndc.set( ( ( clientX - rect.left ) / rect.width ) * 2 - 1, -( ( clientY - rect.top ) / rect.height ) * 2 + 1 )
      raycaster.setFromCamera( ndc, camera )
      return raycaster.ray.intersectPlane( ballPlane, hit ) ? { x: hit.x, z: hit.z } : null
    },
    // Play > pointer: table distance per screen pixel near a point (touch drag gain)
    screenScale() {
      return currentPose ? ( currentPose.distance * Math.tan( ( camera.fov * Math.PI ) / 360 ) * 2 ) / Math.max( 1, canvas.clientHeight ) : 0.003
    },
    invalidate,
    dispose() {
      disposed = true
      cancelAnimationFrame( frameHandle )
      observer.disconnect()
      scene.traverse( ( node ) => {
        node.geometry?.dispose()
        const materials = Array.isArray( node.material ) ? node.material : node.material ? [ node.material ] : []
        for ( const material of materials ) {
          for ( const value of Object.values( material ) ) if ( value?.isTexture ) value.dispose()
          material.dispose()
        }
      } )
      environment.dispose()
      pmrem.dispose()
      renderer.dispose()
    },
  }
}
