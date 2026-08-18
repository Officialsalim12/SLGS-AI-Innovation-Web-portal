"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { challengeTracks, challenges } from "@/lib/data";
import { cn } from "@/lib/utils";
import { MarketingCard, PageIntro } from "@/components/marketing/page-chrome";

const categories = ["All", ...challengeTracks.map((t) => t.name)];

export default function ChallengesPage() {
  const [active, setActive] = useState("All");

  const filtered = useMemo(() => {
    const list =
      active === "All"
        ? challenges
        : challenges.filter((c) => c.track === active);
    return [...list].sort(
      (a, b) => Number(Boolean(b.selected)) - Number(Boolean(a.selected))
    );
  }, [active]);

  const activeTrack =
    active === "All"
      ? null
      : challengeTracks.find((t) => t.name === active) || null;

  return (
    <div className="overflow-x-hidden pb-16 pt-8 sm:pb-20 sm:pt-12 md:pb-28 md:pt-16">
      <div className="mx-auto max-w-3xl space-y-8 px-4 sm:space-y-10 sm:px-6">
        <PageIntro
          title="Problem statements"
          description="These are starter problems you can pick from. Your team can also bring your own idea for a Sierra Leone problem and build that instead."
          align="left"
        />

        <MarketingCard className="p-4 sm:p-5" hover={false}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
            Select
          </p>
          <p className="mt-2 text-sm leading-relaxed text-fg/65 sm:text-[15px]">
            Five problems below are marked Select. These are the ideas teams
            have chosen to build during the programme.
          </p>
        </MarketingCard>

        <MarketingCard className="p-4 sm:p-5" hover={false}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
            Your own idea is welcome
          </p>
          <p className="mt-2 text-sm leading-relaxed text-fg/65 sm:text-[15px]">
            You do not have to choose from this list. If your team has a strong
            idea that helps people in Sierra Leone, work on that. The project
            must be new work for this programme, not an old or existing
            solution.
          </p>
        </MarketingCard>

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
          {activeTrack && (
            <p className="text-sm leading-relaxed text-fg/55">
              {activeTrack.description}
            </p>
          )}
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
                <MarketingCard
                  className={cn(
                    "p-4 sm:p-6 md:p-7",
                    idea.selected && "border-brand bg-brand/[0.04]"
                  )}
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                    <span className="font-display text-sm font-bold text-brand/50">
                      {idea.code}
                    </span>
                    <h2 className="font-display text-lg font-bold text-fg sm:text-xl">
                      {idea.title}
                    </h2>
                    {idea.selected && (
                      <span className="rounded-md bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white dark:text-navy">
                        Select
                      </span>
                    )}
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
                        What to build:{" "}
                      </span>
                      {idea.direction}
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
