// DEMO MODE — mock SMS/Email/in-app notification delivery.
// In production, `send()` would call a real gateway (Twilio/MSG91 for SMS,
// SendGrid/AWS SES/Gmail SMTP for email) via server-side env-configured
// credentials. Here it simulates realistic Pending -> Processing ->
// Sent -> Delivered (or Failed) transitions and publishes each stage on
// notificationBus so the Notification Center stays live.
import { publish } from './notificationBus';

let counter = 1;
function nextId() {
  return `NTF-${String(counter++).padStart(6, '0')}`;
}

const FAIL_RATE = 0.08;

function simulate(initial) {
  let record = initial;
  publish({ type: 'create', notification: record });

  const advance = (status, delay) => {
    setTimeout(() => {
      const failed = status === 'Sent' && Math.random() < FAIL_RATE;
      record = {
        ...record,
        status: failed ? 'Failed' : status,
        attempts: record.attempts + 1,
        updatedAt: Date.now(),
        error: failed ? 'Delivery gateway timeout (simulated demo failure)' : undefined,
      };
      publish({ type: 'update', notification: record });
      if (!failed) {
        if (status === 'Processing') advance('Sent', 900);
        else if (status === 'Sent') advance('Delivered', 1100);
      }
    }, delay);
  };

  advance('Processing', 500);
  return record;
}

function send({ channel, to, subject, message, refType, refId, type, attachmentLabel }) {
  const now = Date.now();
  const record = {
    id: nextId(),
    channel,
    to,
    subject: subject || null,
    message,
    attachmentLabel: attachmentLabel || null,
    refType,
    refId,
    type,
    status: 'Pending',
    attempts: 0,
    createdAt: now,
    updatedAt: now,
  };
  return simulate(record);
}

export function sendSMS({ to, message, refType, refId, type }) {
  return send({ channel: 'SMS', to, message, refType, refId, type });
}

export function sendEmail({ to, subject, message, refType, refId, type, attachmentLabel }) {
  return send({ channel: 'Email', to, subject, message, refType, refId, type, attachmentLabel });
}

export function pushInApp({ message, refType, refId, type }) {
  const now = Date.now();
  const record = {
    id: nextId(),
    channel: 'InApp',
    to: 'dashboard',
    subject: null,
    message,
    attachmentLabel: null,
    refType,
    refId,
    type,
    status: 'Delivered',
    attempts: 1,
    createdAt: now,
    updatedAt: now,
  };
  publish({ type: 'create', notification: record });
  return record;
}

export function retryNotification(record) {
  const reset = { ...record, status: 'Pending', attempts: record.attempts, error: undefined, updatedAt: Date.now() };
  publish({ type: 'update', notification: reset });
  return simulate(reset);
}
