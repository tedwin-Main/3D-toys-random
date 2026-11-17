// Tests layout-proof key ids and held-key tracking.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keyId, trackKeys } from './key-state.ts';

const ev = (type, code, key, tagName = 'BODY') => ({ type, code, key, target: { tagName } });
// minimal window stand-in: dispatch(e) calls listeners for e.type
const fakeWindow = () => { const on = {}; return { addEventListener: (t, f) => (on[t] = f), dispatch: (e) => on[e.type](e) }; };

test('keyId: labeled letter wins on any layout', () => {
  assert.equal(keyId({ code: 'KeyA', key: 'a' }), 'KeyA'); // QWERTY
  assert.equal(keyId({ code: 'KeyQ', key: 'a' }), 'KeyA'); // AZERTY labeled A
  assert.equal(keyId({ code: 'KeyA', key: 'Q' }), 'KeyQ'); // AZERTY labeled Q, shift
  assert.equal(keyId({ code: '', key: 'd' }), 'KeyD'); // device with empty code
});

test('keyId: non-letters fall back to physical code', () => {
  assert.equal(keyId({ code: 'KeyA', key: 'ф' }), 'KeyA'); // Cyrillic
  assert.equal(keyId({ code: 'KeyD', key: 'Process' }), 'KeyD'); // IME composing
  assert.equal(keyId({ code: 'ArrowLeft', key: 'ArrowLeft' }), 'ArrowLeft');
  assert.equal(keyId({ code: 'Space', key: ' ' }), 'Space');
});

test('trackKeys: hold, release, blur, ignore typing', () => {
  const t = fakeWindow(), keys = trackKeys({}, t, null);
  t.dispatch(ev('keydown', 'KeyQ', 'a'));
  assert.equal(keys.KeyA, true);
  t.dispatch(ev('keyup', 'KeyQ', 'å')); // Option pressed mid-hold changes key text
  assert.equal(keys.KeyA, false, 'released by physical key');
  t.dispatch(ev('keydown', 'KeyW', 'w'));
  t.dispatch({ type: 'blur' });
  assert.equal(keys.KeyW, false);
  t.dispatch(ev('keydown', 'KeyD', 'd', 'INPUT'));
  assert.equal(keys.KeyD, undefined);
});

test('trackKeys: logs first press, release and blur; typing stays private; repeats skipped', () => {
  const t = fakeWindow(), seen = [];
  trackKeys({}, t, { record: (kind, e) => seen.push([kind, e?.code]) });
  t.dispatch(ev('keydown', 'KeyA', 'a'));
  t.dispatch({ ...ev('keydown', 'KeyA', 'a'), repeat: true });
  t.dispatch(ev('keyup', 'KeyA', 'a'));
  t.dispatch(ev('keydown', 'KeyD', 'd', 'INPUT'));
  t.dispatch(ev('keyup', 'KeyD', 'd', 'INPUT'));
  t.dispatch({ type: 'blur' });
  assert.deepEqual(seen, [['down', 'KeyA'], ['up', 'KeyA'], ['typing', 'KeyD'], ['blur', undefined]]);
});
