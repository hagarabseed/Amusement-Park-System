import React from 'react';

type BadgeTone = 'blue' | 'emerald' | 'amber' | 'rose' | 'slate' | 'indigo';

const TONE_MAP: Record<BadgeTone, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  testId?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  tone = 'slate',
  testId,
  className = '',
}) => (
  <span
    data-testid={testId}
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${TONE_MAP[tone]} ${className}`}
  >
    {children}
  </span>
);
