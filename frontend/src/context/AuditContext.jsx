import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { loadState, saveState } from '../utils/storage';

const AuditContext = createContext(null);

let counter = 1;
function nextId() {
  return `AUD-${String(counter++).padStart(6, '0')}`;
}

export function AuditProvider({ children }) {
  const [log, setLog] = useState(() => loadState('audit.v1', []));

  const logAction = useCallback(({ user, action, entity, entityId, meta }) => {
    setLog((prev) => {
      const entry = {
        id: nextId(),
        user: user ? { id: user.id, name: user.name, role: user.role } : { id: 'system', name: 'System', role: 'System' },
        action,
        entity,
        entityId: entityId || null,
        meta: meta || null,
        timestamp: Date.now(),
      };
      const next = [entry, ...prev].slice(0, 500);
      saveState('audit.v1', next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ log, logAction }), [log, logAction]);

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAudit() {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error('useAudit must be used within AuditProvider');
  return ctx;
}
