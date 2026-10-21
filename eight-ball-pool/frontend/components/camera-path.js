/**
 * FILE: 3d-toys/eight-ball-pool/frontend/components/camera-path.js
 * PURPOSE: orbit camera math: fit table in view, smooth pose blend, pose to world position
 * UI: 8-Ball > table camera (overhead + cue cam)
 * USED BY: pool-table-scene.js
 * KEY EXPORTS: fitDistance, blendPose, poseToCamera
 */

// fraction of screen half-extent the table may fill
const FIT = 0.9

const lerp = ( a, b, t ) => a + ( b - a ) * t
const wrapAngle = ( angle ) => Math.atan2( Math.sin( angle ), Math.cos( angle ) )

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
