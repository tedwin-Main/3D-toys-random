/**
 * FILE: src/features/toy-box/eight-ball-pool/pool-bot.test.js
 * PURPOSE: bot contracts: finds straight-in pot, chosen shot pots legal ball, places cue on ball in hand, breaks at rack
 * UI: none
 * USED BY: npm test
 * KEY EXPORTS: none
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { chooseShot, potCandidates } from './pool-bot.js'
import { HEAD_STRING_Z, TABLE, createRack, isPlacementValid, placeCueBall, simulateShot } from './pool-game-physics.js'
import { applyShot, createGame } from './pool-game-rules.js'
import { createRandom } from './seeded-random.js'

const layout = ( positions ) => createRack( 1 ).map( ( ball ) => {
  const spot = positions[ ball.id ]
  return spot ? { ...ball, x: spot.x, z: spot.z } : { ...ball, pocketed: true, pocketTime: 9, y: -1 }
} )

// bot's turn, groups set: bot has stripes
const botState = () => {
  const start = createGame( { mode: 'bot', difficulty: 'pro' } )
  return {
    ...start,
    phase: 'play',
    ballInHand: null,
    turn: 1,
    players: [ { ...start.players[ 0 ], group: 'solids' }, { ...start.players[ 1 ], group: 'stripes' } ],
    potted: [ 1, 2, 3, 4, 5, 6, 9, 10, 11, 13, 14, 15 ],
  }
}

test( 'candidates: straight-in ball to corner ranks first', () => {
  const pocket = TABLE.pockets[ 1 ]
  const balls = layout( { 0: { x: pocket.x - 0.55, z: pocket.z + 0.55 }, 12: { x: pocket.x - 0.25, z: pocket.z + 0.25 }, 7: { x: -0.4, z: 0.6 } } )
  const [ best ] = potCandidates( balls, [ 12 ] )
  assert.equal( best.targetId, 12 )
  assert.equal( best.pocketIndex, 1 )
  assert.ok( best.cut < 0.05 )
} )

test( 'pro bot pots its ball (planned shot, no noise) and keeps turn', () => {
  const pocket = TABLE.pockets[ 1 ]
  const balls = layout( { 0: { x: pocket.x - 0.6, z: pocket.z + 0.5 }, 12: { x: pocket.x - 0.3, z: pocket.z + 0.3 }, 7: { x: -0.4, z: 0.6 }, 8: { x: -0.3, z: -0.2 } } )
  const state = botState()
  const shot = chooseShot( { balls, state, difficulty: 'pro', random: createRandom( 5 ) } )
  const result = simulateShot( balls, shot.planned )
  assert.ok( result.pocketed.includes( 12 ), `pocketed ${ result.pocketed }` )
  const { state: next } = applyShot( state, result )
  assert.equal( next.turn, 1 )
} )

test( 'ball in hand: bot places cue on legal spot', () => {
  const balls = layout( { 0: { x: 0, z: 0.8 }, 12: { x: 0.2, z: -0.6 }, 7: { x: -0.4, z: 0.6 }, 8: { x: -0.3, z: -0.2 } } )
  const shot = chooseShot( { balls, state: { ...botState(), ballInHand: 'anywhere' }, random: createRandom( 2 ) } )
  assert.ok( shot.cuePosition )
  assert.ok( isPlacementValid( shot.cuePosition, balls ) )
  const result = simulateShot( placeCueBall( balls, shot.cuePosition ), shot.planned )
  assert.equal( result.firstContact, 12, 'hits own ball first' )
} )

test( 'break: bot breaks from kitchen at full power into rack', () => {
  const start = { ...createGame( { mode: 'bot' } ), turn: 1 }
  const shot = chooseShot( { balls: createRack( 3 ), state: start, random: createRandom( 9 ) } )
  assert.ok( shot.cuePosition.z >= HEAD_STRING_Z )
  assert.equal( shot.power, 1 )
  const result = simulateShot( placeCueBall( createRack( 3 ), shot.cuePosition ), shot )
  assert.ok( result.firstContact !== null )
} )
