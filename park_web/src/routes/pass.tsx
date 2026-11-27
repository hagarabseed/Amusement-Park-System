import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { LogOut, MessageSquare, Plus, Ticket, UtensilsCrossed, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { GuestFrame, Stars } from "@/components/guest-frame";
import { QrCode } from "@/components/qr-code";
import { Button, FieldLabel, StatusPill } from "@/components/ui";
import { DEMO_GUEST, DEMO_PASSWORD, egp, whenLabel } from "@/lib/park";
import { bandForGuest, usePark, visibleRows } from "@/lib/store";

export const Route = createFileRoute("/pass")({
  head: () => ({ meta: [{ title: "My Pass · Pulse" }] }),
  component: PassPage,
});

const TOP_UPS = [100, 200, 500];

function PassPage() {
  const guest = usePark((state) => state.guest);
  return (
    <GuestFrame>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-sm text-muted">
          <Link to="/" className="hover:text-fg">Home</Link>
          <span className="px-2">/</span>
          My Pass
        </p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
          Your pass, <span className="text-cyan">wristband and orders.</span>
        </h1>
        {guest ? <PassDashboard /> : <SignIn />}
      </section>
    </GuestFrame>
  );
}

function SignIn() {
  const signInGuest = usePark((state) => state.signInGuest);
  const [email, setEmail] = useState(DEMO_GUEST.email);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState("");

  function submit() {
    const result = signInGuest(email, password);
    if (!result.ok) setError(result.error);
    else setError("");
  }

  return (
    <div className="card mt-8 max-w-md p-6">
      <h2 className="text-xl font-extrabold">Sign in to your pass</h2>
      <p className="mt-1 text-sm text-muted">
        Use the sample guest, or the email you booked with on this device.
      </p>
      <label className="mt-4 block">
        <FieldLabel>Email</FieldLabel>
        <input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="mt-3 block">
        <FieldLabel>Demo password</FieldLabel>
        <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      {error ? <p className="mt-3 text-sm text-rose" role="alert">{error}</p> : null}
      <Button className="mt-5 w-full" onClick={submit}>Open my pass</Button>
      <p className="mt-3 text-xs text-faint">
        No pass yet? <Link to="/tickets" className="text-cyan">Book tickets</Link>
      </p>
    </div>
  );
}

function PassDashboard() {
  const guest = usePark((state) => state.guest)!;
  const signOutGuest = usePark((state) => state.signOutGuest);
  const wallets = usePark((state) => state.wallets);
  const passes = usePark((state) => state.passes);
  const foodOrders = usePark((state) => state.foodOrders);
  const topUp = usePark((state) => state.topUp);
  const setPassDate = usePark((state) => state.setPassDate);
  const addFeedback = usePark((state) => state.addFeedback);

  const band = bandForGuest(wallets, guest);
  const myPasses = visibleRows(passes, guest.email).filter(
    (pass) => pass.email.toLowerCase() === guest.email.toLowerCase(),
  );
  const myOrders = visibleRows(foodOrders, guest.email).filter(
    (order) => order.email.toLowerCase() === guest.email.toLowerCase(),
  );

  const [stars, setStars] = useState(5);
  const [note, setNote] = useState("");

  function doTopUp(amount: number) {
    if (!band) return;
    const result = topUp(band.id, amount);
    if (result.ok) toast.success(`Added ${egp(amount)} to your wristband`);
    else toast.error(result.error);
  }

  function sendFeedback() {
    if (!note.trim()) {
      toast.error("Write a short note first.");
      return;
    }
    addFeedback({ name: guest.name, stars, body: note });
    setNote("");
    toast.success("Thanks — the guest desk has your note.");
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted">
            Signed in as <span className="font-semibold text-fg">{guest.name}</span>
          </p>
          <Button variant="ghost" onClick={signOutGuest}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-xl font-extrabold">
            <Ticket className="size-5 text-cyan" />
            E-passes
          </h2>
          {myPasses.length === 0 ? (
            <div className="card p-6 text-sm text-muted">
              No passes on this device yet. <Link to="/tickets" className="text-cyan">Book your first pass</Link>.
            </div>
          ) : (
            <div className="space-y-4">
              {myPasses.map((pass) => (
                <article key={pass.code} className="card-glow card grid gap-4 p-5 sm:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-extrabold">{pass.productName}</h3>
                      <StatusPill tone={pass.status === "confirmed" ? "ok" : "warn"}>
                        {pass.status === "confirmed" ? "Confirmed" : "Pay at gate"}
                      </StatusPill>
                      {pass.fastTrack ? <StatusPill tone="cyan">Fast Track</StatusPill> : null}
                    </div>
                    <p className="mt-1 font-mono text-sm text-cyan">{pass.code}</p>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div><dt className="text-faint">Guests</dt><dd className="font-semibold">{pass.qty}</dd></div>
                      <div><dt className="text-faint">Total</dt><dd className="font-semibold">{egp(pass.total)}</dd></div>
                    </dl>
                    <label className="mt-3 block max-w-[220px]">
                      <FieldLabel>Visit date</FieldLabel>
                      <input
                        className="field"
                        type="date"
                        value={pass.date}
                        min="2026-11-27"
                        onChange={(event) => event.target.value && setPassDate(pass.code, event.target.value)}
                      />
                    </label>
                    <p className="mt-2 text-xs text-faint">
                      {safeDate(pass.date)} · booked {whenLabel(pass.createdAt)}
                    </p>
                  </div>
                  <QrCode value={`${pass.code}|${pass.email}|${pass.date}|${pass.total}`} />
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-xl font-extrabold">
            <UtensilsCrossed className="size-5 text-cyan" />
            Food orders
          </h2>
          {myOrders.length === 0 ? (
            <div className="card p-6 text-sm text-muted">
              Nothing ordered yet. <Link to="/food" className="text-cyan">Pre-order food</Link> before you reach the gate.
            </div>
          ) : (
            <ul className="space-y-3">
              {myOrders.map((order) => (
                <li key={order.id} className="card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-sm text-cyan">{order.id}</p>
                    <StatusPill tone={order.status === "ready" ? "ok" : order.status === "collected" ? "muted" : "warn"}>
                      {order.status}
                    </StatusPill>
                  </div>
                  <p className="mt-2 text-sm">
                    {order.items.map((item) => `${item.qty}× ${item.name}`).join(" · ")}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Pickup {order.slot} · {order.kitchen} · {egp(order.total)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
        <section className="card-glow card p-5">
          <h2 className="flex items-center gap-2 text-xl font-extrabold">
            <Wallet className="size-5 text-cyan" />
            Wristband
          </h2>
          {band ? (
            <>
              <p className="mt-3 text-4xl font-extrabold text-cyan tabular-nums">{egp(band.balance)}</p>
              <p className="mt-1 text-sm text-muted">
                {band.pass} · {band.rfid}
              </p>
              <div className="mt-2 flex gap-2">
                <StatusPill tone={band.status === "active" ? "ok" : "bad"}>{band.status}</StatusPill>
                <StatusPill tone="muted">{band.rides} rides today</StatusPill>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {TOP_UPS.map((amount) => (
                  <Button key={amount} variant="soft" disabled={band.status !== "active"} onClick={() => doTopUp(amount)}>
                    <Plus className="size-3.5" />
                    {amount}
                  </Button>
                ))}
              </div>
              {band.status !== "active" ? (
                <p className="mt-3 text-sm text-rose">This band is {band.status} — see the guest desk.</p>
              ) : null}
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">
              No wristband is linked to this account yet. Collect one at the gate with your e-pass.
            </p>
          )}
        </section>

        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-xl font-extrabold">
            <MessageSquare className="size-5 text-cyan" />
            Tell us about your visit
          </h2>
          <div className="mt-2">
            <Stars value={stars} onChange={setStars} />
          </div>
          <textarea
            className="field mt-2 min-h-24"
            placeholder="What worked, what didn't?"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <Button className="mt-3 w-full" onClick={sendFeedback}>Send to guest desk</Button>
        </section>
      </aside>
    </div>
  );
}

function safeDate(value: string) {
  try {
    return format(parseISO(value), "EEE, d MMM yyyy");
  } catch {
    return value;
  }
}
