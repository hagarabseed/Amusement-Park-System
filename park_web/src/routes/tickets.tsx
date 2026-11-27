import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { ArrowRight, Check, CreditCard, Lock, Pencil, Ticket, UtensilsCrossed, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { GuestFrame } from "@/components/guest-frame";
import { QrCode } from "@/components/qr-code";
import { Button } from "@/components/ui";
import { egp, guestFieldsOk, passCode, quote } from "@/lib/park";
import { bandForGuest, usePark } from "@/lib/store";
import type { PayMethod } from "@/lib/park";

export const Route = createFileRoute("/tickets")({
  head: () => ({ meta: [{ title: "Tickets · Pulse" }] }),
  component: TicketsPage,
});

const PRODUCTS = [
  { id: "day", name: "Neon Day Pass", detail: "Unlimited rides until close · 1 guest", price: 350 },
  { id: "child", name: "Child Pass", detail: "Ages 3–12 · unlimited rides", price: 220 },
  { id: "family", name: "Family Bundle", detail: "2 adults + 2 children", price: 950 },
];

function TicketsPage() {
  const bookPass = usePark((state) => state.bookPass);
  const setPrefill = usePark((state) => state.setPrefillEmail);
  const guest = usePark((state) => state.guest);
  const wallets = usePark((state) => state.wallets);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [productId, setProductId] = useState("day");
  const [qty, setQty] = useState(2);
  const [date, setDate] = useState("2026-11-27");
  const [fast, setFast] = useState(true);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [pay, setPay] = useState<PayMethod>("card");
  const [tried, setTried] = useState(false);
  const [code, setCode] = useState("PP-····-····");
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    setCode(passCode());
  }, []);

  const product = PRODUCTS.find((item) => item.id === productId) ?? PRODUCTS[0];
  const passes = product.price * qty;
  const fastTrack = fast ? 180 : 0;
  const priced = useMemo(() => quote(passes + fastTrack), [passes, fastTrack]);
  const band = bandForGuest(wallets, guest);
  const fieldsOk = guestFieldsOk(name, email, mobile);
  const dateLabel = format(parseISO(date), "EEE, d MMM yyyy");

  function confirm() {
    setTried(true);
    if (!fieldsOk) return;
    const result = bookPass({
      code,
      productId,
      qty,
      date,
      name,
      email,
      mobile,
      payment: pay,
      fastTrack: fast,
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    if (result.message) setCode(result.message);
    setBooked(true);
    setStep(3);
    toast.success("E-pass ready on this device.");
  }

  return (
    <GuestFrame>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <ol className="mb-6 flex flex-wrap gap-3 text-sm">
            {["Choose pass", "Your details", "E-pass"].map((label, index) => {
              const n = index + 1;
              const done = step > n || (booked && n < 3);
              const current = step === n;
              return (
                <li key={label} className="flex items-center gap-2">
                  <span className={current || done ? "grid size-7 place-items-center rounded-full bg-cyan text-xs font-bold text-on-cyan" : "grid size-7 place-items-center rounded-full border border-line text-xs text-muted"}>
                    {done && !current ? <Check className="size-3.5" /> : n}
                  </span>
                  <span className={current ? "font-semibold" : "text-muted"}>{label}</span>
                </li>
              );
            })}
          </ol>

          {step === 1 ? (
            <div className="space-y-4">
              <h1 className="text-3xl font-extrabold">1 · Choose a pass</h1>
              <div className="grid gap-3">
                {PRODUCTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProductId(item.id)}
                    className={productId === item.id ? "card card-glow p-4 text-left" : "rounded-3xl border border-line p-4 text-left"}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-sm text-muted">{item.detail}</p>
                      </div>
                      <p className="font-extrabold text-cyan">{egp(item.price)}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm text-muted">
                  Guests
                  <div className="mt-1.5 flex items-center gap-3">
                    <button type="button" className="grid size-11 place-items-center rounded-full border border-line" onClick={() => setQty((value) => Math.max(1, value - 1))}>–</button>
                    <span className="w-8 text-center text-lg font-bold tabular-nums">{qty}</span>
                    <button type="button" className="grid size-11 place-items-center rounded-full border border-line" onClick={() => setQty((value) => Math.min(8, value + 1))}>+</button>
                  </div>
                </label>
                <label className="text-sm text-muted">
                  Visit date
                  <input className="field mt-1.5" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                </label>
              </div>
              <button
                type="button"
                onClick={() => setFast((value) => !value)}
                className={fast ? "card card-glow flex w-full items-center justify-between p-4 text-left" : "flex w-full items-center justify-between rounded-3xl border border-line p-4 text-left"}
              >
                <span>
                  <span className="block font-bold">Fast Track add-on</span>
                  <span className="text-sm text-muted">One line for the whole party · {egp(180)}</span>
                </span>
                <span className={fast ? "rounded-full bg-cyan px-3 py-1 text-xs font-bold text-on-cyan" : "rounded-full border border-line px-3 py-1 text-xs text-muted"}>
                  {fast ? "Added" : "Add"}
                </span>
              </button>
              <Button onClick={() => setStep(2)}>Continue <ArrowRight className="size-4" /></Button>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-3xl font-extrabold">2 · Who is visiting?</h1>
                <button type="button" className="inline-flex items-center gap-1 text-sm font-semibold text-cyan" onClick={() => setStep(1)}>
                  <Pencil className="size-4" /> Edit pass
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm text-muted">
                  Full name
                  <input className="field mt-1.5" value={name} placeholder="Salma Ibrahim" onChange={(event) => setName(event.target.value)} />
                </label>
                <label className="text-sm text-muted">
                  Mobile
                  <input className="field mt-1.5" value={mobile} placeholder="+20 10 0000 0000" onChange={(event) => setMobile(event.target.value)} />
                </label>
              </div>
              <label className="mt-3 block text-sm text-muted">
                Email for the e-pass
                <input className="field mt-1.5" value={email} placeholder="you@example.com" onChange={(event) => setEmail(event.target.value)} />
              </label>
              <p className="mt-6 text-xs font-bold tracking-[0.14em] text-faint">PAYMENT</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <PayCard active={pay === "card"} onClick={() => setPay("card")} icon={<CreditCard className="size-4" />} title="Card" detail="Visa · Mastercard" />
                <PayCard active={pay === "wristband"} onClick={() => setPay("wristband")} icon={<Wallet className="size-4" />} title="Wristband credit" detail={band ? `Balance ${egp(band.balance)}` : "No sample band"} />
                <PayCard active={pay === "gate"} onClick={() => setPay("gate")} icon={<Ticket className="size-4" />} title="Pay at gate" detail="Hold for 30 min" />
              </div>
              {tried && !fieldsOk ? (
                <p className="mt-4 rounded-2xl bg-danger-bg px-4 py-3 text-sm text-rose">
                  Please add your name, email and mobile number so we can send the pass.
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={confirm}>
                  Confirm booking · {egp(priced.total)}
                  <Lock className="size-4" />
                </Button>
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              </div>
              <p className="mt-3 text-xs text-faint">Demo checkout — no card is charged. Your e-pass is generated on this device for the sample park.</p>
            </div>
          ) : null}

          {step === 3 && booked ? (
            <div className="card card-glow p-5">
              <p className="flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-cyan">
                <Check className="size-4" /> BOOKING CONFIRMED
              </p>
              <h1 className="mt-3 text-3xl font-extrabold">{product.name} × {qty} guest{qty === 1 ? "" : "s"}</h1>
              <p className="mt-2 text-sm text-muted">{dateLabel} · scan the code below at any gate to collect your wristbands.</p>
              <div className="mt-5 flex flex-wrap gap-4 rounded-3xl border border-line bg-bg/40 p-4">
                <QrCode value={`${code}|${email}|${date}|${priced.total}`} />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="text-xs font-bold tracking-[0.14em] text-faint">E-PASS CODE</p>
                  <p className="mt-1 text-xl font-extrabold tracking-wide">{code}</p>
                  <dl className="mt-3 grid grid-cols-2 gap-2">
                    <dt className="text-faint">Guest</dt><dd>{name}</dd>
                    <dt className="text-faint">Date</dt><dd>{dateLabel}</dd>
                    <dt className="text-faint">Guests</dt><dd>{qty}</dd>
                    <dt className="text-faint">Paid</dt><dd>{egp(priced.total)}</dd>
                  </dl>
                  <p className="mt-3 text-xs text-muted">Screenshot this pass — gates also accept the code.</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={() => { setPrefill(email); void navigate({ to: "/pass" }); }}>
                  <Ticket className="size-4" /> Open in My Pass
                </Button>
                <Link to="/food" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold">
                  <UtensilsCrossed className="size-4" /> Pre-order food
                </Link>
                <button
                  type="button"
                  className="min-h-11 px-3 text-sm font-semibold text-muted"
                  onClick={() => {
                    setBooked(false);
                    setStep(1);
                    setTried(false);
                    setCode(passCode());
                  }}
                >
                  Book another
                </button>
              </div>
              <div className="mt-6 rounded-2xl border border-line p-4 text-sm text-muted">
                <p className="font-semibold text-fg">Before you arrive</p>
                <p className="mt-2">Last ride admission is 45 minutes before closing. Re-entry is allowed all day with a valid e-pass.</p>
              </div>
            </div>
          ) : null}
        </div>
        <Summary
          code={code}
          name={product.name}
          dateLabel={dateLabel}
          qty={qty}
          passes={passes}
          fast={fast}
          fastTrack={fastTrack}
          subtotal={passes + fastTrack}
          vat={priced.vat}
          total={priced.total}
        />
      </section>
    </GuestFrame>
  );
}

function PayCard({ active, onClick, icon, title, detail }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; detail: string }) {
  return (
    <button type="button" onClick={onClick} className={active ? "card card-glow p-4 text-left" : "rounded-3xl border border-line p-4 text-left"}>
      <span className="text-cyan">{icon}</span>
      <p className="mt-3 font-bold">{title}</p>
      <p className="text-sm text-muted">{detail}</p>
    </button>
  );
}

function Summary(props: {
  code: string;
  name: string;
  dateLabel: string;
  qty: number;
  passes: number;
  fast: boolean;
  fastTrack: number;
  subtotal: number;
  vat: number;
  total: number;
}) {
  return (
    <aside className="card h-fit p-5 lg:sticky lg:top-24">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold">Order summary</h2>
        <span className="text-xs font-semibold text-muted">{props.code}</span>
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line p-3">
        <span className="grid size-10 place-items-center rounded-xl bg-cyan text-on-cyan"><Ticket className="size-4" /></span>
        <div>
          <p className="font-bold">{props.name}</p>
          <p className="text-sm text-muted">{props.dateLabel}</p>
        </div>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <Row k={`Passes × ${props.qty}`} v={egp(props.passes)} />
        {props.fast ? <Row k="Fast Track" v={egp(props.fastTrack)} /> : null}
        <Row k="Subtotal" v={egp(props.subtotal)} />
        <Row k="VAT 14%" v={egp(props.vat)} />
      </dl>
      <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
        <span className="text-sm text-muted">Total</span>
        <span className="text-2xl font-extrabold text-cyan">{egp(props.total)}</span>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-muted">
        <li className="flex gap-2"><Check className="size-4 text-cyan" /> Unlimited rides all day</li>
        <li className="flex gap-2"><Check className="size-4 text-cyan" /> Digital wristband included</li>
        <li className="flex gap-2"><Check className="size-4 text-cyan" /> Re-entry any time</li>
      </ul>
      <p className="mt-4 text-xs text-faint">Free date changes up to 24 hours before your visit.</p>
    </aside>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{k}</dt>
      <dd className="font-semibold tabular-nums">{v}</dd>
    </div>
  );
}
