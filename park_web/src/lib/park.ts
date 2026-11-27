import { format } from "date-fns";

export const DEMO_PASSWORD = "Pass@1234";
export const VAT = 0.14;
export const STATUS_PILL = "Park open · until 23:00";

export const DEMO_GUEST = {
  name: "Salma Ibrahim",
  email: "salma.guest@parkpulse.com",
  mobile: "+20 10 50355465",
  rfid: "RFID-88A4-19C2",
};

export type RoleId = "manager" | "cashier" | "operator";
export type ViewId =
  | "overview"
  | "pos"
  | "gates"
  | "wallets"
  | "feedback"
  | "reports"
  | "maintenance"
  | "shifts"
  | "staff";
export type RideStatus = "open" | "maintenance" | "closed";
export type PayMethod = "card" | "wristband" | "gate";
export type FoodStatus = "preparing" | "ready" | "collected";
export type BandStatus = "active" | "blocked" | "expired";
export type RosterStatus = "on-shift" | "on-break" | "off-duty" | "absent";

export type Ride = {
  id: string;
  name: string;
  zone: string;
  category: "Thrill" | "Family" | "Water" | "Indoor";
  duration: string;
  height: number | null;
  intensity: string;
  blurb: string;
  image: string;
  focus: string;
  capacity: number;
  operator: string;
};

export const RIDES: Ride[] = [
  {
    id: "sky",
    name: "Sky Serpent Coaster",
    zone: "Thrill Ridge",
    category: "Thrill",
    duration: "2 min 10 s",
    height: 130,
    intensity: "Extreme",
    blurb:
      "A 1.2 km steel serpent that dives through neon-lit tunnels at 92 km/h. The park's signature night ride.",
    image: "/media/coaster.jpg",
    focus: "object-center",
    capacity: 720,
    operator: "Ahmed Sabry",
  },
  {
    id: "wheel",
    name: "Golden Wheel",
    zone: "Sunset Pier",
    category: "Family",
    duration: "14 min",
    height: null,
    intensity: "Easy",
    blurb:
      "A 68-metre observation wheel with glass cabins, replaying the whole park skyline in a slow 14-minute loop.",
    image: "/media/wheel.jpg",
    focus: "object-center",
    capacity: 680,
    operator: "Nour Adel",
  },
  {
    id: "drop",
    name: "Twilight Drop",
    zone: "Thrill Ridge",
    category: "Thrill",
    duration: "1 min 05 s",
    height: 140,
    intensity: "Extreme",
    blurb:
      "A 60-metre night drop. The hold at the top looks over Lagoon Bay, then the brakes catch you in a violet shaft of light.",
    image: "/media/carnival.jpg",
    focus: "object-right",
    capacity: 520,
    operator: "Mariam Zaki",
  },
  {
    id: "vr",
    name: "Pulse VR Arena",
    zone: "Arcade Alley",
    category: "Indoor",
    duration: "12 min",
    height: 120,
    intensity: "Moderate",
    blurb:
      "Six-player free-roam VR arena with four scenarios, including a build-your-own coaster challenge.",
    image: "/media/vr.jpg",
    focus: "object-center",
    capacity: 240,
    operator: "Ahmed Sabry",
  },
  {
    id: "carousel",
    name: "Carousel Royale",
    zone: "Heritage Square",
    category: "Family",
    duration: "4 min",
    height: null,
    intensity: "Easy",
    blurb: "An ornate grand carousel under warm bulbs. No height limit, and the organ plays the parade theme.",
    image: "/media/nightpark.jpg",
    focus: "object-center",
    capacity: 700,
    operator: "Youssef Amin",
  },
  {
    id: "sparks",
    name: "Little Sparks Playland",
    zone: "Family Meadow",
    category: "Family",
    duration: "Open play",
    height: null,
    intensity: "Easy",
    blurb:
      "Soft-play towers, a mini train and a supervised crawl zone. Park hosts all ages under 12 — no height limit.",
    image: "/media/carnival.jpg",
    focus: "object-left",
    capacity: 400,
    operator: "Rana Tarek",
  },
  {
    id: "aqua",
    name: "Aqua Canyon Rapids",
    zone: "Lagoon Bay",
    category: "Water",
    duration: "6 min",
    height: 120,
    intensity: "Moderate",
    blurb: "A raft ride through mist and canyon walls. Closed tonight while the pump seal is replaced.",
    image: "/media/rapids.jpg",
    focus: "object-center",
    capacity: 480,
    operator: "Hossam Nabil",
  },
  {
    id: "bumper",
    name: "Neon Drift Bumper Cars",
    zone: "Arcade Alley",
    category: "Indoor",
    duration: "3 min",
    height: 110,
    intensity: "Moderate",
    blurb: "Glossy-floor bumper cars under cyan and magenta light. The floor is being re-laid after last night.",
    image: "/media/wheel.jpg",
    focus: "object-bottom",
    capacity: 360,
    operator: "Nour Adel",
  },
];

