// Thin localStorage wrapper standing in for a backend database in this
// frontend-only demo. Every domain reducer loads its initial state from
// here and persists on every change, so records survive a page refresh.

const PREFIX = 'usai.';

export function loadState(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveState(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable (private browsing) — demo continues in-memory only.
  }
}

export function clearState(key) {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}
