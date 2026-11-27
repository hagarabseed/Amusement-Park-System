import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function QrCode({ value, className }: { value: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    void import("qrcode").then((mod) => {
      const api = "default" in mod && mod.default ? mod.default : mod;
      return api.toDataURL(value, {
        margin: 1,
        width: 280,
        color: { dark: "#071018", light: "#ffffff" },
      });
    }).then((url) => {
      if (live && typeof url === "string") setSrc(url);
    }).catch(() => {
      if (live) setSrc(null);
    });
    return () => {
      live = false;
    };
  }, [value]);

  return (
    <div className={cn("grid size-36 place-items-center overflow-hidden rounded-xl bg-on-photo p-1.5", className)}>
      {src ? <img src={src} alt="" className="size-full" /> : <span className="text-xs text-photo-ink">Coding pass…</span>}
    </div>
  );
}