export type RideLive = {
  wait: number;
  status: RideStatus;
  riders: number;
  downtime: number;
};

export const INITIAL_RIDES: Record<string, RideLive> = {
  sky: { wait: 24, status: "open", riders: 812, downtime: 4 },
  wheel: { wait: 12, status: "open", riders: 640, downtime: 0 },
  drop: { wait: 38, status: "open", riders: 585, downtime: 22 },
  vr: { wait: 18, status: "open", riders: 288, downtime: 6 },
  carousel: { wait: 6, status: "open", riders: 730, downtime: 0 },
  sparks: { wait: 4, status: "open", riders: 410, downtime: 0 },
  aqua: { wait: 0, status: "maintenance", riders: 0, downtime: 428 },
  bumper: { wait: 0, status: "closed", riders: 0, downtime: 90 },
};

export type Sku = {
  id: string;
  name: string;
  detail: string;
  price: number;
  group: "ticket" | "food";
  category?: "Mains" | "Snacks" | "Sweets" | "Drinks";
  prep?: number;
  image?: string;
  meta?: string;
};

export const TICKETS: Sku[] = [
  { id: "day", name: "Day Pass", detail: "Full park access · 1 guest", price: 350, group: "ticket", meta: "Unlimited" },
  { id: "child", name: "Child Pass", detail: "Ages 3–12 · 1 guest", price: 220, group: "ticket", meta: "Unlimited" },
  { id: "family", name: "Family Bundle", detail: "2 adults + 2 children", price: 950, group: "ticket", meta: "Unlimited" },
  { id: "fast", name: "Fast Track Add-on", detail: "Skip the line · 1 guest", price: 180, group: "ticket", meta: "Unlimited" },
  { id: "season", name: "Season Pass", detail: "12 months unlimited", price: 4200, group: "ticket", meta: "Unlimited" },
  { id: "group", name: "Group 10+", detail: "Per guest · advance booking", price: 280, group: "ticket", meta: "Unlimited" },
];

export const GUEST_PASSES = TICKETS.filter((t) => ["day", "child", "family"].includes(t.id));

export const FOOD: Sku[] = [
  {
    id: "burger",
    name: "Coaster Burger Meal",
    detail: "Double patty, neon sauce, fries and a soda",
    price: 120,
    group: "food",
    category: "Mains",
    prep: 12,
    image: "/media/burger.jpg",
  },
  {
    id: "pizza",
    name: "Sky Serpent Pizza",
    detail: "Stone-baked pepperoni with a chilli honey drizzle",
    price: 165,
    group: "food",
    category: "Mains",
    prep: 15,
    image: "/media/pizza.jpg",
  },
  {
    id: "wrap",
    name: "Lagoon Chicken Wrap",
    detail: "Grilled chicken, pickles, garlic yoghurt",
    price: 95,
    group: "food",
    category: "Mains",
    prep: 9,
    image: "/media/wrap.jpg",
  },
  {
    id: "fries",
    name: "Neon Fries",
    detail: "Twice-cooked fries, chilli salt, neon sauce",
    price: 45,
    group: "food",
    category: "Snacks",
    prep: 6,
    image: "/media/fries.jpg",
  },
  {
    id: "churros",
    name: "Heritage Churros",
    detail: "Cinnamon sugar and warm chocolate",
    price: 40,
    group: "food",
    category: "Sweets",
    prep: 8,
    image: "/media/churros.jpg",
  },
  {
    id: "lemonade",
    name: "Fresh Lemonade",
    detail: "Lemon, lime, mint, lots of ice",
    price: 25,
    group: "food",
    category: "Drinks",
    prep: 3,
    image: "/media/lemonade.jpg",
  },
  {
    id: "soda",
    name: "Lagoon Lime Soda",
    detail: "Sparkling lime and crushed ice",
    price: 30,
    group: "food",
    category: "Drinks",
    prep: 3,
    image: "/media/soda.jpg",
  },
];

