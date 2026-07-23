"use client";

import { cn } from "@/lib/utils";

const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-[2.5px]",
  lg: "h-11 w-11 border-[3px]",
} as const;

export function Spinner({
  size = "md",
  className,
  label = "Loading",
}: {
  size?: keyof typeof sizes;
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block animate-spin rounded-full border-brand/25 border-t-brand",
        sizes[size],
        className
      )}
    />
  );
}

export function PageLoader({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[40vh] flex-col items-center justify-center gap-3 py-16",
        className
      )}
    >
      <Spinner size="lg" label={label} />
      {label ? (
        <p className="text-sm font-medium text-fg-muted">{label}</p>
      ) : null}
    </div>
  );
}

export function InlineLoader({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 text-sm text-fg-muted",
        className
      )}
    >
      <Spinner size="sm" label={label} />
      <span>{label}</span>
    </div>
  );
}
