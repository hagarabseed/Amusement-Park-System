import React, { useCallback, useEffect, useState } from 'react';
import { apiFetch, formatApiError, setUnauthorizedHandler } from './api/client';
import { AppShell } from './components/layout/AppShell';
import { AlertBanner } from './components/ui/AlertBanner';
import { LoginView } from './features/auth/LoginView';
import { CustomerLoginView } from './features/portal/CustomerLoginView';
import { CustomerRegisterView } from './features/portal/CustomerRegisterView';
import { TicketBookingView } from './features/portal/TicketBookingView';
import { CatalogGovernanceView } from './features/catalog/CatalogGovernanceView';
import { CustomersView } from './features/customers/CustomersView';
import { DashboardView } from './features/dashboard/DashboardView';
import { FoodPosView } from './features/food/FoodPosView';
import { TicketingPosView } from './features/pos/TicketingPosView';
import { RidesView } from './features/rides/RidesView';
import { StaffView } from './features/staff/StaffView';
import { TransactionsView } from './features/transactions/TransactionsView';
import {
  AuthUser,
  Customer,
  MenuItem,
  Offer,
  PageResponse,
  PersonalDashboard,
  PosCatalog,
  Ride,
  StaffMember,
  Tab,
} from './types';

const EMPTY_CUSTOMER_PAGE: PageResponse<Customer> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 10,
};

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('pp_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [tab, setTab] = useState<Tab>('DASHBOARD');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 'staff-login' | 'customer-login' | 'customer-register'
  const [authScreen, setAuthScreen] = useState<'staff-login' | 'customer-login' | 'customer-register'>('staff-login');

  const [dashboard, setDashboard] = useState<PersonalDashboard | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [customersPage, setCustomersPage] = useState<PageResponse<Customer>>(EMPTY_CUSTOMER_PAGE);
  const [customerSearch, setCustomerSearch] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [posCatalog, setPosCatalog] = useState<PosCatalog | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);

  const clearAlerts = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('pp_token');
    localStorage.removeItem('pp_user');
    setUser(null);
    setDashboard(null);
    setCustomersPage(EMPTY_CUSTOMER_PAGE);
    setAuthScreen('staff-login');
    clearAlerts();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(handleLogout);
  }, [handleLogout]);

  const loadData = useCallback(
    async (searchQuery = customerSearch, pageNum = 0) => {
      if (!user) return;
      // Customers have their own portal shell — no staff data to load
      if (user.role === 'CUSTOMER') return;
      setLoading(true);
      try {
        const [dash, rideList] = await Promise.all([
          apiFetch<PersonalDashboard>('/dashboard'),
          apiFetch<Ride[]>('/rides'),
        ]);
        setDashboard(dash);
        setRides(rideList);

        if (user.role === 'MANAGER' || user.role === 'CASHIER') {
          const params = new URLSearchParams();
          params.set('page', String(pageNum));
          params.set('size', '10');
          if (searchQuery.trim()) params.set('q', searchQuery.trim());

          const [custPage, menu, catalog] = await Promise.all([
            apiFetch<PageResponse<Customer>>(`/customers?${params.toString()}`),
            apiFetch<MenuItem[]>('/menu'),
            apiFetch<PosCatalog>('/pos/catalog'),
          ]);
          setCustomersPage(custPage);
          setMenuItems(menu);
          setPosCatalog(catalog);
        }

        if (user.role === 'MANAGER') {
          const [staffList, offerList, fullMenu] = await Promise.all([
            apiFetch<StaffMember[]>('/staff'),
            apiFetch<Offer[]>('/pos/offers'),
            apiFetch<MenuItem[]>('/menu?includeUnavailable=true'),
          ]);
          setStaff(staffList);
          setOffers(offerList);
          setAllMenuItems(fullMenu);
        }
      } catch (err) {
        setErrorMsg(formatApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [user, customerSearch]
  );

  useEffect(() => {
    if (user) {
      loadData(customerSearch, 0);
    }
  }, [user]);

  const handleToggleMaintenance = async (rideId: number, reason?: string) => {
    clearAlerts();
    try {
      const updated = await apiFetch<Ride>(`/rides/${rideId}/maintenance`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: reason ?? null }),
      });
      await loadData(customerSearch, customersPage.number);
      setSuccessMsg(
        `Ride "${updated.name}" is now ${updated.operational ? 'OPEN (Operational)' : 'CLOSED (Maintenance)'}.`
      );
    } catch (err) {
      setErrorMsg(formatApiError(err));
    }
  };

  if (!user) {
    // Customer portal – booking
    if (authScreen === 'customer-login') {
      return (
        <CustomerLoginView
          onLoginSuccess={loggedInUser => {
            setUser(loggedInUser);
            clearAlerts();
          }}
          onSwitchToRegister={() => setAuthScreen('customer-register')}
          onBack={() => setAuthScreen('staff-login')}
        />
      );
    }
    if (authScreen === 'customer-register') {
      return (
        <CustomerRegisterView
          onRegisterSuccess={loggedInUser => {
            setUser(loggedInUser);
            clearAlerts();
          }}
          onSwitchToLogin={() => setAuthScreen('customer-login')}
          onBack={() => setAuthScreen('staff-login')}
        />
      );
    }

    // Default: staff login with link to guest portal
    return (
      <div>
        <LoginView
          onLoginSuccess={loggedInUser => {
            setUser(loggedInUser);
            setTab('DASHBOARD');
            clearAlerts();
          }}
        />
        {/* Guest portal entry point */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setAuthScreen('customer-login')}
            className="flex items-center gap-2 bg-[#e94560] hover:bg-[#d63651] text-white text-sm font-bold px-5 py-3 rounded-full shadow-xl shadow-[#e94560]/30 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Guest Portal — Book Tickets
          </button>
        </div>
      </div>
    );
  }

  // ── Customer portal shell ────────────────────────────────────────────────
  if (user.role === 'CUSTOMER') {
    return (
      <TicketBookingView
        fullName={user.fullName}
        onLogout={handleLogout}
      />
    );
  }

  const canManagePos = user.role === 'MANAGER' || user.role === 'CASHIER';
  const isManager = user.role === 'MANAGER';

  return (
    <AppShell
      user={user}
      dashboard={dashboard}
      activeTab={tab}
      loading={loading}
      onSelectTab={nextTab => {
        clearAlerts();
        setTab(nextTab);
      }}
      onRefresh={() => loadData(customerSearch, customersPage.number)}
      onLogout={handleLogout}
    >
      <AlertBanner errorMsg={errorMsg} successMsg={successMsg} onDismiss={clearAlerts} />

      {tab === 'DASHBOARD' && dashboard && (
        <DashboardView
          dashboard={dashboard}
          rides={rides}
          onNavigate={next => {
            clearAlerts();
            setTab(next);
          }}
          onToggleMaintenance={handleToggleMaintenance}
        />
      )}

      {tab === 'CUSTOMERS' && canManagePos && (
        <CustomersView
          customersPage={customersPage}
          searchQuery={customerSearch}
          onSearchChange={setCustomerSearch}
          onSearchSubmit={(q, p = 0) => loadData(q, p)}
          onCustomerCreated={msg => {
            setErrorMsg(null);
            setSuccessMsg(msg);
          }}
          onError={msg => {
            setSuccessMsg(null);
            setErrorMsg(msg);
          }}
          onRefreshAll={() => loadData(customerSearch, customersPage.number)}
        />
      )}

      {tab === 'POS' && canManagePos && (
        <TicketingPosView
          customers={customersPage.content}
          catalog={posCatalog}
          onSuccess={msg => {
            setErrorMsg(null);
            setSuccessMsg(msg);
          }}
          onError={msg => {
            setSuccessMsg(null);
            setErrorMsg(msg);
          }}
          onRefreshAll={() => loadData(customerSearch, customersPage.number)}
        />
      )}

      {tab === 'FOOD_POS' && canManagePos && (
        <FoodPosView
          customers={customersPage.content}
          menuItems={menuItems}
          onSuccess={msg => {
            setErrorMsg(null);
            setSuccessMsg(msg);
          }}
          onError={msg => {
            setSuccessMsg(null);
            setErrorMsg(msg);
          }}
          onRefreshAll={() => loadData(customerSearch, customersPage.number)}
        />
      )}

      {tab === 'TRANSACTIONS' && canManagePos && (
        <TransactionsView
          onError={msg => {
            setSuccessMsg(null);
            setErrorMsg(msg);
          }}
        />
      )}

      {tab === 'RIDES' && (
        <RidesView
          rides={rides}
          isManager={isManager}
          onSuccess={msg => {
            setErrorMsg(null);
            setSuccessMsg(msg);
          }}
          onError={msg => {
            setSuccessMsg(null);
            setErrorMsg(msg);
          }}
          onRefreshAll={() => loadData(customerSearch, customersPage.number)}
        />
      )}

      {tab === 'STAFF' && isManager && (
        <StaffView
          staff={staff}
          rides={rides}
          onSuccess={msg => {
            setErrorMsg(null);
            setSuccessMsg(msg);
          }}
          onError={msg => {
            setSuccessMsg(null);
            setErrorMsg(msg);
          }}
          onRefreshAll={() => loadData(customerSearch, customersPage.number)}
        />
      )}

      {tab === 'CATALOG' && isManager && (
        <CatalogGovernanceView
          offers={offers}
          allMenuItems={allMenuItems}
          onSuccess={msg => {
            setErrorMsg(null);
            setSuccessMsg(msg);
          }}
          onError={msg => {
            setSuccessMsg(null);
            setErrorMsg(msg);
          }}
          onRefreshAll={() => loadData(customerSearch, customersPage.number)}
        />
      )}
    </AppShell>
  );
}
