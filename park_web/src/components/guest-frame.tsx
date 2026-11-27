import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, Menu, Moon, Star, Sun, Ticket, UserRound, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { DEMO_GUEST, STATUS_PILL } from "@/lib/park";
import { usePark } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/attractions", label: "Attractions" },
  { to: "/tickets", label: "Tickets" },
  { to: "/food", label: "Food" },
  { to: "/pass", label: "My Pass" },
] as const;

export function Mark({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-line-strong", className)}>
      <img src="/media/wheel.jpg" alt="" className="size-full object-cover" />
    </span>
  );
}

export function GuestFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function Header() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const theme = usePark((state) => state.theme);
  const setTheme = usePark((state) => state.setTheme);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-header backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <Mark />
          <span className="text-lg font-extrabold tracking-tight text-cyan">Pulse</span>
        </Link>
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-semibold",
                path === link.to ? "bg-surface-2 text-cyan" : "text-muted hover:text-fg",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-xs font-medium text-muted">
            <span className="live-dot size-1.5 rounded-full bg-ok" />
            {STATUS_PILL}
          </span>
          <button
            type="button"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="grid size-11 place-items-center rounded-full border border-line"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <Link to="/staff" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-3 text-sm font-semibold">
            <UserRound className="size-4" />
            Staff sign-in
          </Link>
          <Link to="/tickets" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-cyan px-4 text-sm font-semibold text-on-cyan">
            Book tickets
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <button
          type="button"
          className="ml-auto grid size-11 place-items-center rounded-full border border-line lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open ? (
        <div className="space-y-2 border-t border-line px-4 py-3 lg:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex min-h-11 items-center rounded-2xl px-3 text-sm font-semibold",
                path === link.to ? "bg-surface-2 text-cyan" : "text-fg",
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="grid size-11 place-items-center rounded-full border border-line"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <Link to="/staff" onClick={() => setOpen(false)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line text-sm font-semibold">
              Staff sign-in
            </Link>
          </div>
          <Link to="/tickets" onClick={() => setOpen(false)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-cyan text-sm font-semibold text-on-cyan">
            <Ticket className="size-4" />
            Book tickets
          </Link>
        </div>
      ) : null}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <Mark />
            <div>
              <p className="text-lg font-extrabold text-cyan">Pulse</p>
              <p className="text-[11px] font-semibold tracking-[0.16em] text-faint">KEEP YOUR PARK BEATING.</p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted">
            Sunset Park runs on ParkPulse — ticketing, wristbands, ride gates and guest orders beating as one system.
          </p>
          <p className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
            <span>New Cairo, Egypt</span>
            <a href="tel:+20223458890">+20 2 2345 8890</a>
          </p>
        </div>
        <div>
          <p className="font-semibold">Plan your visit</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link to="/tickets" className="hover:text-fg">Ticket packages</Link></li>
            <li><Link to="/attractions" className="hover:text-fg">Rides & live queues</Link></li>
            <li><Link to="/" hash="shows" className="hover:text-fg">Tonight’s show times</Link></li>
            <li><Link to="/food" className="hover:text-fg">Food pre-order</Link></li>
            <li><Link to="/pass" className="hover:text-fg">My pass & wallet</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Opening hours</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4 text-muted"><dt>Sunday – Thursday</dt><dd className="text-fg">10:00 – 23:00</dd></div>
            <div className="flex justify-between gap-4 text-muted"><dt>Friday – Saturday</dt><dd className="text-fg">10:00 – 01:00</dd></div>
            <div className="flex justify-between gap-4 text-muted"><dt>Public holidays</dt><dd className="text-fg">09:00 – 01:00</dd></div>
          </dl>
          <p className="mt-4 text-sm text-muted">Sunset Park Boulevard, Fifth Settlement, New Cairo 11835</p>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-faint">
        <p>© 2026 ParkPulse · Sunset Park. Sample guest experience.</p>
        <p className="flex items-center gap-2">
          <span className="live-dot size-1.5 rounded-full bg-ok" />
          Keep your park beating.
          <Link to="/staff" className="text-cyan">Staff console</Link>
        </p>
      </div>
    </footer>
  );
}

export function WristbandDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const wallets = usePark((state) => state.wallets);
  const [rfid, setRfid] = useState(DEMO_GUEST.rfid);
  const [found, setFound] = useState<(typeof wallets)[number] | null>(null);
  const [miss, setMiss] = useState(false);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-photo-ink/70 p-4" role="dialog" aria-modal="true" aria-labelledby="band-title">
      <div className="card w-full max-w-md p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-cyan">WRISTBAND</p>
            <h2 id="band-title" className="mt-1 text-2xl font-extrabold">Load my wristband</h2>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="grid size-11 place-items-center rounded-full border border-line">
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-2 text-sm text-muted">Sample band for Salma is prefilled. Nothing is sent to a server.</p>
        <label className="mt-4 block text-sm text-muted">
          RFID
          <input className="field mt-1.5" value={rfid} onChange={(event) => setRfid(event.target.value)} />
        </label>
        <Button
          className="mt-4 w-full"
          onClick={() => {
            const hit = wallets.find((wallet) => wallet.rfid.toLowerCase() === rfid.trim().toLowerCase());
            setFound(hit ?? null);
            setMiss(!hit);
          }}
        >
          Load band
        </Button>
        {found ? (
          <div className="mt-4 rounded-2xl border border-line bg-surface-2 p-4">
            <p className="font-bold">{found.name}</p>
            <p className="text-sm text-muted">{found.pass} · {found.id}</p>
            <p className="mt-2 text-2xl font-extrabold text-cyan">EGP {found.balance.toLocaleString("en-US")}</p>
            <p className="text-sm text-muted">{found.rides} rides · {found.status}</p>
          </div>
        ) : null}
        {miss ? <p className="mt-3 text-sm text-rose">No band matches that RFID.</p> : null}
      </div>
    </div>
  );
}

export function Stars({ value, onChange }: { value: number; onChange?: (value: number) => void }) {
  return (
    <div className="flex" aria-label={`${value} of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < value;
        const icon = <Star className={cn("size-4", filled ? "fill-amber text-amber" : "text-faint")} />;
        if (!onChange) return <span key={index} className="grid size-8 place-items-center">{icon}</span>;
        return (
          <button key={index} type="button" className="grid size-11 place-items-center" onClick={() => onChange(index + 1)} aria-label={`${index + 1} star`}>
            {icon}
          </button>
        );
      })}
    </div>
  );
}
