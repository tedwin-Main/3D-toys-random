// Validates toy box feedback and shapes it into a GitHub issue.

export const CATEGORIES = { bug: 'Bug', idea: 'Idea', praise: 'Praise', other: 'Other' };
const CATEGORY_LABELS = { bug: 'bug', idea: 'enhancement', praise: 'praise' };
export const GENERAL_TOY = 'general';
const LIMITS = { message: 2000, name: 60, email: 120, device: 300 };
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Feedback > validate: { ok, data } or { ok:false, error }; honeypot hit marks spam
export function validateFeedback(body, toyDirs) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'bad request' };
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { ok: false, error: 'pick a rating' };
  if (!Object.hasOwn(CATEGORIES, body.category)) return { ok: false, error: 'pick a category' };
  if (body.toy !== GENERAL_TOY && !toyDirs.has(body.toy)) return { ok: false, error: 'pick a toy' };
  const message = text(body.message, LIMITS.message + 1);
  if (!message) return { ok: false, error: 'tell us more' };
  if (message.length > LIMITS.message) return { ok: false, error: `keep it under ${LIMITS.message} characters` };
  const email = text(body.email, LIMITS.email);
  if (email && !EMAIL_SHAPE.test(email)) return { ok: false, error: 'email looks off' };
  const device = body.device && typeof body.device === 'object' ? body.device : {};
  return {
    ok: true,
    spam: Boolean(text(body.website, 100)),
    data: {
      rating,
      category: body.category,
      toy: body.toy,
      message,
      name: text(body.name, LIMITS.name),
      email,
      device: Object.fromEntries(['ua', 'screen', 'viewport', 'touch', 'lang'].map((k) => [k, text(String(device[k] ?? ''), LIMITS.device)])),
    },
  };
}

// Feedback > escape: zero-width joiner after @ stops mentions; HTML tags neutered
function escapeMarkdown(s) {
  return s.replace(/@/g, '@‍').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
const escapeCell = (s) => escapeMarkdown(s).replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ');
const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
const quote = (s) => escapeMarkdown(s).split('\n').map((line) => `> ${line}`).join('\n');

// Feedback > issue: title, markdown body, labels
export function buildIssue(data, toyTitle) {
  const snippet = data.message.replace(/\s+/g, ' ').slice(0, 60);
  const title = `[Feedback] ${stars(data.rating)} ${toyTitle}: ${snippet}${data.message.length > 60 ? '…' : ''}`;
  const rows = [
    ['Rating', `${stars(data.rating)} (${data.rating}/5)`],
    ['Category', CATEGORIES[data.category]],
    ['Toy', toyTitle],
    ['Name', data.name || '_anonymous_'],
    ['Contact', data.email || '_none_'],
  ];
  const deviceRows = Object.entries(data.device).filter(([, v]) => v).map(([k, v]) => `| ${k} | ${escapeCell(v)} |`);
  const body = [
    '| Field | Value |',
    '| --- | --- |',
    ...rows.map(([k, v]) => `| ${k} | ${escapeCell(v)} |`),
    '',
    '### Tell us more',
    quote(data.message),
    '',
    '<details><summary>Device</summary>',
    '',
    '| Key | Value |',
    '| --- | --- |',
    ...deviceRows,
    '',
    '</details>',
    '',
    '_Sent from the 3D Toy Box feedback form._',
  ].join('\n');
  const labels = ['feedback', CATEGORY_LABELS[data.category]].filter(Boolean);
  // titles render plain text, no mentions; only body needs escaping
  return { title, body, labels };
}
