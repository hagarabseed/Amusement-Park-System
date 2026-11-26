import React, { useState } from 'react';
import { apiFetch, formatApiError } from '../../api/client';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { AuthUser } from '../../types';

interface Props {
  onLoginSuccess: (user: AuthUser) => void;
  onSwitchToRegister: () => void;
  onBack: () => void;
}

export const CustomerLoginView: React.FC<Props> = ({
  onLoginSuccess,
  onSwitchToRegister,
  onBack,
}) => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('sara.demo@example.com');
  const [password, setPassword] = useState('Pass@1234');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const data = await apiFetch<AuthUser>('/portal/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.token) localStorage.setItem('pp_token', data.token);
      localStorage.setItem('pp_user', JSON.stringify(data));
      onLoginSuccess(data);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark
          ? 'bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]'
          : 'bg-slate-50'
      }`}
    >
      {/* Top Bar with Back + Theme Toggle */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-5 flex items-center justify-between">
        <button
          type="button"
          data-testid="portal-back-btn"
          onClick={onBack}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition ${
            isDark
              ? 'bg-white/5 border-white/15 text-[#a8b2d8] hover:text-white hover:border-white/30'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Staff Console
        </button>

        <ThemeToggle />
      </div>

      {/* Centered Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#e94560] flex items-center justify-center shadow-lg shadow-[#e94560]/30">
                <span className="text-white font-black text-xl">P</span>
              </div>
              <div className="text-left">
                <div className={`font-black text-2xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ParkPulse
                </div>
                <div className={`text-xs font-medium tracking-widest uppercase ${isDark ? 'text-[#a8b2d8]' : 'text-slate-500'}`}>
                  Guest Portal
                </div>
              </div>
            </div>
            <p className={`text-sm mt-2 ${isDark ? 'text-[#a8b2d8]' : 'text-slate-600'}`}>
              Sign in to book tickets and manage your account
            </p>
          </div>

          {/* Card */}
          <div
            className={`rounded-2xl p-8 transition ${
              isDark
                ? 'bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl'
                : 'bg-white border border-slate-200 shadow-lg'
            }`}
          >
            {error && (
              <div className="mb-5 bg-[#e94560]/10 border border-[#e94560]/30 text-[#e94560] rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-[#a8b2d8]' : 'text-slate-700'}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition border focus:border-[#e94560] focus:ring-2 focus:ring-[#e94560]/20 ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-[#a8b2d8]' : 'text-slate-700'}`}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition border focus:border-[#e94560] focus:ring-2 focus:ring-[#e94560]/20 ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[#e94560] hover:bg-[#d63651] disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-[#e94560]/30 transition"
              >
                {busy ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className={`mt-6 pt-6 border-t text-center ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <p className={`text-sm ${isDark ? 'text-[#a8b2d8]' : 'text-slate-600'}`}>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-[#e94560] font-semibold hover:underline"
                >
                  Create one free
                </button>
              </p>
            </div>

            {/* Demo hint */}
            <div
              className={`mt-4 rounded-xl px-4 py-3 text-xs ${
                isDark ? 'bg-white/5 text-[#a8b2d8]' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <span className={`font-semibold ${isDark ? 'text-white/80' : 'text-slate-800'}`}>Demo account: </span>
              sara.demo@example.com / Pass@1234
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
