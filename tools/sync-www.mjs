import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_ENTRIES = [
  'index.html',
  'sw.js',
  'manifest.json',
  'fonts.css',
  'boot-gate.js',
  'meal-gate.js',
  'privacy.html',
  'fonts',
  'icons',
];

function copyEntry(srcRoot, destRoot, name) {
  const from = path.join(srcRoot, name);
  const to = path.join(destRoot, name);
  if (!fs.existsSync(from)) {
    throw new Error(`sync-www: missing ${name}`);
  }
  fs.cpSync(from, to, { recursive: true });
}

export async function syncWww({
  root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
  dest = path.join(
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
    'www'
  ),
  entries = DEFAULT_ENTRIES,
} = {}) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  for (const name of entries) {
    copyEntry(root, dest, name);
  }
  return dest;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  await syncWww();
  console.log('synced www/');
}
