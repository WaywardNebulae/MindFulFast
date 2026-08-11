import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncWww, DEFAULT_ENTRIES } from './sync-www.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');

test('DEFAULT_ENTRIES includes the runnable app surface', () => {
  for (const name of [
    'index.html',
    'sw.js',
    'manifest.json',
    'fonts.css',
    'boot-gate.js',
    'meal-gate.js',
    'privacy.html',
    'fonts',
    'icons',
  ]) {
    assert.ok(DEFAULT_ENTRIES.includes(name), `missing ${name}`);
  }
});

test('syncWww copies allowlisted files and skips android/node_modules', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-www-'));
  const src = path.join(tmp, 'src');
  const dest = path.join(tmp, 'www');
  fs.mkdirSync(src);
  fs.writeFileSync(path.join(src, 'index.html'), '<html></html>');
  fs.writeFileSync(path.join(src, 'sw.js'), '// sw');
  fs.mkdirSync(path.join(src, 'fonts'));
  fs.writeFileSync(path.join(src, 'fonts', 'x.woff2'), 'x');
  fs.mkdirSync(path.join(src, 'node_modules'));
  fs.writeFileSync(path.join(src, 'node_modules', 'nope.js'), 'no');
  fs.mkdirSync(path.join(src, 'android'));
  fs.writeFileSync(path.join(src, 'android', 'nope'), 'no');

  await syncWww({
    root: src,
    dest,
    entries: ['index.html', 'sw.js', 'fonts'],
  });

  assert.equal(fs.readFileSync(path.join(dest, 'index.html'), 'utf8'), '<html></html>');
  assert.ok(fs.existsSync(path.join(dest, 'fonts', 'x.woff2')));
  assert.equal(fs.existsSync(path.join(dest, 'node_modules')), false);
  assert.equal(fs.existsSync(path.join(dest, 'android')), false);
});

test('repo still has required source entries', () => {
  for (const name of DEFAULT_ENTRIES) {
    assert.ok(fs.existsSync(path.join(repoRoot, name)), `missing source ${name}`);
  }
});
