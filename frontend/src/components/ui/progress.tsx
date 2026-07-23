"use client";

import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  showLabel,
  color = "purple",
}: {
  value: number;
  className?: string;
  showLabel?: boolean;
  color?: "purple" | "blue" | "emerald" | "orange";
}) {
  const colors = {
    purple: "from-purple to-blue",
    blue: "from-blue to-blue-light",
    emerald: "from-emerald to-emerald-light",
    orange: "from-orange to-orange-light",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1.5 flex justify-between text-xs text-fg-muted">
          <span>Progress</span>
          <span className="text-fg">{Math.round(value)}%</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out",
            colors[color]
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
