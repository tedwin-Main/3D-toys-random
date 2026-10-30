// Tests 8-ball game rule contracts: fouls, scratches, ball assignment, and win/loss.

import test from 'node:test'
import assert from 'node:assert/strict'
import { applyShot, createGame, legalTargets, SOLIDS, STRIPES } from './pool-game-rules.js'

const afterBreak = () => applyShot( createGame( { mode: 'bot' } ), { firstContact: 1, pocketed: [] } ).state
const withGroups = ( overrides = {} ) => {
  const state = afterBreak()
  return {
    ...state,
    turn: 0,
    players: [ { ...state.players[ 0 ], group: 'solids' }, { ...state.players[ 1 ], group: 'stripes' } ],
    ...overrides,
  }
}

test( 'break: dry break passes turn, 8 on break is respotted not a loss', () => {
  const start = createGame( { mode: 'bot' } )
  assert.equal( start.ballInHand, 'kitchen' )
  const dry = applyShot( start, { firstContact: 1, pocketed: [] } ).state
  assert.equal( dry.turn, 1 )
  assert.equal( dry.phase, 'play' )
  const eight = applyShot( start, { firstContact: 1, pocketed: [ 8, 3 ] } )
  assert.ok( eight.events.some( ( event ) => event.type === 'respot' && event.id === 8 ) )
  assert.ok( !eight.state.potted.includes( 8 ) )
  assert.equal( eight.state.phase, 'play' )
  assert.equal( eight.state.turn, 0, 'potted 3 too, so breaker continues' )
  assert.equal( eight.state.players[ 0 ].group, null, 'table stays open after break' )
} )

test( 'fouls: scratch, no contact, wrong ball first all give opponent ball in hand', () => {
  const state = withGroups()
  for ( const [ result, reason ] of [
    [ { firstContact: 2, pocketed: [ 0 ] }, 'scratch' ],
    [ { firstContact: null, pocketed: [] }, 'no-contact' ],
    [ { firstContact: 12, pocketed: [ 2 ] }, 'wrong-ball' ],
  ] ) {
    const { state: next, events } = applyShot( state, result )
    assert.ok( events.some( ( event ) => event.type === 'foul' && event.reason === reason ), reason )
    assert.equal( next.turn, 1 )
    assert.equal( next.ballInHand, 'anywhere' )
  }
} )

test( 'open table: first legal pot sets groups and keeps turn', () => {
  const { state, events } = applyShot( afterBreak(), { firstContact: 11, pocketed: [ 11 ] } )
  // after dry break it is bot's turn (index 1)
  assert.equal( state.players[ 1 ].group, 'stripes' )
  assert.equal( state.players[ 0 ].group, 'solids' )
  assert.equal( state.turn, 1 )
  assert.ok( events.some( ( event ) => event.type === 'groups' ) )
  assert.ok( !legalTargets( afterBreak() ).includes( 8 ), '8 not legal on open table' )
} )

test( 'groups set: own pot continues, opponent ball only passes turn', () => {
  assert.equal( applyShot( withGroups(), { firstContact: 2, pocketed: [ 2 ] } ).state.turn, 0 )
  assert.equal( applyShot( withGroups(), { firstContact: 2, pocketed: [ 10 ] } ).state.turn, 1 )
} )

test( '8-ball: legal after clearing group wins, early or with scratch loses', () => {
  const cleared = withGroups( { potted: [ ...SOLIDS ] } )
  assert.deepEqual( legalTargets( cleared ), [ 8 ] )
  const win = applyShot( cleared, { firstContact: 8, pocketed: [ 8 ] } ).state
  assert.equal( win.phase, 'over' )
  assert.equal( win.winner, 0 )
  const scratch = applyShot( cleared, { firstContact: 8, pocketed: [ 8, 0 ] } ).state
  assert.equal( scratch.winner, 1 )
  const early = applyShot( withGroups( { potted: [ 1, 2 ] } ), { firstContact: 3, pocketed: [ 8 ] } ).state
  assert.equal( early.winner, 1 )
  const over = applyShot( win, { firstContact: 1, pocketed: [] } )
  assert.equal( over.state, win, 'finished game ignores shots' )
} )

test( 'practice: scratch is only foul, clearing table ends game', () => {
  const start = createGame()
  assert.equal( start.players.length, 1 )
  const scratch = applyShot( { ...start, phase: 'play' }, { firstContact: null, pocketed: [ 0 ] } ).state
  assert.equal( scratch.ballInHand, 'anywhere' )
  const almost = { ...start, phase: 'play', potted: [ ...SOLIDS, ...STRIPES ], shots: 20 }
  const done = applyShot( almost, { firstContact: 8, pocketed: [ 8 ] } ).state
  assert.equal( done.phase, 'over' )
  assert.match( done.message, /Cleared in 21 shots/ )
} )
