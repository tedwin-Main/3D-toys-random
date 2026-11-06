// Mounts the Toy Box feedback dialog: stars, category, toy picker, message, posts to /3d-toys/feedback.

const CATEGORIES = [['bug', '🐞 Bug'], ['idea', '💡 Idea'], ['praise', '🎉 Praise'], ['other', '💬 Other']];
const MAX_MESSAGE = 2000;
const TOAST_MS = 3000;

const STYLE = `
  #fb-dialog { width: min(480px, calc(100% - 32px)); max-height: calc(100% - 32px); padding: 0; border: 1px solid var(--line); border-radius: 18px; background: var(--card); color: var(--ink); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); }
  #fb-dialog::backdrop { background: rgba(5, 6, 10, 0.65); backdrop-filter: blur(4px); }
  #fb-dialog form { display: grid; gap: 16px; padding: 22px; }
  #fb-dialog h2 { margin: 0; font-size: 22px; letter-spacing: -0.02em; }
  #fb-dialog .close { position: absolute; top: 12px; right: 12px; border: 0; background: transparent; color: var(--muted); font-size: 20px; cursor: pointer; padding: 6px 10px; border-radius: 10px; }
  #fb-dialog .close:hover { background: rgba(255, 255, 255, 0.08); color: var(--ink); }
  #fb-dialog fieldset { border: 0; margin: 0; padding: 0; }
  #fb-dialog legend, #fb-dialog label > span { display: block; font-size: 13px; font-weight: 700; color: var(--muted); margin-bottom: 6px; }
  #fb-dialog .opt { font-weight: 500; opacity: 0.7; }
  .fb-stars { display: flex; flex-direction: row-reverse; justify-content: flex-end; gap: 2px; }
  .fb-stars input, .fb-chips input { position: absolute; opacity: 0; pointer-events: none; }
  .fb-stars label { font-size: 30px; line-height: 1; cursor: pointer; color: #3a4052; transition: color 0.12s, transform 0.12s; padding: 2px; }
  .fb-stars label:hover, .fb-stars label:hover ~ label, .fb-stars input:checked ~ label { color: var(--accent); }
  .fb-stars label:hover { transform: scale(1.12); }
  .fb-stars input:focus-visible + label, .fb-chips input:focus-visible + span { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 6px; }
  .fb-chips { display: flex; gap: 6px; flex-wrap: wrap; }
  .fb-chips label span { display: inline-block; border: 1px solid var(--line); padding: 6px 12px; border-radius: 999px; cursor: pointer; font-size: 13px; font-weight: 600; }
  .fb-chips input:checked + span { background: var(--accent); border-color: var(--accent); color: #1a1408; }
  #fb-dialog select, #fb-dialog textarea, #fb-dialog input[type=text], #fb-dialog input[type=email] { width: 100%; font: inherit; font-size: 14px; color: var(--ink); background: var(--bg); border: 1px solid var(--line); border-radius: 10px; padding: 9px 11px; }
  #fb-dialog select:focus, #fb-dialog textarea:focus, #fb-dialog input:focus { outline: none; border-color: var(--accent); }
  #fb-dialog textarea { min-height: 110px; resize: vertical; }
  #fb-dialog .count { display: block; text-align: right; font-size: 11px; color: var(--muted); margin-top: 4px; }
  #fb-dialog .row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  @media (max-width: 480px) { #fb-dialog .row { grid-template-columns: 1fr; } }
  #fb-dialog .hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
  #fb-dialog .note { margin: 0; font-size: 12px; color: var(--muted); }
  #fb-dialog .err { margin: 0; font-size: 13px; color: #ff7a7a; min-height: 1em; }
  #fb-dialog .send { border: 0; background: var(--accent); color: #1a1408; font-weight: 700; padding: 11px 16px; border-radius: 12px; cursor: pointer; font-size: 15px; }
  #fb-dialog .send:disabled { opacity: 0.55; cursor: progress; }
  #fb-toast { position: fixed; left: 50%; bottom: 24px; transform: translate(-50%, 140%); padding: 11px 18px; border-radius: 999px; background: var(--accent); color: #1a1408; font-weight: 700; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4); transition: transform 0.3s; z-index: 20; pointer-events: none; }
  #fb-toast.show { transform: translate(-50%, 0); }
`;

