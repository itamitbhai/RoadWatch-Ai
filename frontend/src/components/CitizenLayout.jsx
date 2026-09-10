import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Satellite, ShieldCheck } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import ToastContainer from './ToastContainer';

const NAV = [
  { to: '/', key: 'home', end: true },
  { to: '/report', key: 'report' },
  { to: '/track', key: 'track' },
  { to: '/safety', key: 'safety' },
  { to: '/help', key: 'help' },
];

export default function CitizenLayout() {
  const { t } = useTranslation();

  return (
    <div className="grid-overlay min-h-screen bg-base-950">
      <header className="glass sticky top-0 z-50 border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
              <Satellite size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none text-white">{t('app.name')}</p>
              <p className="mt-0.5 text-[10px] leading-none text-slate-400">{t('app.tagline')}</p>
            </div>
          </NavLink>

          <nav className="ml-4 hidden flex-1 items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isActive ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`
                }
              >
                {t(`citizenNav.${item.key}`)}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher compact />
            <NavLink
              to="/login"
              className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 sm:flex"
            >
              <ShieldCheck size={13} /> {t('citizenNav.adminLogin')}
            </NavLink>
          </div>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto border-t border-white/5 px-4 py-2 thin-scroll md:hidden">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${isActive ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-400'}`
              }
            >
              {t(`citizenNav.${item.key}`)}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  );
}
