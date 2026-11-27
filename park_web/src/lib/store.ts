import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { format } from "date-fns";
import {
  DEMO_GUEST,
  DEMO_PASSWORD,
  INITIAL_FEEDBACK,
  INITIAL_FOOD,
  INITIAL_HANDOVERS,
  INITIAL_HISTORY,
  INITIAL_LEDGER,
  INITIAL_LOST,
  INITIAL_MAINT,
  INITIAL_PASSES,
  INITIAL_RIDES,
  INITIAL_ROSTER,
  INITIAL_SETTLEMENTS,
  INITIAL_WALLETS,
  KITCHENS,
  ROSTER_NEXT,
  SKUS,
  egp,
  nid,
  quote,
  rideById,
  skuById,
  type BandStatus,
  type FeedbackNote,
  type FoodOrder,
  type FoodStatus,
  type Handover,
  type LedgerRow,
  type LostItem,
  type MaintTicket,
  type Notice,
  type PassRecord,
  type PayMethod,
  type RideLive,
  type RideScan,
  type RideStatus,
  type RoleId,
  type RosterMember,
  type Settlement,
  type Wallet,
} from "@/lib/park";

export type BasketLine = { id: string; qty: number };
export type PosPay = "cash" | "card" | "rfid";
export type Result = { ok: true; message?: string } | { ok: false; error: string };
export type GateCheck = { id: string; label: string; ok: boolean; detail: string };

type Channels = { ticketing: number; food: number; retail: number; wallet: number };

type Data = {
  theme: "dark" | "light";
  guest: { name: string; email: string } | null;
  staffRole: RoleId | null;
  rides: Record<string, RideLive>;
  guestsInside: number;
  revenueToday: number;
  fleetUptime: number;
  wallets: Wallet[];
  passes: PassRecord[];
  foodOrders: FoodOrder[];
  ledger: LedgerRow[];
  settlements: Settlement[];
  channels: Channels;
  feedback: FeedbackNote[];
  lost: LostItem[];
  maintenance: MaintTicket[];
  roster: RosterMember[];
  handovers: Handover[];
  history: RideScan[];
  notices: Notice[];
  catalog: Record<string, boolean>;
  tillsSigned: number;
  rideLogsSigned: number;
  lostCounted: number;
  foodCart: Record<string, number>;
  collectionId: string;
  slot: string;
  basket: BasketLine[];
  posTab: "ticket" | "food";
  promoInput: string;
  promoApplied: boolean;
  payMethod: PosPay;
  tendered: string;
  prefillEmail: string;
};

type Park = Data & {
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  setTheme: (theme: "dark" | "light") => void;
  signInGuest: (email: string, password: string) => Result;
  signOutGuest: () => void;
  signInStaff: (role: RoleId) => void;
  switchStaff: (role: RoleId) => void;
  signOutStaff: () => void;
  setRideStatus: (id: string, status: RideStatus) => void;
  tickLive: () => void;
  bookPass: (input: {
    code: string;
    productId: string;
    qty: number;
    date: string;
    name: string;
    email: string;
    mobile: string;
    payment: PayMethod;
    fastTrack: boolean;
  }) => Result;
  setPassDate: (code: string, date: string) => void;
  setFoodQty: (id: string, qty: number) => void;
  setCollection: (id: string) => void;
  setSlot: (slot: string) => void;
  placeFoodOrder: (input: { email: string; name: string; pay: "pickup" | "wristband" }) => Result;
  setFoodStatus: (id: string, status: FoodStatus) => void;
  topUp: (walletId: string, amount: number) => Result;
  setWalletStatus: (walletId: string, status: BandStatus) => void;
  addFeedback: (input: { name: string; stars: number; body: string }) => void;
  setFeedbackStatus: (id: string, status: FeedbackNote["status"]) => void;
  setLostStatus: (id: string, status: LostItem["status"]) => void;
  countLost: () => void;
  addMaintenance: (input: { rideId: string; title: string; note: string; severity: MaintTicket["severity"] }) => void;
  setMaintenanceStatus: (id: string, status: MaintTicket["status"]) => void;
  toggleCheck: (handoverId: string, checkId: string) => void;
  signOff: (handoverId: string) => void;
  cycleRoster: (id: string) => void;
  toggleSku: (id: string) => void;
  addToBasket: (id: string) => void;
  setBasketQty: (id: string, qty: number) => void;
  setPosTab: (tab: "ticket" | "food") => void;
  setPromoInput: (value: string) => void;
  applyPromo: () => Result;
  setPayMethod: (method: PosPay) => void;
  setTendered: (value: string) => void;
  newSale: () => void;
  recordSale: (rfid: string) => Result;
  dispatchGate: (rideId: string, rfid: string, height: number) => Result;
  markNoticesRead: () => void;
  setPrefillEmail: (email: string) => void;
};

