"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  MessageSquare,
  Mic2,
  Target,
} from "lucide-react";
import {
  MarketingCard,
  PageIntro,
} from "@/components/marketing/page-chrome";

const criteria = [
  {
    name: "Solution Development",
    weight: 40,
    summary:
      "Does it work? Is it well built? Is the interface usable? Did the team do something clever?",
    icon: Code2,
    details: [
      "Does the project actually run end to end?",
      "How solid is the technical build?",
      "Is the interface clear and easy to use?",
      "Any creative or unusual approaches?",
      "Is the code readable enough for someone else to follow?",
      "Does the finished product feel complete, or half-done?",
    ],
    detailIntro: "Judges score this on:",
  },
  {
    name: "Meeting Challenge Requirements",
    weight: 25,
    summary:
      "Did the team pick a real challenge and build something that answers it?",
    icon: Target,
    details: [
      "Does it tackle the assigned challenge?",
      "Are the required deliverables in place?",
      "Would this help a real person with a real problem?",
      "Do the builders understand the problem they chose?",
      "Is the outcome practical, not just a demo for show?",
    ],
    detailIntro: "Ask:",
  },
  {
    name: "Presentation & Pitching",
    weight: 20,
    summary:
      "Can the team explain what they built, show it working, and answer questions?",
    icon: Mic2,
    details: [
      "What problem are you solving?",
      "What did you build?",
      "Show a live demo",
      "What tools and stack did you use?",
      "Who would this help, and how?",
      "What would you do next if you had more time?",
    ],
    detailIntro: "Your pitch should cover:",
    extras: {
      intro: "Judges also notice:",
      items: [
        "Confidence",
        "Clarity",
        "Structure",
        "Staying on time",
        "Handling Q&A",
      ],
    },
  },
  {
    name: "Communication & Teamwork",
    weight: 15,
    summary:
      "How did the team work together, talk to mentors, and show up during the programme?",
    icon: MessageSquare,
    details: [
      "Did the team work as a unit, not one person doing everything?",
      "Did they check in with mentors when stuck?",
      "Did everyone take part?",
      "Were they professional with organizers and judges?",
      "Did they take feedback and act on it?",
      "Were they respectful with each other and other teams?",
    ],
    detailIntro: "Mentors and judges watch for:",
  },
] as const;

const scoreBands = [
  {
    range: "90 to 100",
    label: "Outstanding",
    description: "Top-tier build, clear demo, and strong teamwork.",
  },
  {
    range: "80 to 89",
    label: "Excellent",
    description: "Strong project. A few rough edges, nothing major.",
  },
  {
    range: "70 to 79",
    label: "Good",
    description: "Works, shows real effort, and addresses the challenge.",
  },
  {
    range: "60 to 69",
    label: "Fair",
    description: "Some of it is there, but it still feels unfinished.",
  },
  {
    range: "Below 60",
    label: "Needs work",
    description: "Big gaps in the build, the challenge fit, or the pitch.",
  },
] as const;

const notes = [
  "Work must be your team's own. Don't submit someone else's project.",
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
          description="Judges score every project on the four areas below. A working app matters, so does how you work as a team and how clearly you explain what you built."
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
                    Criteria
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
              >
                <MarketingCard className="flex h-full flex-col p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/15">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-md bg-brand px-2.5 py-1 text-xs font-bold text-white dark:text-navy">
                      {item.weight} pts
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
                  {"extras" in item && item.extras && (
                    <div className="mt-5 border-t border-line pt-5">
                      <p className="text-sm font-semibold text-fg">
                        {item.extras.intro}
                      </p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {item.extras.items.map((extra) => (
                          <li
                            key={extra}
                            className="rounded-md border border-line bg-canvas/80 px-2.5 py-1 text-xs font-medium text-fg/70"
                          >
                            {extra}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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
