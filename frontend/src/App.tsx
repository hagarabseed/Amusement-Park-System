import React, { useEffect, useState } from 'react';
import { apiFetch, ApiError } from './api/client';

type Role = 'MANAGER' | 'CASHIER' | 'RIDE_OPERATOR';
type Tab = 'DASHBOARD' | 'CUSTOMERS' | 'POS' | 'FOOD_POS' | 'RIDES' | 'STAFF';

interface AuthUser {
  token: string;
  fullName: string;
  email: string;
  role: Role;
}

interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  wristbandBalance: number;
  loyaltyPoints: number;
}

interface Ride {
  id: number;
  name: string;
  category: string;
  capacity: number;
  minAge: number;
  minHeightM: number;
  needMaintenance: boolean;
  operational: boolean;
  specificDetails?: string;
}

interface MenuItem {
  id: number;
  name: string;
  itemType: string;
  subCategory: string;
  price: number;
  available: boolean;
}

interface StaffMember {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  assignedStation: string;
  dutyStatus: 'ON_DUTY' | 'OFF_DUTY';
}

interface AuditLog {
  id: number;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}

interface DashboardSummary {
  totalRevenue: number;
  ticketRevenue: number;
  foodRevenue: number;
  topupRevenue: number;
  registeredCustomers: number;
  operationalRides: number;
  totalRides: number;
  activeStaffCount: number;
  recentLogs: AuditLog[];
}

