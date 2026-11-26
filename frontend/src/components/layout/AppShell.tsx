import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { AuthUser, PersonalDashboard, Tab } from '../../types';
import { Badge } from '../ui/Badge';
import { ThemeToggle } from '../ui/ThemeToggle';
import {
  DashboardIcon,
  FoodIcon,
  LogoutIcon,
  ReceiptIcon,
  RideIcon,
  StaffIcon,
  TagIcon,
  TicketIcon,
  UsersIcon,
} from '../ui/Icons';

interface NavItem {
  id: Tab;
  label: string;
  testId: string;
  icon: React.ReactNode;
  visible: boolean;
}

interface AppShellProps {
  user: AuthUser;
  dashboard: PersonalDashboard | null;
  activeTab: Tab;
  loading: boolean;
  onSelectTab: (tab: Tab) => void;
  onRefresh: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const TAB_TITLES: Record<Tab, { title: string; subtitle: string }> = {
  DASHBOARD: { title: 'Operations Command', subtitle: 'Role-scoped telemetry and shift status' },
  CUSTOMERS: { title: 'Visitors & RFID Wallets', subtitle: 'Manage guest registrations, balances, and loyalty points' },
  POS: { title: 'Ticketing & Wallet POS', subtitle: 'Issue day passes, apply promos, and top up wristbands' },
  FOOD_POS: { title: 'Food Court POS', subtitle: 'Multi-item order builder with instant RFID settlement' },
  TRANSACTIONS: { title: 'Transactions & Receipts', subtitle: 'Auditable ledger with itemized receipts and CSV export' },
  RIDES: { title: 'Rides & Gate Control', subtitle: 'Safety eligibility boarding, dispatch logs, and maintenance' },
  STAFF: { title: 'Staff & Station Roster', subtitle: 'Shift scheduling, station assignments, and onboarding' },
  CATALOG: { title: 'Promos & Menu Governance', subtitle: 'Control active discount campaigns and menu availability' },
};

export const AppShell: React.FC<AppShellProps> = ({
  user,
  dashboard,
  activeTab,
  loading,
  onSelectTab,
  onRefresh,
  onLogout,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark } = useTheme();

  const canManagePos = user.role === 'MANAGER' || user.role === 'CASHIER';
  const isManager = user.role === 'MANAGER';

  const navItems: NavItem[] = [
    { id: 'DASHBOARD', label: 'Overview', testId: 'nav-dashboard', icon: <DashboardIcon />, visible: true },
    { id: 'CUSTOMERS', label: 'Visitors & Wallets', testId: 'nav-customers', icon: <UsersIcon />, visible: canManagePos },
    { id: 'POS', label: 'Ticketing & Top-Up', testId: 'nav-pos', icon: <TicketIcon />, visible: canManagePos },
    { id: 'FOOD_POS', label: 'Food Court POS', testId: 'nav-food-pos', icon: <FoodIcon />, visible: canManagePos },
    { id: 'TRANSACTIONS', label: 'Transactions', testId: 'nav-transactions', icon: <ReceiptIcon />, visible: canManagePos },
    { id: 'RIDES', label: 'Rides & Boarding', testId: 'nav-rides', icon: <RideIcon />, visible: true },
    { id: 'STAFF', label: 'Staff & Stations', testId: 'nav-staff', icon: <StaffIcon />, visible: isManager },
    { id: 'CATALOG', label: 'Promos & Menu', testId: 'nav-catalog', icon: <TagIcon />, visible: isManager },
  ];

  const station = dashboard?.assignedStation ?? user.assignedStation;
  const dutyStatus = dashboard?.dutyStatus ?? user.dutyStatus;

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4">
      <div>
        <div className="flex items-center gap-2.5 px-2 pb-4 border-b border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            P
          </div>
          <div>
            <div className="font-bold text-slate-900 leading-tight">ParkPulse</div>
            <div className="text-[11px] text-slate-500 font-medium">Operations Suite</div>
          </div>
        </div>

        <div className="mt-4 mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div>
            <p className="text-sm font-semibold text-slate-900 truncate">{user.fullName}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge tone="blue" testId="user-role-badge">
              {user.role}
            </Badge>
            <Badge tone={dutyStatus === 'ON_DUTY' ? 'emerald' : 'slate'}>
              {dutyStatus}
            </Badge>
          </div>
          <p className="text-xs text-slate-600 pt-0.5">
            Station: <span className="font-semibold text-slate-900">{station}</span>
          </p>
        </div>

        <nav className="space-y-1">
          {navItems
            .filter(item => item.visible)
            .map(item => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  data-testid={item.testId}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    active
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className={active ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
        </nav>
      </div>

      <button
        data-testid="logout-btn"
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 transition"
      >
        <LogoutIcon />
        Sign Out
      </button>
    </div>
  );

  const meta = TAB_TITLES[activeTab];

  return (
    <div
      className={`min-h-screen flex transition-colors duration-200 ${
        isDark ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block w-64 shrink-0 border-r ${
          isDark ? 'bg-[#16213e] border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <aside
            className={`relative w-64 max-w-[80vw] h-full shadow-xl z-50 ${
              isDark ? 'bg-[#16213e]' : 'bg-white'
            }`}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className={`sticky top-0 z-20 backdrop-blur border-b px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 ${
            isDark ? 'bg-[#16213e]/95 border-white/10' : 'bg-white/95 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className={`md:hidden px-2.5 py-1.5 rounded-lg border text-sm font-medium ${
                isDark ? 'border-white/15 text-slate-200' : 'border-slate-200 text-slate-700'
              }`}
            >
              Menu
            </button>
            <div>
              <h1 className={`text-lg font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {meta.title}
              </h1>
              <p className={`text-xs hidden sm:block ${isDark ? 'text-[#a8b2d8]' : 'text-slate-500'}`}>
                {meta.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {loading && (
              <span
                data-testid="loading-indicator"
                className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full"
              >
                Syncing...
              </span>
            )}
            <ThemeToggle />
            <button
              type="button"
              onClick={onRefresh}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                isDark
                  ? 'border-white/15 bg-white/5 hover:bg-white/10 text-slate-200'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              Refresh
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
