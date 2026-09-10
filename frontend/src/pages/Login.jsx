import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Satellite } from 'lucide-react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogin(user) {
    login(user);
    push({ title: `Signed in as ${user.name}`, message: `Role: ${user.role} (Demo Sign-In)`, variant: 'success' });
    navigate(location.state?.from || '/admin', { replace: true });
  }

  return (
    <div className="grid-overlay flex min-h-screen items-center justify-center bg-base-950 p-4">
      <div className="glass w-full max-w-lg rounded-2xl p-8">
        <Link to="/" className="mb-5 flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200">
          <ArrowLeft size={13} /> Back to public site
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Satellite size={20} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">UrbanSense AI Command Center</p>
            <p className="text-xs text-slate-400">Government / Department Staff Sign-In</p>
          </div>
        </div>

        <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
          <ShieldCheck size={15} className="mt-0.5 shrink-0" />
          <p>
            <strong>DEMO MODE</strong> — this is a role-based demo sign-in with no real credentials. Select any role
            below to explore the platform as that user. A production deployment would replace this with real
            government SSO/OAuth authentication.
          </p>
        </div>

        <div className="space-y-2.5">
          {DEMO_USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => handleLogin(user)}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-colors hover:border-cyan-500/40 hover:bg-white/10"
            >
              <div>
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.title}{user.department ? ` · ${user.department}` : ''}</p>
              </div>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
                {user.role}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
