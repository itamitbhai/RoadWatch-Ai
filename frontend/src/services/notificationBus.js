// Minimal pub-sub so independent domain reducers (violations, complaints)
// can raise notifications without importing each other or React context —
// NotificationCenterContext is the single subscriber that builds the list.

const listeners = new Set();

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function publish(event) {
  listeners.forEach((fn) => fn(event));
}
