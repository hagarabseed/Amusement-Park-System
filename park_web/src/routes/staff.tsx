import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  FileBarChart2,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageSquare,
  Minus,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  Wallet as WalletIcon,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Stars } from "@/components/guest-frame";
import { Button, Chip, FieldLabel, StatusPill } from "@/components/ui";
import { WeekChart } from "@/components/week-chart";
import {
  DEMO_PASSWORD,
  FOOD,
  NAV,
  RIDES,
  ROLES,
  ROSTER_LABEL,
  SKUS,
  TICKETS,
  egp,
  landingFor,
  quote,
  skuById,
  stampLabel,
  viewsFor,
  type RoleId,
  type ViewId,
} from "@/lib/park";
import { evaluateGate, usePark } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/staff")({
  head: () => ({ meta: [{ title: "Pulse Ops Console · Sunset Park" }] }),
  component: StaffPage,
});

const ROLE_EMAILS: Record<RoleId, string> = {
  manager: "omar.manager@parkpulse.com",
  cashier: "khaled.cashier@parkpulse.com",
  operator: "ahmed.operator@parkpulse.com",
};

const VIEW_ICONS: Record<ViewId, typeof LayoutDashboard> = {
  overview: LayoutDashboard,
  pos: ShoppingBag,
  gates: QrCode,
  wallets: WalletIcon,
  feedback: MessageSquare,
  reports: FileBarChart2,
  maintenance: Wrench,
  shifts: ClipboardCheck,
  staff: Users,
};

function StaffPage() {
  const role = usePark((state) => state.staffRole);
  const hydrated = usePark((state) => state.hydrated);
  if (!hydrated) return <div className="min-h-screen bg-bg" />;
  return role ? <Console role={role} /> : <RolePicker />;
}

/* -------------------------------------------------------------------------- */
/*                               1. SIGN-IN GATE                              */
/* -------------------------------------------------------------------------- */

