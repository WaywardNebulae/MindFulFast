export const MEAL_GATE_MS = 3 * 3600000;

export function lastSubstantiveMealAt(meals, now = Date.now()) {
  let best = null;
  for (const m of meals || []) {
    if (!m || m.kind !== 'Meal') continue;
    if (typeof m.at !== 'number' || m.at > now) continue;
    if (best == null || m.at > best) best = m.at;
  }
  return best;
}

export function isMealGateClosed(meals, now = Date.now()) {
  const at = lastSubstantiveMealAt(meals, now);
  if (at == null) return false;
  return (now - at) < MEAL_GATE_MS;
}

export function mealAgoLabel(ms) {
  const mins = Math.max(1, Math.round(ms / 60000));
  if (mins < 60) return mins + (mins === 1 ? ' minute' : ' minutes');
  const h = Math.floor(mins / 60);
  if (h < 2) return 'about an hour';
  return 'about ' + h + ' hours';
}
