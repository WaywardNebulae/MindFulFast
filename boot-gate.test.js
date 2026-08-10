import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldShowBootOverlay,
  SESSION_KEY,
  readSessionFlag,
  writeSessionFlag
} from './boot-gate.js';

test('SESSION_KEY is mindfulfast-session', () => {
  assert.equal(SESSION_KEY, 'mindfulfast-session');
});

test('shows when no session flag and not bfcache', () => {
  assert.equal(shouldShowBootOverlay({ hasSessionFlag: false, persisted: false }), true);
});

test('skips when session flag set', () => {
  assert.equal(shouldShowBootOverlay({ hasSessionFlag: true, persisted: false }), false);
});

test('skips bfcache restore even without flag', () => {
  assert.equal(shouldShowBootOverlay({ hasSessionFlag: false, persisted: true }), false);
});

test('readSessionFlag reflects storage', () => {
  const mem = new Map();
  const storage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => { mem.set(k, String(v)); }
  };
  assert.equal(readSessionFlag(storage), false);
  writeSessionFlag(storage);
  assert.equal(readSessionFlag(storage), true);
  assert.equal(mem.get(SESSION_KEY), '1');
});

test('readSessionFlag is false when storage throws', () => {
  const storage = {
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('blocked'); }
  };
  assert.equal(readSessionFlag(storage), false);
  writeSessionFlag(storage); // must not throw
});
