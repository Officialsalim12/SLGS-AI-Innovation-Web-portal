"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Code2 } from "lucide-react";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import {
  MarketingAtmosphere,
  MarketingCard,
} from "@/components/marketing/page-chrome";
import { HeroIllustration } from "@/components/marketing/illustrations";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { liveStats } from "@/lib/data";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-canvas text-fg">
      <MarketingAtmosphere />
      <SiteHeader />

      <section className="relative overflow-hidden pt-[64px] sm:pt-[72px]">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:gap-10 sm:px-6 sm:py-16 md:grid-cols-2 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="min-w-0"
          >
            <div className="max-w-xl overflow-hidden rounded-xl border border-line bg-card/90 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-sm">
              <div className="flex">
                <div className="w-1 shrink-0 bg-brand" aria-hidden />
                <div className="min-w-0 flex-1 px-4 py-3 sm:px-5 sm:py-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fg/45 sm:text-[11px]">
                    Facilitated by KNS · Partner SLGS
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <p className="font-display text-sm font-semibold leading-snug text-fg sm:text-[15px]">
                      AI Innovation Bootcamp &amp; Challenge
                    </p>
                    <span className="inline-flex items-center rounded-md bg-brand px-2 py-0.5 text-[10px] font-bold tracking-wide text-white sm:text-[11px] dark:text-navy">
                      2026
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <h1 className="font-display mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-fg sm:mt-5 sm:text-4xl sm:leading-tight md:text-[3rem] md:leading-[1.1] lg:text-[3.25rem]">
              Build a real app. Solve a Sierra Leone problem.
            </h1>
            <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-brand to-blue/70 sm:mt-5" />
            <p className="mt-4 max-w-xl text-base leading-relaxed text-fg/60 sm:mt-6 sm:text-lg">
              A four week programme for selected Grammar School students. Two
              weeks of instructor led bootcamp on the fundamentals, then two
              weeks in assigned teams with mentors while you build and pitch a
              web app. Facilitated by KNS in partnership with Sierra Leone
              Grammar School.
            </p>
            <div className="mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_30px_-12px_rgba(93,42,128,0.65)] transition hover:bg-brand-hover sm:w-auto dark:text-navy"
              >
                Sign in
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
              <Link
                href="/challenges"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line-strong bg-card/80 px-6 py-3.5 text-center text-[15px] font-semibold text-fg backdrop-blur-sm transition hover:border-brand/40 hover:bg-card sm:w-auto"
              >
                See the problem statements
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <HeroIllustration className="mx-auto hidden w-full max-w-md sm:block md:max-w-lg" />
          </motion.div>
        </div>
      </section>

      <section className="relative border-y border-line bg-card/70 backdrop-blur-sm">
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-3 px-4 py-10 sm:gap-8 sm:px-6 sm:py-12 md:py-16">
          {[
            { label: "Participants", value: liveStats.participants, suffix: "+" },
            { label: "Teams", value: liveStats.teams, suffix: "+" },
            { label: "Mentors", value: liveStats.mentors, suffix: "+" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="min-w-0 text-center md:text-left"
            >
              <AnimatedCounter
                value={stat.value}
                suffix={stat.suffix}
                className="font-display text-2xl font-bold text-fg sm:text-3xl md:text-4xl"
              />
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-fg/45 sm:text-sm sm:normal-case sm:tracking-normal">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="brand-panel px-4 py-14 text-white sm:py-16 md:py-20">
        <div className="relative z-10 mx-auto max-w-3xl text-center md:px-6">
          <Code2 className="mx-auto h-9 w-9 opacity-80 sm:h-10 sm:w-10" />
          <h2 className="font-display mt-5 text-2xl font-bold tracking-tight sm:mt-6 sm:text-3xl md:text-4xl">
            Ready to get started? Open your portal.
          </h2>
          <div className="mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center">
            <Link
              href="/login?portal=participant"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-card px-6 py-3.5 text-[15px] font-semibold text-brand transition hover:bg-canvas sm:w-auto"
            >
              Participant
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
            <Link
              href="/portal/mentor"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/25 bg-transparent px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Mentor Portal
            </Link>
            <Link
              href="/portal/admin"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/25 bg-transparent px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </section>

      <section id="organizers" className="scroll-mt-24 py-12 sm:py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl items-start gap-8 px-4 sm:gap-10 sm:px-6 md:grid-cols-2">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">
              Need help?
            </h2>
            <div className="mt-3 h-1 w-12 rounded-full bg-gradient-to-r from-brand to-blue/70" />
            <p className="mt-3 max-w-md text-sm text-fg/55 sm:mt-4 sm:text-base">
              Questions about login, teams, or the schedule? Contact the
              organizers.
            </p>
          </div>
          <MarketingCard className="min-w-0 space-y-5 p-5 sm:p-6 md:p-8" hover={false}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-fg/40">
                Email
              </p>
              <a
                href="mailto:salim@kns.sl"
                className="mt-1 block break-all text-base font-semibold text-brand hover:underline sm:text-lg"
              >
                salim@kns.sl
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-fg/40">
                WhatsApp
              </p>
              <a
                href="https://wa.me/23279594218"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-base font-semibold text-fg hover:text-brand sm:text-lg"
              >
                +232 79 594 218
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-fg/40">
                Hours
              </p>
              <p className="mt-1 text-sm text-fg/70 sm:text-base">
                8:00 AM to 8:00 PM · Everyday
              </p>
            </div>
          </MarketingCard>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
