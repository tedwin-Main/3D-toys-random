// Computes camera choreography from striker perspective to settled scene.

// per-scene opening shot: elevation (rad), extra distance behind striker (m), fov (deg)
const OPENING = Object.freeze( {
  pool: { elevation: 0.17, back: 1.0, fov: 38 },
  marbles: { elevation: 0.42, back: 0.9, fov: 40 },
  dominoes: { elevation: 0.45, back: 0.7, fov: 42 },
} )
const OVERVIEW_ELEVATION = 1.02
// rails/walls past physics bounds that overview must also fit (m)
const OVERVIEW_MARGIN = Object.freeze( { pool: 0.2, marbles: 0.06, dominoes: 0 } )
// fraction of screen half-extent the scene may fill
const FIT = 0.9

const lerp = ( a, b, t ) => a + ( b - a ) * t
const wrapAngle = ( angle ) => Math.atan2( Math.sin( angle ), Math.cos( angle ) )

const framePosition = ( recording, frame, body ) => {
  const offset = ( frame * recording.bodyCount + body ) * 3
  return [ recording.positions[ offset ], recording.positions[ offset + 1 ], recording.positions[ offset + 2 ] ]
}

// Run engine: opening shot looks from behind striker at centroid of targets
export function startPose( recording ) {
  const opening = OPENING[ recording.preset ] || OPENING.pool
  const striker = framePosition( recording, 0, 0 )
  const centroid = [ 0, 0, 0 ]
  for ( let body = 1; body < recording.bodyCount; body += 1 ) {
    const position = framePosition( recording, 0, body )
    centroid[ 0 ] += position[ 0 ] / ( recording.bodyCount - 1 )
    centroid[ 2 ] += position[ 2 ] / ( recording.bodyCount - 1 )
  }
  const dx = striker[ 0 ] - centroid[ 0 ]
  const dz = striker[ 2 ] - centroid[ 2 ]
  return {
    target: [ centroid[ 0 ], 0.02, centroid[ 2 ] ],
    azimuth: Math.atan2( dx, dz ),
    elevation: opening.elevation,
    distance: Math.hypot( dx, dz ) + opening.back,
    fov: opening.fov,
  }
}

// Run engine: area overview must fit. Tables: whole surface. Dominoes: fallen tiles only (floor is endless).
const overviewArea = ( recording ) => {
  if ( recording.preset !== 'dominoes' ) return { centerX: 0, centerZ: 0, ...recording.bounds }
  const last = recording.frameCount - 1
  let minX = Infinity
  let maxX = -Infinity
  let minZ = Infinity
  let maxZ = -Infinity
  for ( let body = 1; body < recording.bodyCount; body += 1 ) {
    const [ x, , z ] = framePosition( recording, last, body )
    minX = Math.min( minX, x )
    maxX = Math.max( maxX, x )
    minZ = Math.min( minZ, z )
    maxZ = Math.max( maxZ, z )
  }
  const pad = 0.3
  return {
    centerX: ( minX + maxX ) / 2,
    centerZ: ( minZ + maxZ ) / 2,
    halfWidth: Math.max( 0.45, ( maxX - minX ) / 2 + pad ),
    halfLength: Math.max( 0.45, ( maxZ - minZ ) / 2 + pad ),
  }
}

