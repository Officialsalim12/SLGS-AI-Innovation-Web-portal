"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MarketingAtmosphere() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] overflow-hidden"
    >
      <div className="marketing-mesh absolute inset-0" />
      <div className="marketing-grid absolute inset-0 opacity-[0.35] dark:opacity-[0.2]" />
      <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-brand/20 blur-3xl dark:bg-brand/25" />
      <div className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-blue/15 blur-3xl dark:bg-blue/20" />
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-canvas to-transparent" />
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={cn(
        align === "center" && "mx-auto max-w-3xl text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-card/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand backdrop-blur-sm sm:text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          {eyebrow}
        </p>
      )}
      <h1
        className={cn(
          "font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl md:text-5xl",
          eyebrow ? "mt-4 sm:mt-5" : undefined
        )}
      >
        {title}
      </h1>
      {description && (
        <p
          className={cn(
            "mt-3 text-base leading-relaxed text-fg/55 sm:mt-4 sm:text-lg",
            align === "center" && "mx-auto max-w-2xl"
          )}
        >
          {description}
        </p>
      )}
      <div
        className={cn(
          "mt-5 h-1 w-14 rounded-full bg-gradient-to-r from-brand to-blue/70",
          align === "center" && "mx-auto"
        )}
      />
    </motion.div>
  );
}

export function MarketingCard({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-card/90 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-sm dark:shadow-none",
        hover &&
          "transition duration-300 hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-[0_12px_40px_-20px_rgba(93,42,128,0.35)]",
        className
      )}
    >
      {children}
    </div>
  );
}
