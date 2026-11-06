// Tests feedback validation and GitHub issue shaping.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildIssue, validateFeedback } from './feedback-issue.js';

const TOY_DIRS = new Set(['drift-kart-racing']);
const valid = (over = {}) => ({ rating: 4, category: 'bug', toy: 'drift-kart-racing', message: 'Kart clips through wall', ...over });

test('accepts valid feedback, trims text, keeps known device keys only', () => {
  const r = validateFeedback(valid({ message: '  hi  ', name: ' Ted ', device: { ua: 'UA', screen: '390x844@3', evil: 'x' } }), TOY_DIRS);
  assert.equal(r.ok, true);
  assert.equal(r.spam, false);
  assert.equal(r.data.message, 'hi');
  assert.equal(r.data.name, 'Ted');
  assert.deepEqual(Object.keys(r.data.device), ['ua', 'screen', 'viewport', 'touch', 'lang']);
});

test('accepts general toy', () => {
  assert.equal(validateFeedback(valid({ toy: 'general' }), TOY_DIRS).ok, true);
});

test('rejects bad rating, category, toy, message, email', () => {
  for (const over of [{ rating: 0 }, { rating: 6 }, { rating: 2.5 }, { category: 'rant' }, { toy: 'nope' }, { toy: 'constructor' }, { message: '   ' }, { message: 'x'.repeat(2001) }, { email: 'not-an-email' }]) {
    assert.equal(validateFeedback(valid(over), TOY_DIRS).ok, false, JSON.stringify(over).slice(0, 40));
  }
  assert.equal(validateFeedback(null, TOY_DIRS).ok, false);
});

test('flags honeypot as spam', () => {
  assert.equal(validateFeedback(valid({ website: 'http://spam' }), TOY_DIRS).spam, true);
});

test('builds title, labels, body table', () => {
  const { data } = validateFeedback(valid({ category: 'idea', email: 'a@b.co' }), TOY_DIRS);
  const issue = buildIssue(data, 'Drift Kart GP');
  assert.equal(issue.title, '[Feedback] ★★★★☆ Drift Kart GP: Kart clips through wall');
  assert.deepEqual(issue.labels, ['feedback', 'enhancement']);
  assert.match(issue.body, /\| Rating \| ★★★★☆ \(4\/5\) \|/);
  assert.match(issue.body, /\| Name \| _anonymous_ \|/);
  assert.match(issue.body, /> Kart clips through wall/);
});

test('other category gets feedback label only; long title truncated', () => {
  const { data } = validateFeedback(valid({ category: 'other', message: 'y'.repeat(100) }), TOY_DIRS);
  const issue = buildIssue(data, 'General');
  assert.deepEqual(issue.labels, ['feedback']);
  assert.ok(issue.title.endsWith('y'.repeat(60) + '…'));
});

test('escapes mentions, html, table pipes', () => {
  const { data } = validateFeedback(valid({ name: 'a|b @bob', message: '@octocat <script>x</script>' }), TOY_DIRS);
  const { body } = buildIssue(data, 'T');
  assert.doesNotMatch(body, /@octocat/);
  assert.doesNotMatch(body, /<script>/);
  assert.match(body, /\| Name \| a\\\|b @‍bob \|/);
});
