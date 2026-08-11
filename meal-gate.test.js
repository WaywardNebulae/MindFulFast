// meal-gate.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MEAL_GATE_MS,
  lastSubstantiveMealAt,
  isMealGateClosed,
  mealAgoLabel
} from './meal-gate.js';

test('MEAL_GATE_MS is 3 hours', () => {
  assert.equal(MEAL_GATE_MS, 3 * 3600000);
});

test('lastSubstantiveMealAt ignores Snack and Drink', () => {
  const now = 1_700_000_000_000;
  const meals = [
    { at: now - 3600000, kind: 'Snack' },
    { at: now - 7200000, kind: 'Meal' },
    { at: now - 1800000, kind: 'Drink' }
  ];
  assert.equal(lastSubstantiveMealAt(meals, now), now - 7200000);
});

test('lastSubstantiveMealAt returns null when no Meal', () => {
  assert.equal(lastSubstantiveMealAt([{ at: 1, kind: 'Snack' }], 10), null);
});

test('isMealGateClosed true inside 3h of Meal', () => {
  const now = 1_700_000_000_000;
  assert.equal(isMealGateClosed([{ at: now - 2.5 * 3600000, kind: 'Meal' }], now), true);
});

test('isMealGateClosed false after 3h', () => {
  const now = 1_700_000_000_000;
  assert.equal(isMealGateClosed([{ at: now - 3.1 * 3600000, kind: 'Meal' }], now), false);
});

test('isMealGateClosed false when only Snack recent', () => {
  const now = 1_700_000_000_000;
  assert.equal(isMealGateClosed([{ at: now - 600000, kind: 'Snack' }], now), false);
});

test('mealAgoLabel formats hours', () => {
  assert.match(mealAgoLabel(2.5 * 3600000), /2/);
});
