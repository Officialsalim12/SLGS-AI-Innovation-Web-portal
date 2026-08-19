"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Flag,
  Gauge,
  MapPinned,
  Target,
} from "lucide-react";
import {
  MarketingCard,
  PageIntro,
} from "@/components/marketing/page-chrome";

const criteria = [
  {
    letter: "S",
    name: "Specific",
    weight: 20,
    summary:
      "Is the problem clear? Who is this for? What exactly did the team build?",
    icon: Target,
    details: [
      "Can they name the problem in one sentence?",
      "Is it obvious who the project is for?",
      "Do they know exactly what they built, not a vague idea?",
      "Is the scope tight enough to finish in the programme?",
    ],
    detailIntro: "Judges look for a clear target:",
  },
  {
    letter: "M",
    name: "Measurable",
    weight: 20,
    summary:
      "Can you see it working? Is there a demo or other evidence that it does what they claim?",
    icon: Gauge,
    details: [
      "Does the demo show the project actually running?",
      "Can a judge tell whether it succeeded or not?",
      "Are claims backed by what you can see, not just slides?",
      "Is there a simple way to know if it helped someone?",
    ],
    detailIntro: "Judges look for proof:",
  },
  {
    letter: "A",
    name: "Achievable",
    weight: 20,
    summary:
      "Did they finish something real in the programme? Is it well built and usable?",
    icon: Flag,
    details: [
      "Did they complete a working piece, not only a plan?",
      "Is the build solid enough for someone else to use?",
      "Is the interface clear enough to try without a long explanation?",
      "Did they attempt something ambitious but still finish it?",
    ],
    detailIntro: "Judges look for a finished build:",
  },
  {
    letter: "R",
    name: "Relevant",
    weight: 20,
    summary:
      "Does it answer a real Sierra Leone need, from the challenge list or their own idea?",
    icon: MapPinned,
    details: [
      "Does it tackle a listed challenge or a clear local idea?",
      "Would this help a real person in Sierra Leone?",
      "Do the builders understand the problem they chose?",
      "Is the outcome practical, not just a demo for show?",
    ],
    detailIntro: "Judges look for local fit:",
  },
  {
    letter: "T",
    name: "Time-bound",
    weight: 20,
    summary:
      "Did they hit deadlines, present a complete pitch on time, and say what comes next?",
    icon: Clock3,
    details: [
      "Was the project submitted on time?",
      "Did the pitch stay within time and cover the work?",
      "Does the team have a next step if they had more days?",
      "Did they show up and finish the programme work, not rush it at the end?",
    ],
    detailIntro: "Judges look for delivery on time:",
  },
] as const;

const scoreBands = [
  {
    range: "90 to 100",
    label: "Outstanding",
    description: "Clear problem, working demo, real local fit, delivered on time.",
  },
  {
    range: "80 to 89",
    label: "Excellent",
    description: "Strong SMART scores. A few rough edges, nothing major.",
  },
  {
    range: "70 to 79",
    label: "Good",
    description: "Works, shows real effort, and answers a real problem.",
  },
  {
    range: "60 to 69",
    label: "Fair",
    description: "Some of it is there, but it still feels unfinished.",
  },
  {
    range: "Below 60",
    label: "Needs work",
    description: "Gaps in the build, the problem fit, the evidence, or the delivery.",
  },
] as const;

const notes = [
  "Work must be your team's own. Don't submit someone else's project.",
  "You may pick a listed problem or bring your own Sierra Leone idea.",
  "Follow the programme rules and hit the deadlines.",
  "Judges' decisions are final.",
  "Late submissions can lose points or be ruled out.",
  "Everyone on the team should help build and take part in the final pitch.",
] as const;

export default function GradingPage() {
  return (
    <div className="overflow-x-hidden py-10 sm:py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <PageIntro
          title="Judging Criteria"
          description="Judges score every project with SMART: Specific, Measurable, Achievable, Relevant, and Time-bound. Each letter is worth 20 points, for a total of 100."
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mt-10 overflow-hidden rounded-2xl border border-line bg-card/90 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-sm sm:mt-12"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-brand/[0.06]">
                  <th className="px-4 py-3.5 font-semibold text-fg sm:px-6">
                    SMART
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-fg sm:px-6">
                    Weight
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-fg sm:px-6">
                    What judges ask
                  </th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((item) => (
                  <tr
                    key={item.name}
                    className="border-b border-line last:border-b-0"
                  >
                    <td className="px-4 py-4 font-semibold text-fg sm:px-6">
                      <span className="mr-2 font-bold text-brand">
                        {item.letter}
                      </span>
                      {item.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-brand sm:px-6">
                      {item.weight} pts
                    </td>
                    <td className="px-4 py-4 leading-relaxed text-fg/60 sm:px-6">
                      {item.summary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="mt-10 grid gap-5 sm:mt-14 sm:gap-6 md:grid-cols-2">
          {criteria.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={i === 4 ? "md:col-span-2" : undefined}
              >
                <MarketingCard className="flex h-full flex-col p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/15">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-md bg-brand px-2.5 py-1 text-xs font-bold text-white dark:text-navy">
                      {item.letter} · {item.weight} pts
                    </span>
                  </div>
                  <h2 className="font-display mt-4 text-lg font-bold text-fg sm:text-xl">
                    {item.name}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-fg/55">
                    {item.detailIntro}
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {item.details.map((point) => (
                      <li
                        key={point}
                        className="flex gap-2.5 text-sm leading-relaxed text-fg/75"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </MarketingCard>
              </motion.div>
            );
          })}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-14"
        >
          <h2 className="font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            Score bands
          </h2>
          <p className="mt-2 text-sm text-fg/55 sm:text-base">
            Rough guide for how totals usually land.
          </p>
          <div className="mt-6 space-y-3">
            {scoreBands.map((band, i) => (
              <MarketingCard
                key={band.range}
                className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-5"
                hover={false}
              >
                <span className="inline-flex w-full shrink-0 items-center justify-center rounded-lg bg-brand/10 px-3 py-2 text-sm font-bold text-brand sm:w-28">
                  {band.range}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-fg">{band.label}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-fg/55">
                    {band.description}
                  </p>
                </div>
                <span className="hidden text-xs font-medium text-fg/25 sm:ml-auto sm:inline">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </MarketingCard>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="brand-panel mt-10 rounded-2xl p-5 sm:mt-14 sm:p-8"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 text-white">
              <AlertTriangle className="h-5 w-5" />
              <h2 className="font-display text-xl font-bold sm:text-2xl">
                Before you submit
              </h2>
            </div>
            <ul className="mt-5 space-y-3">
              {notes.map((note) => (
                <li
                  key={note}
                  className="flex gap-2.5 text-sm leading-relaxed text-white/85 sm:text-base"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
