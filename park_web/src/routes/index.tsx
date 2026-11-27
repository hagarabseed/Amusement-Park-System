import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowRight, Car, Clock3, Droplets, MapPin, Music, Phone, Sparkles, Ticket, Users, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { GuestFrame, Stars, WristbandDialog } from "@/components/guest-frame";
import { Button } from "@/components/ui";
import { FAQS, RIDES, SHOWS, avgWait, fmtDur, minutesUntil, openCount, rideById } from "@/lib/park";
import { usePark } from "@/lib/store";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Pulse · Sunset Park" }] }),
  component: HomePage,
});

const PREVIEW = ["sky", "wheel", "drop", "aqua"];

function focusClass(focus: string) {
  if (focus === "object-right") return "object-right";
  if (focus === "object-left") return "object-left";
  if (focus === "object-bottom") return "object-bottom";
  return "object-center";
}

function HomePage() {
  const rides = usePark((state) => state.rides);
  const guests = usePark((state) => state.guestsInside);
  const uptime = usePark((state) => state.fleetUptime);
  const addFeedback = usePark((state) => state.addFeedback);
  const now = useNow(1000);
  const [bandOpen, setBandOpen] = useState(false);
  const [note, setNote] = useState("");
  const [name, setName] = useState("");
  const [stars, setStars] = useState(5);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const clock = now ? format(now, "HH:mm") : "--:--";
  const finale = now ? fmtDur(minutesUntil("21:30", now)) : "21:30";
  const open = openCount(rides);
  const wait = avgWait(rides);

  return (
    <GuestFrame>
      <section className="relative overflow-hidden">
        <div className="park-grid pointer-events-none absolute inset-0" />
        <img
          src="/media/coaster.jpg"
          alt=""
          className="pointer-events-none absolute top-0 right-0 hidden h-full w-[55%] object-cover opacity-35 [mask-image:linear-gradient(90deg,transparent,black_30%)] lg:block"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs font-semibold tracking-[0.16em] text-cyan">
              <span className="size-1.5 rounded-full bg-cyan" />
              SUNSET PARK · NEW CAIRO
            </p>
            <h1 className="mt-6 max-w-xl text-5xl font-extrabold tracking-tight text-fg md:text-6xl">
              Your night at the park, <span className="text-cyan">one pulse from start.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted md:text-lg">
              Buy your pass, load a wristband and pre-order food before you reach the gate. Live queue times, show schedules and your e-pass all live in one place — no printing, no queueing twice.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/tickets" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-cyan px-5 text-sm font-semibold text-on-cyan">
                <Ticket className="size-4" />
                Book your pass
              </Link>
              <Link to="/attractions" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-5 text-sm font-semibold">
                <Zap className="size-4" />
                See live queues
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-line pt-6 sm:grid-cols-4">
              <Stat k="Rides & shows" v="42" />
              <Stat k="Guests inside" v={guests.toLocaleString("en-US")} />
              <Stat k="Ride uptime" v={`${uptime.toFixed(1)}%`} />
              <Stat k="Fireworks finale" v="21:30" />
            </dl>
          </div>
          <aside className="card card-glow p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-cyan">
                <span className="live-dot size-2 rounded-full bg-cyan" />
                LIVE PARK PULSE
              </p>
              <p className="text-sm text-muted tabular-nums">{clock}</p>
            </div>
            <div className="space-y-2">
              {["sky", "wheel", "drop"].map((id) => {
                const ride = rideById(id);
                const live = rides[id];
                if (!ride || !live) return null;
                return (
                  <div key={id} className="flex items-center gap-3 rounded-2xl border border-line bg-bg/50 px-3 py-3">
                    <span className="grid size-9 place-items-center rounded-full bg-surface-2 text-cyan">
                      <Zap className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{ride.name}</p>
                      <p className="text-xs text-muted">{ride.zone} · {ride.duration}</p>
                    </div>
                    <span className="rounded-full bg-surface-2 px-3 py-1 text-sm font-semibold tabular-nums">{live.wait} min</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-3 rounded-2xl border border-line-strong bg-surface-2 px-3 py-3">
                <span className="grid size-9 place-items-center rounded-full bg-cyan text-on-cyan">
                  <Droplets className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Laser & fireworks finale</p>
                  <p className="text-xs text-muted">Lagoon Bay · 21:30</p>
                </div>
                <span className="text-sm font-semibold text-cyan tabular-nums">{finale}</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-surface-2 px-3 py-4 text-center">
                <p className="text-2xl font-extrabold tabular-nums">{open}/8</p>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-faint">RIDES OPEN</p>
              </div>
              <div className="rounded-2xl bg-surface-2 px-3 py-4 text-center">
                <p className="text-2xl font-extrabold tabular-nums">{wait} min</p>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-faint">AVG. WAIT</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-cyan">ATTRACTIONS</p>
            <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Rides with a heartbeat</h2>
            <p className="mt-2 max-w-2xl text-muted">
              Eight signature experiences across six zones. Queue times update as gates scan, so you can plan the night instead of standing in it.
            </p>
          </div>
          <Link to="/attractions" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-cyan">
            All attractions & queues
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PREVIEW.map((id) => {
            const ride = RIDES.find((item) => item.id === id);
            const live = rides[id];
            if (!ride || !live) return null;
            const closed = live.status !== "open";
            return (
              <Link key={id} to="/attractions" className="group overflow-hidden rounded-3xl border border-line bg-surface">
                <div className="relative h-44">
                  <img src={ride.image} alt="" className={cn("h-full w-full object-cover", focusClass(ride.focus))} />
                  <span className={cn("absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold", closed ? "tone-bad" : "bg-cyan text-on-cyan")}>
                    {closed ? live.status.toUpperCase() : `${live.wait} MIN WAIT`}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted">{ride.zone}</p>
                  <p className="mt-1 font-bold">{ride.name}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="shows" className="mx-auto grid max-w-6xl gap-4 px-4 py-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-3">
          {SHOWS.map((show) => {
            const Icon = show.kind === "PARADE" ? Car : show.kind === "MEET & GREET" ? Users : show.kind === "FIREWORKS" ? Sparkles : Music;
            return (
              <article key={show.time} className="flex items-center gap-4 rounded-3xl border border-line bg-surface px-4 py-4">
                <p className="w-14 shrink-0 text-lg font-extrabold tabular-nums">{show.time}</p>
                <span className="live-dot size-2 shrink-0 rounded-full bg-cyan" />
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-cyan">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{show.name}</p>
                  <p className="text-sm text-muted">{show.place} · {show.mins} min</p>
                </div>
                <span className="hidden rounded-full border border-line px-3 py-1 text-[11px] font-bold tracking-wide text-muted sm:inline">{show.kind}</span>
              </article>
            );
          })}
        </div>
        <aside className="card h-fit p-5">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
            <span className="font-semibold">Friday – Saturday</span>
            <span className="font-bold tabular-nums">10:00 – 01:00</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-line py-4">
            <span className="font-semibold">Public holidays</span>
            <span className="font-bold tabular-nums">09:00 – 01:00</span>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li className="flex gap-2"><Clock3 className="mt-0.5 size-4 shrink-0 text-cyan" /> Last ride admission is 45 minutes before closing.</li>
            <li className="flex gap-2"><Ticket className="mt-0.5 size-4 shrink-0 text-cyan" /> Re-entry is allowed all day with a valid e-pass.</li>
            <li className="flex gap-2"><Zap className="mt-0.5 size-4 shrink-0 text-cyan" /> Wristbands are required for ride access in every zone.</li>
          </ul>
          <p className="mt-3 text-xs text-faint">Sunday – Thursday the park closes at 23:00. Friday and Saturday run until 01:00.</p>
          <Button className="mt-5 w-full" onClick={() => setBandOpen(true)}>
            <Zap className="size-4" />
            Load my wristband
          </Button>
        </aside>
      </section>

      <section id="visit" className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-cyan">GETTING HERE</p>
          <h2 className="mt-2 text-4xl font-extrabold">Sunset Park, New Cairo</h2>
          <div className="mt-5 overflow-hidden rounded-3xl border border-line">
            <iframe
              title="Map of Sunset Park in New Cairo"
              className="h-72 w-full bg-surface-2"
              src="https://www.openstreetmap.org/export/embed.html?bbox=31.42%2C29.97%2C31.56%2C30.06&layer=mapnik&marker=30.007%2C31.491"
            />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-line p-4">
              <p className="text-xs font-bold tracking-[0.14em] text-faint">ADDRESS</p>
              <p className="mt-2 flex gap-2 text-sm"><MapPin className="mt-0.5 size-4 shrink-0 text-cyan" /> Sunset Park Boulevard, Fifth Settlement, New Cairo 11835</p>
            </div>
            <div className="rounded-3xl border border-line p-4">
              <p className="text-xs font-bold tracking-[0.14em] text-faint">GUEST SERVICES</p>
              <p className="mt-2 flex gap-2 text-sm"><Phone className="mt-0.5 size-4 shrink-0 text-cyan" /> <a href="tel:+20223458890">+20 2 2345 8890</a></p>
              <p className="mt-1 text-sm text-muted">Lost property desk · beside Gate 1</p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-extrabold">Tell us how tonight felt</h2>
          <p className="mt-2 text-sm text-muted">Every note goes straight to the duty manager.</p>
          <form
            className="card mt-4 p-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (note.trim().length < 8) {
                toast.error("Add a few words so the duty manager can act on it.");
                return;
              }
              addFeedback({ name, stars, body: note.trim() });
              setNote("");
              toast.success("Sent to the duty manager. It is already on the guest desk.");
            }}
          >
            <p className="text-sm font-semibold">Your feedback</p>
            <label className="mt-3 block text-sm text-muted">
              Name
              <input className="field mt-1.5" value={name} placeholder="Your name" onChange={(event) => setName(event.target.value)} />
            </label>
            <div className="mt-3">
              <Stars value={stars} onChange={setStars} />
            </div>
            <textarea
              className="field mt-3 min-h-32 resize-y"
              maxLength={500}
              placeholder="What worked, what did not, and what would make your next visit better?"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-faint">We only use this to reply to your note. {note.length}/500</p>
              <Button type="submit">
                Send feedback
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>
          <div className="mt-4 space-y-2">
            {FAQS.map((faq, index) => {
              const openItem = openFaq === index;
              return (
                <div key={faq.q} className="rounded-2xl border border-line">
                  <button
                    type="button"
                    className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left font-semibold"
                    aria-expanded={openItem}
                    onClick={() => setOpenFaq(openItem ? null : index)}
                  >
                    {faq.q}
                    <span className="text-cyan">{openItem ? "–" : "+"}</span>
                  </button>
                  {openItem ? <p className="px-4 pb-4 text-sm text-muted">{faq.a}</p> : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <WristbandDialog open={bandOpen} onClose={() => setBandOpen(false)} />
    </GuestFrame>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold tracking-[0.14em] text-faint uppercase">{k}</dt>
      <dd className="mt-1 text-2xl font-extrabold tabular-nums">{v}</dd>
    </div>
  );
}