const initial: Data = {
  theme: "dark",
  guest: null,
  staffRole: null,
  rides: INITIAL_RIDES,
  guestsInside: 6482,
  revenueToday: 72900,
  fleetUptime: 98.4,
  wallets: INITIAL_WALLETS,
  passes: INITIAL_PASSES,
  foodOrders: INITIAL_FOOD,
  ledger: INITIAL_LEDGER,
  settlements: INITIAL_SETTLEMENTS,
  channels: { ticketing: 3500, food: 630, retail: 460, wallet: 500 },
  feedback: INITIAL_FEEDBACK,
  lost: INITIAL_LOST,
  maintenance: INITIAL_MAINT,
  roster: INITIAL_ROSTER,
  handovers: INITIAL_HANDOVERS,
  history: INITIAL_HISTORY,
  notices: [
    { id: "n1", text: "Aqua Canyon held — pump seal replacement", at: "2026-11-27T09:12:00", read: false },
    { id: "n2", text: "Card terminal 2 reconnected at Gate 1", at: "2026-11-27T13:20:00", read: false },
  ],
  catalog: Object.fromEntries(SKUS.map((sku) => [sku.id, true])),
  tillsSigned: 5,
  rideLogsSigned: 6,
  lostCounted: 0,
  foodCart: { burger: 1, lemonade: 2 },
  collectionId: "neon",
  slot: "18:15",
  basket: [{ id: "day", qty: 1 }],
  posTab: "ticket",
  promoInput: "PARK10",
  promoApplied: false,
  payMethod: "cash",
  tendered: "0",
  prefillEmail: "",
};

function pushNotice(notices: Notice[], text: string): Notice[] {
  return [{ id: nid("NT"), text, at: new Date().toISOString(), read: false }, ...notices].slice(0, 14);
}

function kitchenLabel(id: string) {
  const kitchen = KITCHENS.find((item) => item.id === id);
  return kitchen ? `${kitchen.name} · ${kitchen.zone}` : id;
}

function admitFor(id: string, qty: number) {
  if (id === "family") return qty * 4;
  if (id === "fast") return 0;
  if (id === "day" || id === "child" || id === "season" || id === "group") return qty;
  return 0;
}

function sampleBand(wallets: Wallet[], guest: Data["guest"], name?: string) {
  const target = (guest?.name || name || "").trim().toLowerCase();
  const named = target ? wallets.find((wallet) => wallet.name.toLowerCase() === target) : undefined;
  return named ?? wallets.find((wallet) => wallet.id === "V-1042") ?? wallets[0];
}

