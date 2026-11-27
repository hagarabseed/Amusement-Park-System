import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { GuestFrame } from "@/components/guest-frame";
import { Chip } from "@/components/ui";
import { RIDES, type Ride } from "@/lib/park";
import { usePark } from "@/lib/store";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const Route = createFileRoute("/attractions")({
  head: () => ({ meta: [{ title: "Attractions · Pulse" }] }),
  component: AttractionsPage,
});

const FILTERS = ["All", "Thrill", "Family", "Water", "Indoor"] as const;

function focusClass(focus: string) {
  if (focus === "object-right") return "object-right";
  if (focus === "object-left") return "object-left";
  if (focus === "object-bottom") return "object-bottom";
  return "object-center";
}

function AttractionsPage() {
  const rides = usePark((state) => state.rides);
  const now = useNow(30000);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const visible = RIDES.filter((ride) => filter === "All" || ride.category === filter);
  const ranked = [...RIDES].sort((a, b) => {
    const left = rides[a.id];
    const right = rides[b.id];
    const rank = (status: string) => (status === "open" ? 0 : 1);
    if (rank(left?.status ?? "closed") !== rank(right?.status ?? "closed")) {
      return rank(left?.status ?? "closed") - rank(right?.status ?? "closed");
    }
    return (right?.wait ?? 0) - (left?.wait ?? 0);
  });

  return (
    <GuestFrame>
      <section className="relative overflow-hidden border-b border-line">
        <img src="/media/nightpark.jpg" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="relative mx-auto max-w-6xl px-4 py-14">
          <p className="text-sm text-muted">
            <Link to="/" className="hover:text-fg">Home</Link>
            <span className="px-2">/</span>
            Attractions
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl">
            Every ride, every queue, <span className="text-cyan">live.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-muted">
            Queue times refresh as gates scan wristbands. Filters below help you build a route through the park — or simply follow the shortest line.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {FILTERS.map((item) => (
              <Chip key={item} active={filter === item} onClick={() => setFilter(item)}>{item}</Chip>
            ))}
            <p className="ml-auto flex items-center gap-2 text-sm text-muted">
              <span className="live-dot size-1.5 rounded-full bg-ok" />
              Updated {now ? format(now, "HH:mm") : "--:--"}
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl font-extrabold">All attractions</h2>
            <p className="text-sm text-muted">{visible.length} experiences</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {visible.map((ride) => (
              <RideCard key={ride.id} ride={ride} wait={rides[ride.id]?.wait ?? 0} status={rides[ride.id]?.status ?? "closed"} />
            ))}
          </div>
        </div>
        <aside className="card h-fit p-4 lg:sticky lg:top-24">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Live queue board</h2>
            <span className="flex items-center gap-1 text-xs font-bold text-ok">
              <span className="live-dot size-1.5 rounded-full bg-ok" />
              LIVE
            </span>
          </div>
          <ul className="divide-y divide-line">
            {ranked.map((ride) => {
              const live = rides[ride.id];
              const label = live?.status === "maintenance" ? "Maint." : live?.status === "closed" ? "Closed" : `${live?.wait ?? 0}m`;
              return (
                <li key={ride.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-semibold">{ride.name}</p>
                    <p className="text-[11px] font-semibold tracking-[0.12em] text-faint uppercase">{ride.zone}</p>
                  </div>
                  <span className={cn("text-sm font-bold tabular-nums", live?.status === "open" ? "text-cyan" : "text-muted")}>{label}</span>
                </li>
              );
            })}
          </ul>
        </aside>
      </section>
    </GuestFrame>
  );
}

function RideCard({ ride, wait, status }: { ride: Ride; wait: number; status: string }) {
  const closed = status !== "open";
  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-surface">
      <div className="relative h-44">
        <img src={ride.image} alt="" className={cn("h-full w-full object-cover", focusClass(ride.focus))} />
        <span className={cn("absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold", closed ? "tone-bad" : "bg-cyan text-on-cyan")}>
          {closed ? status.toUpperCase() : `${wait} MIN`}
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-photo-ink/70 px-3 py-1 text-xs font-semibold text-on-photo">{ride.zone}</span>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-extrabold">{ride.name}</h3>
        <p className="mt-2 text-sm text-muted">{ride.blurb}</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <span className="text-cyan">{ride.duration}</span>
          <span>{ride.height ? `${ride.height} cm min` : "No height limit"}</span>
          <span>{ride.intensity}</span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-cyan" style={{ width: closed ? "12%" : `${Math.min(100, 18 + wait)}%` }} />
        </div>
      </div>
    </article>
  );
}
