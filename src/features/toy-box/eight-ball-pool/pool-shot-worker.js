/**
 * FILE: src/features/toy-box/eight-ball-pool/pool-shot-worker.js
 * PURPOSE: off-main-thread shot sim + bot thinking, so long shots never freeze table
 * UI: Play > shot, Play > vs Bot (bot turn)
 * USED BY: pool-shot-client.js
 * KEY EXPORTS: none (worker message protocol)
 */

import { simulateShot } from './pool-game-physics.js'
import { chooseShot } from './pool-bot.js'
import { createRandom } from './seeded-random.js'

// Run engine: { id, type: 'simulate' | 'bot' } in, { id, result | shot | error } out
self.onmessage = ( { data } ) => {
  const { id, type } = data
  try {
    if ( type === 'simulate' ) {
      const result = simulateShot( data.balls, data.shot )
      // frames buffer moves, not copies
      self.postMessage( { id, result }, [ result.frames.buffer ] )
      return
    }
    if ( type === 'bot' ) {
      const shot = chooseShot( { balls: data.balls, state: data.state, difficulty: data.difficulty, random: createRandom( data.seed ) } )
      self.postMessage( { id, shot } )
      return
    }
    throw new Error( `Unknown request ${ type }` )
  } catch ( error ) {
    self.postMessage( { id, error: error.message } )
  }
}
