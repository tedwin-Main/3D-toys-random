// Handles POST /3d-toys/feedback: rate limits, validates, files a GitHub issue.

import { GENERAL_TOY, buildIssue, validateFeedback } from './feedback-issue.js';

const MAX_BODY_BYTES = 8 * 1024;
const MINUTE = 60_000;
const WINDOWS = [
  { ms: 10 * MINUTE, max: 3 },
  { ms: 24 * 60 * MINUTE, max: 20 },
];

const sendJson = (res, status, obj) => res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' }).end(JSON.stringify(obj));

// Feedback > client ip: Render proxy puts real ip first in x-forwarded-for
const clientIp = (req) => String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown';

// Feedback > rate limit: per-ip timestamps, pruned past longest window
export function createRateLimiter(windows = WINDOWS, now = Date.now) {
  const hits = new Map();
  const longest = Math.max(...windows.map((w) => w.ms));
  return {
    allow(key) {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((h) => t - h < longest);
      const blocked = windows.some((w) => recent.filter((h) => t - h < w.ms).length >= w.max);
      if (!blocked) recent.push(t);
      recent.length ? hits.set(key, recent) : hits.delete(key);
      return !blocked;
    },
  };
}

// Feedback > body: JSON up to MAX_BODY_BYTES; throws 'too large' / 'bad json'
async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error('too large');
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new Error('bad json');
  }
}

// Feedback > GitHub: create issue; throws on non-2xx
async function createIssue({ fetch, token, repo, issue }) {
  const r = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'content-type': 'application/json',
      'user-agent': '3d-toys-feedback',
      'x-github-api-version': '2022-11-28',
    },
    body: JSON.stringify(issue),
  });
  if (!r.ok) throw new Error(`github ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

export function createFeedbackRoute({ token, repo, toys, fetch = globalThis.fetch, limiter = createRateLimiter() }) {
  const toyTitles = new Map(toys.map((t) => [t.dir, t.title]));
  const toyDirs = new Set(toyTitles.keys());
  return {
    async handle(req, res) {
      if (req.method !== 'POST') return res.writeHead(405, { allow: 'POST' }).end();
      if (!token) return sendJson(res, 503, { error: 'Feedback is offline right now.' });
      let body;
      try {
        body = await readJson(req);
      } catch (e) {
        return sendJson(res, e.message === 'too large' ? 413 : 400, { error: 'Bad request.' });
      }
      const result = validateFeedback(body, toyDirs);
      if (!result.ok) return sendJson(res, 400, { error: result.error });
      if (!limiter.allow(clientIp(req))) return sendJson(res, 429, { error: 'Slow down, try again later.' });
      // bots get fake success so they don't retry
      if (result.spam) return sendJson(res, 201, { ok: true });
      const toyTitle = result.data.toy === GENERAL_TOY ? 'General' : toyTitles.get(result.data.toy);
      try {
        await createIssue({ fetch, token, repo, issue: buildIssue(result.data, toyTitle) });
        sendJson(res, 201, { ok: true });
      } catch (e) {
        console.error('feedback:', e.message);
        sendJson(res, 502, { error: 'Could not send, try again later.' });
      }
    },
  };
}
