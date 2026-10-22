/**
 * FILE: 3d-toys/eight-ball-pool/backend/seeded-random.js
 * PURPOSE: deterministic random numbers for rack jitter, bot aim noise, texture grain
 * UI: none
 * USED BY: pool-game-physics.js, pool-shot-worker.js, pool-table-scene.js, ball-textures.js
 * KEY EXPORTS: createRandom
 */

// Run engine: mulberry32, same seed same sequence on every machine
export function createRandom( seed = 1 ) {
  let state = ( seed >>> 0 ) || 1
  const next = () => {
    state = ( state + 0x6d2b79f5 ) >>> 0
    let value = state
    value = Math.imul( value ^ ( value >>> 15 ), value | 1 )
    value ^= value + Math.imul( value ^ ( value >>> 7 ), value | 61 )
    return ( ( value ^ ( value >>> 14 ) ) >>> 0 ) / 4294967296
  }
  // Run engine: signed value in -1..1
  next.signed = () => next() * 2 - 1
  return next
}