const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function toyOptions(toys) {
  const sorted = [...toys].sort((a, b) => a.title.localeCompare(b.title));
  return ['<option value="general">🌐 General / whole site</option>', ...sorted.map((t) => `<option value="${t.dir}">${t.emoji} ${escapeHtml(t.title)}</option>`)].join('');
}

// Feedback > dialog markup; stars reversed so CSS ~ sibling fills lower stars on hover
function dialogHtml(toys) {
  const stars = [5, 4, 3, 2, 1].map((n) => `<input type="radio" name="rating" id="fb-r${n}" value="${n}" required><label for="fb-r${n}" title="${n} star${n > 1 ? 's' : ''}">★</label>`).join('');
  const chips = CATEGORIES.map(([v, label], i) => `<label><input type="radio" name="category" value="${v}" ${i === 0 ? 'required' : ''}><span>${label}</span></label>`).join('');
  return `
    <form method="dialog" novalidate>
      <button type="button" class="close" aria-label="Close">✕</button>
      <h2>Send feedback</h2>
      <fieldset><legend>Rating</legend><div class="fb-stars">${stars}</div></fieldset>
      <fieldset><legend>Type</legend><div class="fb-chips">${chips}</div></fieldset>
      <label><span>Which toy?</span><select name="toy">${toyOptions(toys)}</select></label>
      <label><span>Tell us more</span><textarea name="message" maxlength="${MAX_MESSAGE}" placeholder="What happened, what you loved, what you'd add…" required></textarea><small class="count">0 / ${MAX_MESSAGE}</small></label>
      <div class="row">
        <label><span>Name <em class="opt">(optional)</em></span><input type="text" name="name" maxlength="60" autocomplete="nickname"></label>
        <label><span>Email <em class="opt">(optional)</em></span><input type="email" name="email" maxlength="120" autocomplete="email"></label>
      </div>
      <label class="hp" aria-hidden="true">Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
      <p class="note">Posted publicly as a GitHub issue, so don't share anything private.</p>
      <p class="err" role="alert"></p>
      <button type="submit" class="send">Send feedback</button>
    </form>`;
}

function deviceInfo() {
  return {
    ua: navigator.userAgent,
    screen: `${screen.width}x${screen.height}@${devicePixelRatio}`,
    viewport: `${innerWidth}x${innerHeight}`,
    touch: String(navigator.maxTouchPoints > 0),
    lang: navigator.language,
  };
}

// Feedback > client check: same rules as server, friendlier order
function firstProblem(f) {
  if (!f.get('rating')) return 'Pick a star rating.';
  if (!f.get('category')) return 'Pick a feedback type.';
  if (!String(f.get('message')).trim()) return 'Tell us a little more.';
  const email = String(f.get('email')).trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'That email looks off.';
  return '';
}

async function postFeedback(form) {
  const r = await fetch('feedback', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...Object.fromEntries(form), device: deviceInfo() }) });
  if (r.ok) return;
  const { error } = await r.json().catch(() => ({}));
  throw new Error(error || 'Could not send, try again later.');
}

function showToast(toast, text) {
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), TOAST_MS);
}

export function mountFeedback(button, toys) {
  document.head.insertAdjacentHTML('beforeend', `<style>${STYLE}</style>`);
  const dialog = document.createElement('dialog');
  dialog.id = 'fb-dialog';
  dialog.innerHTML = dialogHtml(toys);
  const toast = Object.assign(document.createElement('div'), { id: 'fb-toast', role: 'status' });
  document.body.append(dialog, toast);

  const form = dialog.querySelector('form');
  const err = dialog.querySelector('.err');
  const send = dialog.querySelector('.send');
  const count = dialog.querySelector('.count');
  const message = form.elements.message;

  button.addEventListener('click', () => dialog.showModal());
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  // click on backdrop closes
  dialog.addEventListener('click', (e) => e.target === dialog && dialog.close());
  message.addEventListener('input', () => (count.textContent = `${message.value.length} / ${MAX_MESSAGE}`));
  form.addEventListener('input', () => (err.textContent = ''));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    err.textContent = firstProblem(data);
    if (err.textContent) return;
    send.disabled = true;
    send.textContent = 'Sending…';
    try {
      await postFeedback(data);
      form.reset();
      count.textContent = `0 / ${MAX_MESSAGE}`;
      dialog.close();
      showToast(toast, 'Thanks! Feedback sent 🙏');
    } catch (e2) {
      err.textContent = e2.message;
    } finally {
      send.disabled = false;
      send.textContent = 'Send feedback';
    }
  });
}
