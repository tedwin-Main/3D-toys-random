// Tests turn re-seating after players join or leave a turn-based game.

import test from 'node:test'
import assert from 'node:assert/strict'
import { reseatTurn } from './turn-seats.js'

const [a, b, c, d] = ['a', 'b', 'c', 'd'].map((id) => ({ id }))

test('current player stays: turn follows them to new index', () => {
  assert.deepEqual(reseatTurn([a, b, c], 2, [b, c]), { turn: 1, left: false })
})

test('current player leaves: next seat plays', () => {
  assert.deepEqual(reseatTurn([a, b, c], 1, [a, c]), { turn: 1, left: true })
})

test('last seat leaves: wraps to first seat', () => {
  assert.deepEqual(reseatTurn([a, b, c], 2, [a, b]), { turn: 0, left: true })
})

test('seat before and current leave together: next seat still plays', () => {
  assert.deepEqual(reseatTurn([a, b, c, d], 2, [a, d]), { turn: 1, left: true })
})

test('next seat also left: skips to first one still seated', () => {
  assert.deepEqual(reseatTurn([a, b, c, d], 1, [a, d]), { turn: 1, left: true })
})

test('joiner appended: turn kept', () => {
  assert.deepEqual(reseatTurn([a, b], 1, [a, b, c]), { turn: 1, left: false })
})

test('everyone from before leaves: seat 0', () => {
  assert.deepEqual(reseatTurn([a, b], 0, [c]), { turn: 0, left: true })
})