export const SKUS: Sku[] = [...TICKETS, ...FOOD];

export const KITCHENS = [
  { id: "neon", name: "Neon Bites", zone: "Arcade Alley" },
  { id: "lagoon", name: "Lagoon Grill", zone: "Lagoon Bay" },
  { id: "heritage", name: "Heritage Kiosk", zone: "Heritage Square" },
  { id: "pier", name: "Sunset Pier Snacks", zone: "Sunset Pier" },
];

export const SHOWS = [
  { time: "17:30", name: "Sunset Pier Drumline", place: "Sunset Pier Stage", mins: 25, kind: "SHOW" },
  { time: "18:45", name: "Neon Pulse Parade", place: "Main Boulevard", mins: 30, kind: "PARADE" },
  { time: "19:30", name: "Sky Serpent Light Sync", place: "Thrill Ridge", mins: 15, kind: "SHOW" },
  { time: "20:15", name: "Meet the Pulse Crew", place: "Heritage Square", mins: 20, kind: "MEET & GREET" },
  { time: "21:30", name: "Laser & Fireworks Finale", place: "Lagoon Bay", mins: 18, kind: "FIREWORKS" },
];

export const FAQS = [
  {
    q: "Do I need a wristband if I booked online?",
    a: "Yes. Your e-pass is scanned at the gate and swapped for a wristband. The band is your ticket, wallet and ride key for the night. Re-entry works with the same band or the e-pass code.",
  },
  {
    q: "Can I move my booking to another date?",
    a: "Free date changes are allowed up to 24 hours before your visit. Inside 24 hours the pass stays locked to the original night. Open My Pass and pick a new date on a confirmed e-pass.",
  },
  {
    q: "How does the food pre-order work?",
    a: "Pick a kitchen, choose a collection slot and pay with your wristband at pickup. Food is held under your order code for 15 minutes past the slot.",
  },
];

export const ROLES: Record<
  RoleId,
  { id: RoleId; title: string; name: string; email: string; initials: string; blurb: string }
> = {
  manager: {
    id: "manager",
    title: "Park Manager",
    name: "Omar Fathy",
    email: "omar.manager@parkpulse.com",
    initials: "OF",
    blurb: "Revenue, admissions, ride uptime and full staff governance.",
  },
  cashier: {
    id: "cashier",
    title: "Cashier",
    name: "Khaled Mostafa",
    email: "khaled.cashier@parkpulse.com",
    initials: "KM",
    blurb: "Ticketing & food court point of sale with promo quoting.",
  },
  operator: {
    id: "operator",
    title: "Ride Operator",
    name: "Ahmed Sabry",
    email: "ahmed.operator@parkpulse.com",
    initials: "AS",
    blurb: "Gate safety, height checks and boarding clearance.",
  },
};

export const NAV: { group: string; items: { id: ViewId; label: string; hint: string; roles: RoleId[] }[] }[] = [
  {
    group: "Operations",
    items: [
      { id: "overview", label: "Overview", hint: "Revenue & park health", roles: ["manager"] },
      { id: "pos", label: "Ticketing & POS", hint: "Sell passes and food", roles: ["manager", "cashier"] },
      { id: "gates", label: "Ride Gates", hint: "Boarding & safety", roles: ["manager", "operator"] },
    ],
  },
  {
    group: "Guest experience",
    items: [
      { id: "wallets", label: "Visitor Wallets", hint: "RFID balances", roles: ["manager", "cashier"] },
      { id: "feedback", label: "Feedback & Lost Property", hint: "Guest voice desk", roles: ["manager", "cashier"] },
    ],
  },
  {
    group: "Management",
    items: [
      { id: "reports", label: "Reports & Analytics", hint: "Exports & trends", roles: ["manager"] },
      { id: "maintenance", label: "Maintenance Log", hint: "Tickets & incidents", roles: ["manager", "operator"] },
      { id: "shifts", label: "Shift Handover", hint: "Attendance & notes", roles: ["manager", "cashier", "operator"] },
      { id: "staff", label: "Staff & Catalog", hint: "Governance", roles: ["manager"] },
    ],
  },
];

