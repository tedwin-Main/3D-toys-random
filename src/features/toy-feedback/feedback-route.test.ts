// Tests feedback route: offline, validation, rate limit, GitHub call.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createFeedbackRoute, createRateLimiter } from './feedback-route.ts';

const TOYS = [{ dir: 'drift-kart-racing', title: 'Drift Kart GP' }];
const BODY = { rating: 5, category: 'praise', toy: 'drift-kart-racing', message: 'love it' };

function fakeReq(body, { method = 'POST', ip = '1.2.3.4' } = {}) {
  const req = Readable.from([Buffer.from(typeof body === 'string' ? body : JSON.stringify(body))]);
  return Object.assign(req, { method, headers: { 'x-forwarded-for': `${ip}, 10.0.0.1` }, socket: {} });
}
function fakeRes() {
  const res = { status: 0, body: '', writeHead: (s) => ((res.status = s), res), end: (b = '') => ((res.body = b), res) };
  return res;
}
function stubFetch(status = 201) {
  const calls = [];
  const fetch = async (url, init) => (calls.push({ url, init }), { ok: status < 300, status, text: async () => 'err' });
  return { fetch, calls };
}
async function post(route, body, opts = undefined) {
  const res = fakeRes();
  await route.handle(fakeReq(body, opts), res);
  return res;
}

test('503 when no token', async () => {
  const route = createFeedbackRoute({ token: '', repo: 'o/r', toys: TOYS });
  assert.equal((await post(route, BODY)).status, 503);
});

test('405 on GET, 400 on bad json or invalid body', async () => {
  const route = createFeedbackRoute({ token: 't', repo: 'o/r', toys: TOYS, fetch: stubFetch().fetch });
  assert.equal((await post(route, BODY, { method: 'GET' })).status, 405);
  assert.equal((await post(route, '{oops')).status, 400);
  assert.equal((await post(route, { ...BODY, rating: 9 })).status, 400);
});

test('413 on oversized body', async () => {
  const route = createFeedbackRoute({ token: 't', repo: 'o/r', toys: TOYS, fetch: stubFetch().fetch });
  assert.equal((await post(route, { ...BODY, message: 'x'.repeat(13000) })).status, 413);
});

test('files issue with token, labels, toy title', async () => {
  const { fetch, calls } = stubFetch();
  const route = createFeedbackRoute({ token: 'tok', repo: 'o/r', toys: TOYS, fetch });
  const res = await post(route, BODY);
  assert.equal(res.status, 201);
  assert.deepEqual(JSON.parse(res.body), { ok: true });
  assert.equal(calls[0].url, 'https://api.github.com/repos/o/r/issues');
  assert.equal(calls[0].init.headers.authorization, 'Bearer tok');
  const issue = JSON.parse(calls[0].init.body);
  assert.deepEqual(issue.labels, ['feedback', 'praise']);
  assert.match(issue.title, /Drift Kart GP/);
});

test('honeypot returns 201 without calling GitHub', async () => {
  const { fetch, calls } = stubFetch();
  const route = createFeedbackRoute({ token: 't', repo: 'o/r', toys: TOYS, fetch });
  assert.equal((await post(route, { ...BODY, website: 'x' })).status, 201);
  assert.equal(calls.length, 0);
});

test('502 when GitHub fails', async () => {
  const route = createFeedbackRoute({ token: 't', repo: 'o/r', toys: TOYS, fetch: stubFetch(401).fetch });
  const origError = console.error;
  console.error = () => {};
  try {
    assert.equal((await post(route, BODY)).status, 502);
  } finally {
    console.error = origError;
  }
});

test('429 after 3 posts from same ip; other ip still allowed', async () => {
  const route = createFeedbackRoute({ token: 't', repo: 'o/r', toys: TOYS, fetch: stubFetch().fetch });
  for (let i = 0; i < 3; i++) assert.equal((await post(route, BODY)).status, 201);
  assert.equal((await post(route, BODY)).status, 429);
  assert.equal((await post(route, BODY, { ip: '5.6.7.8' })).status, 201);
});

test('rate limiter frees slots after window', () => {
  let t = 0;
  const limiter = createRateLimiter([{ ms: 1000, max: 1 }], () => t);
  assert.equal(limiter.allow('a'), true);
  assert.equal(limiter.allow('a'), false);
  t = 1001;
  assert.equal(limiter.allow('a'), true);
});

test('key log rides in its own fenced section, trimmed, fence-proof', async () => {
  const { fetch, calls } = stubFetch();
  const route = createFeedbackRoute({ token: 't', repo: 'o/r', toys: TOYS, fetch });
  const keys = 'toy: drift-kart-racing · layout: w a s d\n    812 down   KeyA "a"\n```\n@octocat';
  assert.equal((await post(route, { ...BODY, device: { ua: 'UA', keys: keys + 'x'.repeat(3000) } })).status, 201);
  const { body } = JSON.parse(calls[0].init.body);
  const section = body.slice(body.indexOf('<summary>Recent game keys</summary>'));
  assert.match(section, /```text\ntoy: drift-kart-racing · layout: w a s d\n {4}812 down {3}KeyA "a"\n'''\n@octocat/);
  assert.equal((section.match(/```/g) ?? []).length, 2, 'one fence, opened and closed');
  assert.ok(section.length < 1800, 'keys capped');
  assert.doesNotMatch(body.slice(0, body.indexOf('Recent game keys')), /\| keys \|/, 'not in device table');
});

test('no key section when the player never played a game', async () => {
  const { fetch, calls } = stubFetch();
  const route = createFeedbackRoute({ token: 't', repo: 'o/r', toys: TOYS, fetch });
  await post(route, { ...BODY, device: { ua: 'UA', keys: '' } });
  assert.doesNotMatch(JSON.parse(calls[0].init.body).body, /Recent game keys/);
});
