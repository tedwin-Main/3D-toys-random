/**
 * FILE: 3d-toys/physics-portfolio-builder/frontend/components/scene-renderer.js
 * PURPOSE: three.js stage for any baked break: surface, bodies, lights, camera swing, hover/pick, label projection
 * UI: Viewer > Hero, Builder > Preview
 * USED BY: break-stage.js
 * KEY EXPORTS: createSceneRenderer
 */

import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { createSample, sampleRecording, timelineState } from '../../backend/scene-recording.js'
import { FONT_PAIRS, PALETTES } from '../../backend/site-schema.js'
import { blendPose, endPose, poseToCamera, startPose } from './camera-path.js'
import { cueBallTexture, dominoTexture, marbleTexture, poolBallTexture, surfaceTexture } from './body-textures.js'

const clamp = ( value, min = 0, max = 1 ) => Math.min( max, Math.max( min, value ) )
const IS_TOUCH = typeof window !== 'undefined' && window.matchMedia( '(hover: none) and (pointer: coarse)' ).matches
const FINE_POINTER = typeof window !== 'undefined' && window.matchMedia( '(hover: hover) and (pointer: fine)' ).matches
// label flash after first hit, in sim seconds
const FLASH_IN = 0.08
const FLASH_HOLD = 0.9
const FLASH_OUT = 0.5

const initialOf = ( title ) => ( title?.trim()?.[ 0 ] || '•' ).toUpperCase()

// Run engine: free every GPU resource under a group
const disposeTree = ( root ) => {
  root.traverse( ( node ) => {
    node.geometry?.dispose()
    const materials = Array.isArray( node.material ) ? node.material : node.material ? [ node.material ] : []
    for ( const material of materials ) {
      for ( const value of Object.values( material ) ) if ( value?.isTexture ) value.dispose()
      material.dispose()
    }
  } )
}

// Preview > surface: pool table (felt, cushions, wood rails, sights, apron)
const buildPoolTable = ( group, bounds, palette ) => {
  const { halfWidth: hw, halfLength: hl } = bounds
  const felt = surfaceTexture( 'felt', palette.surface )
  felt.repeat.set( 2, 4 )
  const feltMaterial = new THREE.MeshStandardMaterial( { map: felt, roughness: 0.94 } )
  const bed = new THREE.Mesh( new THREE.PlaneGeometry( hw * 2, hl * 2 ), feltMaterial )
  bed.rotation.x = -Math.PI / 2
  bed.receiveShadow = true
  group.add( bed )

  const cushion = 0.05
  const railWidth = 0.13
  const cushionMaterial = new THREE.MeshStandardMaterial( { color: new THREE.Color( palette.surface ).multiplyScalar( 0.85 ), roughness: 0.9 } )
  const wood = surfaceTexture( 'wood', palette.rail )
  const railMaterial = new THREE.MeshStandardMaterial( { map: wood, roughness: 0.42, metalness: 0.05 } )
  const addBox = ( width, height, depth, x, y, z, material ) => {
    const mesh = new THREE.Mesh( new THREE.BoxGeometry( width, height, depth ), material )
    mesh.position.set( x, y, z )
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add( mesh )
  }
  for ( const side of [ -1, 1 ] ) {
    addBox( cushion, 0.042, hl * 2, side * ( hw + cushion / 2 ), 0.021, 0, cushionMaterial )
    addBox( hw * 2 + cushion * 2, 0.042, cushion, 0, 0.021, side * ( hl + cushion / 2 ), cushionMaterial )
    addBox( railWidth, 0.06, hl * 2 + ( cushion + railWidth ) * 2, side * ( hw + cushion + railWidth / 2 ), 0.03, 0, railMaterial )
    addBox( hw * 2 + cushion * 2, 0.06, railWidth, 0, 0.03, side * ( hl + cushion + railWidth / 2 ), railMaterial )
  }
  const apron = new THREE.Mesh(
    new THREE.BoxGeometry( ( hw + cushion + railWidth ) * 2, 0.7, ( hl + cushion + railWidth ) * 2 ),
    new THREE.MeshStandardMaterial( { color: new THREE.Color( palette.rail ).multiplyScalar( 0.5 ), roughness: 0.6 } ),
  )
  // top 2 mm under felt: shared plane z-fights
  apron.position.y = -0.352
  apron.receiveShadow = true
  group.add( apron )

  // diamond sights along rails, as on real table
  const sightMaterial = new THREE.MeshStandardMaterial( { color: '#efe6cf', roughness: 0.3, metalness: 0.2 } )
  const sightGeometry = new THREE.CircleGeometry( 0.008, 16 )
  const railCenter = cushion + railWidth / 2
  const addSight = ( x, z ) => {
    const sight = new THREE.Mesh( sightGeometry, sightMaterial )
    sight.rotation.x = -Math.PI / 2
    sight.position.set( x, 0.0605, z )
    group.add( sight )
  }
  for ( let step = 1; step < 8; step += 1 ) {
    if ( step === 4 ) continue
    const z = -hl + ( step / 8 ) * hl * 2
    addSight( -hw - railCenter, z )
    addSight( hw + railCenter, z )
  }
  for ( let step = 1; step < 4; step += 1 ) {
    const x = -hw + ( step / 4 ) * hw * 2
    addSight( x, -hl - railCenter )
    addSight( x, hl + railCenter )
  }
  return { reach: Math.max( hw, hl ) + cushion + railWidth }
}

