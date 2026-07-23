"use client";

import { motion } from "framer-motion";
import { CalendarDays, Rocket } from "lucide-react";
import { programmeOverview } from "@/lib/data";
import { MarketingCard } from "@/components/marketing/page-chrome";

export default function TimelinePage() {
  const { title, subtitle, stack, weeks, footer } = programmeOverview;

  return (
    <div className="overflow-x-hidden py-10 sm:py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="brand-panel rounded-2xl px-6 py-8 text-center text-white sm:px-10 sm:py-12"
        >
          <div className="relative z-10">
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {title}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
              {subtitle}
            </p>
          </div>
        </motion.div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-8 sm:gap-3">
          {stack.map((item, i) => (
            <motion.span
              key={item}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-full border border-brand/20 bg-card/90 px-4 py-1.5 text-sm font-semibold text-brand shadow-sm backdrop-blur-sm"
            >
              {item}
            </motion.span>
          ))}
        </div>

        <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-2 md:gap-10">
          {weeks.map((week, wi) => {
            const Icon = week.icon === "rocket" ? Rocket : CalendarDays;
            return (
              <motion.section
                key={week.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: wi * 0.08 }}
                className="min-w-0"
              >
                <div className="mb-5 flex items-center gap-2.5 border-l-4 border-brand pl-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h2 className="font-display text-lg font-bold text-fg sm:text-xl">
                    {week.label}
                  </h2>
                </div>

                <ol className="space-y-4">
                  {week.days.map((item, di) => (
                    <motion.li
                      key={item.day}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: di * 0.05 }}
                    >
                      <MarketingCard className="flex gap-3 p-4 sm:gap-4 sm:p-5">
                        <span className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-fg px-2.5 text-xs font-bold text-canvas sm:h-10 sm:min-w-[3.5rem] sm:text-sm">
                          {item.day}
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-bold text-fg">{item.title}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-fg/55">
                            {item.description}
                          </p>
                        </div>
                      </MarketingCard>
                    </motion.li>
                  ))}
                </ol>
              </motion.section>
            );
          })}
        </div>

        <div className="brand-panel mt-10 rounded-xl px-4 py-4 text-center sm:mt-14">
          <p className="relative z-10 text-sm font-semibold text-white sm:text-base">
            {footer}
          </p>
        </div>
      </div>
    </div>
  );
}
