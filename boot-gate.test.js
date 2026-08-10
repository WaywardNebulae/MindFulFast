import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldShowBootOverlay, SESSION_KEY } from './boot-gate.js';

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
