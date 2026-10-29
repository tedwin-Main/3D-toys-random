// Tests HUD hint text per phase, ball in hand, pointer type and camera.
import test from 'node:test'
import assert from 'node:assert/strict'
import { hintFor } from './play-hint.js'

const base = { phase: 'aim', ballInHand: null, finePointer: false, cameraMode: 'overhead' }

test( 'hintFor: bot + playback phases', () => {
  assert.equal( hintFor( { ...base, phase: 'bot' } ), 'Bot is lining up…' )
  assert.equal( hintFor( { ...base, phase: 'shooting' } ), 'Tap table to skip' )
  assert.equal( hintFor( { ...base, phase: 'replay' } ), 'Tap table to skip' )
} )

test( 'hintFor: no hint in menu or game over', () => {
  assert.equal( hintFor( { ...base, phase: 'menu' } ), '' )
  assert.equal( hintFor( { ...base, phase: 'over', ballInHand: 'anywhere' } ), '' )
} )

test( 'hintFor: aim hints by ball in hand, pointer, camera', () => {
  assert.equal( hintFor( { ...base, ballInHand: 'kitchen' } ), 'Ball in hand: drag the cue ball, then shoot' )
  assert.equal( hintFor( { ...base, finePointer: true } ), 'Move to aim · press, pull back, release · ← → fine aim' )
  assert.equal( hintFor( { ...base, finePointer: true, cameraMode: 'cue' } ), 'Tap or drag to aim · pull power bar down, release' )
  assert.equal( hintFor( base ), 'Tap or drag to aim · pull power bar down, release' )
} )
