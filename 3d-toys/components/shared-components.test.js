/**
 * FILE: 3d-toys/components/shared-components.test.js
 * PURPOSE: lobby invite link contracts and game audio unlock / burst gating with stubbed Web Audio
 * UI: none
 * USED BY: npm test (3d-toys root)
 * KEY EXPORTS: none
 */

import test from 'node:test'
import assert from 'node:assert/strict'

const listeners = []
globalThis.addEventListener = (type, fn, opts) => listeners.push({ type, fn, opts })

const { buildInviteLinks } = await import('./room-lobby.js')
const { createGameAudio } = await import('./game-audio.js')

const param = () => ({ value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} })
const node = () => ({ connect: (next) => next, start() {}, stop() {}, frequency: param(), gain: param(), Q: param() })
class FakeAudioContext {
  constructor() { this.sampleRate = 100; this.currentTime = 0; this.destination = node(); this.made = [] }
  createBuffer(_ch, length) { return { length, getChannelData: () => new Float32Array(length) } }
  createOscillator() { const n = node(); this.made.push(['osc', n]); return n }
  createGain() { return node() }
  createBiquadFilter() { const n = node(); this.made.push(['filter', n]); return n }
  createBufferSource() { const n = node(); this.made.push(['src', n]); return n }
}
globalThis.AudioContext = FakeAudioContext

test('buildInviteLinks: local page adds Same Wi-Fi link', () => {
  const loc = { pathname: '/3d-toys/bomb-tag-arena/', protocol: 'http:', host: 'localhost:5055', hostname: 'localhost', port: '5055' }
  assert.deepEqual(buildInviteLinks(loc, { ip: '192.168.1.5', port: 5055 }, 'ABCD'), [
    ['This computer', 'http://localhost:5055/3d-toys/#bomb-tag-arena?room=ABCD'],
    ['Same Wi-Fi', 'http://192.168.1.5:5055/3d-toys/#bomb-tag-arena?room=ABCD'],
  ])
})

test('buildInviteLinks: public host gives single invite link', () => {
  const loc = { pathname: '/3d-toys/kart-race-online/', protocol: 'https:', host: 'toys.example', hostname: 'toys.example', port: '' }
  assert.deepEqual(buildInviteLinks(loc, { ip: '10.0.0.2', port: 5055 }, 'WXYZ'), [
    ['Invite link', 'https://toys.example/3d-toys/#kart-race-online?room=WXYZ'],
  ])
})

test('createGameAudio: silent until unlock, unlock is idempotent and runs onUnlock once', () => {
  listeners.length = 0
  let unlocks = 0
  const sfx = createGameAudio({ noiseSeconds: 2, onUnlock: (ctx, buf) => { unlocks++; assert.equal(buf.length, ctx.sampleRate * 2) } })
  assert.deepEqual(listeners.map((l) => [l.type, l.opts.once]), [['pointerdown', true], ['keydown', true]])
  sfx.tone(440, 220, 0.2, 0.1)
  assert.equal(sfx.ctx, null)
  const ctx = sfx.unlock()
  assert.equal(sfx.unlock(), ctx)
  assert.equal(unlocks, 1)
  sfx.tone(440, 220, 0.2, 0.1, 'square')
  assert.equal(ctx.made.at(-1)[1].type, 'square')
})

test('createGameAudio: noise uses default filter + Q, skips bursts under minNoiseVol', () => {
  const sfx = createGameAudio({ noiseFilter: 'bandpass', noiseQ: 2, minNoiseVol: 0.003 })
  const ctx = sfx.unlock()
  sfx.noise(0.2, 0.001, 800, 200)
  assert.equal(ctx.made.length, 0)
  sfx.noise(0.2, 0.1, 800, 200)
  const filter = ctx.made.find(([kind]) => kind === 'filter')[1]
  assert.equal(filter.type, 'bandpass')
  assert.equal(filter.Q.value, 2)
  sfx.noise(0.2, 0.1, 800, 200, 'highpass')
  assert.equal(ctx.made.filter(([kind]) => kind === 'filter').at(-1)[1].type, 'highpass')
})
