// Turns a .ts file into browser JavaScript by stripping types, cached by mtime (no bundler).
import fs from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';

const noEntries = (): [string, { mtimeMs: number; js: Buffer }][] => [];
const cache = new Map(noEntries());

/** Browser JS bytes for a .ts file; relative `.ts` imports keep working since the server strips those too. */
export function typescriptAsJs(file: string) {
  const { mtimeMs } = fs.statSync(file);
  const hit = cache.get(file);
  if (hit && hit.mtimeMs === mtimeMs) return hit.js;
  const js = Buffer.from(stripTypeScriptTypes(fs.readFileSync(file, 'utf8')));
  cache.set(file, { mtimeMs, js });
  return js;
}