// Preview > surface: marble tray (stone, low walls, chalk ring)
const buildMarbleTray = ( group, bounds, palette ) => {
  const { halfWidth: hw, halfLength: hl } = bounds
  const stone = surfaceTexture( 'stone', palette.surface )
  stone.repeat.set( 3, 3 )
  const bed = new THREE.Mesh( new THREE.PlaneGeometry( hw * 2, hl * 2 ), new THREE.MeshStandardMaterial( { map: stone, roughness: 0.75 } ) )
  bed.rotation.x = -Math.PI / 2
  bed.receiveShadow = true
  group.add( bed )
  const wall = 0.04
  const wallMaterial = new THREE.MeshStandardMaterial( { color: palette.rail, roughness: 0.5 } )
  for ( const side of [ -1, 1 ] ) {
    const long = new THREE.Mesh( new THREE.BoxGeometry( wall, 0.035, hl * 2 + wall * 2 ), wallMaterial )
    long.position.set( side * ( hw + wall / 2 ), 0.0175, 0 )
    const short = new THREE.Mesh( new THREE.BoxGeometry( hw * 2, 0.035, wall ), wallMaterial )
    short.position.set( 0, 0.0175, side * ( hl + wall / 2 ) )
    for ( const mesh of [ long, short ] ) {
      mesh.castShadow = true
      mesh.receiveShadow = true
      group.add( mesh )
    }
  }
  const ring = new THREE.Mesh(
    new THREE.RingGeometry( 0.34, 0.348, 96 ),
    new THREE.MeshBasicMaterial( { color: '#ffffff', transparent: true, opacity: 0.55 } ),
  )
  ring.rotation.x = -Math.PI / 2
  ring.position.set( 0, 0.0006, -0.12 )
  group.add( ring )
  return { reach: Math.max( hw, hl ) + wall }
}

// Preview > surface: wood floor for domino run
const buildDominoFloor = ( group, bounds, palette ) => {
  const span = Math.max( bounds.halfWidth, bounds.halfLength ) * 2 + 2
  // floor in rail wood (lifted), not felt colour: tiles pop on warm planks
  const wood = surfaceTexture( 'wood', new THREE.Color( palette.rail ).offsetHSL( 0, 0, 0.14 ).getStyle() )
  wood.repeat.set( span / 1.2, span / 1.2 )
  const floor = new THREE.Mesh( new THREE.PlaneGeometry( span, span ), new THREE.MeshStandardMaterial( { map: wood, roughness: 0.55 } ) )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  group.add( floor )
  return { reach: Math.max( bounds.halfWidth, bounds.halfLength ) }
}

const SURFACES = { pool: buildPoolTable, marbles: buildMarbleTray, dominoes: buildDominoFloor }

