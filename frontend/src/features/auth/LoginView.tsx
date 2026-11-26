import React, { useState } from 'react';
import { apiFetch, formatApiError } from '../../api/client';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { AuthUser } from '../../types';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

const DEMO_ACCOUNTS = [
  {
    role: 'Manager',
    email: 'omar.manager@parkpulse.com',
    station: 'Command Center',
    badgeClass: 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100',
  },
  {
    role: 'Cashier',
    email: 'khaled.cashier@parkpulse.com',
    station: 'Main Gate POS #1',
    badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
  },
  {
    role: 'Operator',
    email: 'ahmed.operator@parkpulse.com',
    station: 'Thunder Coaster',
    badgeClass: 'text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100',
  },
];

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('omar.manager@parkpulse.com');
  const [password, setPassword] = useState('Pass@1234');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const data = await apiFetch<AuthUser>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.token) {
        localStorage.setItem('pp_token', data.token);
      }
      localStorage.setItem('pp_user', JSON.stringify(data));
      onLoginSuccess(data);
    } catch (err) {
      setErrorMsg(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-200 ${
        isDark
          ? 'bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]'
          : 'bg-slate-100'
      }`}
    >
      <div className="w-full max-w-4xl flex justify-end mb-4">
        <ThemeToggle />
      </div>
      <div
        className={`w-full max-w-4xl rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-5 border ${
          isDark ? 'bg-[#16213e] border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        {/* Brand Context Panel */}
        <div className="md:col-span-2 bg-slate-900 text-white p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-base">
                P
              </div>
              <div>
                <div className="font-bold text-lg tracking-tight">ParkPulse</div>
                <div className="text-xs text-slate-400">Theme Park Operations Suite</div>
              </div>
            </div>

            <h2 className="text-xl font-bold mt-8 leading-snug">
              Unified Gate POS, RFID Wallets & Ride Safety Control
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Role-isolated terminals for park managers, front-gate cashiers, and attraction operators.
            </p>
          </div>

          <div className="pt-8 border-t border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Auth Protocol</span>
              <span className="text-slate-200 font-medium">Stateless JWT RBAC</span>
            </div>
            <div className="flex justify-between">
              <span>Currency Precision</span>
              <span className="text-slate-200 font-medium">NUMERIC(10,2)</span>
            </div>
            <div className="flex justify-between">
              <span>Audit Compliance</span>
              <span className="text-slate-200 font-medium">Immutable Ledger</span>
            </div>
          </div>
        </div>

        {/* Sign-in Form */}
        <div className="md:col-span-3 p-8 sm:p-10">
          <div className="mb-6">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Staff Console Sign In
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-[#a8b2d8]' : 'text-slate-500'}`}>
              Authenticate to load your assigned station workspace.
            </p>
          </div>

          {errorMsg && (
            <div
              data-testid="alert-error"
              role="alert"
              className="mb-5 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg text-sm"
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-[#a8b2d8]' : 'text-slate-700'}`}
              >
                Staff Email
              </label>
              <input
                id="login-email"
                data-testid="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full border focus:border-[#e94560] focus:ring-2 focus:ring-[#e94560]/20 rounded-lg px-3.5 py-2.5 text-sm outline-none transition ${
                  isDark
                    ? 'bg-white/5 border-white/15 text-white placeholder-white/30'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="name@parkpulse.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-[#a8b2d8]' : 'text-slate-700'}`}
              >
                Password
              </label>
              <input
                id="login-password"
                data-testid="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`w-full border focus:border-[#e94560] focus:ring-2 focus:ring-[#e94560]/20 rounded-lg px-3.5 py-2.5 text-sm outline-none transition ${
                  isDark
                    ? 'bg-white/5 border-white/15 text-white placeholder-white/30'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>

            <button
              data-testid="login-submit"
              type="submit"
              disabled={submitting}
              className="w-full bg-[#e94560] hover:bg-[#d63651] disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm shadow-xs transition"
            >
              {submitting ? 'Authenticating...' : 'Sign In to Console'}
            </button>
          </form>

          <div className={`mt-7 pt-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Quick-Fill Demo Personas (Password: Pass@1234)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  data-testid={`demo-fill-${acc.role.toLowerCase()}`}
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword('Pass@1234');
                    setErrorMsg(null);
                  }}
                  className={`text-left p-2.5 rounded-lg border transition ${acc.badgeClass}`}
                >
                  <div className="text-xs font-bold">{acc.role}</div>
                  <div className="text-[11px] opacity-80 truncate">{acc.station}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
