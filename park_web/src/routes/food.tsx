import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GuestFrame } from "@/components/guest-frame";
import { Button, Chip } from "@/components/ui";
import { FOOD, KITCHENS, egp, guestFieldsOk, pickupSlots, type Sku } from "@/lib/park";
import { usePark } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/food")({
  head: () => ({ meta: [{ title: "Food · Pulse" }] }),
  component: FoodPage,
});

const CATS = ["All", "Mains", "Snacks", "Sweets", "Drinks"] as const;

function FoodPage() {
  const cart = usePark((state) => state.foodCart);
  const setQty = usePark((state) => state.setFoodQty);
  const collectionId = usePark((state) => state.collectionId);
  const setCollection = usePark((state) => state.setCollection);
  const slot = usePark((state) => state.slot);
  const setSlot = usePark((state) => state.setSlot);
  const place = usePark((state) => state.placeFoodOrder);
  const guest = usePark((state) => state.guest);
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [slots, setSlots] = useState<string[]>(["17:45", "18:15", "18:45", "19:15"]);
  const [name, setName] = useState(guest?.name ?? "");
  const [email, setEmail] = useState(guest?.email ?? "");
  const [pay, setPay] = useState<"pickup" | "wristband">("pickup");
  const [placed, setPlaced] = useState("");

  useEffect(() => {
    const next = pickupSlots(new Date());
    setSlots(next);
    if (!next.includes(usePark.getState().slot)) setSlot(next[1] ?? next[0] ?? "18:15");
  }, [setSlot]);

  useEffect(() => {
    if (guest) {
      setName(guest.name);
      setEmail(guest.email);
    }
  }, [guest]);

  const items = FOOD.filter((item) => cat === "All" || item.category === cat);
  const lines = FOOD.map((item) => ({ item, qty: cart[item.id] ?? 0 })).filter((line) => line.qty > 0);
  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  const total = lines.reduce((sum, line) => sum + line.item.price * line.qty, 0);

  return (
    <GuestFrame>
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-sm text-muted">
            <Link to="/" className="hover:text-fg">Home</Link>
            <span className="px-2">/</span>
            Food pre-order
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-6xl">
            Order now, <span className="text-cyan">skip the counter queue.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-muted">
            Pick a kitchen, choose a collection slot and pay with your wristband at pickup. Food is held under your order code for 15 minutes past the slot.
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {CATS.map((item) => (
              <Chip key={item} active={cat === item} onClick={() => setCat(item)}>{item}</Chip>
            ))}
            <p className="ml-auto text-sm text-muted">Kitchens open until 22:30</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <FoodCard key={item.id} item={item} qty={cart[item.id] ?? 0} onQty={(qty) => setQty(item.id, qty)} />
            ))}
          </div>
        </div>
        <aside className="card h-fit p-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold">Your order</h2>
            <span className="text-sm text-muted">{count} item{count === 1 ? "" : "s"}</span>
          </div>
          {lines.length === 0 ? <p className="mt-4 text-sm text-muted">The tray is empty. Add a meal to hold a slot.</p> : null}
          <ul className="mt-3 space-y-3">
            {lines.map(({ item, qty }) => (
              <li key={item.id} className="flex items-start justify-between gap-2 text-sm">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-muted">× {qty}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold tabular-nums">{item.price * qty}</span>
                  <button type="button" aria-label={`Remove ${item.name}`} className="grid size-9 place-items-center rounded-full text-muted" onClick={() => setQty(item.id, 0)}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <label className="mt-4 block text-xs font-bold tracking-[0.14em] text-faint">
            COLLECTION POINT
            <select className="field mt-2" value={collectionId} onChange={(event) => setCollection(event.target.value)}>
              {KITCHENS.map((kitchen) => (
                <option key={kitchen.id} value={kitchen.id}>{kitchen.name} · {kitchen.zone}</option>
              ))}
            </select>
          </label>
          <p className="mt-4 text-xs font-bold tracking-[0.14em] text-faint">PICKUP SLOT</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {slots.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSlot(item)}
                className={cn("min-h-11 rounded-full px-3 text-sm font-semibold", item === slot ? "bg-cyan text-on-cyan" : "border border-line")}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            <input className="field" placeholder="Name on the order" value={name} onChange={(event) => setName(event.target.value)} />
            <input className="field" placeholder="Email for the order code" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setPay("pickup")} className={cn("min-h-11 rounded-2xl border px-3 text-sm font-semibold", pay === "pickup" ? "border-line-strong text-cyan" : "border-line")}>Pay at pickup</button>
            <button type="button" onClick={() => setPay("wristband")} className={cn("min-h-11 rounded-2xl border px-3 text-sm font-semibold", pay === "wristband" ? "border-line-strong text-cyan" : "border-line")}>Wristband</button>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted">Total</span>
            <span className="text-xl font-extrabold">{egp(total)}</span>
          </div>
          <p className="mt-1 text-xs text-faint">Held 15 minutes past {slot}.</p>
          <Button
            className="mt-4 w-full"
            onClick={() => {
              if (!guestFieldsOk(name, email, name ? "01000000001" : "")) {
                if (name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                  toast.error("Add the name and email that should hold this order.");
                  return;
                }
              }
              const result = place({ name, email, pay });
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              setPlaced(result.message ?? "");
              toast.success(`Order ${result.message} is in the kitchen.`);
            }}
          >
            <UtensilsCrossed className="size-4" />
            Place order
          </Button>
          {placed ? <p className="mt-3 text-sm text-cyan">Order {placed} is on your pass. Show it at the counter.</p> : null}
        </aside>
      </section>
    </GuestFrame>
  );
}

function FoodCard({ item, qty, onQty }: { item: Sku; qty: number; onQty: (qty: number) => void }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-surface">
      {item.image ? <img src={item.image} alt="" className="h-40 w-full object-cover" /> : null}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold">{item.name}</h3>
          <span className="font-semibold text-cyan">{egp(item.price)}</span>
        </div>
        <p className="mt-1 text-sm text-muted">{item.detail}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted">{item.prep} MIN</span>
          {qty > 0 ? (
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Decrease" className="grid size-11 place-items-center rounded-full border border-line" onClick={() => onQty(qty - 1)}><Minus className="size-4" /></button>
              <span className="w-4 text-center font-bold tabular-nums">{qty}</span>
              <button type="button" aria-label="Increase" className="grid size-11 place-items-center rounded-full border border-line" onClick={() => onQty(qty + 1)}><Plus className="size-4" /></button>
            </div>
          ) : (
            <button type="button" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-cyan" onClick={() => onQty(1)}>
              <Plus className="size-4" /> Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
