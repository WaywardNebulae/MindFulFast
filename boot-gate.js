export const SESSION_KEY = 'mindfulfast-session';

export function shouldShowBootOverlay({ hasSessionFlag, persisted }) {
  if (persisted) return false;
  if (hasSessionFlag) return false;
  return true;
}

export function readSessionFlag(storage) {
  try {
    const store = storage || globalThis.sessionStorage;
    return store.getItem(SESSION_KEY) === '1';
  } catch (e) {
    return false;
  }
}

export function writeSessionFlag(storage) {
  try {
    const store = storage || globalThis.sessionStorage;
    store.setItem(SESSION_KEY, '1');
  } catch (e) {}
}
