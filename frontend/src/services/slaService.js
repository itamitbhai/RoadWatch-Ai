export const SLA_HOURS = { CRITICAL: 24, HIGH: 48, MEDIUM: 120, LOW: 240 };

export function computeSlaDeadline(priority, fromTs = Date.now()) {
  const hours = SLA_HOURS[priority] ?? SLA_HOURS.MEDIUM;
  return fromTs + hours * 3600 * 1000;
}

export function slaState(deadline, status) {
  if (status === 'Resolved' || status === 'Rejected') return 'Completed';
  const remaining = deadline - Date.now();
  if (remaining < 0) return 'Overdue';
  if (remaining < 6 * 3600 * 1000) return 'Due Soon';
  return 'On Time';
}

export const ESCALATION_CHAIN = ['Department Officer', 'Supervisor', 'Administrator'];

export function nextEscalationLevel(currentLevel = 0) {
  return Math.min(currentLevel + 1, ESCALATION_CHAIN.length - 1);
}
