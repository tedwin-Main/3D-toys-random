// Finds one element under a root and checks its DOM class, so callers get typed nodes without casts.

/** Element matching selector as kind; throws when missing or a different element type. */
export function pick<T extends Element>(root: ParentNode, selector: string, kind: { new (): T }): T {
  const el = root.querySelector(selector);
  if (!(el instanceof kind)) throw new Error(`missing ${selector}`);
  return el;
}

/** Same as pick, but null when absent (optional controls). */
export function maybePick<T extends Element>(root: ParentNode, selector: string, kind: { new (): T }): T | null {
  const el = root.querySelector(selector);
  return el instanceof kind ? el : null;
}
