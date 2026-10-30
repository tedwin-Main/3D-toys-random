// Encodes, decodes, and interpolates compressed physics animation recordings.

export const RECORDING_VERSION = 1

const clamp = ( value, min = 0, max = 1 ) => Math.min( max, Math.max( min, value ) )
const smoothstep = ( value ) => value * value * ( 3 - 2 * value )

// Run engine: raw sim output plus scene description = one recording
export function createRecording( { preset, seed, bodies, bounds, simulation } ) {
  return {
    version: RECORDING_VERSION,
    preset,
    seed,
    bodies,
    bounds,
    fps: simulation.fps,
    bodyCount: simulation.bodyCount,
    frameCount: simulation.frameCount,
    impactTime: simulation.impactTime,
    settleTime: simulation.settleTime,
    firstHit: simulation.firstHit,
    positions: simulation.positions,
    quaternions: simulation.quaternions,
  }
}

const toBase64 = ( bytes ) => {
  if ( globalThis.Buffer ) return globalThis.Buffer.from( bytes.buffer, bytes.byteOffset, bytes.byteLength ).toString( 'base64' )
  let binary = ''
  // chunked: fromCharCode.apply overflows stack on big arrays
  for ( let index = 0; index < bytes.length; index += 0x8000 ) {
    binary += String.fromCharCode.apply( null, bytes.subarray( index, index + 0x8000 ) )
  }
  return btoa( binary )
}

const fromBase64 = ( text ) => {
  if ( globalThis.Buffer ) {
    const buffer = globalThis.Buffer.from( text, 'base64' )
    // copy so Int16Array view gets aligned offset
    return new Uint8Array( buffer.buffer.slice( buffer.byteOffset, buffer.byteOffset + buffer.byteLength ) )
  }
  const binary = atob( text )
  const bytes = new Uint8Array( binary.length )
  for ( let index = 0; index < binary.length; index += 1 ) bytes[ index ] = binary.charCodeAt( index )
  return bytes
}

const MAX_INT16 = 32767

// Cloud Sync: recording to JSON-safe object, Int16 quantized (halves size, sub-mm error)
export function encodeRecording( recording ) {
  const { positions, quaternions, ...rest } = recording
  let maxAbs = 1e-6
  for ( const value of positions ) maxAbs = Math.max( maxAbs, Math.abs( value ) )
  const positionScale = MAX_INT16 / maxAbs
  const packedPositions = Int16Array.from( positions, ( value ) => Math.round( value * positionScale ) )
  const packedQuaternions = Int16Array.from( quaternions, ( value ) => Math.round( clamp( value, -1, 1 ) * MAX_INT16 ) )
  return {
    ...rest,
    positionScale,
    positions: toBase64( new Uint8Array( packedPositions.buffer ) ),
    quaternions: toBase64( new Uint8Array( packedQuaternions.buffer ) ),
  }
}

// Cloud Sync: JSON object back to Float32 recording
export function decodeRecording( encoded ) {
  if ( encoded.version !== RECORDING_VERSION ) throw new Error( `Unsupported recording version ${ encoded.version }` )
  const { positionScale, positions, quaternions, ...rest } = encoded
  const packedPositions = new Int16Array( fromBase64( positions ).buffer )
  const packedQuaternions = new Int16Array( fromBase64( quaternions ).buffer )
  return {
    ...rest,
    positions: Float32Array.from( packedPositions, ( value ) => value / positionScale ),
    quaternions: Float32Array.from( packedQuaternions, ( value ) => value / MAX_INT16 ),
  }
}

export const createSample = ( recording ) => ( {
  positions: new Float32Array( recording.bodyCount * 3 ),
  quaternions: new Float32Array( recording.bodyCount * 4 ),
} )

// Run engine: body state at sim time, lerp positions, nlerp quaternions (60 fps frames, close enough to slerp)
export function sampleRecording( recording, time, out = createSample( recording ) ) {
  const lastFrame = recording.frameCount - 1
  const exact = clamp( time * recording.fps, 0, lastFrame )
  const firstFrame = Math.floor( exact )
  const secondFrame = Math.min( lastFrame, firstFrame + 1 )
  const amount = exact - firstFrame
  const { positions, quaternions, bodyCount } = recording

  for ( let body = 0; body < bodyCount; body += 1 ) {
    const a3 = ( firstFrame * bodyCount + body ) * 3
    const b3 = ( secondFrame * bodyCount + body ) * 3
    for ( let axis = 0; axis < 3; axis += 1 ) {
      out.positions[ body * 3 + axis ] = positions[ a3 + axis ] + ( positions[ b3 + axis ] - positions[ a3 + axis ] ) * amount
    }
    const a4 = ( firstFrame * bodyCount + body ) * 4
    const b4 = ( secondFrame * bodyCount + body ) * 4
    let dot = 0
    for ( let axis = 0; axis < 4; axis += 1 ) dot += quaternions[ a4 + axis ] * quaternions[ b4 + axis ]
    // shortest arc: flip second when hemispheres differ
    const sign = dot < 0 ? -1 : 1
    let length = 0
    for ( let axis = 0; axis < 4; axis += 1 ) {
      const value = quaternions[ a4 + axis ] + ( sign * quaternions[ b4 + axis ] - quaternions[ a4 + axis ] ) * amount
      out.quaternions[ body * 4 + axis ] = value
      length += value * value
    }
    length = Math.sqrt( length ) || 1
    for ( let axis = 0; axis < 4; axis += 1 ) out.quaternions[ body * 4 + axis ] /= length
  }
  return out
}

// Scroll choreography shares: roll in, scatter, then hold settled table as nav
export const TIMELINE = Object.freeze( {
  approachShare: 0.2,
  settleShare: 0.8,
} )

// striker gathers speed like heavy push, then constant into impact (8Ball easeRollMomentum)
const ROLL_RAMP = 0.35
const easeRollMomentum = ( progress ) => {
  const t = clamp( progress )
  if ( t < ROLL_RAMP ) return t * t / ( ROLL_RAMP * ( 2 - ROLL_RAMP ) )
  return ( 2 * t - ROLL_RAMP ) / ( 2 - ROLL_RAMP )
}

// Viewer > Hero: scroll progress 0..1 to sim time, camera blend, and nav state
export function timelineState( recording, progress ) {
  const p = clamp( progress )
  const { approachShare, settleShare } = TIMELINE
  const impact = recording.impactTime
  const span = Math.max( 0, recording.settleTime - impact )
  let time
  if ( p <= approachShare ) time = easeRollMomentum( p / approachShare ) * impact
  else {
    const u = clamp( ( p - approachShare ) / ( settleShare - approachShare ) )
    // slow-mo through impact chaos, faster through long settle; never zero speed
    time = impact + span * ( 0.35 * u + 0.65 * u * u )
  }
  const cameraStart = approachShare * 0.6
  return {
    time,
    cameraBlend: smoothstep( clamp( ( p - cameraStart ) / ( settleShare - cameraStart ) ) ),
    settled: p >= settleShare - 0.005,
  }
}