// Preview > bodies: one mesh per recording body, look follows preset + project
const buildBody = ( body, index, recording, site, palette, fontFamily, requestRender ) => {
  const project = index > 0 ? site.projects[ index - 1 ] : null
  const color = project?.color || palette.muted
  if ( body.kind === 'box' ) {
    const texture = dominoTexture( color, project ? initialOf( project.title ) : '', index, fontFamily, requestRender )
    const material = new THREE.MeshPhysicalMaterial( { map: texture, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.2 } )
    return new THREE.Mesh( new RoundedBoxGeometry( ...body.size, 3, 0.006 ), material )
  }
  const geometry = new THREE.SphereGeometry( body.radius, IS_TOUCH ? 32 : 56, IS_TOUCH ? 20 : 36 )
  if ( recording.preset === 'dominoes' ) {
    return new THREE.Mesh( geometry, new THREE.MeshStandardMaterial( { color: '#c9ccd2', metalness: 1, roughness: 0.22 } ) )
  }
  if ( recording.preset === 'marbles' ) {
    const map = marbleTexture( index === 0 ? '#d9e4ee' : color, index )
    return new THREE.Mesh( geometry, new THREE.MeshPhysicalMaterial( { map, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03, iridescence: 0.2 } ) )
  }
  const map = index === 0 ? cueBallTexture() : poolBallTexture( index, color, fontFamily, requestRender )
  return new THREE.Mesh( geometry, new THREE.MeshPhysicalMaterial( { map, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.05 } ) )
}