export function viewsFor(role: RoleId): ViewId[] {
  return NAV.flatMap((group) => group.items.filter((item) => item.roles.includes(role)).map((item) => item.id));
}

export function landingFor(role: RoleId): ViewId {
  if (role === "operator") return "gates";
  if (role === "cashier") return "pos";
  return "overview";
}

export type Wallet = {
  id: string;
  name: string;
  party: string;
  pass: string;
  rfid: string;
  balance: number;
  status: BandStatus;
  rides: number;
  spend: number;
};

export const INITIAL_WALLETS: Wallet[] = [
  { id: "V-1042", name: "Salma Ibrahim", party: "party of 2", pass: "Season Pass", rfid: "RFID-88A4-19C2", balance: 640, status: "active", rides: 6, spend: 470 },
  { id: "V-1043", name: "Yara Rabie", party: "party of 4", pass: "Day Pass", rfid: "RFID-2287-4D01", balance: 180, status: "active", rides: 3, spend: 220 },
  { id: "V-1044", name: "Mohamed Adel", party: "party of 5", pass: "Family Bundle", rfid: "RFID-91C3-7F55", balance: 1250, status: "active", rides: 8, spend: 640 },
  { id: "V-1048", name: "Dina Ashraf", party: "party of 1", pass: "Day Pass", rfid: "RFID-11B2-90AA", balance: 40, status: "active", rides: 2, spend: 460 },
  { id: "V-1033", name: "Karim Fouad", party: "party of 2", pass: "Day Pass", rfid: "RFID-77E1-2C10", balance: 0, status: "blocked", rides: 1, spend: 180 },
  { id: "V-0991", name: "Lina Farid", party: "party of 3", pass: "Season Pass", rfid: "RFID-55D0-18EE", balance: 90, status: "expired", rides: 0, spend: 0 },
  { id: "V-1050", name: "Nour Hassan", party: "party of 2", pass: "Day Pass", rfid: "RFID-19AA-1001", balance: 900, status: "active", rides: 4, spend: 120 },
  { id: "V-1051", name: "Tarek Soliman", party: "party of 3", pass: "Family Bundle", rfid: "RFID-19AA-1002", balance: 1500, status: "active", rides: 5, spend: 310 },
  { id: "V-1052", name: "Farah Nabil", party: "party of 1", pass: "Day Pass", rfid: "RFID-19AA-1003", balance: 800, status: "active", rides: 2, spend: 90 },
  { id: "V-1053", name: "Hassan Lotfy", party: "party of 6", pass: "Group 10+", rfid: "RFID-19AA-1004", balance: 2200, status: "active", rides: 7, spend: 540 },
  { id: "V-1054", name: "Maha Fathy", party: "party of 2", pass: "Season Pass", rfid: "RFID-19AA-1005", balance: 640, status: "active", rides: 9, spend: 210 },
  { id: "V-1055", name: "Omar Sharif", party: "party of 4", pass: "Family Bundle", rfid: "RFID-19AA-1006", balance: 1100, status: "active", rides: 3, spend: 260 },
  { id: "V-1056", name: "Layla Mostafa", party: "party of 2", pass: "Day Pass", rfid: "RFID-19AA-1007", balance: 1750, status: "active", rides: 6, spend: 180 },
  { id: "V-1057", name: "Yassin Adel", party: "party of 1", pass: "Child Pass", rfid: "RFID-19AA-1008", balance: 980, status: "active", rides: 4, spend: 70 },
  { id: "V-1058", name: "Nada Kamal", party: "party of 3", pass: "Day Pass", rfid: "RFID-19AA-1009", balance: 1360, status: "active", rides: 5, spend: 300 },
  { id: "V-1059", name: "Seif Rahman", party: "party of 2", pass: "Fast Track Add-on", rfid: "RFID-19AA-1010", balance: 1400, status: "active", rides: 8, spend: 420 },
];

export type PassRecord = {
  code: string;
  productId: string;
  productName: string;
  qty: number;
  date: string;
  guestName: string;
  email: string;
  mobile: string;
  total: number;
  payment: PayMethod;
  fastTrack: boolean;
  status: "confirmed" | "held";
  createdAt: string;
  shared: boolean;
};

