// Fast-forwards a multiplayer page's attract sim to mid-game for gallery hover previews and posters.

const params = new URLSearchParams(globalThis.location?.search ?? '');
const DEFAULT_SECONDS = 25;
const CHUNK_BUDGET_MS = 8;

// ?preview or ?preview=<s>: gallery hover / poster capture
export const IS_PREVIEW = params.has('preview');

// sim seconds to skip; ?preview=<s> overrides per game (toy-list "previewAt")
export function previewSeconds(fallback = DEFAULT_SECONDS) {
  const s = Number(params.get('preview'));
  return s > 0 ? s : fallback;
}

let warmStarted = false, ready = false;
export const isWarming = () => warmStarted && !ready;

// steps sim at 1/hz until isMid() or seconds cap; yields every chunk since a same-origin iframe shares the gallery's main thread
export function warmUp(hz, step, { isMid = () => false, seconds = previewSeconds() } = {}) {
  warmStarted = true;
  let left = Math.round(seconds * hz);
  const done = () => left <= 0 || isMid();
  return new Promise((resolve) => {
    const chunk = () => {
      const end = performance.now() + CHUNK_BUDGET_MS;
      while (!done() && performance.now() < end) { step(1 / hz); left--; }
      if (done()) resolve();
      else setTimeout(chunk, 0);
    };
    setTimeout(chunk, 0);
  });
}

// tells capture (globalThis flag) + gallery (postMessage) the frame is worth showing
export function markReady() {
  if (ready) return;
  ready = true;
  globalThis.__previewReady = true;
  if (globalThis.parent && parent !== window) parent.postMessage({ toyPreview: 'ready' }, location.origin);
}

// pages without a warm-up (no sim ticker) are ready as soon as they boot
export function readyUnlessWarming() {
  if (IS_PREVIEW) setTimeout(() => { if (!warmStarted) markReady(); }, 500);
}