export function evaluateGate(
  rides: Record<string, RideLive>,
  wallets: Wallet[],
  rideId: string,
  rfid: string,
  height: number,
): GateCheck[] {
  const ride = rideById(rideId);
  const live = rides[rideId];
  const wallet = wallets.find((item) => item.rfid.toLowerCase() === rfid.trim().toLowerCase());
  const heightOk = !ride?.height || (Number.isFinite(height) && height >= ride.height);
  return [
    {
      id: "pass",
      label: "Pass on file",
      ok: Boolean(wallet) && wallet?.status !== "expired",
      detail: wallet ? `${wallet.pass} · ${wallet.name}` : "No wristband for that RFID",
    },
    {
      id: "height",
      label: "Height clearance",
      ok: heightOk,
      detail: !ride?.height
        ? "No height limit"
        : heightOk
          ? `${height} cm clears ${ride.height} cm`
          : `${Number.isFinite(height) ? height : 0} cm is under the ${ride.height} cm minimum`,
    },
    {
      id: "wallet",
      label: "Wallet clear",
      ok: Boolean(wallet) && wallet?.status === "active",
      detail: !wallet
        ? "No band to charge"
        : wallet.status === "active"
          ? `Active · ${egp(wallet.balance)}`
          : wallet.status === "blocked"
            ? "Band is blocked"
            : "Pass is expired",
    },
    {
      id: "gate",
      label: "Gate open",
      ok: live?.status === "open",
      detail:
        live?.status === "open"
          ? "Open for dispatch"
          : live?.status === "maintenance"
            ? "Ride is in maintenance"
            : "Ride is closed",
    },
  ];
}

function saleLines(basket: BasketLine[]) {
  return basket
    .filter((line) => line.qty > 0)
    .map((line) => {
      const sku = skuById(line.id);
      return sku ? { sku, qty: line.qty } : null;
    })
    .filter((line): line is { sku: NonNullable<ReturnType<typeof skuById>>; qty: number } => Boolean(line));
}