export type FoodOrder = {
  id: string;
  items: { id: string; name: string; qty: number; price: number }[];
  kitchen: string;
  slot: string;
  total: number;
  status: FoodStatus;
  pay: "pickup" | "wristband";
  guestName: string;
  email: string;
  createdAt: string;
  shared: boolean;
};

export type LedgerRow = {
  id: string;
  title: string;
  detail: string;
  channel: string;
  amount: number;
  status: string;
  createdAt: string;
  email: string;
  shared: boolean;
};

export type Settlement = {
  id: string;
  who: string;
  channel: string;
  detail: string;
  amount: number;
  at: string;
};

export type FeedbackNote = {
  id: string;
  name: string;
  stars: number;
  tag: string;
  channel: string;
  body: string;
  status: "open" | "reviewed" | "resolved";
  at: string;
};

export type LostItem = {
  id: string;
  name: string;
  place: string;
  at: string;
  status: "unclaimed" | "claimed" | "returned";
};

export type MaintTicket = {
  id: string;
  rideId: string;
  title: string;
  severity: "low" | "medium" | "high";
  status: "open" | "in-progress" | "closed";
  at: string;
  note: string;
};

export type RosterMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  assignment: string;
  shift: string;
  today: string;
  status: RosterStatus;
  initials: string;
};

export type Handover = {
  id: string;
  ref: string;
  name: string;
  initials: string;
  role: string;
  place: string;
  window: string;
  note: string;
  credited: boolean;
  checks: { id: string; label: string; done: boolean }[];
};

export type RideScan = {
  id: string;
  ride: string;
  guest: string;
  gate: string;
  at: string;
  result: "cleared" | "held";
};

export type Notice = { id: string; text: string; at: string; read: boolean };

export const WEEK = [
  { d: "Mon", guests: 41 },
  { d: "Tue", guests: 44 },
  { d: "Wed", guests: 48 },
  { d: "Thu", guests: 52 },
  { d: "Fri", guests: 61 },
  { d: "Sat", guests: 66 },
  { d: "Sun", guests: 58 },
];

export function egp(n: number) {
  return `EGP ${Math.round(n).toLocaleString("en-US")}`;
}

export function egpCompact(n: number) {
  const abs = Math.abs(n);
  if (abs >= 10000) {
    const k = n / 1000;
    const digits = Math.abs(k) >= 100 ? 0 : 1;
    return `EGP ${k.toFixed(digits)}k`;
  }
  return egp(n);
}

export function guestFieldsOk(name: string, email: string, mobile: string) {
  const n = name.trim();
  const e = email.trim().toLowerCase();
  const digits = mobile.replace(/\D/g, "");
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e !== "you@example.com";
  const placeholderMobile = digits === "201000000000" || /0{6,}/.test(digits);
  const mobileOk = digits.length >= 8 && !placeholderMobile;
  return n.length >= 2 && emailOk && mobileOk;
}

export function productLabel(id: string) {
  if (id === "day") return "Neon Day Pass";
  return skuById(id)?.name ?? "Pass";
}

export function utilPct(riders: number, capacity: number, downtime: number) {
  if (riders <= 0) return 0;
  if (downtime >= 20) return 97;
  return riders / capacity >= 0.9 ? 100 : Math.round((riders / capacity) * 100);
}

export function quote(subtotal: number, rate = 0) {
  const discount = Math.round(subtotal * rate);
  const net = subtotal - discount;
  const vat = Math.round(net * VAT);
  return { discount, net, vat, total: net + vat };
}

export function nid(prefix: string) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function passCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const chunk = (n: number) =>
    Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `PP-${chunk(4)}-${chunk(4)}`;
}

export function stampLabel(iso: string) {
  return format(new Date(iso), "d MMM · HH:mm");
}

export function whenLabel(iso: string, now = new Date()) {
  const d = new Date(iso);
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  const day =
    d.toDateString() === now.toDateString()
      ? "Today"
      : d.toDateString() === yest.toDateString()
        ? "Yesterday"
        : format(d, "d MMM");
  return `${day} · ${format(d, "HH:mm")}`;
}

