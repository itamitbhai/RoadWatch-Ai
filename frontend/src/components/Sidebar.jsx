import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Bus,
  Construction,
  BarChart3,
  ShieldAlert,
  Map,
  FileBarChart,
  X,
  Satellite,
  ScanLine,
  Car,
  MessageSquareWarning,
  Building2,
  Bell,
  TrendingUp,
  Settings as SettingsIcon,
  Globe2,
} from 'lucide-react';
import { useAuth, canAccess } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin', key: 'dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/detection-studio', key: 'detectionStudio', icon: ScanLine },
  { to: '/admin/violations', key: 'violations', icon: MessageSquareWarning },
  { to: '/admin/vehicles', key: 'vehicles', icon: Car },
  { to: '/admin/fleet', key: 'fleet', icon: Bus },
  { to: '/admin/road-intelligence', key: 'roadIntelligence', icon: Construction },
  { to: '/admin/traffic-analytics', key: 'trafficAnalytics', icon: BarChart3 },
  { to: '/admin/incidents', key: 'incidents', icon: ShieldAlert },
  { to: '/admin/complaints', key: 'complaints', icon: MessageSquareWarning },
  { to: '/admin/departments', key: 'departments', icon: Building2 },
  { to: '/admin/gis-map', key: 'gisMap', icon: Map },
  { to: '/admin/notifications', key: 'notifications', icon: Bell },
  { to: '/admin/analytics', key: 'analytics', icon: TrendingUp },
  { to: '/admin/reports', key: 'reports', icon: FileBarChart },
  { to: '/admin/settings', key: 'settings', icon: SettingsIcon },
];

export default function Sidebar({ open, onClose }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const items = NAV_ITEMS.filter((item) => !user || canAccess(user.role, item.to));

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside
        className={`glass fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/5 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/5 px-5 lg:hidden">
          <div className="flex items-center gap-2">
            <Satellite size={18} className="text-cyan-400" />
            <span className="font-bold text-white">UrbanSense AI</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div className="hidden items-center gap-2 border-b border-white/5 px-5 py-3 lg:flex">
          <ShieldAlert size={14} className="text-amber-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Government / Department Portal</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3 thin-scroll">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-transparent text-cyan-300'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-cyan-400 shadow-[0_0_10px_2px_rgba(34,211,238,0.6)]" />}
                  <item.icon size={18} strokeWidth={2} />
                  {t(`nav.${item.key}`)}
                </>
              )}
            </NavLink>
          ))}

          <Link
            to="/"
            onClick={onClose}
            className="mt-2 flex items-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3.5 py-2.5 text-sm font-medium text-cyan-300 hover:bg-cyan-500/15"
          >
            <Globe2 size={18} strokeWidth={2} />
            View Public Citizen Site
          </Link>
        </nav>

        <div className="border-t border-white/5 p-4">
          <div className="glass rounded-xl p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Smart India Hackathon</p>
            <p className="mt-1 text-xs text-slate-500">Problem Statement 26124 — Mobile Urban Intelligence Platform</p>
          </div>
        </div>
      </aside>
    </>
  );
}
