// Logs recent game key events for feedback reports and shows a live key overlay on ?keys, so players can show what the page received.

const STORE_KEY = 'toybox-keylog';
const LOG_SIZE = 30;
const LAYOUT_CODES = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];
const OVERLAY_KEYS = [['KeyW', 'W'], ['KeyA', 'A'], ['KeyS', 'S'], ['KeyD', 'D'], ['ArrowUp', '↑'], ['ArrowLeft', '←'], ['ArrowDown', '↓'], ['ArrowRight', '→'], ['Space', 'Space']];

// localStorage outlives the game frame and new tabs; any access may throw (private mode, blocked site data)
// tests pass in-memory stores with only the methods they need
function browserStore(): Partial<Pick<Storage, 'getItem' | 'setItem'>> | null {
  try { return typeof document === 'undefined' ? null : globalThis.localStorage; } catch { return null; }
}
const tagOf = (e) => (e?.target?.tagName ?? '').toLowerCase();

/**
 * Ring buffer of key events saved as { toy, layout, events: [[ms, kind, code, key, tag]] }.
 * kind: down | up | blur | typing (key went to a text field: no code or key kept, typed text stays private)
 */
export function createKeyLog({ toy = '', size = LOG_SIZE, store = browserStore(), now = () => performance.now() } = {}) {
  const saved = { toy, layout: '', events: [] };
  let last = null;
  const save = () => { try { store?.setItem(STORE_KEY, JSON.stringify(saved)); } catch { /* storage blocked: overlay still works */ } };
  return {
    get last() { return last; },
    record(kind, e = undefined) {
      const typing = kind === 'typing';
      last = [Math.round(now()), kind, typing ? '' : e?.code ?? '', typing ? '' : e?.key ?? '', tagOf(e)];
      saved.events.push(last);
      if (saved.events.length > size) saved.events.shift();
      save();
    },
    setLayout(layout) { saved.layout = layout; save(); },
  };
}

/** Resolves what the W A S D keys type on this keyboard ("w a s d", "z q s d"), '' when the browser can't tell. */
export async function probeLayout(keyboard: { getLayoutMap(): Promise<Map<string, string>> } | undefined = Reflect.get(globalThis.navigator ?? {}, 'keyboard')) {
  try {
    const map = await keyboard.getLayoutMap();
    return LAYOUT_CODES.map((code) => map.get(code) ?? '?').join(' ');
  } catch {
    return '';
  }
}

let pageLog = null;
/** One log per page, shared by every key tracker; null outside a browser. */
export function pageKeyLog() {
  if (typeof document === 'undefined') return null;
  if (!pageLog) {
    pageLog = createKeyLog({ toy: location.pathname.split('/').filter(Boolean).at(-1) ?? '' });
    probeLayout().then((layout) => layout && pageLog.setLayout(layout));
  }
  return pageLog;
}

const eventLine = ([ms, kind, code, key, tag]) => `${String(ms).padStart(7)} ${kind.padEnd(6)} ${code} ${key ? JSON.stringify(key) : ''}${tag && tag !== 'body' ? ` @${tag}` : ''}`.trimEnd();

/** Saved log as plain text for a feedback report: header line, then one event per line. */
export function formatKeyLog({ toy, layout, events }) {
  const head = `toy: ${toy || '?'} · layout: ${layout || 'unknown'} · ms since page load, kind, code, key`;
  return [head, ...events.map(eventLine)].join('\n');
}

/** Last saved log as text, '' when none (no game played, storage blocked). */
export function readKeyReport(store = browserStore()) {
  try {
    const saved = JSON.parse(store?.getItem(STORE_KEY) ?? 'null');
    return saved?.events?.length ? formatKeyLog(saved) : '';
  } catch {
    return '';
  }
}

const OVERLAY_CSS = `
.kd-wrap { position: fixed; left: 50%; bottom: 12px; transform: translateX(-50%); z-index: 90; pointer-events: none; padding: 8px 10px; border-radius: 12px; background: rgba(10, 12, 20, 0.78); color: #fff; font: 600 12px ui-monospace, Menlo, Consolas, monospace; display: grid; gap: 6px; justify-items: center; }
.kd-keys { display: flex; gap: 4px; }
.kd-keys b { min-width: 26px; padding: 4px 6px; border-radius: 6px; text-align: center; background: rgba(255, 255, 255, 0.12); }
.kd-keys b.on { background: #ffd23f; color: #1a1408; }
.kd-info { opacity: 0.85; white-space: nowrap; }
`;

/** ?keys in the page URL: live card of held keys, last key event and page focus, for players to screenshot. */
export function showKeyOverlayIfAsked(keys, log) {
  if (typeof document === 'undefined' || !/[?&]keys\b/.test(location.search)) return;
  const style = document.createElement('style');
  style.textContent = OVERLAY_CSS;
  const wrap = Object.assign(document.createElement('div'), { className: 'kd-wrap' });
  wrap.innerHTML = `<div class="kd-keys">${OVERLAY_KEYS.map(([code, label]) => `<b data-code="${code}">${label}</b>`).join('')}</div><div class="kd-info"></div>`;
  document.head.append(style);
  document.body.append(wrap);
  const chips = [...wrap.querySelectorAll('b')], info = wrap.querySelector('.kd-info');
  (function paint() {
    for (const chip of chips) chip.classList.toggle('on', !!keys[chip.dataset.code]);
    const focus = document.hasFocus() ? `page (${tagOf({ target: document.activeElement }) || 'none'})` : 'away';
    const last = log?.last ? `${log.last[1]} ${log.last[2]} ${log.last[3] ? JSON.stringify(log.last[3]) : ''}` : 'none yet';
    info.textContent = `last: ${last} · focus: ${focus}`;
    requestAnimationFrame(paint);
  })();
}