function RolePicker() {
  const signInStaff = usePark((state) => state.signInStaff);
  const inside = usePark((state) => state.guestsInside);
  const revenue = usePark((state) => state.revenueToday);
  const uptime = usePark((state) => state.fleetUptime);

  const [selectedRole, setSelectedRole] = useState<RoleId>("manager");
  const [email, setEmail] = useState(ROLE_EMAILS.manager);
  const [password, setPassword] = useState(DEMO_PASSWORD);

  function selectDemoRole(id: RoleId) {
    setSelectedRole(id);
    setEmail(ROLE_EMAILS[id]);
    setPassword(DEMO_PASSWORD);
  }

  function handleSignIn(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) {
      toast.error("Enter a workspace email or select a demo role.");
      return;
    }
    if (password !== DEMO_PASSWORD) {
      toast.error(`Invalid demo password. Use ${DEMO_PASSWORD}`);
      return;
    }
    const matched = (Object.keys(ROLE_EMAILS) as RoleId[]).find(
      (id) => ROLE_EMAILS[id].toLowerCase() === email.trim().toLowerCase(),
    );
    signInStaff(matched ?? selectedRole);
  }

  return (
    <div className="min-h-screen bg-bg text-fg lg:grid lg:grid-cols-[1.08fr_1fr]">
      {/* Left Hero Column */}
      <div className="flex flex-col justify-between border-b border-line bg-bg-2 p-6 sm:p-10 lg:border-r lg:border-b-0 lg:p-14">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-cyan font-black text-photo-ink">
              P
            </span>
            <div>
              <p className="font-extrabold tracking-tight">Pulse</p>
              <p className="text-[11px] font-semibold tracking-[0.16em] text-faint uppercase">
                Ops Console · Cairo
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted transition hover:border-line-strong hover:text-fg"
          >
            Guest portal
            <ExternalLink className="size-3.5" />
          </Link>
        </div>

        <div className="my-10 max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-cyan">
            <Sparkles className="size-3.5" />
            Sunset Park · Live Operations
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
            One control room for every ride, till and wristband.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Monitor live queue pressure, clear guests at boarding gates, settle POS baskets, and coordinate shift handovers across Sunset Park.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
            <div className="card p-4">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-faint uppercase">
                Guests Inside
              </p>
              <p className="mt-1.5 text-2xl font-extrabold tabular-nums">
                {inside.toLocaleString("en-US")}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-faint uppercase">
                Revenue Today
              </p>
              <p className="mt-1.5 text-2xl font-extrabold text-cyan tabular-nums">
                EGP {(revenue / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="card p-4">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-faint uppercase">
                Ride Uptime
              </p>
              <p className="mt-1.5 text-2xl font-extrabold text-ok tabular-nums">
                {uptime}%
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-faint">
          Demo environment · All transactions and gate scans persist locally in this browser.
        </p>
      </div>

      {/* Right Workspace Sign-In Column */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Sign in to your workspace
            </h2>
            <p className="mt-1 text-sm text-muted">
              Choose a role preset below or sign in directly to launch the console.
            </p>
          </div>

          <div className="space-y-2.5">
            {(Object.keys(ROLES) as RoleId[]).map((id) => {
              const r = ROLES[id];
              const active = selectedRole === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => selectDemoRole(id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-2xl border p-3.5 text-left transition",
                    active
                      ? "border-cyan bg-surface-2"
                      : "border-line bg-surface hover:border-line-strong",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-xl text-sm font-extrabold",
                        active ? "bg-cyan text-photo-ink" : "bg-surface-2 text-cyan",
                      )}
                    >
                      {r.initials}
                    </span>
                    <div>
                      <p className="text-sm font-bold leading-tight">{r.title}</p>
                      <p className="text-xs text-faint">
                        {r.name} · {ROLE_EMAILS[id]}
                      </p>
                    </div>
                  </div>
                  <StatusPill tone={active ? "ok" : "muted"}>
                    {active ? "Selected" : "Preset"}
                  </StatusPill>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSignIn} className="card space-y-4 p-5">
            <label className="block">
              <FieldLabel>Work email</FieldLabel>
              <input
                type="email"
                className="field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block">
              <FieldLabel>Password</FieldLabel>
              <input
                type="password"
                className="field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <Button type="submit" className="w-full">
              Continue as {ROLES[selectedRole].title}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             2. WORKSPACE SHELL                             */
/* -------------------------------------------------------------------------- */

function Console({ role }: { role: RoleId }) {
  const signOutStaff = usePark((state) => state.signOutStaff);
  const switchStaff = usePark((state) => state.switchStaff);
  const notices = usePark((state) => state.notices);
  const markRead = usePark((state) => state.markNoticesRead);
  const rides = usePark((state) => state.rides);

  const allowed = viewsFor(role);
  const [view, setView] = useState<ViewId>(landingFor(role));
  const [showNotices, setShowNotices] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    if (!allowed.includes(view)) setView(landingFor(role));
  }, [allowed, view, role]);

  const unread = notices.filter((notice) => !notice.read).length;
  const me = ROLES[role];
  const openRidesCount = Object.values(rides).filter((r) => r.status === "open").length;
  const activeNavLabel =
    NAV.flatMap((group) => group.items).find((item) => item.id === view)?.label ?? "Console";

  return (
    <div className="min-h-screen bg-bg text-fg lg:grid lg:grid-cols-[268px_1fr]">
      {/* Left Sidebar */}
      <aside className="flex flex-col justify-between border-b border-line bg-bg-2 p-4 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r lg:border-b-0">
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-cyan font-black text-photo-ink">
                P
              </span>
              <div>
                <p className="text-sm font-extrabold leading-tight">Pulse</p>
                <p className="text-[10px] font-semibold tracking-[0.16em] text-faint uppercase">
                  Ops Console · Cairo
                </p>
              </div>
            </div>
          </div>

          {/* Park Status Card */}
          <div className="mt-4 rounded-2xl border border-line bg-surface p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-ok">
              <span className="size-2 rounded-full bg-ok" />
              Park open · until 23:00
            </div>
            <p className="mt-1 text-xs text-faint">
              {openRidesCount} of {RIDES.length} rides running
            </p>
          </div>

          {/* Grouped Navigation */}
          <nav className="mt-5 space-y-5" aria-label="Console sections">
            {NAV.map((group) => {
              const items = group.items.filter((item) => item.roles.includes(role));
              if (!items.length) return null;
              return (
                <div key={group.group}>
                  <p className="mb-1.5 px-2 text-[10px] font-semibold tracking-[0.16em] text-faint uppercase">
                    {group.group}
                  </p>
                  <div className="flex flex-wrap gap-1 lg:block lg:space-y-1">
                    {items.map((item) => {
                      const Icon = VIEW_ICONS[item.id];
                      const isActive = view === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setView(item.id)}
                          className={cn(
                            "flex min-h-10 w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold transition",
                            isActive
                              ? "bg-surface-2 text-cyan"
                              : "text-muted hover:bg-surface hover:text-fg",
                          )}
                        >
                          <Icon className="size-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div>
              <p className="mb-1.5 px-2 text-[10px] font-semibold tracking-[0.16em] text-faint uppercase">
                Guest Portal
              </p>
              <Link
                to="/"
                className="flex min-h-10 w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-muted transition hover:bg-surface hover:text-fg"
              >
                <span>Open guest site</span>
                <ExternalLink className="size-3.5 text-faint" />
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom Active User Card */}
        <div className="mt-6 border-t border-line pt-4">
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-surface p-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-xs font-extrabold text-cyan">
                {me.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold leading-tight">{me.name}</p>
                <p className="truncate text-[11px] text-faint">{me.title}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={signOutStaff}
              title="Sign out"
              aria-label="Sign out"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-faint transition hover:bg-surface-2 hover:text-fg"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-col">
        {/* Top Utility Header */}
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-faint">Sunset Park</span>
            <span className="text-faint">/</span>
            <span className="font-bold text-fg">{activeNavLabel}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted sm:inline-flex">
              <span className="size-1.5 rounded-full bg-ok" />
              Fri 27 Nov · Live
            </span>

            {/* Alerts Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowNotices((v) => !v);
                  setShowRoleMenu(false);
                  if (showNotices) markRead();
                }}
                aria-label="Alerts"
                className="relative grid size-9 place-items-center rounded-xl border border-line bg-surface text-muted transition hover:border-line-strong hover:text-fg"
              >
                <Bell className="size-4" />
                {unread > 0 ? (
                  <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-rose text-[10px] font-bold text-photo-ink">
                    {unread}
                  </span>
                ) : null}
              </button>

              {showNotices ? (
                <div className="card absolute right-0 z-30 mt-2 w-80 max-w-[85vw] p-3 shadow-xl">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <p className="text-xs font-bold tracking-wider text-faint uppercase">
                      Live Alerts
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        markRead();
                        setShowNotices(false);
                      }}
                      className="text-xs font-semibold text-cyan hover:underline"
                    >
                      Mark read
                    </button>
                  </div>
                  <ul className="divide-y divide-line">
                    {notices.slice(0, 6).map((notice) => (
                      <li key={notice.id} className="px-1 py-2.5 text-xs">
                        <p className="font-medium text-fg">{notice.text}</p>
                        <p className="mt-0.5 text-[11px] text-faint">
                          {stampLabel(notice.at)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowRoleMenu((v) => !v);
                  setShowNotices(false);
                }}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-bold transition hover:border-line-strong"
              >
                <span className="text-cyan">{me.title}</span>
                <ChevronDown className="size-3.5 text-faint" />
              </button>

              {showRoleMenu ? (
                <div className="card absolute right-0 z-30 mt-2 w-60 p-2 shadow-xl">
                  <p className="px-2 py-1 text-[10px] font-semibold tracking-wider text-faint uppercase">
                    Switch Role
                  </p>
                  {(Object.keys(ROLES) as RoleId[]).map((id) => {
                    const item = ROLES[id];
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          switchStaff(id);
                          setShowRoleMenu(false);
                          toast.success(`Switched to ${item.title}`);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition",
                          role === id
                            ? "bg-surface-2 text-cyan"
                            : "text-muted hover:bg-surface hover:text-fg",
                        )}
                      >
                        <div>
                          <p>{item.title}</p>
                          <p className="text-[11px] font-normal text-faint">{item.name}</p>
                        </div>
                        {role === id ? <CheckCircle2 className="size-3.5 text-cyan" /> : null}
                      </button>
                    );
                  })}
                  <div className="my-1 border-t border-line" />
                  <Link
                    to="/"
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-muted hover:bg-surface hover:text-fg"
                  >
                    <span>Guest portal</span>
                    <ExternalLink className="size-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={signOutStaff}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-rose hover:bg-surface"
                  >
                    <span>Sign out of demo</span>
                    <LogOut className="size-3.5" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {/* Active Console View */}
        <main className="min-w-0 flex-1 p-4 md:p-8">
          {view === "overview" ? <Overview /> : null}
          {view === "pos" ? <Pos /> : null}
          {view === "gates" ? <Gates /> : null}
          {view === "wallets" ? <Wallets /> : null}
          {view === "feedback" ? <Feedback /> : null}
          {view === "reports" ? <Reports /> : null}
          {view === "maintenance" ? <Maintenance /> : null}
          {view === "shifts" ? <Shifts /> : null}
          {view === "staff" ? <Catalog /> : null}
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              SHARED UI HELPERS                             */
/* -------------------------------------------------------------------------- */

function Panel({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-extrabold tracking-tight">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-faint">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Stat({
  label,
  value,
  delta,
  tone = "ok",
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "ok" | "warn" | "muted";
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-faint uppercase">
          {label}
        </p>
        {delta ? <StatusPill tone={tone}>{delta}</StatusPill> : null}
      </div>
      <p className="mt-2 text-2xl font-extrabold tabular-nums">{value}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 3. OVERVIEW                                */
/* -------------------------------------------------------------------------- */

function Overview() {
  const revenue = usePark((state) => state.revenueToday);
  const inside = usePark((state) => state.guestsInside);
  const rides = usePark((state) => state.rides);
  const wallets = usePark((state) => state.wallets);
  const channels = usePark((state) => state.channels);
  const settlements = usePark((state) => state.settlements);
  const maintenance = usePark((state) => state.maintenance);

  const [range, setRange] = useState<"7d" | "14d">("7d");

  const walletFloat = wallets.reduce((sum, w) => sum + w.balance, 0);
  const openRides = Object.values(rides).filter((r) => r.status === "open");
  const avgWait = openRides.length
    ? Math.round(openRides.reduce((sum, r) => sum + r.wait, 0) / openRides.length)
    : 0;
  const totalChannels = Object.values(channels).reduce((sum, v) => sum + v, 0) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Operations Overview
          </h1>
          <p className="text-sm text-muted">
            Live revenue mix, gate flow, and active park alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-line bg-surface p-1">
            <Chip active={range === "7d"} onClick={() => setRange("7d")}>
              7 days
            </Chip>
            <Chip active={range === "14d"} onClick={() => setRange("14d")}>
              14 days
            </Chip>
          </div>
          <Button
            variant="soft"
            onClick={() =>
              downloadCsv("sunset-park-transactions.csv", [
                ["ID", "Guest / Channel", "Detail", "Amount"],
                ...settlements.map((s) => [s.id, s.who, s.detail, s.amount]),
              ])
            }
          >
            <Download className="size-4" />
            Export transactions
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue Today" value={egp(revenue)} delta="+12.4%" tone="ok" />
        <Stat
          label="Admissions"
          value={inside.toLocaleString("en-US")}
          delta="Live count"
          tone="ok"
        />
        <Stat
          label="Wallet Float"
          value={egp(walletFloat)}
          delta={`${wallets.length} bands`}
          tone="muted"
        />
        <Stat
          label="Avg. Queue Wait"
          value={`${avgWait} min`}
          delta={`${openRides.length}/${RIDES.length} open`}
          tone={avgWait > 25 ? "warn" : "ok"}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Revenue mix"
          subtitle={`Channel distribution (${range === "7d" ? "Last 7 days" : "Last 14 days"})`}
        >
          <ul className="space-y-4">
            {Object.entries(channels).map(([name, value]) => {
              const pct = Math.round((value / totalChannels) * 100);
              return (
                <li key={name}>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold capitalize">{name}</span>
                    <span className="font-bold tabular-nums">
                      {egp(value)}{" "}
                      <span className="font-normal text-faint">({pct}%)</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-cyan transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Gate flow" subtitle="Hourly & weekly turnstile throughput (hundreds)">
          <WeekChart />
        </Panel>
      </div>

      {/* Bottom 3-Column Operations Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr_1fr]">
        <Panel title="Latest transactions" subtitle="Real-time POS & online settlements">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] text-faint uppercase">
                <tr>
                  <th className="py-2">Ref</th>
                  <th>Guest</th>
                  <th>Channel</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {settlements.slice(0, 6).map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 font-mono text-xs text-faint">{item.id}</td>
                    <td className="font-semibold">{item.who}</td>
                    <td className="text-xs text-muted">{item.channel}</td>
                    <td className="text-right font-bold text-cyan tabular-nums">
                      {egp(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Queue pressure" subtitle="Live ride wait times">
          <ul className="space-y-3">
            {RIDES.map((ride) => {
              const live = rides[ride.id];
              const isOpen = live?.status === "open";
              const wait = isOpen ? live.wait : 0;
              const pct = Math.min(100, Math.round((wait / 45) * 100));
              return (
                <li key={ride.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">{ride.name}</span>
                    <span className="font-bold tabular-nums text-muted">
                      {isOpen ? `${wait} min` : live?.status}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        !isOpen
                          ? "bg-rose"
                          : wait > 25
                            ? "bg-amber-400"
                            : "bg-cyan",
                      )}
                      style={{ width: isOpen ? `${pct}%` : "100%" }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Needs attention" subtitle="Active operational flags">
          <ul className="space-y-2.5">
            {RIDES.filter((r) => rides[r.id]?.status !== "open").map((ride) => (
              <li
                key={ride.id}
                className="flex items-start gap-2.5 rounded-2xl border border-line bg-surface-2 p-3 text-xs"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose" />
                <div>
                  <p className="font-bold">{ride.name} offline</p>
                  <p className="text-faint">
                    Status: {rides[ride.id]?.status} · {ride.zone}
                  </p>
                </div>
              </li>
            ))}
            {maintenance
              .filter((m) => m.status !== "closed")
              .slice(0, 2)
              .map((ticket) => (
                <li
                  key={ticket.id}
                  className="flex items-start gap-2.5 rounded-2xl border border-line bg-surface-2 p-3 text-xs"
                >
                  <Wrench className="mt-0.5 size-4 shrink-0 text-amber-400" />
                  <div>
                    <p className="font-bold">{ticket.title}</p>
                    <p className="text-faint">
                      {ticket.id} · {ticket.severity} priority
                    </p>
                  </div>
                </li>
              ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             4. TICKETING & POS                             */
/* -------------------------------------------------------------------------- */

function Pos() {
  const tab = usePark((state) => state.posTab);
  const setTab = usePark((state) => state.setPosTab);
  const basket = usePark((state) => state.basket);
  const catalog = usePark((state) => state.catalog);
  const addToBasket = usePark((state) => state.addToBasket);
  const setQty = usePark((state) => state.setBasketQty);
  const promoInput = usePark((state) => state.promoInput);
  const promoApplied = usePark((state) => state.promoApplied);
  const setPromoInput = usePark((state) => state.setPromoInput);
  const applyPromo = usePark((state) => state.applyPromo);
  const payMethod = usePark((state) => state.payMethod);
  const setPayMethod = usePark((state) => state.setPayMethod);
  const tendered = usePark((state) => state.tendered);
  const setTendered = usePark((state) => state.setTendered);
  const recordSale = usePark((state) => state.recordSale);
  const newSale = usePark((state) => state.newSale);
  const [rfid, setRfid] = useState("RFID-88A4-19C2");

  const items = (tab === "ticket" ? TICKETS : FOOD).filter(
    (sku) => catalog[sku.id] !== false,
  );
  const lines = basket.filter((line) => line.qty > 0);
  const subtotal = lines.reduce(
    (sum, line) => sum + (skuById(line.id)?.price ?? 0) * line.qty,
    0,
  );
  const priced = quote(subtotal, promoApplied ? 0.1 : 0);

  function charge() {
    const result = recordSale(rfid);
    if (result.ok) toast.success(result.message ?? "Sale recorded");
    else toast.error(result.error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Ticketing & POS
        </h1>
        <p className="text-sm text-muted">
          Issue gate passes, combos, and charge guest wristbands.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Panel
          title="Point of Sale Catalogue"
          subtitle="Tap to add items to the current till basket"
          action={
            <div className="flex gap-1.5 rounded-xl border border-line bg-surface p-1">
              <Chip active={tab === "ticket"} onClick={() => setTab("ticket")}>
                Tickets
              </Chip>
              <Chip active={tab === "food"} onClick={() => setTab("food")}>
                Food Court
              </Chip>
            </div>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((sku) => {
              const inBasket = basket.find((b) => b.id === sku.id)?.qty ?? 0;
              return (
                <div
                  key={sku.id}
                  className={cn(
                    "flex flex-col justify-between rounded-2xl border p-4 transition",
                    inBasket > 0
                      ? "border-cyan bg-surface-2"
                      : "border-line bg-surface-2 hover:border-line-strong",
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold">{sku.name}</p>
                      {inBasket > 0 ? (
                        <StatusPill tone="ok">{inBasket} in basket</StatusPill>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted">{sku.detail}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="font-extrabold text-cyan tabular-nums">
                      {egp(sku.price)}
                    </p>
                    <Button variant="soft" onClick={() => addToBasket(sku.id)}>
                      <Plus className="size-3.5" />
                      Add
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel
          title="Current basket"
          action={
            lines.length ? (
              <button
                type="button"
                onClick={newSale}
                className="text-xs font-semibold text-faint hover:text-fg"
              >
                Clear all
              </button>
            ) : null
          }
        >
          {lines.length === 0 ? (
            <p className="rounded-2xl bg-surface-2 p-4 text-center text-sm text-muted">
              Select a ticket or menu SKU to begin a sale.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {lines.map((line) => {
                const sku = skuById(line.id);
                return (
                  <li
                    key={line.id}
                    className="flex items-center justify-between gap-2 py-2.5 text-sm"
                  >
                    <div>
                      <p className="font-semibold">{sku?.name}</p>
                      <p className="text-xs text-faint">
                        {egp((sku?.price ?? 0) * line.qty)}
                      </p>
                    </div>
                    <span className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Less"
                        className="grid size-8 place-items-center rounded-full border border-line hover:border-line-strong"
                        onClick={() => setQty(line.id, line.qty - 1)}
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center font-bold tabular-nums">
                        {line.qty}
                      </span>
                      <button
                        type="button"
                        aria-label="More"
                        className="grid size-8 place-items-center rounded-full border border-line hover:border-line-strong"
                        onClick={() => setQty(line.id, line.qty + 1)}
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-4 flex gap-2">
            <input
              className="field"
              placeholder="Promo code (PARK10)"
              value={promoInput}
              onChange={(event) => setPromoInput(event.target.value)}
              aria-label="Promo code"
            />
            <Button
              variant="soft"
              onClick={() => {
                const result = applyPromo();
                if (result.ok) toast.success(result.message);
                else toast.error(result.error);
              }}
            >
              Apply
            </Button>
          </div>

          <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between text-muted">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{egp(subtotal)}</dd>
            </div>
            {priced.discount ? (
              <div className="flex justify-between text-ok">
                <dt>Promo (−10%)</dt>
                <dd className="tabular-nums">−{egp(priced.discount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between text-muted">
              <dt>VAT (14%)</dt>
              <dd className="tabular-nums">{egp(priced.vat)}</dd>
            </div>
            <div className="flex justify-between pt-1 text-lg font-extrabold">
              <dt>Total due</dt>
              <dd className="text-cyan tabular-nums">{egp(priced.total)}</dd>
            </div>
          </dl>

          <div className="mt-4">
            <FieldLabel>Payment method</FieldLabel>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {(["cash", "card", "rfid"] as const).map((method) => (
                <Chip
                  key={method}
                  active={payMethod === method}
                  onClick={() => setPayMethod(method)}
                >
                  {method === "rfid" ? "RFID wallet" : method.toUpperCase()}
                </Chip>
              ))}
            </div>
          </div>

          {payMethod === "cash" ? (
            <label className="mt-3 block">
              <FieldLabel>Cash tendered (EGP)</FieldLabel>
              <input
                className="field"
                inputMode="decimal"
                value={tendered}
                onChange={(event) => setTendered(event.target.value)}
              />
            </label>
          ) : null}

          {payMethod === "rfid" ? (
            <label className="mt-3 block">
              <FieldLabel>Wristband RFID</FieldLabel>
              <input
                className="field font-mono"
                value={rfid}
                onChange={(event) => setRfid(event.target.value)}
              />
            </label>
          ) : null}

          <Button
            className="mt-4 w-full"
            disabled={!lines.length}
            onClick={charge}
          >
            Charge {egp(priced.total)}
          </Button>
        </Panel>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           5. RIDE GATES & BOARDING                         */
/* -------------------------------------------------------------------------- */

function Gates() {
  const rides = usePark((state) => state.rides);
  const setRideStatus = usePark((state) => state.setRideStatus);
  const wallets = usePark((state) => state.wallets);
  const history = usePark((state) => state.history);
  const dispatchGate = usePark((state) => state.dispatchGate);

  const [rideId, setRideId] = useState(RIDES[0]?.id ?? "sky");
  const [rfid, setRfid] = useState("RFID-88A4-19C2");
  const [height, setHeight] = useState("140");

  const activeRide = RIDES.find((r) => r.id === rideId) ?? RIDES[0];
  const liveRide = rides[rideId];
  const checks = useMemo(
    () => evaluateGate(rides, wallets, rideId, rfid, Number(height)),
    [rides, wallets, rideId, rfid, height],
  );
  const allOk = checks.every((check) => check.ok);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Ride Gates & Boarding
        </h1>
        <p className="text-sm text-muted">
          Verify wristband clearance, height checks, and dispatch turnstiles.
        </p>
      </div>

      {/* Ride Selector Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RIDES.map((ride) => {
          const live = rides[ride.id];
          const selected = ride.id === rideId;
          const tone =
            live?.status === "open"
              ? "ok"
              : live?.status === "maintenance"
                ? "warn"
                : "bad";
          return (
            <button
              key={ride.id}
              type="button"
              onClick={() => setRideId(ride.id)}
              className={cn(
                "card p-4 text-left transition",
                selected ? "border-cyan bg-surface-2" : "hover:border-line-strong",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold">{ride.name}</p>
                <StatusPill tone={tone}>{live?.status}</StatusPill>
              </div>
              <p className="mt-1 text-xs text-faint">
                {ride.zone} · Min {ride.height ? `${ride.height} cm` : "None"}
              </p>
              <p className="mt-2 text-xs font-semibold text-muted">
                {live?.status === "open"
                  ? `${live.wait} min wait · ${live.riders} dispatched`
                  : "Gate locked"}
              </p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title={`Selected gate · ${activeRide?.name ?? ""}`}
          subtitle="Run safety and pass validation before dispatching"
          action={
            <div className="flex gap-1">
              {(["open", "maintenance", "closed"] as const).map((status) => (
                <Chip
                  key={status}
                  active={liveRide?.status === status}
                  onClick={() => setRideStatus(rideId, status)}
                >
                  {status}
                </Chip>
              ))}
            </div>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <FieldLabel>Guest RFID / Visitor ID</FieldLabel>
              <input
                className="field font-mono"
                value={rfid}
                onChange={(event) => setRfid(event.target.value)}
              />
            </label>
            <label className="block">
              <FieldLabel>Measured height (cm)</FieldLabel>
              <input
                className="field"
                inputMode="numeric"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
              />
            </label>
          </div>

          <ul className="mt-4 space-y-2">
            {checks.map((check) => (
              <li
                key={check.id}
                className="flex items-start justify-between gap-3 rounded-2xl bg-surface-2 p-3 text-sm"
              >
                <div>
                  <p className="font-semibold">{check.label}</p>
                  <p className="text-xs text-muted">{check.detail}</p>
                </div>
                <StatusPill tone={check.ok ? "ok" : "bad"}>
                  {check.ok ? "Pass" : "Fail"}
                </StatusPill>
              </li>
            ))}
          </ul>

          <Button
            className="mt-4 w-full"
            disabled={!allOk}
            onClick={() => {
              const result = dispatchGate(rideId, rfid, Number(height));
              if (result.ok) toast.success(result.message ?? "Cleared");
              else toast.error(result.error);
            }}
          >
            Clear to board
          </Button>
        </Panel>

        <Panel title="Boarding log" subtitle="Latest wristband turnstile scans">
          <ul className="divide-y divide-line">
            {history.slice(0, 12).map((scan) => (
              <li
                key={scan.id}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">{scan.guest}</p>
                  <p className="text-xs text-faint">
                    {scan.ride} · {scan.gate} · {stampLabel(scan.at)}
                  </p>
                </div>
                <StatusPill tone={scan.result === "cleared" ? "ok" : "warn"}>
                  {scan.result}
                </StatusPill>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             6. VISITOR WALLETS                             */
/* -------------------------------------------------------------------------- */

function Wallets() {
  const wallets = usePark((state) => state.wallets);
  const topUp = usePark((state) => state.topUp);
  const setWalletStatus = usePark((state) => state.setWalletStatus);
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState(wallets[0]?.id ?? "");

  const rows = wallets.filter((wallet) =>
    `${wallet.name} ${wallet.rfid} ${wallet.id}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  const inspected =
    wallets.find((w) => w.id === selectedId) ?? rows[0] ?? wallets[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Visitor Wallets
        </h1>
        <p className="text-sm text-muted">
          Inspect RFID wristbands, issue instant top-ups, or freeze lost bands.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Panel
          title={`${rows.length} visitor wallets`}
          action={
            <div className="relative w-60">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" />
              <input
                className="field pl-9"
                placeholder="Search name or RFID"
                value={q}
                onChange={(event) => setQ(event.target.value)}
              />
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead className="text-xs text-faint uppercase">
                <tr>
                  <th className="py-2">Guest</th>
                  <th>RFID</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th className="text-right">Quick actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((wallet) => (
                  <tr
                    key={wallet.id}
                    onClick={() => setSelectedId(wallet.id)}
                    className={cn(
                      "cursor-pointer transition",
                      inspected?.id === wallet.id
                        ? "bg-surface-2"
                        : "hover:bg-surface-2/50",
                    )}
                  >
                    <td className="py-3">
                      <p className="font-semibold">{wallet.name}</p>
                      <p className="text-xs text-faint">
                        {wallet.pass} · {wallet.party}
                      </p>
                    </td>
                    <td className="font-mono text-xs">{wallet.rfid}</td>
                    <td className="font-bold tabular-nums">{egp(wallet.balance)}</td>
                    <td>
                      <StatusPill
                        tone={wallet.status === "active" ? "ok" : "bad"}
                      >
                        {wallet.status}
                      </StatusPill>
                    </td>
                    <td
                      className="space-x-1 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="soft"
                        onClick={() => {
                          const r = topUp(wallet.id, 100);
                          if (r.ok) toast.success("+EGP 100 added");
                          else toast.error(r.error);
                        }}
                      >
                        +100
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setWalletStatus(
                            wallet.id,
                            wallet.status === "blocked" ? "active" : "blocked",
                          )
                        }
                      >
                        {wallet.status === "blocked" ? "Unblock" : "Block"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {inspected ? (
          <Panel title="Wristband inspector" subtitle={inspected.rfid}>
            <div className="space-y-4">
              <div className="rounded-2xl bg-surface-2 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-extrabold">{inspected.name}</p>
                  <StatusPill
                    tone={inspected.status === "active" ? "ok" : "bad"}
                  >
                    {inspected.status}
                  </StatusPill>
                </div>
                <p className="mt-1 text-xs text-faint">
                  {inspected.pass} · {inspected.rides} rides · Spend{" "}
                  {egp(inspected.spend)}
                </p>
                <p className="mt-4 text-3xl font-extrabold text-cyan tabular-nums">
                  {egp(inspected.balance)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="soft"
                  onClick={() => {
                    const r = topUp(inspected.id, 200);
                    if (r.ok) toast.success("+EGP 200 added");
                    else toast.error(r.error);
                  }}
                >
                  <CreditCard className="size-4" />
                  Top up +200
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setWalletStatus(
                      inspected.id,
                      inspected.status === "blocked" ? "active" : "blocked",
                    )
                  }
                >
                  <Lock className="size-4" />
                  {inspected.status === "blocked" ? "Unblock" : "Block band"}
                </Button>
              </div>
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                        7. FEEDBACK & LOST PROPERTY                         */
/* -------------------------------------------------------------------------- */

function Feedback() {
  const feedback = usePark((state) => state.feedback);
  const lost = usePark((state) => state.lost);
  const setFeedbackStatus = usePark((state) => state.setFeedbackStatus);
  const setLostStatus = usePark((state) => state.setLostStatus);
  const [filter, setFilter] = useState<"all" | "open" | "reviewed" | "resolved">(
    "all",
  );

  const avgRating = feedback.length
    ? (
        feedback.reduce((sum, item) => sum + item.stars, 0) / feedback.length
      ).toFixed(1)
    : "0.0";

  const filteredFeedback =
    filter === "all"
      ? feedback
      : feedback.filter((item) => item.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Feedback & Lost Property
          </h1>
          <p className="text-sm text-muted">
            Triage live guest reviews and log found items across park zones.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", "open", "reviewed", "resolved"] as const).map((status) => (
            <Chip
              key={status}
              active={filter === status}
              onClick={() => setFilter(status)}
            >
              {status === "all" ? "All notes" : status}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Panel title={`Guest feedback (${filteredFeedback.length})`}>
          <ul className="space-y-3">
            {filteredFeedback.map((note) => (
              <li key={note.id} className="rounded-2xl bg-surface-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{note.name}</p>
                    <p className="text-xs text-faint">
                      {note.tag} · {stampLabel(note.at)}
                    </p>
                  </div>
                  <Stars value={note.stars} />
                </div>
                <p className="mt-2 text-sm text-muted">{note.body}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <StatusPill tone="muted">{note.channel}</StatusPill>
                  <div className="flex gap-1">
                    {(["open", "reviewed", "resolved"] as const).map((status) => (
                      <Chip
                        key={status}
                        active={note.status === status}
                        onClick={() => setFeedbackStatus(note.id, status)}
                      >
                        {status}
                      </Chip>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel title="Rating summary" subtitle={`${feedback.length} guest submissions`}>
            <div className="flex items-center gap-4">
              <p className="text-4xl font-extrabold text-cyan tabular-nums">
                {avgRating}
                <span className="text-lg font-normal text-faint"> / 5</span>
              </p>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = feedback.filter((f) => f.stars === star).length;
                  const pct = feedback.length
                    ? Math.round((count / feedback.length) * 100)
                    : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-4 font-bold">{star}★</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                        <div
                          className="h-full rounded-full bg-cyan"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-faint tabular-nums">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Panel>

          <Panel title="Lost property" subtitle="Guest relations desk log">
            <ul className="divide-y divide-line">
              {lost.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-faint">
                      {item.place} · {stampLabel(item.at)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {(["unclaimed", "claimed", "returned"] as const).map(
                      (status) => (
                        <Chip
                          key={status}
                          active={item.status === status}
                          onClick={() => setLostStatus(item.id, status)}
                        >
                          {status}
                        </Chip>
                      ),
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           8. REPORTS & ANALYTICS                           */
/* -------------------------------------------------------------------------- */

function downloadCsv(name: string, rows: (string | number)[][]) {
  const body = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function Reports() {
  const ledger = usePark((state) => state.ledger);
  const settlements = usePark((state) => state.settlements);
  const channels = usePark((state) => state.channels);
  const rides = usePark((state) => state.rides);
  const revenue = usePark((state) => state.revenueToday);
  const totalChannels = Object.values(channels).reduce((s, v) => s + v, 0) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Reports & Analytics
          </h1>
          <p className="text-sm text-muted">
            Channel revenue breakdown, ride throughput, and settlement ledger.
          </p>
        </div>
        <Button
          variant="soft"
          onClick={() =>
            downloadCsv("revenue-ledger.csv", [
              ["id", "detail", "channel", "amount", "status", "created"],
              ...ledger.map((row) => [
                row.id,
                row.detail,
                row.channel,
                row.amount,
                row.status,
                row.createdAt,
              ]),
            ])
          }
        >
          <Download className="size-4" />
          Revenue CSV
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Channel mix" subtitle={`Total tracked: ${egp(revenue)}`}>
          <ul className="space-y-3">
            {Object.entries(channels).map(([name, val]) => {
              const pct = Math.round((val / totalChannels) * 100);
              return (
                <li key={name}>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold capitalize">{name}</span>
                    <span className="tabular-nums">
                      {egp(val)} ({pct}%)
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-cyan"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Ride performance" subtitle="Today's dispatches & live status">
          <ul className="divide-y divide-line text-sm">
            {RIDES.map((ride) => {
              const live = rides[ride.id];
              return (
                <li
                  key={ride.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <div>
                    <p className="font-semibold">{ride.name}</p>
                    <p className="text-xs text-faint">{ride.zone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold tabular-nums">
                      {live?.riders ?? 0} riders
                    </p>
                    <p className="text-xs text-faint">{live?.status}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <Panel title="Ledger">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs text-faint uppercase">
              <tr>
                <th className="py-2">Ref</th>
                <th>Detail</th>
                <th>Channel</th>
                <th>Status</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ledger.slice(0, 30).map((row) => (
                <tr key={row.id}>
                  <td className="py-2 font-mono text-xs">{row.id}</td>
                  <td>{row.detail}</td>
                  <td>{row.channel}</td>
                  <td>{row.status}</td>
                  <td className="text-right tabular-nums">{egp(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Recent Settlements">
        <ul className="divide-y divide-line">
          {settlements.slice(0, 12).map((item) => (
            <li
              key={item.id}
              className="flex justify-between gap-3 py-2 text-sm"
            >
              <span>
                {item.who} <span className="text-faint">· {item.detail}</span>
              </span>
              <span className="font-semibold tabular-nums">
                {egp(item.amount)}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             9. MAINTENANCE LOG                             */
/* -------------------------------------------------------------------------- */

function Maintenance() {
  const rides = usePark((state) => state.rides);
  const setRideStatus = usePark((state) => state.setRideStatus);
  const tickets = usePark((state) => state.maintenance);
  const addMaintenance = usePark((state) => state.addMaintenance);
  const setStatus = usePark((state) => state.setMaintenanceStatus);

  const [rideId, setRideId] = useState(RIDES[0]?.id ?? "sky");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const tone = { low: "muted", medium: "warn", high: "bad" } as const;

  const nextStatusMap = {
    open: "maintenance",
    maintenance: "closed",
    closed: "open",
  } as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Maintenance Log
        </h1>
        <p className="text-sm text-muted">
          Control ride availability states and track engineering work orders.
        </p>
      </div>

      {/* Interactive Ride Status Control Cards */}
      <Panel
        title="Ride status control"
        subtitle="Click any ride card to cycle status (Open → Maintenance → Closed)"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RIDES.map((ride) => {
            const live = rides[ride.id];
            const current = live?.status ?? "open";
            const pillTone =
              current === "open"
                ? "ok"
                : current === "maintenance"
                  ? "warn"
                  : "bad";
            return (
              <button
                key={ride.id}
                type="button"
                onClick={() => setRideStatus(ride.id, nextStatusMap[current])}
                className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface-2 p-4 text-left transition hover:border-line-strong"
              >
                <div>
                  <p className="font-bold">{ride.name}</p>
                  <p className="text-xs text-faint">{ride.zone}</p>
                </div>
                <StatusPill tone={pillTone}>{current}</StatusPill>
              </button>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Panel title="Work orders & incident log">
          <ul className="space-y-3">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="rounded-2xl bg-surface-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{ticket.title}</p>
                  <StatusPill tone={tone[ticket.severity]}>
                    {ticket.severity}
                  </StatusPill>
                </div>
                <p className="text-xs text-faint">
                  {RIDES.find((ride) => ride.id === ticket.rideId)?.name} ·{" "}
                  {stampLabel(ticket.at)}
                </p>
                <p className="mt-1.5 text-sm text-muted">{ticket.note}</p>
                <div className="mt-3 flex gap-1">
                  {(["open", "in-progress", "closed"] as const).map((status) => (
                    <Chip
                      key={status}
                      active={ticket.status === status}
                      onClick={() => setStatus(ticket.id, status)}
                    >
                      {status}
                    </Chip>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Log an issue">
          <label className="block">
            <FieldLabel>Ride</FieldLabel>
            <select
              className="field"
              value={rideId}
              onChange={(event) => setRideId(event.target.value)}
            >
              {RIDES.map((ride) => (
                <option key={ride.id} value={ride.id}>
                  {ride.name}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block">
            <FieldLabel>Title</FieldLabel>
            <input
              className="field"
              placeholder="e.g., Restraint sensor check"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label className="mt-3 block">
            <FieldLabel>Note</FieldLabel>
            <textarea
              className="field min-h-20"
              placeholder="Technician details..."
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
          <div className="mt-3">
            <FieldLabel>Severity</FieldLabel>
            <div className="mt-1.5 flex gap-1.5">
              {(["low", "medium", "high"] as const).map((level) => (
                <Chip
                  key={level}
                  active={severity === level}
                  onClick={() => setSeverity(level)}
                >
                  {level}
                </Chip>
              ))}
            </div>
          </div>
          <Button
            className="mt-4 w-full"
            onClick={() => {
              if (!title.trim()) return toast.error("Add a title.");
              addMaintenance({
                rideId,
                title: title.trim(),
                note: note.trim(),
                severity,
              });
              setTitle("");
              setNote("");
              toast.success("Work order logged");
            }}
          >
            Log work order
          </Button>
        </Panel>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             10. SHIFT HANDOVER                             */
/* -------------------------------------------------------------------------- */

function Shifts() {
  const handovers = usePark((state) => state.handovers);
  const roster = usePark((state) => state.roster);
  const toggleCheck = usePark((state) => state.toggleCheck);
  const signOff = usePark((state) => state.signOff);
  const cycleRoster = usePark((state) => state.cycleRoster);
  const tillsSigned = usePark((state) => state.tillsSigned);
  const rideLogsSigned = usePark((state) => state.rideLogsSigned);

  const tone = {
    "on-shift": "ok",
    "on-break": "warn",
    "off-duty": "muted",
    absent: "bad",
  } as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Shift Handover
        </h1>
        <p className="text-sm text-muted">
          Verify shift checklists, sign off tills, and track floor attendance.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Handover checklists">
          <div className="space-y-4">
            {handovers.map((handover) => {
              const done = handover.checks.every((check) => check.done);
              return (
                <div key={handover.id} className="rounded-2xl bg-surface-2 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">
                      {handover.name}{" "}
                      <span className="text-xs font-normal text-faint">
                        · {handover.role} · {handover.place}
                      </span>
                    </p>
                    <StatusPill tone={handover.credited ? "ok" : "warn"}>
                      {handover.credited ? "Signed off" : "Pending"}
                    </StatusPill>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {handover.window} — {handover.note}
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {handover.checks.map((check) => (
                      <li key={check.id}>
                        <label className="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm">
                          <input
                            type="checkbox"
                            className="accent-cyan"
                            checked={check.done}
                            onChange={() => toggleCheck(handover.id, check.id)}
                          />
                          <span
                            className={cn(
                              check.done && "text-faint line-through",
                            )}
                          >
                            {check.label}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-3"
                    variant={handover.credited ? "ghost" : "solid"}
                    disabled={!done || handover.credited}
                    onClick={() => signOff(handover.id)}
                  >
                    {handover.credited ? "Signed off" : "Sign off checklist"}
                  </Button>
                </div>
              );
            })}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Shift targets" subtitle="End-of-shift compliance">
            <div className="space-y-3 text-sm">
              <div>
                <div className="flex justify-between">
                  <span className="font-semibold">Tills reconciled</span>
                  <span className="tabular-nums">{tillsSigned} / 6</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-cyan"
                    style={{ width: `${Math.round((tillsSigned / 6) * 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="font-semibold">Ride safety logs signed</span>
                  <span className="tabular-nums">{rideLogsSigned} / 6</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-ok"
                    style={{
                      width: `${Math.round((rideLogsSigned / 6) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Panel>

          <Panel
            title="Attendance"
            subtitle="Click a status badge to cycle shift state"
          >
            <ul className="divide-y divide-line">
              {roster.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-xs text-faint">
                      {member.role} · {member.assignment} · {member.shift}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => cycleRoster(member.id)}
                    aria-label={`Change status for ${member.name}`}
                  >
                    <StatusPill tone={tone[member.status]}>
                      {ROSTER_LABEL[member.status]}
                    </StatusPill>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             11. STAFF & CATALOG                            */
/* -------------------------------------------------------------------------- */

function Catalog() {
  const catalog = usePark((state) => state.catalog);
  const toggleSku = usePark((state) => state.toggleSku);
  const roster = usePark((state) => state.roster);
  const cycleRoster = usePark((state) => state.cycleRoster);

  const tone = {
    "on-shift": "ok",
    "on-break": "warn",
    "off-duty": "muted",
    absent: "bad",
  } as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Staff & Catalog
        </h1>
        <p className="text-sm text-muted">
          Manage active floor roster status and toggle live POS items.
        </p>
      </div>

      <Panel
        title="Staff roster"
        subtitle="Tap a status pill to cycle shift availability"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs text-faint uppercase">
              <tr>
                <th className="py-2">Team member</th>
                <th>Role</th>
                <th>Assignment</th>
                <th>Shift</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {roster.map((member) => (
                <tr key={member.id}>
                  <td className="py-3 font-semibold">{member.name}</td>
                  <td className="text-muted">{member.role}</td>
                  <td className="text-muted">{member.assignment}</td>
                  <td className="text-xs text-faint">{member.shift}</td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => cycleRoster(member.id)}
                      aria-label={`Cycle status for ${member.name}`}
                    >
                      <StatusPill tone={tone[member.status]}>
                        {ROSTER_LABEL[member.status]}
                      </StatusPill>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="POS catalogue availability"
        subtitle="Turned-off items are hidden from the Ticketing & POS terminal"
      >
        <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {SKUS.map((sku) => (
            <li
              key={sku.id}
              className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 p-3.5 text-sm"
            >
              <div>
                <p className="font-semibold">{sku.name}</p>
                <p className="text-xs text-faint">
                  {sku.group} · {egp(sku.price)}
                </p>
              </div>
              <Chip
                active={catalog[sku.id] !== false}
                onClick={() => toggleSku(sku.id)}
              >
                {catalog[sku.id] !== false ? "Active" : "Hidden"}
              </Chip>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}