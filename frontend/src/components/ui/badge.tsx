import { cn } from "@/lib/utils";

const variants = {
  purple: "bg-purple/20 text-purple-light border-purple/30",
  blue: "bg-blue/20 text-blue-700 dark:text-blue-light border-blue/30",
  emerald: "bg-emerald/20 text-emerald-700 dark:text-emerald-light border-emerald/30",
  orange: "bg-orange/20 text-orange-700 dark:text-orange-light border-orange/30",
  muted: "bg-surface-muted text-fg-muted border-line",
  success: "bg-emerald/20 text-emerald-700 dark:text-emerald-light border-emerald/30",
  warning: "bg-orange/20 text-orange-700 dark:text-orange-light border-orange/30",
  danger: "bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/30",
};

export function Badge({
  children,
  variant = "muted",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