export const usePark = create<Park>()(
  persist(
    (set, get) => ({
      ...initial,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      setTheme: (theme) => set({ theme }),
      signInGuest: (email, password) => {
        const clean = email.trim().toLowerCase();
        if (password !== DEMO_PASSWORD) return { ok: false, error: "That demo password does not match." };
        if (clean === DEMO_GUEST.email) {
          set({ guest: { name: DEMO_GUEST.name, email: DEMO_GUEST.email } });
          return { ok: true };
        }
        const pass = get().passes.find((item) => item.email.toLowerCase() === clean);
        if (!pass) {
          return {
            ok: false,
            error: "No e-pass on this device for that email. Book a pass first, or use the sample guest.",
          };
        }
        set({ guest: { name: pass.guestName, email: pass.email } });
        return { ok: true };
      },
      signOutGuest: () => set({ guest: null }),
      signInStaff: (role) => set({ staffRole: role }),
      switchStaff: (role) => set({ staffRole: role }),
      signOutStaff: () => set({ staffRole: null }),
      setRideStatus: (id, status) => {
        const current = get().rides[id];
        if (!current || current.status === status) return;
        const wasOpen = current.status === "open";
        const nowOpen = status === "open";
        let fleetUptime = get().fleetUptime;
        if (wasOpen && !nowOpen) fleetUptime = Math.max(90, Math.round((fleetUptime - 0.8) * 10) / 10);
        if (!wasOpen && nowOpen) fleetUptime = Math.min(99.9, Math.round((fleetUptime + 0.8) * 10) / 10);
        const name = rideById(id)?.name ?? "Ride";
        set({
          rides: {
            ...get().rides,
            [id]: { ...current, status, wait: nowOpen ? Math.max(current.wait, 4) : 0 },
          },
          fleetUptime,
          notices: pushNotice(get().notices, `${name} marked ${status}`),
        });
      },
      tickLive: () => {
        const rides = { ...get().rides };
        for (const id of Object.keys(rides)) {
          const live = rides[id];
          if (!live || live.status !== "open") continue;
          const delta = Math.random() < 0.5 ? -1 : 1;
          const wait = Math.max(2, Math.min(55, live.wait + (Math.random() < 0.65 ? delta : 0)));
          rides[id] = { ...live, wait };
        }
        const drift = Math.random() < 0.5 ? -3 : 4;
        set({ rides, guestsInside: Math.max(6100, get().guestsInside + drift) });
      },
      bookPass: (input) => {
        const sku = skuById(input.productId);
        if (!sku || sku.group !== "ticket" || sku.id === "fast") return { ok: false, error: "Choose a pass." };
        const fast = input.fastTrack ? 180 : 0;
        const subtotal = sku.price * input.qty + fast;
        const priced = quote(subtotal);
        let wallets = get().wallets;
        if (input.payment === "wristband") {
          const band = sampleBand(wallets, get().guest, input.name);
          if (!band || band.status !== "active") return { ok: false, error: "That wristband cannot be charged." };
          if (band.balance < priced.total) return { ok: false, error: "Wristband balance is too low for this booking." };
          wallets = wallets.map((wallet) =>
            wallet.id === band.id
              ? { ...wallet, balance: wallet.balance - priced.total, spend: wallet.spend + priced.total }
              : wallet,
          );
        }
        const code = /^PP-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(input.code) ? input.code : nid("PP").replace("PP-", "PP-DEMO-");
        const productName = input.productId === "day" ? "Neon Day Pass" : sku.name;
        const createdAt = new Date().toISOString();
        const status = input.payment === "gate" ? "held" : "confirmed";
        const pass: PassRecord = {
          code,
          productId: input.productId,
          productName,
          qty: input.qty,
          date: input.date,
          guestName: input.name.trim(),
          email: input.email.trim(),
          mobile: input.mobile.trim(),
          total: priced.total,
          payment: input.payment,
          fastTrack: input.fastTrack,
          status,
          createdAt,
          shared: true,
        };
        const ledger: LedgerRow = {
          id: code,
          title: code,
          detail: `${productName} × ${input.qty} guest${input.qty === 1 ? "" : "s"}`,
          channel: "Tickets",
          amount: priced.total,
          status: status === "held" ? "Held" : "Confirmed",
          createdAt,
          email: pass.email,
          shared: true,
        };
        const paid = input.payment !== "gate";
        const settlement: Settlement = {
          id: nid("S"),
          who: pass.guestName,
          channel: "Ticketing",
          detail: `Online · ${format(new Date(), "HH:mm")}`,
          amount: priced.total,
          at: createdAt,
        };
        set({
          wallets,
          passes: [pass, ...get().passes.filter((item) => item.code !== code)],
          ledger: [ledger, ...get().ledger.filter((item) => item.id !== code)],
          revenueToday: get().revenueToday + (paid ? priced.total : 0),
          guestsInside: get().guestsInside + admitFor(input.productId, input.qty),
          channels: {
            ...get().channels,
            ticketing: get().channels.ticketing + (paid ? priced.total : 0),
          },
          settlements: paid ? [settlement, ...get().settlements] : get().settlements,
          notices: pushNotice(get().notices, `${productName} booked · ${code}`),
          prefillEmail: pass.email,
        });
        return { ok: true, message: code };
      },
      setPassDate: (code, date) => {
        set({
          passes: get().passes.map((pass) => (pass.code === code ? { ...pass, date } : pass)),
        });
      },
      setFoodQty: (id, qty) => {
        const next = { ...get().foodCart };
        if (qty <= 0) delete next[id];
        else next[id] = Math.min(12, qty);
        set({ foodCart: next });
      },
      setCollection: (id) => set({ collectionId: id }),
      setSlot: (slot) => set({ slot }),
      placeFoodOrder: ({ email, name, pay }) => {
        const items = Object.entries(get().foodCart)
          .map(([id, qty]) => {
            const sku = skuById(id);
            if (!sku || qty <= 0) return null;
            return { id, name: sku.name, qty, price: sku.price };
          })
          .filter((item): item is FoodOrder["items"][number] => Boolean(item));
        if (!items.length) return { ok: false, error: "Add something from the kitchen first." };
        const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
        let wallets = get().wallets;
        if (pay === "wristband") {
          const band = sampleBand(wallets, get().guest, name);
          if (!band || band.status !== "active") return { ok: false, error: "That wristband cannot be charged." };
          if (band.balance < total) return { ok: false, error: "Wristband balance is too low for this order." };
          wallets = wallets.map((wallet) =>
            wallet.id === band.id ? { ...wallet, balance: wallet.balance - total, spend: wallet.spend + total } : wallet,
          );
        }
        const createdAt = new Date().toISOString();
        const id = nid("GO");
        const kitchen = kitchenLabel(get().collectionId);
        const order: FoodOrder = {
          id,
          items,
          kitchen,
          slot: get().slot,
          total,
          status: "preparing",
          pay,
          guestName: name.trim() || "Guest",
          email: email.trim(),
          createdAt,
          shared: true,
        };
        const mains = items.filter((item) => skuById(item.id)?.category === "Mains").reduce((sum, item) => sum + item.qty, 0);
        const drinks = items.filter((item) => skuById(item.id)?.category === "Drinks").reduce((sum, item) => sum + item.qty, 0);
        const detail =
          mains || drinks
            ? `${kitchen.split(" · ")[0]} · ${mains ? `${mains} main${mains === 1 ? "" : "s"}` : "snacks"}${drinks ? ` + ${drinks} drink${drinks === 1 ? "" : "s"}` : ""}`
            : `${kitchen.split(" · ")[0]} · ${items.length} item${items.length === 1 ? "" : "s"}`;
        const ledger: LedgerRow = {
          id,
          title: id,
          detail,
          channel: "Food pre-order",
          amount: total,
          status: "Preparing",
          createdAt,
          email: order.email,
          shared: true,
        };
        set({
          wallets,
          foodOrders: [order, ...get().foodOrders],
          ledger: [ledger, ...get().ledger],
          foodCart: {},
          channels: pay === "wristband" ? { ...get().channels, food: get().channels.food + total } : get().channels,
          revenueToday: pay === "wristband" ? get().revenueToday + total : get().revenueToday,
          notices: pushNotice(get().notices, `Food pre-order ${id} · ${kitchen.split(" · ")[0]}`),
          prefillEmail: order.email,
        });
        return { ok: true, message: id };
      },
      setFoodStatus: (id, status) => {
        const label = status === "ready" ? "Ready" : status === "collected" ? "Collected" : "Preparing";
        set({
          foodOrders: get().foodOrders.map((order) => (order.id === id ? { ...order, status } : order)),
          ledger: get().ledger.map((row) => (row.id === id ? { ...row, status: label } : row)),
          notices: pushNotice(get().notices, `${id} marked ${label.toLowerCase()}`),
        });
      },
      topUp: (walletId, amount) => {
        const wallet = get().wallets.find((item) => item.id === walletId);
        if (!wallet) return { ok: false, error: "Wallet missing." };
        if (wallet.status === "blocked") return { ok: false, error: "Unblock the band before topping up." };
        if (wallet.status === "expired") return { ok: false, error: "This pass has expired." };
        const createdAt = new Date().toISOString();
        const topId = nid("GO");
        const ledger =
          wallet.name === DEMO_GUEST.name
            ? [
                {
                  id: topId,
                  title: topId,
                  detail: "Wristband top-up",
                  channel: "Top-up",
                  amount,
                  status: "Confirmed",
                  createdAt,
                  email: DEMO_GUEST.email,
                  shared: false,
                } satisfies LedgerRow,
                ...get().ledger,
              ]
            : get().ledger;
        set({
          wallets: get().wallets.map((item) => (item.id === walletId ? { ...item, balance: item.balance + amount } : item)),
          revenueToday: get().revenueToday + amount,
          channels: { ...get().channels, wallet: get().channels.wallet + amount },
          settlements: [
            {
              id: nid("S"),
              who: wallet.name,
              channel: "Wallet Top-up",
              detail: `Wallet Top-up · ${format(new Date(), "HH:mm")}`,
              amount,
              at: createdAt,
            },
            ...get().settlements,
          ],
          ledger,
          notices: pushNotice(get().notices, `${wallet.name} topped up ${egp(amount)}`),
        });
        return { ok: true, message: `${wallet.name} now holds the new balance.` };
      },
      setWalletStatus: (walletId, status) => {
        set({
          wallets: get().wallets.map((wallet) => (wallet.id === walletId ? { ...wallet, status } : wallet)),
        });
      },
      addFeedback: ({ name, stars, body }) => {
        const note: FeedbackNote = {
          id: nid("FB"),
          name: name.trim() || "Guest",
          stars: Math.min(5, Math.max(1, stars)),
          tag: "Visit",
          channel: "GUEST APP",
          body: body.trim(),
          status: "open",
          at: new Date().toISOString(),
        };
        set({
          feedback: [note, ...get().feedback],
          notices: pushNotice(get().notices, `New guest note from ${note.name}`),
        });
      },
      setFeedbackStatus: (id, status) => {
        set({
          feedback: get().feedback.map((note) => (note.id === id ? { ...note, status } : note)),
        });
      },
      setLostStatus: (id, status) => {
        set({
          lost: get().lost.map((item) => (item.id === id ? { ...item, status } : item)),
          lostCounted: status === "unclaimed" ? get().lostCounted : Math.max(get().lostCounted, 1),
        });
      },
      countLost: () => set({ lostCounted: 1 }),
      addMaintenance: ({ rideId, title, note, severity }) => {
        const ticket: MaintTicket = {
          id: nid("MX"),
          rideId,
          title: title.trim(),
          severity,
          status: "open",
          at: new Date().toISOString(),
          note: note.trim(),
        };
        set({
          maintenance: [ticket, ...get().maintenance],
          notices: pushNotice(get().notices, `${ticket.id} opened on ${rideById(rideId)?.name ?? "a ride"}`),
        });
      },
      setMaintenanceStatus: (id, status) => {
        set({
          maintenance: get().maintenance.map((ticket) => (ticket.id === id ? { ...ticket, status } : ticket)),
        });
      },
      toggleCheck: (handoverId, checkId) => {
        set({
          handovers: get().handovers.map((handover) =>
            handover.id === handoverId
              ? {
                  ...handover,
                  checks: handover.checks.map((check) => (check.id === checkId ? { ...check, done: !check.done } : check)),
                }
              : handover,
          ),
        });
      },
      signOff: (handoverId) => {
        const handover = get().handovers.find((item) => item.id === handoverId);
        if (!handover) return;
        let tillsSigned = get().tillsSigned;
        let rideLogsSigned = get().rideLogsSigned;
        if (!handover.credited && handover.id === "HO-440") tillsSigned = Math.min(6, tillsSigned + 1);
        if (!handover.credited && handover.id === "HO-439") rideLogsSigned = Math.min(6, rideLogsSigned + 1);
        set({
          tillsSigned,
          rideLogsSigned,
          handovers: get().handovers.map((item) =>
            item.id === handoverId
              ? { ...item, credited: true, checks: item.checks.map((check) => ({ ...check, done: true })) }
              : item,
          ),
        });
      },
      cycleRoster: (id) => {
        set({
          roster: get().roster.map((member) =>
            member.id === id ? { ...member, status: ROSTER_NEXT[member.status] } : member,
          ),
        });
      },
      toggleSku: (id) => set({ catalog: { ...get().catalog, [id]: get().catalog[id] === false } }),
      addToBasket: (id) => {
        if (get().catalog[id] === false) return;
        const basket = get().basket;
        const line = basket.find((item) => item.id === id);
        set({
          basket: line
            ? basket.map((item) => (item.id === id ? { ...item, qty: Math.min(20, item.qty + 1) } : item))
            : [...basket, { id, qty: 1 }],
        });
      },
      setBasketQty: (id, qty) => {
        set({
          basket: qty <= 0 ? get().basket.filter((line) => line.id !== id) : get().basket.map((line) => (line.id === id ? { ...line, qty } : line)),
        });
      },
      setPosTab: (tab) => set({ posTab: tab }),
      setPromoInput: (value) => set({ promoInput: value, promoApplied: false }),
      applyPromo: () => {
        if (get().promoInput.trim().toUpperCase() === "PARK10") {
          set({ promoApplied: true });
          return { ok: true, message: "PARK10 applied — 10% off." };
        }
        set({ promoApplied: false });
        return { ok: false, error: "Code not recognised. Try PARK10." };
      },
      setPayMethod: (method) => set({ payMethod: method }),
      setTendered: (value) => set({ tendered: value.replace(/[^\d.]/g, "") }),
      newSale: () => set({ basket: [], promoApplied: false, tendered: "0" }),
      recordSale: (rfid) => {
        const lines = saleLines(get().basket);
        if (!lines.length) return { ok: false, error: "Basket is empty." };
        if (lines.some((line) => get().catalog[line.sku.id] === false)) {
          return { ok: false, error: "A SKU in the basket is off the catalogue." };
        }
        const subtotal = lines.reduce((sum, line) => sum + line.sku.price * line.qty, 0);
        const ticketSub = lines
          .filter((line) => line.sku.group === "ticket")
          .reduce((sum, line) => sum + line.sku.price * line.qty, 0);
        const priced = quote(subtotal, get().promoApplied ? 0.1 : 0);
        const ticketShare = subtotal ? ticketSub / subtotal : 0;
        const ticketTotal = Math.round(priced.total * ticketShare);
        const foodTotal = priced.total - ticketTotal;
        let wallets = get().wallets;
        let chargedName = "";
        if (get().payMethod === "cash") {
          const cash = Number(get().tendered);
          if (!Number.isFinite(cash) || cash < priced.total) return { ok: false, error: "Cash tendered is less than the total." };
        }
        if (get().payMethod === "rfid") {
          const wallet = wallets.find((item) => item.rfid.toLowerCase() === rfid.trim().toLowerCase());
          if (!wallet) return { ok: false, error: "No wristband matches that RFID." };
          if (wallet.status !== "active") return { ok: false, error: "That band is blocked or expired." };
          if (wallet.balance < priced.total) return { ok: false, error: "Wallet balance is too low." };
          chargedName = wallet.name;
          wallets = wallets.map((item) =>
            item.id === wallet.id ? { ...item, balance: item.balance - priced.total, spend: item.spend + priced.total } : item,
          );
        }
        const createdAt = new Date().toISOString();
        const admit = lines.reduce((sum, line) => sum + admitFor(line.sku.id, line.qty), 0);
        const who = chargedName || "Walk-in · Gate 2";
        const channel = foodTotal > ticketTotal ? "Food Court" : "Ticketing";
        const settlement: Settlement = {
          id: nid("TX"),
          who,
          channel,
          detail: `${channel} · ${format(new Date(), "HH:mm")}`,
          amount: priced.total,
          at: createdAt,
        };
        const salmaCharged = chargedName === DEMO_GUEST.name;
        const ledger = salmaCharged
          ? [
              {
                id: settlement.id,
                title: settlement.id,
                detail: lines.map((line) => `${line.sku.name} × ${line.qty}`).join(", "),
                channel: channel === "Food Court" ? "Food pre-order" : "Tickets",
                amount: priced.total,
                status: "Confirmed",
                createdAt,
                email: DEMO_GUEST.email,
                shared: false,
              } satisfies LedgerRow,
              ...get().ledger,
            ]
          : get().ledger;
        const cash = Number(get().tendered);
        const change = get().payMethod === "cash" ? Math.max(0, Math.round(cash - priced.total)) : 0;
        set({
          wallets,
          ledger,
          basket: [],
          promoApplied: false,
          tendered: "0",
          revenueToday: get().revenueToday + priced.total,
          guestsInside: get().guestsInside + admit,
          channels: {
            ticketing: get().channels.ticketing + ticketTotal,
            food: get().channels.food + foodTotal,
            retail: get().channels.retail,
            wallet: get().channels.wallet,
          },
          settlements: [settlement, ...get().settlements],
          notices: pushNotice(get().notices, `${settlement.id} settled · ${egp(priced.total)}`),
        });
        const message =
          get().payMethod === "cash"
            ? `Charged ${egp(priced.total)}. Change ${egp(change)}.`
            : `Charged ${egp(priced.total)}${chargedName ? ` to ${chargedName}` : ""}.`;
        return { ok: true, message };
      },
      dispatchGate: (rideId, rfid, height) => {
        const checks = evaluateGate(get().rides, get().wallets, rideId, rfid, height);
        const failed = checks.find((check) => !check.ok);
        if (failed) return { ok: false, error: failed.detail };
        const ride = rideById(rideId);
        const live = get().rides[rideId];
        if (!ride || !live) return { ok: false, error: "That gate is not on the board." };
        const wallet = get().wallets.find((item) => item.rfid.toLowerCase() === rfid.trim().toLowerCase());
        const scan: RideScan = {
          id: nid("RH"),
          ride: ride.name,
          guest: wallet?.name ?? "Walk-up",
          gate: ride.zone,
          at: new Date().toISOString(),
          result: "cleared",
        };
        set({
          rides: {
            ...get().rides,
            [rideId]: { ...live, riders: live.riders + 12, wait: Math.max(2, live.wait - 1) },
          },
          wallets: wallet
            ? get().wallets.map((item) => (item.id === wallet.id ? { ...item, rides: item.rides + 1 } : item))
            : get().wallets,
          history: [scan, ...get().history],
          notices: pushNotice(get().notices, `Dispatched ${ride.name} · ${scan.guest}`),
        });
        return { ok: true, message: `${scan.guest} cleared on ${ride.name}.` };
      },
      markNoticesRead: () => set({ notices: get().notices.map((notice) => ({ ...notice, read: true })) }),
      setPrefillEmail: (email) => set({ prefillEmail: email }),
    }),
    {
      name: "parkpulse",
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const data: Data = {
          theme: state.theme,
          guest: state.guest,
          staffRole: state.staffRole,
          rides: state.rides,
          guestsInside: state.guestsInside,
          revenueToday: state.revenueToday,
          fleetUptime: state.fleetUptime,
          wallets: state.wallets,
          passes: state.passes,
          foodOrders: state.foodOrders,
          ledger: state.ledger,
          settlements: state.settlements,
          channels: state.channels,
          feedback: state.feedback,
          lost: state.lost,
          maintenance: state.maintenance,
          roster: state.roster,
          handovers: state.handovers,
          history: state.history,
          notices: state.notices,
          catalog: state.catalog,
          tillsSigned: state.tillsSigned,
          rideLogsSigned: state.rideLogsSigned,
          lostCounted: state.lostCounted,
          foodCart: state.foodCart,
          collectionId: state.collectionId,
          slot: state.slot,
          basket: state.basket,
          posTab: state.posTab,
          promoInput: state.promoInput,
          promoApplied: state.promoApplied,
          payMethod: state.payMethod,
          tendered: state.tendered,
          prefillEmail: state.prefillEmail,
        };
        return data as unknown as Park;
      },
      onRehydrateStorage: () => () => {
        queueMicrotask(() => {
          usePark.getState().setHydrated(true);
        });
      },
    },
  ),
);

export function visibleRows<T extends { email: string; shared: boolean }>(rows: T[], email?: string | null) {
  if (!email) return [];
  const clean = email.toLowerCase();
  return rows.filter((row) => row.shared || row.email.toLowerCase() === clean);
}

export function bandForGuest(wallets: Wallet[], guest: { name: string; email: string } | null) {
  if (!guest) return wallets.find((wallet) => wallet.id === "V-1042") ?? null;
  return (
    wallets.find((wallet) => wallet.name.toLowerCase() === guest.name.toLowerCase()) ??
    (guest.email.toLowerCase() === DEMO_GUEST.email ? wallets.find((wallet) => wallet.id === "V-1042") ?? null : null)
  );
}
