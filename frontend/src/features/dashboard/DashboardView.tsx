import React from 'react';
import { PersonalDashboard, Ride, Tab } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { RevenueChart } from '../../components/ui/RevenueChart';
import { StatCard } from '../../components/ui/StatCard';
import { formatCurrency } from '../../utils/posCalculations';

interface DashboardViewProps {
  dashboard: PersonalDashboard;
  rides: Ride[];
  onNavigate: (tab: Tab) => void;
  onToggleMaintenance: (rideId: number, reason?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  dashboard,
  rides,
  onNavigate,
  onToggleMaintenance,
}) => {
  const isManager = dashboard.role === 'MANAGER';
  const isCashier = dashboard.role === 'CASHIER';
  const isOperator = dashboard.role === 'RIDE_OPERATOR';
  const canPos = isManager || isCashier;

  const assignedRide = dashboard.assignedRideId
    ? rides.find(r => r.id === dashboard.assignedRideId)
    : rides.find(r => r.name.toLowerCase() === dashboard.assignedStation.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Actions Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold text-slate-900">Welcome back, {dashboard.fullName}</h2>
            <Badge tone={dashboard.dutyStatus === 'ON_DUTY' ? 'emerald' : 'slate'}>
              {dashboard.dutyStatus}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Station: <span className="font-semibold text-slate-800">{dashboard.assignedStation}</span> · Role:{' '}
            <span className="font-semibold text-slate-800">{dashboard.role}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canPos && (
            <>
              <button
                onClick={() => onNavigate('POS')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-xs"
              >
                + Issue Ticket
              </button>
              <button
                onClick={() => onNavigate('CUSTOMERS')}
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                + Register Visitor
              </button>
            </>
          )}
          {isOperator && (
            <button
              onClick={() => onNavigate('RIDES')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-xs"
            >
              Open Gate Boarding Console
            </button>
          )}
        </div>
      </div>

      {/* Manager KPIs & Analytics */}
      {isManager && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Gross Park Revenue"
              value={formatCurrency(dashboard.totalRevenue)}
              sublabel={`Tickets ${formatCurrency(dashboard.revenueBreakdown?.ticketRevenue)} · Food ${formatCurrency(dashboard.revenueBreakdown?.foodRevenue)}`}
              accent="emerald"
              testId="stat-revenue"
            />
            <StatCard
              label="Registered Visitors"
              value={dashboard.registeredCustomers ?? 0}
              sublabel="Active RFID wristband accounts"
              accent="blue"
              testId="stat-customers"
            />
            <StatCard
              label="Operational Rides"
              value={`${dashboard.operationalRides} / ${dashboard.totalRides}`}
              sublabel={`${dashboard.myBoardingsCount ?? 0} total gate boardings`}
              accent="amber"
              testId="stat-rides"
            />
            <StatCard
              label="Active Staff On Duty"
              value={`${dashboard.activeStaffCount ?? 0} / ${dashboard.totalStaffCount ?? 0}`}
              sublabel="Across gate, food & rides"
              accent="indigo"
              testId="stat-staff"
            />
          </div>

          {dashboard.revenueBreakdown && (
            <RevenueChart
              totalRevenue={Number(dashboard.totalRevenue ?? 0)}
              breakdown={dashboard.revenueBreakdown}
            />
          )}
        </>
      )}

      {/* Cashier KPIs */}
      {isCashier && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="My Settled Transactions"
            value={dashboard.myTransactionsCount ?? 0}
            sublabel={`Volume: ${formatCurrency(dashboard.myProcessedVolume)}`}
            accent="blue"
            testId="stat-my-actions"
          />
          <StatCard
            label="Registered Visitors"
            value={dashboard.registeredCustomers ?? 0}
            sublabel="Available for POS & top-ups"
            accent="emerald"
            testId="stat-customers"
          />
          <StatCard
            label="Open Park Attractions"
            value={`${dashboard.operationalRides} / ${dashboard.totalRides}`}
            sublabel="Real-time park readiness"
            accent="amber"
            testId="stat-rides"
          />
        </div>
      )}

      {/* Ride Operator Station Card */}
      {isOperator && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                My Assigned Attraction
              </span>
              {assignedRide && (
                <Badge tone={assignedRide.operational ? 'emerald' : 'rose'}>
                  {assignedRide.operational ? 'OPEN FOR RIDERS' : 'MAINTENANCE'}
                </Badge>
              )}
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {assignedRide ? assignedRide.name : dashboard.assignedStation}
            </div>
            {assignedRide ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <div className="text-slate-500">Capacity</div>
                    <div className="font-bold text-slate-900 mt-0.5">{assignedRide.capacity} riders</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <div className="text-slate-500">Min Age</div>
                    <div className="font-bold text-slate-900 mt-0.5">{assignedRide.minAge}+ yrs</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <div className="text-slate-500">Min Height</div>
                    <div className="font-bold text-slate-900 mt-0.5">{Number(assignedRide.minHeightM).toFixed(2)}m</div>
                  </div>
                </div>
                {assignedRide.maintenanceReason && (
                  <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg">
                    Reason: {assignedRide.maintenanceReason}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => onToggleMaintenance(assignedRide.id)}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition"
                  >
                    {assignedRide.operational ? 'Place in Maintenance' : 'Reopen Attraction'}
                  </button>
                  <button
                    onClick={() => onNavigate('RIDES')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition"
                  >
                    Validate & Board Guest
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Use Rides & Boarding console to inspect park attractions.</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              label="My Gate Dispatches"
              value={dashboard.myBoardingsCount ?? 0}
              sublabel="Validated rider boardings"
              accent="blue"
              testId="stat-my-boardings"
            />
            <StatCard
              label="Park Ride Readiness"
              value={`${dashboard.operationalRides} / ${dashboard.totalRides}`}
              sublabel="Attractions currently open"
              accent="emerald"
              testId="stat-rides"
            />
          </div>
        </div>
      )}

      {/* Audit Activity Feed */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {isManager ? 'Global Park Audit Trail' : 'My Recent Activity Log'}
            </h3>
            <p className="text-xs text-slate-500">Latest 20 recorded operational events</p>
          </div>
          <Badge tone="slate">{dashboard.recentLogs.length} events</Badge>
        </div>

        {dashboard.recentLogs.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No operational activity recorded under this account yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {dashboard.recentLogs.map(log => (
              <div
                key={log.id}
                className="px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono-num font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded shrink-0">
                    {log.action}
                  </span>
                  <span className="text-slate-700 truncate">{log.details}</span>
                </div>
                <div className="text-slate-400 shrink-0 font-mono-num">
                  {log.actorEmail} · {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
