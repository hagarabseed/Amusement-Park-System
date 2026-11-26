import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: 'blue' | 'emerald' | 'amber' | 'indigo' | 'slate';
  testId?: string;
}

const ACCENT_BORDER: Record<string, string> = {
  blue: 'border-l-blue-600',
  emerald: 'border-l-emerald-600',
  amber: 'border-l-amber-500',
  indigo: 'border-l-indigo-600',
  slate: 'border-l-slate-700',
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  sublabel,
  accent = 'blue',
  testId,
}) => (
  <div
    className={`bg-white border border-slate-200 border-l-4 ${ACCENT_BORDER[accent]} rounded-xl p-5 shadow-xs`}
  >
    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
    <div data-testid={testId} className="text-2xl font-bold text-slate-900 mt-1.5 font-mono-num">
      {value}
    </div>
    {sublabel && <div className="text-xs text-slate-500 mt-1.5">{sublabel}</div>}
  </div>
);
