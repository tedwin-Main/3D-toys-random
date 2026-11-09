// Tracks held keyboard keys by typed letter so WASD-style hints work on any keyboard layout.

// id = 'Key' + letter when e.key is a Latin letter (AZERTY labeled A = KeyA), else physical e.code
// (arrows, Space, Shift, Cyrillic/IME/Option combos fall back to the physical key)
export const keyId = (e) => (/^[a-z]$/i.test(e.key ?? '') ? 'Key' + e.key.toUpperCase() : e.code);

const typing = (e) => /^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName ?? '');

// held map: keys.KeyA, keys.ArrowLeft, keys.Space ...; blur clears all so alt-tab can't stick a key
export function trackKeys(keys = {}, target = globalThis) {
  const heldAs = {}; // physical code > id given at keydown, so a modifier change can't strand the key
  target.addEventListener('keydown', (e) => {
    if (typing(e)) return;
    const id = keyId(e);
    heldAs[e.code] = id; keys[id] = true;
  });
  target.addEventListener('keyup', (e) => { keys[heldAs[e.code] ?? keyId(e)] = false; keys[keyId(e)] = false; });
  target.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
  return keys;
}
