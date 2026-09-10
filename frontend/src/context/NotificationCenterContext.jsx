import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { subscribe } from '../services/notificationBus';
import { retryNotification as retryService } from '../services/notificationService';
import { loadState, saveState } from '../utils/storage';

const NotificationCenterContext = createContext(null);

export function NotificationCenterProvider({ children }) {
  const [notifications, setNotifications] = useState(() => loadState('notifications.v1', []));
  const [preferences, setPreferences] = useState(() => loadState('notification-prefs.v1', { sms: true, email: true, inApp: true }));

  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === event.notification.id);
        const next = exists
          ? prev.map((n) => (n.id === event.notification.id ? event.notification : n))
          : [event.notification, ...prev];
        return next.slice(0, 300);
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    saveState('notifications.v1', notifications);
  }, [notifications]);

  useEffect(() => {
    saveState('notification-prefs.v1', preferences);
  }, [preferences]);

  const retry = useCallback(
    (id) => {
      const record = notifications.find((n) => n.id === id);
      if (record) retryService(record);
    },
    [notifications]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.status === 'Failed' || n.status === 'Pending' || n.status === 'Processing').length,
    [notifications]
  );

  const value = useMemo(
    () => ({ notifications, preferences, setPreferences, retry, unreadCount }),
    [notifications, preferences, retry, unreadCount]
  );

  return <NotificationCenterContext.Provider value={value}>{children}</NotificationCenterContext.Provider>;
}

export function useNotificationCenter() {
  const ctx = useContext(NotificationCenterContext);
  if (!ctx) throw new Error('useNotificationCenter must be used within NotificationCenterProvider');
  return ctx;
}
