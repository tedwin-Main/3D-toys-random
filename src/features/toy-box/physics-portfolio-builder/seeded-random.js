// Provides deterministic pseudorandom generator for reproducible break layouts.

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