// Run engine: overview frames area; long axis follows long screen axis
export function endPose( recording, aspect, startAzimuth = 0 ) {
  const { centerX, centerZ, halfWidth, halfLength } = overviewArea( recording )
  const wantZHorizontal = ( aspect >= 1 ) === ( halfLength > halfWidth )
  const candidates = wantZHorizontal ? [ Math.PI / 2, -Math.PI / 2 ] : [ 0, Math.PI ]
  const azimuth = candidates.reduce( ( best, angle ) =>
    Math.abs( wrapAngle( angle - startAzimuth ) ) < Math.abs( wrapAngle( best - startAzimuth ) ) ? angle : best )
  // portrait phones get wider lens so table is not a postage stamp
  const fov = aspect < 1 ? 48 : 36
  const margin = OVERVIEW_MARGIN[ recording.preset ] ?? 0
  const corners = []
  for ( const x of [ -1, 1 ] ) for ( const z of [ -1, 1 ] ) for ( const y of [ 0, 0.08 ] ) {
    corners.push( [ x * ( halfWidth + margin ), y, z * ( halfLength + margin ) ] )
  }
  const distance = fitDistance( corners, azimuth, OVERVIEW_ELEVATION, fov, aspect )
  return { target: [ centerX, 0, centerZ ], azimuth, elevation: OVERVIEW_ELEVATION, distance, fov }
}

// Run engine: smallest orbit distance where every corner projects inside FIT of screen (binary search)
export function fitDistance( points, azimuth, elevation, fov, aspect ) {
  const tanY = Math.tan( ( fov * Math.PI ) / 360 )
  const tanX = tanY * aspect
  const back = [ Math.sin( azimuth ) * Math.cos( elevation ), Math.sin( elevation ), Math.cos( azimuth ) * Math.cos( elevation ) ]
  const forward = back.map( ( value ) => -value )
  // right = forward x worldUp, up = right x forward
  const rightLength = Math.hypot( forward[ 2 ], forward[ 0 ] ) || 1
  const right = [ -forward[ 2 ] / rightLength, 0, forward[ 0 ] / rightLength ]
  const up = [
    right[ 1 ] * forward[ 2 ] - right[ 2 ] * forward[ 1 ],
    right[ 2 ] * forward[ 0 ] - right[ 0 ] * forward[ 2 ],
    right[ 0 ] * forward[ 1 ] - right[ 1 ] * forward[ 0 ],
  ]
  const fits = ( distance ) => points.every( ( point ) => {
    const v = point.map( ( value, axis ) => value - back[ axis ] * distance )
    const depth = v[ 0 ] * forward[ 0 ] + v[ 1 ] * forward[ 1 ] + v[ 2 ] * forward[ 2 ]
    if ( depth <= 0.05 ) return false
    const x = ( v[ 0 ] * right[ 0 ] + v[ 2 ] * right[ 2 ] ) / ( depth * tanX )
    const y = ( v[ 0 ] * up[ 0 ] + v[ 1 ] * up[ 1 ] + v[ 2 ] * up[ 2 ] ) / ( depth * tanY )
    return Math.abs( x ) <= FIT && Math.abs( y ) <= FIT
  } )
  let near = 0.1
  let far = 60
  for ( let step = 0; step < 40; step += 1 ) {
    const middle = ( near + far ) / 2
    if ( fits( middle ) ) far = middle
    else near = middle
  }
  return far
}

// Run engine: shortest-arc azimuth, log-space distance so zoom feels even
export function blendPose( from, to, amount ) {
  const t = Math.min( 1, Math.max( 0, amount ) )
  return {
    target: from.target.map( ( value, axis ) => lerp( value, to.target[ axis ], t ) ),
    azimuth: from.azimuth + wrapAngle( to.azimuth - from.azimuth ) * t,
    elevation: lerp( from.elevation, to.elevation, t ),
    distance: Math.exp( lerp( Math.log( from.distance ), Math.log( to.distance ), t ) ),
    fov: lerp( from.fov, to.fov, t ),
  }
}

// Run engine: orbit pose to world-space camera position
export function poseToCamera( pose ) {
  const { target, azimuth, elevation, distance } = pose
  return {
    position: [
      target[ 0 ] + distance * Math.sin( azimuth ) * Math.cos( elevation ),
      target[ 1 ] + distance * Math.sin( elevation ),
      target[ 2 ] + distance * Math.cos( azimuth ) * Math.cos( elevation ),
    ],
    target,
  }
}