// Viewer > Hero + Builder > Preview: create stage on canvas. Throws if WebGL unavailable.
export function createSceneRenderer( { canvas, onLabels = () => {}, onHover = () => {}, onSelect = () => {} } ) {
  const renderer = new THREE.WebGLRenderer( { canvas, antialias: true, powerPreference: 'high-performance' } )
  renderer.setPixelRatio( Math.min( window.devicePixelRatio || 1, IS_TOUCH ? 1.5 : 2 ) )
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator( renderer )
  const environment = pmrem.fromScene( new RoomEnvironment(), 0.04 ).texture
  scene.environment = environment
  scene.environmentIntensity = 0.5
  const camera = new THREE.PerspectiveCamera( 38, 1, 0.02, 60 )

  const hemisphere = new THREE.HemisphereLight( '#ffffff', '#000000', 0.55 )
  const key = new THREE.DirectionalLight( '#fff4e2', 2.6 )
  key.castShadow = true
  key.shadow.mapSize.set( IS_TOUCH ? 1024 : 2048, IS_TOUCH ? 1024 : 2048 )
  key.shadow.bias = -0.0004
  key.shadow.normalBias = 0.015
  key.shadow.radius = 4
  const lamp = new THREE.SpotLight( '#fff1d6', 0, 0, 0.85, 0.75, 1.6 )
  scene.add( hemisphere, key, key.target, lamp, lamp.target )

  let world = null
  let recording = null
  let site = null
  let meshes = []
  let lifts = []
  let sample = null
  let opening = null
  let state = { time: 0, cameraBlend: 0, settled: false }
  let hovered = -1
  let focused = -1
  // 'auto': settled table shows every label when few enough to stay readable
  let showAllLabels = 'auto'
  let frameHandle = 0
  let disposed = false
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 }
  const labels = []
  const projected = new THREE.Vector3()
  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()

  const invalidate = () => {
    if ( disposed || frameHandle ) return
    frameHandle = requestAnimationFrame( renderFrame )
  }

  // Preview > stage: rebuild world for new break or new look
  const setScene = ( next ) => {
    recording = next.recording
    site = next.site
    if ( world ) {
      scene.remove( world )
      disposeTree( world )
    }
    world = new THREE.Group()
    const palette = PALETTES[ site.palette ] || PALETTES.felt
    const fontFamily = ( FONT_PAIRS[ site.fontPair ] || FONT_PAIRS.grotesk ).display
    scene.background = new THREE.Color( palette.bg )
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry( 80, 80 ),
      new THREE.MeshStandardMaterial( { color: new THREE.Color( palette.bg ).lerp( new THREE.Color( palette.surface ), 0.08 ), roughness: 1 } ),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = recording.preset === 'pool' ? -0.7 : -0.002
    floor.receiveShadow = true
    world.add( floor )

    const { reach } = ( SURFACES[ recording.preset ] || buildPoolTable )( world, recording.bounds, palette )
    scene.fog = new THREE.Fog( palette.bg, reach * 3, reach * 9 )
    hemisphere.groundColor.set( palette.bg )
    key.position.set( -reach * 0.9, reach * 2.6, reach * 0.7 )
    Object.assign( key.shadow.camera, { left: -reach - 0.3, right: reach + 0.3, top: reach + 0.3, bottom: -reach - 0.3, near: 0.1, far: reach * 6 } )
    key.shadow.camera.updateProjectionMatrix()
    // billiard lamp pool over pool table only
    lamp.intensity = recording.preset === 'pool' ? 9 : 0
    lamp.position.set( 0, 1.6, 0 )
    key.intensity = recording.preset === 'pool' ? 1.6 : 2.6

    meshes = recording.bodies.map( ( body, index ) => {
      const mesh = buildBody( body, index, recording, site, palette, fontFamily, invalidate )
      mesh.castShadow = true
      mesh.userData.bodyIndex = index
      world.add( mesh )
      return mesh
    } )
    lifts = meshes.map( () => 0 )
    sample = createSample( recording )
    opening = startPose( recording )
    labels.length = 0
    for ( let index = 1; index < recording.bodyCount; index += 1 ) {
      if ( site.projects[ index - 1 ] ) labels.push( { project: index - 1, body: index, x: 0, y: 0, opacity: 0, active: false } )
    }
    scene.add( world )
    invalidate()
  }

  const setProgress = ( progress ) => {
    if ( !recording ) return
    state = timelineState( recording, progress )
    if ( !state.settled && hovered >= 0 ) setHovered( -1 )
    invalidate()
  }

  const setHovered = ( body ) => {
    if ( body === hovered ) return
    hovered = body
    canvas.style.cursor = body >= 0 ? 'pointer' : ''
    onHover( body >= 0 ? body - 1 : -1 )
    invalidate()
  }

  const pickBody = ( clientX, clientY ) => {
    const rect = canvas.getBoundingClientRect()
    ndc.set( ( ( clientX - rect.left ) / rect.width ) * 2 - 1, -( ( clientY - rect.top ) / rect.height ) * 2 + 1 )
    raycaster.setFromCamera( ndc, camera )
    const hit = raycaster.intersectObjects( meshes.slice( 1 ), false )[ 0 ]
    const body = hit?.object.userData.bodyIndex ?? -1
    return body > 0 && site.projects[ body - 1 ] ? body : -1
  }

  // Hero > settled table > hover: lift body, show its label
  const handlePointerMove = ( event ) => {
    if ( FINE_POINTER ) {
      pointer.targetX = ( event.clientX / window.innerWidth - 0.5 ) * 2
      pointer.targetY = ( event.clientY / window.innerHeight - 0.5 ) * 2
      invalidate()
    }
    if ( !state.settled || event.pointerType === 'touch' ) return
    setHovered( pickBody( event.clientX, event.clientY ) )
  }
  let downAt = null
  const handlePointerDown = ( event ) => { downAt = { x: event.clientX, y: event.clientY } }
  // Hero > settled table > click body: open project (drag or scroll gesture ignored)
  const handlePointerUp = ( event ) => {
    if ( !downAt || !state.settled ) return
    const moved = Math.hypot( event.clientX - downAt.x, event.clientY - downAt.y )
    downAt = null
    if ( moved > 8 ) return
    const body = pickBody( event.clientX, event.clientY )
    if ( body > 0 ) onSelect( body - 1 )
  }
  const handlePointerLeave = () => setHovered( -1 )
  canvas.addEventListener( 'pointermove', handlePointerMove )
  canvas.addEventListener( 'pointerdown', handlePointerDown )
  canvas.addEventListener( 'pointerup', handlePointerUp )
  canvas.addEventListener( 'pointerleave', handlePointerLeave )

  const resize = () => {
    const parent = canvas.parentElement
    const width = Math.max( 1, parent?.clientWidth || canvas.clientWidth )
    const height = Math.max( 1, parent?.clientHeight || canvas.clientHeight )
    renderer.setSize( width, height, false )
    camera.aspect = width / height
    invalidate()
  }
  const observer = new ResizeObserver( resize )
  if ( canvas.parentElement ) observer.observe( canvas.parentElement )

  // Run engine: one paint; re-arms while hover lift or pointer parallax still moving
  function renderFrame() {
    frameHandle = 0
    if ( disposed || !recording ) return
    let animating = false

    pointer.x += ( pointer.targetX - pointer.x ) * 0.06
    pointer.y += ( pointer.targetY - pointer.y ) * 0.06
    if ( Math.abs( pointer.targetX - pointer.x ) + Math.abs( pointer.targetY - pointer.y ) > 0.002 ) animating = true

    sampleRecording( recording, state.time, sample )
    for ( let index = 0; index < meshes.length; index += 1 ) {
      const target = state.settled && ( index === hovered || index === focused ) ? 1 : 0
      lifts[ index ] += ( target - lifts[ index ] ) * 0.18
      if ( Math.abs( target - lifts[ index ] ) > 0.002 ) animating = true
      else lifts[ index ] = target
      const body = recording.bodies[ index ]
      const liftHeight = body.kind === 'ball' ? body.radius * 0.9 : 0.05
      const mesh = meshes[ index ]
      mesh.position.set( sample.positions[ index * 3 ], sample.positions[ index * 3 + 1 ] + lifts[ index ] * liftHeight, sample.positions[ index * 3 + 2 ] )
      mesh.quaternion.set( sample.quaternions[ index * 4 ], sample.quaternions[ index * 4 + 1 ], sample.quaternions[ index * 4 + 2 ], sample.quaternions[ index * 4 + 3 ] )
      const emissive = mesh.material.emissive
      if ( emissive ) {
        const project = index > 0 ? site.projects[ index - 1 ] : null
        emissive.set( project?.color || '#000000' ).multiplyScalar( lifts[ index ] * 0.35 )
      }
    }

    const pose = blendPose( opening, endPose( recording, camera.aspect, opening.azimuth ), state.cameraBlend )
    pose.azimuth += pointer.x * 0.05
    pose.elevation = clamp( pose.elevation - pointer.y * 0.03, 0.08, 1.4 )
    const { position, target } = poseToCamera( pose )
    camera.position.set( ...position )
    camera.lookAt( target[ 0 ], target[ 1 ], target[ 2 ] )
    if ( camera.fov !== pose.fov ) camera.fov = pose.fov
    camera.updateProjectionMatrix()
    renderer.render( scene, camera )

    // labels: flash after first hit, then only hovered/focused (or all, builder toggle) once settled
    const width = renderer.domElement.clientWidth
    const height = renderer.domElement.clientHeight
    for ( const label of labels ) {
      const hit = recording.firstHit[ label.body ]
      const since = state.time - hit
      let opacity = hit >= 0 && since >= 0
        ? clamp( since / FLASH_IN ) * ( 1 - clamp( ( since - FLASH_HOLD ) / FLASH_OUT ) )
        : 0
      const showAll = showAllLabels === 'auto' ? labels.length <= 8 : showAllLabels
      if ( state.settled ) opacity = Math.max( opacity, showAll ? 0.92 : 0, lifts[ label.body ] )
      const mesh = meshes[ label.body ]
      const body = recording.bodies[ label.body ]
      const top = body.kind === 'ball' ? body.radius * 1.6 : 0.16
      projected.set( mesh.position.x, mesh.position.y + top, mesh.position.z ).project( camera )
      label.x = ( projected.x * 0.5 + 0.5 ) * width
      label.y = ( -projected.y * 0.5 + 0.5 ) * height
      label.opacity = projected.z < 1 ? opacity : 0
      label.active = label.body === hovered || label.body === focused
    }
    onLabels( labels, state )
    if ( animating ) invalidate()
  }

  return {
    setScene,
    setProgress,
    resize,
    invalidate,
    // Hero > keyboard focus on project: lift + label like hover
    focusProject: ( projectIndex ) => {
      focused = projectIndex >= 0 ? projectIndex + 1 : -1
      invalidate()
    },
    setShowAllLabels: ( value ) => {
      showAllLabels = value === 'auto' ? 'auto' : Boolean( value )
      invalidate()
    },
    get settled() { return state.settled },
    dispose: () => {
      disposed = true
      cancelAnimationFrame( frameHandle )
      observer.disconnect()
      canvas.removeEventListener( 'pointermove', handlePointerMove )
      canvas.removeEventListener( 'pointerdown', handlePointerDown )
      canvas.removeEventListener( 'pointerup', handlePointerUp )
      canvas.removeEventListener( 'pointerleave', handlePointerLeave )
      if ( world ) disposeTree( world )
      environment.dispose()
      pmrem.dispose()
      renderer.dispose()
    },
  }
}