const defaultTabForRole = (role: Role): Tab =>
  role === 'RIDE_OPERATOR' ? 'RIDES' : 'DASHBOARD';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('pp_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [tab, setTab] = useState<Tab>(() => {
    const saved = localStorage.getItem('pp_user');
    return saved ? defaultTabForRole(JSON.parse(saved).role) : 'DASHBOARD';
  });

  // Login state
  const [email, setEmail] = useState('omar.manager@parkpulse.com');
  const [password, setPassword] = useState('Pass@1234');

  // Global feedback & loading states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Domain data state
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [rides, setRides] = useState<Ride[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  // Customer registration form state
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custDeposit, setCustDeposit] = useState('50.00');

  // Ticketing & Wristband POS state
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(1);
  const [passType, setPassType] = useState<'REGULAR' | 'VIP_FASTPASS' | 'FAMILY'>('REGULAR');
  const [payWithWristband, setPayWithWristband] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [topupAmount, setTopupAmount] = useState('50.00');

  // Food Court POS state
  const [foodCustomerId, setFoodCustomerId] = useState<number>(1);
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [foodPayWristband, setFoodPayWristband] = useState(true);
  const [foodPromoCode, setFoodPromoCode] = useState('');

  // Create Ride form state (Manager only)
  const [rideName, setRideName] = useState('');
  const [rideCategory, setRideCategory] = useState<'ROLLER_COASTER' | 'HORROR' | 'KIDS' | 'WATER' | 'FAMILY'>('ROLLER_COASTER');
  const [rideCapacity, setRideCapacity] = useState('20');
  const [rideMinAge, setRideMinAge] = useState('10');
  const [rideMinHeight, setRideMinHeight] = useState('1.20');
  const [rideDetails, setRideDetails] = useState('');

  // Station assignment state (Manager only)
  const [stationEdits, setStationEdits] = useState<Record<number, string>>({});

  const clearAlerts = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const formatApiError = (err: unknown): string => {
    if (err instanceof ApiError) {
      if (err.errors && Object.keys(err.errors).length > 0) {
        return Object.values(err.errors).join(' | ');
      }
      return err.message;
    }
    return err instanceof Error ? err.message : 'Unexpected error occurred';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    try {
      const data = await apiFetch<AuthUser>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('pp_token', data.token);
      localStorage.setItem('pp_user', JSON.stringify(data));
      setUser(data);
      setTab(defaultTabForRole(data.role));
    } catch (err) {
      setErrorMsg(formatApiError(err));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pp_token');
    localStorage.removeItem('pp_user');
    setUser(null);
    setCart([]);
    clearAlerts();
  };

  const loadData = async (searchQuery = customerSearch) => {
    if (!user) return;
    setLoading(true);
    try {
      const rideList = await apiFetch<Ride[]>('/rides');
      setRides(rideList);

      if (user.role === 'MANAGER' || user.role === 'CASHIER') {
        const queryParam = searchQuery.trim() ? `?q=${encodeURIComponent(searchQuery.trim())}` : '';
        const [dash, custPage, menu] = await Promise.all([
          apiFetch<DashboardSummary>('/dashboard'),
          apiFetch<{ content: Customer[] }>(`/customers${queryParam}`),
          apiFetch<MenuItem[]>('/menu'),
        ]);
        setDashboard(dash);
        setCustomers(custPage.content);
        setMenuItems(menu);

        if (custPage.content.length > 0) {
          if (!custPage.content.some(c => c.id === selectedCustomerId)) {
            setSelectedCustomerId(custPage.content[0].id);
          }
          if (!custPage.content.some(c => c.id === foodCustomerId)) {
            setFoodCustomerId(custPage.content[0].id);
          }
        }
      }

      if (user.role === 'MANAGER') {
        const staffList = await apiFetch<StaffMember[]>('/staff');
        setStaff(staffList);
      }
    } catch (err) {
      setErrorMsg(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    try {
      await apiFetch('/customers', {
        method: 'POST',
        body: JSON.stringify({
          fullName: custName,
          email: custEmail,
          phone: custPhone,
          initialDeposit: parseFloat(custDeposit),
        }),
      });
      setSuccessMsg(`Customer "${custName}" registered successfully.`);
      setCustName('');
      setCustEmail('');
      setCustPhone('');
      setCustDeposit('50.00');
      await loadData();
    } catch (err) {
      setErrorMsg(formatApiError(err));
    }
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    try {
      const res = await apiFetch<any>('/pos/topup', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedCustomerId,
          amount: parseFloat(topupAmount),
        }),
      });
      setSuccessMsg(
        `Wristband topped up by $${Number(res.netAmount).toFixed(2)}. New balance: $${Number(res.updatedBalance).toFixed(2)}`
      );
      setTopupAmount('50.00');
      await loadData();
    } catch (err) {
      setErrorMsg(formatApiError(err));
    }
  };

  const handleIssueTicket = async () => {
    clearAlerts();
    try {
      const res = await apiFetch<any>('/pos/tickets', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedCustomerId,
          passType,
          paymentMethod: payWithWristband ? 'WRISTBAND' : 'CASH',
          promoCode: promoCode.trim() || null,
        }),
      });
      setSuccessMsg(
        `Ticket issued ($${Number(res.netAmount).toFixed(2)}). Remaining balance: $${Number(res.updatedBalance).toFixed(2)} | Loyalty points: ${res.updatedLoyaltyPoints}`
      );
      await loadData();
    } catch (err) {
      setErrorMsg(formatApiError(err));
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(entry => entry.item.id === item.id);
      if (existing) {
        return prev.map(entry =>
          entry.item.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => prev.filter(entry => entry.item.id !== itemId));
  };

  const cartSubtotal = cart.reduce((sum, entry) => sum + Number(entry.item.price) * entry.quantity, 0);

  const handleFoodCheckout = async () => {
    clearAlerts();
    try {
      const res = await apiFetch<any>('/pos/food-orders', {
        method: 'POST',
        body: JSON.stringify({
          customerId: foodCustomerId,
          paymentMethod: foodPayWristband ? 'WRISTBAND' : 'CASH',
          promoCode: foodPromoCode.trim() || null,
          items: cart.map(entry => ({
            menuItemId: entry.item.id,
            quantity: entry.quantity,
          })),
        }),
      });
      setSuccessMsg(
        `Food order completed ($${Number(res.netAmount).toFixed(2)}). Remaining balance: $${Number(res.updatedBalance).toFixed(2)}`
      );
      setCart([]);
      setFoodPromoCode('');
      await loadData();
    } catch (err) {
      setErrorMsg(formatApiError(err));
    }
  };

  const handleCreateRide = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    try {
      await apiFetch('/rides', {
        method: 'POST',
        body: JSON.stringify({
          name: rideName,
          category: rideCategory,
          capacity: parseInt(rideCapacity, 10),
          minAge: parseInt(rideMinAge, 10),
          minHeightM: parseFloat(rideMinHeight),
          specificDetails: rideDetails.trim() || null,
        }),
      });
      setSuccessMsg(`Ride "${rideName}" added to park operations.`);
      setRideName('');
      setRideDetails('');
      await loadData();
    } catch (err) {
      setErrorMsg(formatApiError(err));
    }
  };

  const handleToggleMaintenance = async (rideId: number) => {
    clearAlerts();
    try {
      const updated = await apiFetch<Ride>(`/rides/${rideId}/maintenance`, { method: 'PATCH' });
      setSuccessMsg(
        `Ride "${updated.name}" is now ${updated.operational ? 'OPEN (Operational)' : 'CLOSED (In Maintenance)'}.`
      );
      await loadData();
    } catch (err) {
      setErrorMsg(formatApiError(err));
    }
  };

  const handleToggleShift = async (staffId: number) => {
    clearAlerts();
    try {
      const updated = await apiFetch<StaffMember>(`/staff/${staffId}/shift`, { method: 'PATCH' });
      setSuccessMsg(`${updated.fullName} shift status updated to ${updated.dutyStatus}.`);
      await loadData();
    } catch (err) {
      setErrorMsg(formatApiError(err));
    }
  };

  const handleAssignStation = async (staffId: number) => {
    clearAlerts();
    const newStation = stationEdits[staffId];
    if (!newStation || !newStation.trim()) {
      setErrorMsg('Please enter a station name before assigning.');
      return;
    }
    try {
      const updated = await apiFetch<StaffMember>(`/staff/${staffId}/station`, {
        method: 'PATCH',
        body: JSON.stringify({ assignedStation: newStation.trim() }),
      });
      setSuccessMsg(`${updated.fullName} assigned to "${updated.assignedStation}".`);
      setStationEdits(prev => ({ ...prev, [staffId]: '' }));
      await loadData();
    } catch (err) {
      setErrorMsg(formatApiError(err));
    }
  };

  // --- LOGIN VIEW ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <form
          onSubmit={handleLogin}
          className="bg-slate-900 border border-slate-800 p-8 rounded-xl w-full max-w-md space-y-4 shadow-xl"
        >
          <h1 className="text-2xl font-bold text-cyan-400">ParkPulse Web Console</h1>
          <p className="text-sm text-slate-400">Sign in with your staff credentials</p>

          {errorMsg && (
            <div data-testid="alert-error" className="bg-red-950 border border-red-700 text-red-200 p-3 rounded text-sm">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-sm mb-1 text-slate-300">Email</label>
            <input
              data-testid="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">Password</label>
            <input
              data-testid="login-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100"
              required
            />
          </div>

          <button
            data-testid="login-submit"
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 rounded transition"
          >
            Sign In
          </button>

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Demo Accounts (Password: Pass@1234):</p>
            <p>• Manager: omar.manager@parkpulse.com</p>
            <p>• Cashier: khaled.cashier@parkpulse.com</p>
            <p>• Operator: ahmed.operator@parkpulse.com</p>
          </div>
        </form>
      </div>
    );
  }

  const canManagePos = user.role === 'MANAGER' || user.role === 'CASHIER';
  const isManager = user.role === 'MANAGER';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Role-Aware Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold text-cyan-400">ParkPulse</h1>
          <div className="mt-1 mb-6">
            <p className="text-sm font-medium text-slate-200">{user.fullName}</p>
            <span
              data-testid="user-role-badge"
              className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded bg-cyan-950 text-cyan-300 border border-cyan-800"
            >
              {user.role}
            </span>
          </div>

          <nav className="space-y-1.5 text-sm">
            {canManagePos && (
              <button
                data-testid="nav-dashboard"
                onClick={() => { clearAlerts(); setTab('DASHBOARD'); }}
                className={`w-full text-left px-3 py-2 rounded transition ${tab === 'DASHBOARD' ? 'bg-cyan-600 font-semibold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                Overview Dashboard
              </button>
            )}

            {canManagePos && (
              <>
                <button
                  data-testid="nav-customers"
                  onClick={() => { clearAlerts(); setTab('CUSTOMERS'); }}
                  className={`w-full text-left px-3 py-2 rounded transition ${tab === 'CUSTOMERS' ? 'bg-cyan-600 font-semibold' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  Customers & Wallets
                </button>
                <button
                  data-testid="nav-pos"
                  onClick={() => { clearAlerts(); setTab('POS'); }}
                  className={`w-full text-left px-3 py-2 rounded transition ${tab === 'POS' ? 'bg-cyan-600 font-semibold' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  Ticketing & Top-Up POS
                </button>
                <button
                  data-testid="nav-food-pos"
                  onClick={() => { clearAlerts(); setTab('FOOD_POS'); }}
                  className={`w-full text-left px-3 py-2 rounded transition ${tab === 'FOOD_POS' ? 'bg-cyan-600 font-semibold' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  Food Court POS
                </button>
              </>
            )}

            <button
              data-testid="nav-rides"
              onClick={() => { clearAlerts(); setTab('RIDES'); }}
              className={`w-full text-left px-3 py-2 rounded transition ${tab === 'RIDES' ? 'bg-cyan-600 font-semibold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              Rides & Maintenance
            </button>

            {isManager && (
              <button
                data-testid="nav-staff"
                onClick={() => { clearAlerts(); setTab('STAFF'); }}
                className={`w-full text-left px-3 py-2 rounded transition ${tab === 'STAFF' ? 'bg-cyan-600 font-semibold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                Staff Duty & Stations
              </button>
            )}
          </nav>
        </div>

        <button
          data-testid="logout-btn"
          onClick={handleLogout}
          className="w-full bg-slate-800 hover:bg-red-900/80 border border-slate-700 py-2 rounded text-sm font-medium transition"
        >
          Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        {loading && (
          <div data-testid="loading-indicator" className="text-cyan-400 text-sm">
            Syncing park telemetry...
          </div>
        )}

        {errorMsg && (
          <div data-testid="alert-error" className="bg-red-950 border border-red-700 text-red-200 p-3 rounded text-sm">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div data-testid="alert-success" className="bg-emerald-950 border border-emerald-700 text-emerald-200 p-3 rounded text-sm">
            {successMsg}
          </div>
        )}

        {/* 1. OVERVIEW DASHBOARD */}
        {tab === 'DASHBOARD' && canManagePos && dashboard && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Live Operations Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-emerald-900/30 border border-emerald-700 p-4 rounded-lg">
                <div className="text-xs uppercase tracking-wider text-emerald-300">Total Revenue</div>
                <div data-testid="stat-revenue" className="text-2xl font-bold mt-1">
                  ${Number(dashboard.totalRevenue).toFixed(2)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Tickets: ${Number(dashboard.ticketRevenue).toFixed(2)} | Food: ${Number(dashboard.foodRevenue).toFixed(2)}
                </div>
              </div>

              <div className="bg-blue-900/30 border border-blue-700 p-4 rounded-lg">
                <div className="text-xs uppercase tracking-wider text-blue-300">Registered Visitors</div>
                <div data-testid="stat-customers" className="text-2xl font-bold mt-1">
                  {dashboard.registeredCustomers}
                </div>
              </div>

              <div className="bg-amber-900/30 border border-amber-700 p-4 rounded-lg">
                <div className="text-xs uppercase tracking-wider text-amber-300">Operational Rides</div>
                <div data-testid="stat-rides" className="text-2xl font-bold mt-1">
                  {dashboard.operationalRides} / {dashboard.totalRides}
                </div>
              </div>

              <div className="bg-purple-900/30 border border-purple-700 p-4 rounded-lg">
                <div className="text-xs uppercase tracking-wider text-purple-300">Staff Roster</div>
                <div data-testid="stat-staff" className="text-2xl font-bold mt-1">
                  {dashboard.activeStaffCount}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <h3 className="font-bold text-cyan-400 mb-3">Live System Audit Trail</h3>
              {dashboard.recentLogs.length === 0 ? (
                <p className="text-sm text-slate-400">No audit events recorded yet.</p>
              ) : (
                <div className="space-y-2 text-xs font-mono">
                  {dashboard.recentLogs.map(log => (
                    <div key={log.id} className="p-2 bg-slate-950 rounded border border-slate-800/80 flex justify-between">
                      <span>
                        <strong className="text-emerald-400">[{log.action}]</strong> {log.details}
                      </span>
                      <span className="text-slate-400">{log.actorEmail}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. CUSTOMERS & WALLETS */}
        {tab === 'CUSTOMERS' && canManagePos && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <h2 className="text-lg font-bold">Registered Visitors</h2>
                <div className="flex gap-2">
                  <input
                    data-testid="cust-search-input"
                    placeholder="Search name, email, phone..."
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm"
                  />
                  <button
                    data-testid="cust-search-btn"
                    onClick={() => loadData(customerSearch)}
                    className="bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 rounded text-sm font-medium"
                  >
                    Search
                  </button>
                </div>
              </div>

              <table data-testid="customers-table" className="w-full text-left text-sm">
                <thead className="text-cyan-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2">Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Balance</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        No customers found.
                      </td>
                    </tr>
                  ) : (
                    customers.map(c => (
                      <tr key={c.id} className="border-b border-slate-800/60">
                        <td className="py-2 font-medium">{c.fullName}</td>
                        <td className="text-slate-300">{c.email}</td>
                        <td className="text-slate-300">{c.phone}</td>
                        <td className="text-emerald-400 font-semibold">${Number(c.wristbandBalance).toFixed(2)}</td>
                        <td>{c.loyaltyPoints}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <form
              onSubmit={handleCreateCustomer}
              className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 h-fit"
            >
              <h3 className="font-bold text-cyan-400">Register New Customer</h3>
              <input
                data-testid="cust-name"
                placeholder="Full Name"
                value={custName}
                onChange={e => setCustName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                required
              />
              <input
                data-testid="cust-email"
                type="email"
                placeholder="Email"
                value={custEmail}
                onChange={e => setCustEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                required
              />
              <input
                data-testid="cust-phone"
                placeholder="Phone (8-15 digits)"
                value={custPhone}
                onChange={e => setCustPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                required
              />
              <div>
                <label className="block text-xs text-slate-400 mb-1">Initial Wristband Deposit ($)</label>
                <input
                  data-testid="cust-deposit"
                  type="number"
                  step="0.01"
                  value={custDeposit}
                  onChange={e => setCustDeposit(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                  required
                />
              </div>
              <button
                data-testid="cust-submit"
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded font-semibold text-sm"
              >
                Register Customer
              </button>
            </form>
          </div>
        )}

        {/* 3. TICKETING & WRISTBAND TOP-UP POS */}
        {tab === 'POS' && canManagePos && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-bold text-cyan-400">Issue Ticket Pass</h2>

              <div>
                <label className="block text-sm mb-1">Target Visitor</label>
                <select
                  data-testid="pos-customer-select"
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} (Bal: ${Number(c.wristbandBalance).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Pass Type</label>
                <select
                  data-testid="pos-pass-select"
                  value={passType}
                  onChange={e => setPassType(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                >
                  <option value="REGULAR">Regular Pass ($50.00)</option>
                  <option value="VIP_FASTPASS">VIP FastPass ($75.00)</option>
                  <option value="FAMILY">Family Pass ($160.00)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Promo Code (Optional)</label>
                <input
                  data-testid="pos-promo-input"
                  placeholder="e.g. SUMMER20"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  data-testid="pos-wristband-checkbox"
                  type="checkbox"
                  checked={payWithWristband}
                  onChange={e => setPayWithWristband(e.target.checked)}
                />
                Deduct payment from RFID Wristband Balance
              </label>

              <button
                data-testid="pos-issue-btn"
                onClick={handleIssueTicket}
                className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded font-semibold text-sm"
              >
                Issue Ticket Pass
              </button>
            </div>

            <form
              onSubmit={handleTopUp}
              className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4 h-fit"
            >
              <h2 className="text-xl font-bold text-emerald-400">Wristband Wallet Top-Up</h2>
              <p className="text-xs text-slate-400">
                Adds funds to the selected visitor&apos;s RFID wristband and awards 1 loyalty point per $20.
              </p>

              <div>
                <label className="block text-sm mb-1">Top-Up Amount ($)</label>
                <input
                  data-testid="pos-topup-input"
                  type="number"
                  step="0.01"
                  value={topupAmount}
                  onChange={e => setTopupAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                  required
                />
              </div>

              <button
                data-testid="pos-topup-btn"
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded font-semibold text-sm"
              >
                Top-Up Wristband
              </button>
            </form>
          </div>
        )}

        {/* 4. FOOD COURT POS */}
        {tab === 'FOOD_POS' && canManagePos && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
              <h2 className="text-lg font-bold text-cyan-400">Food & Beverage Menu</h2>
              <table data-testid="menu-table" className="w-full text-left text-sm">
                <thead className="text-cyan-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2">Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item.id} className="border-b border-slate-800/60">
                      <td className="py-2 font-medium">{item.name}</td>
                      <td className="text-slate-400">{item.subCategory}</td>
                      <td>${Number(item.price).toFixed(2)}</td>
                      <td>
                        <button
                          data-testid={`add-menu-${item.id}`}
                          onClick={() => addToCart(item)}
                          className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-xs font-semibold"
                        >
                          + Add
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
              <h2 className="text-lg font-bold text-emerald-400">Current Order Cart</h2>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Customer</label>
                <select
                  data-testid="food-customer-select"
                  value={foodCustomerId}
                  onChange={e => setFoodCustomerId(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} (Bal: ${Number(c.wristbandBalance).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {cart.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center border border-dashed border-slate-800 rounded">
                  Cart is empty. Select items from the menu.
                </p>
              ) : (
                <div className="space-y-2">
                  {cart.map(entry => (
                    <div
                      key={entry.item.id}
                      className="flex justify-between items-center bg-slate-800/70 px-3 py-2 rounded text-sm"
                    >
                      <span>
                        {entry.item.name} × {entry.quantity} ($
                        {(Number(entry.item.price) * entry.quantity).toFixed(2)})
                      </span>
                      <button
                        onClick={() => removeFromCart(entry.item.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-sm text-slate-400">Subtotal:</span>
                <span data-testid="food-cart-total" className="text-lg font-bold text-emerald-400">
                  ${cartSubtotal.toFixed(2)}
                </span>
              </div>

              <input
                data-testid="food-promo-input"
                placeholder="Promo Code (Optional)"
                value={foodPromoCode}
                onChange={e => setFoodPromoCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  data-testid="food-wristband-checkbox"
                  type="checkbox"
                  checked={foodPayWristband}
                  onChange={e => setFoodPayWristband(e.target.checked)}
                />
                Pay with RFID Wristband Balance
              </label>

              <button
                data-testid="food-checkout-btn"
                onClick={handleFoodCheckout}
                className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded font-semibold text-sm"
              >
                Checkout Food Order
              </button>
            </div>
          </div>
        )}

        {/* 5. RIDES & MAINTENANCE (All Roles Can View & Toggle Maintenance; Only Manager Can Add Rides) */}
        {tab === 'RIDES' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${isManager ? 'lg:col-span-2' : 'lg:col-span-3'} bg-slate-900 border border-slate-800 rounded-lg p-4`}>
              <h2 className="text-lg font-bold mb-4">Rides Operations & Safety</h2>
              <table data-testid="rides-table" className="w-full text-left text-sm">
                <thead className="text-cyan-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2">Ride</th>
                    <th>Category</th>
                    <th>Capacity</th>
                    <th>Min Age / Height</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map(r => (
                    <tr key={r.id} className="border-b border-slate-800/60">
                      <td className="py-2 font-medium">{r.name}</td>
                      <td className="text-slate-300">{r.category}</td>
                      <td>{r.capacity}</td>
                      <td className="text-slate-300">
                        {r.minAge} yrs / {Number(r.minHeightM).toFixed(2)}m
                      </td>
                      <td>
                        <span
                          data-testid={`ride-status-${r.id}`}
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            r.operational
                              ? 'bg-emerald-900 text-emerald-200'
                              : 'bg-red-900 text-red-200'
                          }`}
                        >
                          {r.operational ? 'OPEN' : 'MAINTENANCE'}
                        </span>
                      </td>
                      <td>
                        <button
                          data-testid={`toggle-maint-${r.id}`}
                          onClick={() => handleToggleMaintenance(r.id)}
                          className="bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded text-xs font-semibold"
                        >
                          Toggle Maintenance
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isManager && (
              <form
                onSubmit={handleCreateRide}
                className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 h-fit"
              >
                <h3 className="font-bold text-cyan-400">Add New Attraction (Manager)</h3>
                <input
                  data-testid="ride-name"
                  placeholder="Ride Name"
                  value={rideName}
                  onChange={e => setRideName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                  required
                />
                <select
                  data-testid="ride-category"
                  value={rideCategory}
                  onChange={e => setRideCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                >
                  <option value="ROLLER_COASTER">Roller Coaster</option>
                  <option value="HORROR">Horror / Thrill</option>
                  <option value="KIDS">Kids Ride</option>
                  <option value="WATER">Water Ride</option>
                  <option value="FAMILY">Family Ride</option>
                </select>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-slate-400">Capacity</label>
                    <input
                      data-testid="ride-capacity"
                      type="number"
                      value={rideCapacity}
                      onChange={e => setRideCapacity(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400">Min Age</label>
                    <input
                      data-testid="ride-min-age"
                      type="number"
                      value={rideMinAge}
                      onChange={e => setRideMinAge(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400">Height (m)</label>
                    <input
                      data-testid="ride-min-height"
                      type="number"
                      step="0.05"
                      value={rideMinHeight}
                      onChange={e => setRideMinHeight(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm"
                      required
                    />
                  </div>
                </div>
                <input
                  data-testid="ride-details"
                  placeholder="Details (optional)"
                  value={rideDetails}
                  onChange={e => setRideDetails(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                />
                <button
                  data-testid="ride-submit"
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded font-semibold text-sm"
                >
                  Create Ride
                </button>
              </form>
            )}
          </div>
        )}

        {/* 6. STAFF DUTY & STATION ASSIGNMENTS (Manager Only) */}
        {tab === 'STAFF' && isManager && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h2 className="text-lg font-bold mb-4">Staff Duty & Station Assignments</h2>
            <table data-testid="staff-table" className="w-full text-left text-sm">
              <thead className="text-cyan-400 border-b border-slate-800">
                <tr>
                  <th className="py-2">Name</th>
                  <th>Role</th>
                  <th>Current Station</th>
                  <th>Status</th>
                  <th>Reassign Station</th>
                  <th>Shift</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id} className="border-b border-slate-800/60">
                    <td className="py-2 font-medium">{s.fullName}</td>
                    <td className="text-slate-300">{s.role}</td>
                    <td>{s.assignedStation}</td>
                    <td>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          s.dutyStatus === 'ON_DUTY'
                            ? 'bg-emerald-900 text-emerald-200'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {s.dutyStatus}
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1.5">
                        <input
                          data-testid={`station-input-${s.id}`}
                          placeholder="New station..."
                          value={stationEdits[s.id] || ''}
                          onChange={e =>
                            setStationEdits(prev => ({ ...prev, [s.id]: e.target.value }))
                          }
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs"
                        />
                        <button
                          data-testid={`assign-station-${s.id}`}
                          onClick={() => handleAssignStation(s.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 rounded text-xs font-semibold"
                        >
                          Save
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        data-testid={`toggle-shift-${s.id}`}
                        onClick={() => handleToggleShift(s.id)}
                        className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-xs font-semibold"
                      >
                        Toggle Shift
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}