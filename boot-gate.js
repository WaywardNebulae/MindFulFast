export const SESSION_KEY = 'mindfulfast-session';

export function shouldShowBootOverlay({ hasSessionFlag, persisted }) {
  if (persisted) return false;
  if (hasSessionFlag) return false;
  return true;
}
