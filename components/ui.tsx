import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "gold";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-pitch-600 text-white hover:bg-pitch-700 active:bg-pitch-800 shadow-sm",
  secondary:
    "bg-white text-ink-800 border border-ink-200 hover:bg-ink-50 active:bg-ink-100",
  ghost: "bg-transparent text-ink-700 hover:bg-ink-100 active:bg-ink-200",
  gold: "bg-gold-400 text-ink-900 hover:bg-gold-500 active:bg-gold-600 shadow-sm",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-14 px-6 text-base gap-2.5",
};

const buttonBase =
  "inline-flex items-center justify-center rounded-xl font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-600";

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonBase, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonBase, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-200 bg-white shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "pitch" | "gold" | "ink";
  className?: string;
}) {
  const tones = {
    neutral: "bg-ink-100 text-ink-600",
    pitch: "bg-pitch-100 text-pitch-800",
    gold: "bg-gold-300/60 text-gold-600",
    ink: "bg-ink-900 text-white",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  done,
  total,
  className,
}: {
  done: number;
  total: number;
  className?: string;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className={className}>
      <div className="flex items-center justify-between text-xs font-semibold text-ink-500">
        <span>
          {done} / {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink-100">
        <div
          className="h-full rounded-full bg-pitch-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-pitch-600">
          {eyebrow}
        </p>
      )}
      <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-ink-600">{description}</p>
      )}
    </div>
  );
}
