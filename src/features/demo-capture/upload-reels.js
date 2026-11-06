// Uploads posting reels, covers and the daily post queue to Vercel Blob for Instagram to fetch.

import { put } from '@vercel/blob';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..', '..');
const OUT = join(ROOT, 'src', 'features', 'instagram-posts');
const startArg = process.argv.find((a) => a.startsWith('--start='));
const queueOnly = process.argv.includes('--queue-only');

function loadBlobToken() {
  try { process.loadEnvFile(join(ROOT, '.env')); } catch {}
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('BLOB_READ_WRITE_TOKEN missing: add it to .env');
}

const todayInSingapore = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);

async function uploadFile(localPath, blobPath, contentType, cacheControlMaxAge = 31536000) {
  const { url } = await put(blobPath, await readFile(localPath), { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType, cacheControlMaxAge });
  return url;
}

loadBlobToken();
const queue = JSON.parse(await readFile(join(OUT, 'post-queue.json'), 'utf8'));
const missingUrls = queue.entries.filter((e) => !e.videoUrl || !e.coverUrl).map((e) => e.name);
if (queueOnly && missingUrls.length) throw new Error(`--queue-only needs uploaded media; missing: ${missingUrls.join(', ')}`);
for (const entry of queueOnly ? [] : queue.entries) {
  entry.videoUrl = await uploadFile(join(OUT, entry.video), entry.video, 'video/mp4');
  entry.coverUrl = await uploadFile(join(OUT, entry.cover), entry.cover, 'image/jpeg');
  console.log(`uploaded day ${entry.day}: ${entry.name}`);
}
queue.startDate = startArg ? startArg.split('=')[1] : queue.startDate ?? todayInSingapore();
queue.timezone = 'Asia/Singapore';
await writeFile(join(OUT, 'post-queue.json'), `${JSON.stringify(queue, null, 2)}\n`);
const queueUrl = await uploadFile(join(OUT, 'post-queue.json'), 'post-queue.json', 'application/json', 60);
console.log(`queue: ${queueUrl}\nstart: ${queue.startDate}`);