export function minutesUntil(hhmm: string, now: Date) {
  const [h, m] = hhmm.split(":").map(Number);
  const target = new Date(now);
  target.setHours(h ?? 0, m ?? 0, 0, 0);
  let diff = Math.round((target.getTime() - now.getTime()) / 60000);
  if (diff < 0) diff += 24 * 60;
  return diff;
}

export function fmtDur(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m} min`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function pickupSlots(now: Date) {
  const slots: string[] = [];
  const evening = new Date(now);
  evening.setHours(17, 45, 0, 0);
  const cursor = new Date(now);
  cursor.setSeconds(0, 0);
  const bump = 30 - (cursor.getMinutes() % 30 || 30);
  cursor.setMinutes(cursor.getMinutes() + bump);
  const start = cursor < evening ? evening : cursor;
  for (let i = 0; i < 4; i += 1) {
    slots.push(format(new Date(start.getTime() + i * 30 * 60000), "HH:mm"));
  }
  return slots;
}

export function rideById(id: string) {
  return RIDES.find((ride) => ride.id === id);
}

export function skuById(id: string) {
  return SKUS.find((sku) => sku.id === id);
}

export function openCount(rides: Record<string, RideLive>) {
  return Object.values(rides).filter((ride) => ride.status === "open").length;
}

export function avgWait(rides: Record<string, RideLive>) {
  const open = Object.values(rides).filter((ride) => ride.status === "open");
  if (!open.length) return 0;
  return Math.round(open.reduce((sum, ride) => sum + ride.wait, 0) / open.length);
}

export function uptime(rides: Record<string, RideLive>) {
  const values = Object.values(rides);
  const penalty = values.filter((ride) => ride.status !== "open").length * 0.8;
  return Math.max(90, 98.4 - penalty);
}

export const INITIAL_PASSES: PassRecord[] = [
  {
    code: "PP-SLMA-1042",
    productId: "day",
    productName: "Neon Day Pass",
    qty: 1,
    date: "2026-11-26",
    guestName: "Salma Ibrahim",
    email: DEMO_GUEST.email,
    mobile: DEMO_GUEST.mobile,
    total: 350,
    payment: "card",
    fastTrack: false,
    status: "confirmed",
    createdAt: "2026-11-26T11:05:00",
    shared: false,
  },
];

export const INITIAL_FOOD: FoodOrder[] = [
  {
    id: "GO-2291",
    items: [
      { id: "wrap", name: "Lagoon Grill mains", qty: 2, price: 95 },
      { id: "lemonade", name: "drinks", qty: 2, price: 25 },
    ],
    kitchen: "Lagoon Grill · Lagoon Bay",
    slot: "18:15",
    total: 305,
    status: "ready",
    pay: "wristband",
    guestName: "Salma Ibrahim",
    email: DEMO_GUEST.email,
    createdAt: "2026-11-26T18:20:00",
    shared: false,
  },
];

export const INITIAL_LEDGER: LedgerRow[] = [
  {
    id: "GO-2291",
    title: "GO-2291",
    detail: "Lagoon Grill · 2 mains + 2 drinks",
    channel: "Food pre-order",
    amount: 305,
    status: "Ready",
    createdAt: "2026-11-26T18:20:00",
    email: DEMO_GUEST.email,
    shared: false,
  },
  {
    id: "GO-2284",
    title: "GO-2284",
    detail: "Neon Day Pass × 1 guest",
    channel: "Tickets",
    amount: 350,
    status: "Confirmed",
    createdAt: "2026-11-26T11:05:00",
    email: DEMO_GUEST.email,
    shared: false,
  },
  {
    id: "GO-2210",
    title: "GO-2210",
    detail: "Wristband top-up",
    channel: "Top-up",
    amount: 300,
    status: "Confirmed",
    createdAt: "2026-11-26T10:58:00",
    email: DEMO_GUEST.email,
    shared: false,
  },
  {
    id: "GO-2177",
    title: "GO-2177",
    detail: "Pulse hoodie · size M",
    channel: "Retail",
    amount: 420,
    status: "Collected",
    createdAt: "2026-10-12T20:14:00",
    email: DEMO_GUEST.email,
    shared: false,
  },
  {
    id: "GO-2165",
    title: "GO-2165",
    detail: "Heritage Kiosk · churros + lemonade",
    channel: "Food pre-order",
    amount: 75,
    status: "Collected",
    createdAt: "2026-10-12T19:32:00",
    email: DEMO_GUEST.email,
    shared: false,
  },
];

export const INITIAL_SETTLEMENTS: Settlement[] = [
  { id: "S1", who: "Walk-in · Gate 2", channel: "Ticketing", detail: "Ticketing · 18:42", amount: 1050, at: "2026-11-27T18:42:00" },
  { id: "S2", who: "Walk-in · Online", channel: "Ticketing", detail: "Ticketing · 18:14", amount: 700, at: "2026-11-27T18:14:00" },
  { id: "S3", who: "Salma Ibrahim", channel: "Wallet Top-up", detail: "Wallet Top-up · 18:31", amount: 500, at: "2026-11-27T18:31:00" },
  { id: "S4", who: "Dina Ashraf", channel: "Retail", detail: "Retail · 18:02", amount: 460, at: "2026-11-27T18:02:00" },
  { id: "S5", who: "Family Bundle · V-1049", channel: "Food Court", detail: "Food Court · 17:58", amount: 385, at: "2026-11-27T17:58:00" },
  { id: "S6", who: "Habiba Nabil", channel: "Food Court", detail: "Food Court · 17:55", amount: 245, at: "2026-11-27T17:55:00" },
];

export const INITIAL_FEEDBACK: FeedbackNote[] = [
  {
    id: "FB-510",
    name: "Omar guest tablet",
    stars: 3,
    tag: "Staff",
    channel: "GATE TABLET",
    body: "Family bundle checkout was quick, but the locker near gate 2 was out of order.",
    status: "open",
    at: "2026-11-27T15:02:00",
  },
  {
    id: "FB-509",
    name: "Habiba Nabil",
    stars: 5,
    tag: "Staff",
    channel: "GUEST APP",
    body: "Rana at Neon Bites noticed my daughter's birthday and brought a candle with the sundae. Lovely moment.",
    status: "resolved",
    at: "2026-11-27T13:38:00",
  },
  {
    id: "FB-508",
    name: "Karim Fouad",
    stars: 2,
    tag: "Value",
    channel: "EMAIL FOLLOW-UP",
    body: "Paid for fast track but Twilight Drop was stopped for 20 minutes. Refund process took too long.",
    status: "reviewed",
    at: "2026-11-26T20:10:00",
  },
  {
    id: "FB-507",
    name: "Menna Habib",
    stars: 4,
    tag: "Ride experience",
    channel: "GUEST APP",
    body: "The map in the app is great. Adding ride waits to it would make it perfect.",
    status: "resolved",
    at: "2026-11-26T19:02:00",
  },
];

export const INITIAL_LOST: LostItem[] = [
  { id: "LF-2196", name: "Prescription glasses, tortoise frame", place: "Twilight Drop exit", at: "2026-11-27T14:05:00", status: "unclaimed" },
  { id: "LF-2195", name: "Silver bracelet (engraved 'M.S.')", place: "Heritage Square fountain", at: "2026-11-26T20:30:00", status: "returned" },
  { id: "LF-2198", name: "Souvenir popcorn bucket", place: "Arcade Alley", at: "2026-11-26T19:12:00", status: "unclaimed" },
];

export const INITIAL_MAINT: MaintTicket[] = [
  {
    id: "MX-441",
    rideId: "aqua",
    title: "Pump seal weeping on canyon lift",
    severity: "high",
    status: "in-progress",
    at: "2026-11-27T09:10:00",
    note: "Ride held. Parts cage has the replacement seal. Do not dispatch rafts.",
  },
  {
    id: "MX-438",
    rideId: "sky",
    title: "250-hour chain inspection",
    severity: "medium",
    status: "closed",
    at: "2026-11-27T08:20:00",
    note: "Chain within tolerance. Height gate catching about 12 guests an hour.",
  },
  {
    id: "MX-436",
    rideId: "drop",
    title: "Brake stack temperature watch",
    severity: "low",
    status: "open",
    at: "2026-11-26T21:40:00",
    note: "Logged after the 20-minute stop. Running, but log every dispatch block.",
  },
];

export const INITIAL_ROSTER: RosterMember[] = [
  { id: "omar", name: "Omar Fathy", email: "omar.manager@parkpulse.com", role: "Manager", assignment: "Control Room", shift: "09:00 – 21:00", today: "—", status: "on-shift", initials: "OF" },
  { id: "khaled", name: "Khaled Mostafa", email: "khaled.cashier@parkpulse.com", role: "Cashier", assignment: "Gate 1 Ticketing", shift: "09:00 – 18:00", today: "EGP 18,420", status: "on-shift", initials: "KM" },
  { id: "rana", name: "Rana Tarek", email: "rana.cashier@parkpulse.com", role: "Cashier", assignment: "Food Court A", shift: "12:00 – 21:00", today: "EGP 9,260", status: "on-break", initials: "RT" },
  { id: "ahmed", name: "Ahmed Sabry", email: "ahmed.operator@parkpulse.com", role: "Ride Operator", assignment: "Sky Serpent Coaster", shift: "09:00 – 18:00", today: "—", status: "on-shift", initials: "AS" },
  { id: "nour", name: "Nour Adel", email: "nour.operator@parkpulse.com", role: "Ride Operator", assignment: "Golden Wheel", shift: "10:00 – 19:00", today: "—", status: "on-shift", initials: "NA" },
  { id: "mariam", name: "Mariam Zaki", email: "mariam.operator@parkpulse.com", role: "Ride Operator", assignment: "Twilight Drop", shift: "12:00 – 21:00", today: "—", status: "on-shift", initials: "MZ" },
  { id: "hossam", name: "Hossam Nabil", email: "hossam.maint@parkpulse.com", role: "Maintenance", assignment: "Aqua Canyon Rapids", shift: "08:00 – 17:00", today: "—", status: "on-shift", initials: "HN" },
  { id: "youssef", name: "Youssef Amin", email: "youssef.operator@parkpulse.com", role: "Ride Operator", assignment: "Carousel Royale", shift: "—", today: "—", status: "off-duty", initials: "YA" },
];

export const INITIAL_HANDOVERS: Handover[] = [
  {
    id: "HO-440",
    ref: "HO-440",
    name: "Khaled Mostafa",
    initials: "KM",
    role: "Cashier · Gate 1",
    place: "Morning → Evening",
    window: "2/3",
    note: "Drawer at EGP 1,840 float. Two refunds raised (TX-90237, TX-90231) both pending manager approval. Card terminal 2 reconnected at 13:20.",
    credited: false,
    checks: [
      { id: "c1", label: "Refunds documented with receipts", done: true },
      { id: "c2", label: "Card terminal 2 tested", done: true },
      { id: "c3", label: "Handover float counted with Rana", done: false },
    ],
  },
  {
    id: "HO-439",
    ref: "HO-439",
    name: "Ahmed Sabry",
    initials: "AS",
    role: "Ride Operator · Sky Serpent",
    place: "Morning → Evening",
    window: "2/4",
    note: "Coaster running clean after the 250-hour chain inspection. Height check at the gate is catching about 12 guests per hour — extra host recommended for the 19:00 rush.",
    credited: false,
    checks: [
      { id: "c1", label: "Restraint test cycle completed", done: true },
      { id: "c2", label: "Boarding log handed to Mariam", done: true },
      { id: "c3", label: "Extra host requested for 19:00", done: false },
      { id: "c4", label: "Queue barrier extension installed", done: false },
    ],
  },
];

export const INITIAL_HISTORY: RideScan[] = [
  { id: "rh1", ride: "Sky Serpent Coaster", guest: "Salma Ibrahim", gate: "Thrill Ridge", at: "2026-11-26T18:02:00", result: "cleared" },
  { id: "rh2", ride: "Golden Wheel", guest: "Salma Ibrahim", gate: "Sunset Pier", at: "2026-11-26T17:11:00", result: "cleared" },
  { id: "rh3", ride: "Carousel Royale", guest: "Salma Ibrahim", gate: "Heritage Square", at: "2026-11-26T16:40:00", result: "cleared" },
];

export const ROSTER_NEXT: Record<RosterStatus, RosterStatus> = {
  "on-shift": "on-break",
  "on-break": "off-duty",
  "off-duty": "absent",
  absent: "on-shift",
};

export const ROSTER_LABEL: Record<RosterStatus, string> = {
  "on-shift": "On shift",
  "on-break": "On break",
  "off-duty": "Off duty",
  absent: "Absent",
};
