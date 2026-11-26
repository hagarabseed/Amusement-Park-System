import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { isDark, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Color mode selector"
      data-testid="theme-toggle"
      className={`inline-flex items-center rounded-xl p-1 border transition ${
        isDark
          ? 'bg-white/5 border-white/15 text-slate-200'
          : 'bg-slate-100 border-slate-200 text-slate-700'
      } ${className}`}
    >
      <button
        type="button"
        data-testid="theme-light-btn"
        onClick={() => setTheme('light')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
          !isDark
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-300 hover:text-white'
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m8.66-10h-1M4.34 12h-1m15.07 6.07l-.71-.71M6.34 6.34l-.71-.71m12.73 0l-.71.71M6.34 17.66l-.71.71M12 7a5 5 0 100 10 5 5 0 000-10z"
          />
        </svg>
        White
      </button>
      <button
        type="button"
        data-testid="theme-dark-btn"
        onClick={() => setTheme('dark')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
          isDark
            ? 'bg-[#e94560] text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
        Dark
      </button>
    </div>
  );
};
