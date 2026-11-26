import React from 'react';
import { RevenueBreakdown } from '../../types';
import { formatCurrency } from '../../utils/posCalculations';

interface RevenueChartProps {
  totalRevenue: number;
  breakdown: RevenueBreakdown;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ totalRevenue, breakdown }) => {
  const streams = [
    { label: 'Ticketing POS', value: Number(breakdown.ticketRevenue), color: 'bg-blue-600' },
    { label: 'Food Court POS', value: Number(breakdown.foodRevenue), color: 'bg-emerald-600' },
    { label: 'Wristband Top-Ups', value: Number(breakdown.topupRevenue), color: 'bg-indigo-600' },
  ];

  const maxStream = Math.max(...streams.map(s => s.value), 1);
  const paymentTotal = Math.max(
    Number(breakdown.wristbandPaidRevenue) + Number(breakdown.cashPaidRevenue),
    1
  );
  const wristbandPct = Math.round((Number(breakdown.wristbandPaidRevenue) / paymentTotal) * 100);
  const cashPct = 100 - wristbandPct;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Revenue by Park Stream</h3>
            <p className="text-xs text-slate-500">Total settled volume: {formatCurrency(totalRevenue)}</p>
          </div>
        </div>
        <div className="space-y-3">
          {streams.map(s => {
            const pct = Math.round((s.value / maxStream) * 100);
            return (
              <div key={s.label} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">{s.label}</span>
                  <span className="font-mono-num text-slate-900 font-semibold">{formatCurrency(s.value)}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.color} transition-all duration-300`}
                    style={{ width: `${Math.max(pct, s.value > 0 ? 6 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Settlement Method Split</h3>
          <p className="text-xs text-slate-500">RFID Wristband wallet vs Cash tender</p>
        </div>

        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${wristbandPct}%` }}
            title={`Wristband: ${wristbandPct}%`}
          />
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${cashPct}%` }}
            title={`Cash: ${cashPct}%`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100">
            <div className="flex items-center gap-1.5 text-xs font-medium text-blue-900">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              RFID Wristband ({wristbandPct}%)
            </div>
            <div className="text-lg font-bold font-mono-num text-slate-900 mt-1">
              {formatCurrency(breakdown.wristbandPaidRevenue)}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100">
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-900">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Cash Tender ({cashPct}%)
            </div>
            <div className="text-lg font-bold font-mono-num text-slate-900 mt-1">
              {formatCurrency(breakdown.cashPaidRevenue)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
