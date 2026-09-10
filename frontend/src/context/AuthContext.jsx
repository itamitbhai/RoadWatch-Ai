import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { loadState, saveState, clearState } from '../utils/storage';

const AuthContext = createContext(null);

export const ROLES = {
  CITIZEN: 'Citizen',
  TRAFFIC_OFFICER: 'Traffic Officer',
  DEPARTMENT_STAFF: 'Department Staff',
  SUPERVISOR: 'Supervisor',
  ADMINISTRATOR: 'Administrator',
};

// Demo sign-in only — no real credentials/backend. A production build would
// replace `login()` with a real auth call (SSO/OAuth/gov ID) behind the
// same interface.
export const DEMO_USERS = [
  { id: 'U-ADM', name: 'Anjali Mehta', role: ROLES.ADMINISTRATOR, department: null, title: 'System Administrator' },
  { id: 'U-SUP', name: 'Rakesh Thakur', role: ROLES.SUPERVISOR, department: null, title: 'Zonal Supervisor' },
  { id: 'U-OFF', name: 'Insp. Neeraj Kumar', role: ROLES.TRAFFIC_OFFICER, department: 'Traffic Police', title: 'Traffic Inspector' },
  { id: 'U-STF', name: 'Ramesh (Field Staff)', role: ROLES.DEPARTMENT_STAFF, department: 'Road & Highway Department', title: 'Field Engineer' },
];

// Route-permission matrix: which admin-shell paths (under /admin) each role can open.
const PERMISSIONS = {
  [ROLES.ADMINISTRATOR]: '*',
  [ROLES.SUPERVISOR]: ['/admin', '/admin/violations', '/admin/vehicles', '/admin/complaints', '/admin/departments', '/admin/notifications', '/admin/analytics', '/admin/traffic-analytics', '/admin/reports', '/admin/gis-map', '/admin/settings', '/admin/incidents', '/admin/road-intelligence'],
  [ROLES.TRAFFIC_OFFICER]: ['/admin', '/admin/detection-studio', '/admin/violations', '/admin/vehicles', '/admin/gis-map', '/admin/notifications', '/admin/settings', '/admin/incidents', '/admin/road-intelligence'],
  [ROLES.DEPARTMENT_STAFF]: ['/admin', '/admin/complaints', '/admin/departments', '/admin/gis-map', '/admin/notifications', '/admin/settings'],
};

export function canAccess(role, path) {
  const rules = PERMISSIONS[role];
  if (!rules) return false;
  if (rules === '*') return true;
  return rules.includes(path);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadState('auth.v1', null));

  const login = useCallback((demoUser) => {
    setUser(demoUser);
    saveState('auth.v1', demoUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearState('auth.v1');
  }, []);

  const value = useMemo(() => ({ user, login, logout, isAuthenticated: !!user }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
