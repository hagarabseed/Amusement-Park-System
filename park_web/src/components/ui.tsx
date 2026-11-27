import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "ok" | "warn" | "bad" | "info" | "muted" | "cyan";

export function StatusPill({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", `tone-${tone}`, className)}>{children}</span>;
}

export function Button({
  variant = "solid",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "ghost" | "soft" }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "solid" && "bg-cyan text-on-cyan hover:brightness-110",
        variant === "ghost" && "border border-line bg-transparent text-fg hover:border-line-strong",
        variant === "soft" && "bg-surface-2 text-fg hover:border-line-strong",
        className,
      )}
      {...props}
    />
  );
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full px-4 text-sm font-semibold",
        active ? "bg-cyan text-on-cyan" : "border border-line bg-surface text-muted hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="mb-1.5 block text-sm text-muted">{children}</span>;
}
