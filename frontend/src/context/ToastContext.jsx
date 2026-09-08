import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

let idCounter = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const push = useCallback((toast) => {
    const id = idCounter++;
    const entry = {
      id,
      title: toast.title || 'Notification',
      message: toast.message || '',
      variant: toast.variant || 'info',
      duration: toast.duration ?? 4500,
    };
    setToasts((prev) => [...prev, entry].slice(-5));
    timers.current[id] = setTimeout(() => dismiss(id), entry.duration);
    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
