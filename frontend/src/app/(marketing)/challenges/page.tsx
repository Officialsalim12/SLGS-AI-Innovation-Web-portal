"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { challenges } from "@/lib/data";
import { cn } from "@/lib/utils";
import { MarketingCard, PageIntro } from "@/components/marketing/page-chrome";

const categories = [
  "All",
  ...Array.from(new Set(challenges.map((c) => c.track))).sort((a, b) =>
    a.localeCompare(b)
  ),
];

export default function ChallengesPage() {
  const [active, setActive] = useState("All");

  const filtered = useMemo(
    () =>
      active === "All"
        ? challenges
        : challenges.filter((c) => c.track === active),
    [active]
  );

  return (
    <div className="overflow-x-hidden pb-16 pt-8 sm:pb-20 sm:pt-12 md:pb-28 md:pt-16">
      <div className="mx-auto max-w-3xl space-y-8 px-4 sm:space-y-10 sm:px-6">
        <PageIntro
          title="Problem statements"
          description="Read these with your group. Pick one Sierra Leone problem to solve."
          align="left"
        />

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-fg/50">
              Filter by category
            </p>
            <p className="text-sm tabular-nums text-fg/40">
              {filtered.length}{" "}
              {filtered.length === 1 ? "problem" : "problems"}
            </p>
          </div>
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Challenge categories"
          >
            {categories.map((category) => {
              const isActive = active === category;
              const count =
                category === "All"
                  ? challenges.length
                  : challenges.filter((c) => c.track === category).length;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(category)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition",
                    isActive
                      ? "border-brand bg-brand text-white dark:text-navy"
                      : "border-line bg-card/90 text-fg/65 hover:border-brand/35 hover:text-fg"
                  )}
                >
                  {category}
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                      isActive
                        ? "bg-white/20 text-white dark:bg-navy/15 dark:text-navy"
                        : "bg-fg/5 text-fg/45"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.ol
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 sm:space-y-6"
          >
            {filtered.map((idea, i) => (
              <motion.li
                key={idea.id}
                id={idea.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.35) }}
                className="scroll-mt-24 list-none sm:scroll-mt-28"
              >
                <MarketingCard className="p-4 sm:p-6 md:p-7">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-display text-sm font-bold text-brand/50">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="font-display text-lg font-bold text-fg sm:text-xl">
                      {idea.title}
                    </h2>
                  </div>
                  <p className="mt-1 inline-flex rounded-md bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand sm:text-sm">
                    {idea.track}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-fg/60 sm:mt-4 sm:text-base">
                    {idea.summary}
                  </p>
                  <div className="mt-3 rounded-xl border border-line bg-canvas/70 px-3 py-3 sm:mt-4 sm:px-4">
                    <p className="text-sm leading-relaxed text-fg sm:text-base">
                      <span className="font-semibold text-brand">
                        The Problem:{" "}
                      </span>
                      {idea.problem}
                    </p>
                  </div>
                </MarketingCard>
              </motion.li>
            ))}
          </motion.ol>
        </AnimatePresence>
      </div>
    </div>
  );
}
