"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";

const fade = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

export function PortalPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      {...fade}
      className="flex flex-wrap items-end justify-between gap-3 border-b border-line/60 pb-5"
    >
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-fg-muted">
            {description}
          </p>
        )}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </motion.div>
  );
}

function greetingLabel() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

type MetaItem = {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
};

export function DashboardHero({
  name,
  title,
  subtitle,
  meta = [],
  daysRemaining,
  daysLabel = "Until 21 August 2026",
}: {
  name: string;
  title: string;
  subtitle?: string;
  meta?: MetaItem[];
  daysRemaining?: number | string | null;
  daysLabel?: string;
}) {
  const [hello, setHello] = useState("Welcome");

  useEffect(() => {
    setHello(greetingLabel());
  }, []);

  return (
    <motion.div {...fade}>
      <Card className="relative overflow-hidden border-line/60 p-0 shadow-[0_28px_70px_-40px_rgba(15,23,42,0.5)]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(93,42,128,0.16),transparent_52%),radial-gradient(ellipse_at_bottom_left,rgba(37,99,235,0.1),transparent_48%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent"
          aria-hidden
        />
        <div className="relative grid min-w-0 gap-6 p-5 sm:gap-8 sm:p-7 md:grid-cols-[minmax(0,1.35fr)_auto] md:p-8">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-subtle sm:text-xs">
              {hello}, {name}
            </p>
            <h1 className="font-display mt-2 break-words text-2xl font-semibold tracking-tight text-fg sm:text-3xl md:text-[2.2rem] md:leading-[1.12]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted sm:text-[15px]">
                {subtitle}
              </p>
            )}
            {meta.length > 0 && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
                {meta.map((item) => (
                  <div
                    key={item.label}
                    className="min-w-0 rounded-2xl border border-line/70 bg-card/55 px-4 py-3 backdrop-blur-sm"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                      {item.label}
                    </p>
                    <div className="mt-1.5 break-words font-display text-lg font-semibold text-fg sm:text-xl">
                      {item.value}
                    </div>
                    {item.hint != null && item.hint !== "" && (
                      <div className="mt-1 break-words text-xs text-fg-subtle">
                        {item.hint}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex w-full flex-col justify-center rounded-[1.35rem] border border-line/70 bg-gradient-to-b from-card to-surface-muted/40 px-5 py-5 shadow-inner sm:px-6 md:min-w-[12rem] md:items-center md:text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/25 md:mx-auto dark:text-navy">
              <CalendarDays className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
              Days remaining
            </p>
            <p className="font-display mt-1 text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
              {daysRemaining ?? "—"}
            </p>
            <p className="mt-1.5 text-xs text-fg-muted">{daysLabel}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function DashboardStatGrid({
  title = "Overview",
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div {...fade} transition={{ delay: 0.05 }}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold tracking-tight text-fg sm:text-xl">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-fg-muted">{description}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {children}
      </div>
    </motion.div>
  );
}

export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  tone,
  delay = 0,
  footer,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone: string;
  delay?: number;
  footer?: React.ReactNode;
}) {
  return (
    <motion.div {...fade} transition={{ delay }}>
      <Card
        hover
        className="h-full border-line/60 shadow-[0_16px_44px_-30px_rgba(15,23,42,0.4)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-fg-subtle">
              {label}
            </p>
            <p className="font-display mt-2 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              {value}
            </p>
          </div>
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone}`}
          >
            <Icon className="h-5 w-5" strokeWidth={2.25} />
          </div>
        </div>
        {footer}
      </Card>
    </motion.div>
  );
}
