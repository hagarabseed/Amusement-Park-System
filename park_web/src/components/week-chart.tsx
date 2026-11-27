import { useEffect, useState } from "react";
import { WEEK } from "@/lib/park";

type Charts = typeof import("recharts");

export function WeekChart() {
  const [lib, setLib] = useState<Charts | null>(null);
  const [color, setColor] = useState("");

  useEffect(() => {
    let live = true;
    void import("recharts").then((mod) => {
      if (live) setLib(mod);
    });
    const next = getComputedStyle(document.documentElement).getPropertyValue("--cyan").trim();
    if (next) setColor(next);
    return () => {
      live = false;
    };
  }, []);

  if (!lib || !color) return <div className="h-52 rounded-2xl bg-surface-2" />;

  const { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } = lib;
  return (
    <div className="h-52 text-faint">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={WEEK} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
          <XAxis dataKey="d" tick={{ fill: "currentColor", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 80]} ticks={[20, 40, 60]} tick={{ fill: "currentColor", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => [`${value} hundred`, "Guests"]}
            contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, color: "var(--fg)" }}
          />
          <Line type="monotone" dataKey="guests" stroke={color} strokeWidth={3} dot={{ r: 3, stroke: color, fill: color }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
