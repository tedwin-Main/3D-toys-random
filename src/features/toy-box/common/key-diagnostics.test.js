// Tests key event log: ring size, private typing, saved report, layout probe, blocked storage.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createKeyLog, formatKeyLog, probeLayout, readKeyReport } from './key-diagnostics.js';

const memoryStore = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) }; };
const key = (code, key, tagName = 'BODY') => ({ code, key, target: { tagName } });

test('createKeyLog: keeps the newest events up to size', () => {
  const store = memoryStore();
  let t = 0;
  const log = createKeyLog({ toy: 'hex-drop-survival', size: 3, store, now: () => (t += 10) });
  for (const k of ['a', 'b', 'c', 'd']) log.record('down', key(`Key${k.toUpperCase()}`, k));
  const saved = JSON.parse(store.getItem('toybox-keylog'));
  assert.deepEqual(saved.events.map((e) => e[2]), ['KeyB', 'KeyC', 'KeyD']);
  assert.deepEqual(log.last, [40, 'down', 'KeyD', 'd', 'body']);
});

test('createKeyLog: typing keeps no code or key', () => {
  const log = createKeyLog({ store: memoryStore(), now: () => 5 });
  log.record('typing', key('KeyA', 'a', 'INPUT'));
  assert.deepEqual(log.last, [5, 'typing', '', '', 'input']);
});

test('readKeyReport: header with toy + layout, one line per event', () => {
  const store = memoryStore();
  const log = createKeyLog({ toy: 'hex-drop-survival', store, now: () => 812 });
  log.setLayout('w a s d');
  log.record('down', key('KeyA', 'a'));
  log.record('blur');
  const lines = readKeyReport(store).split('\n');
  assert.match(lines[0], /^toy: hex-drop-survival · layout: w a s d/);
  assert.equal(lines[1], '    812 down   KeyA "a"');
  assert.equal(lines[2], '    812 blur');
});

test('readKeyReport: empty when nothing saved or storage throws', () => {
  assert.equal(readKeyReport(memoryStore()), '');
  assert.equal(readKeyReport({ getItem() { throw new Error('blocked'); } }), '');
});

test('createKeyLog: blocked storage never throws', () => {
  const log = createKeyLog({ store: { setItem() { throw new Error('quota'); } } });
  assert.doesNotThrow(() => log.record('down', key('KeyD', 'd')));
  assert.equal(log.last[2], 'KeyD');
});

test('formatKeyLog: unknown layout and other focused tags', () => {
  const text = formatKeyLog({ toy: '', layout: '', events: [[3, 'up', 'KeyD', 'd', 'button']] });
  assert.match(text, /toy: \? · layout: unknown/);
  assert.match(text, /up {5}KeyD "d" @button$/);
});

test('probeLayout: W A S D letters, empty when unsupported or denied', async () => {
  const azerty = new Map([['KeyW', 'z'], ['KeyA', 'q'], ['KeyS', 's'], ['KeyD', 'd']]);
  assert.equal(await probeLayout({ getLayoutMap: async () => azerty }), 'z q s d');
  assert.equal(await probeLayout(undefined), '');
  assert.equal(await probeLayout({ getLayoutMap: async () => { throw new Error('SecurityError'); } }), '');
});
