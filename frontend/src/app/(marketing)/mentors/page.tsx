"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MarketingCard, PageIntro } from "@/components/marketing/page-chrome";
import {
  programmeJudges,
  programmeMentors,
  type ProgrammeProfile,
} from "@/lib/data";

export default function MentorsPage() {
  return (
    <div className="overflow-x-hidden pb-16 pt-8 sm:pb-20 sm:pt-12 md:pb-28 md:pt-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <MarketingCard
          className="mb-10 overflow-hidden sm:mb-14"
          hover={false}
        >
          <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
            <div className="p-5 sm:p-7">
              <h2 className="font-display text-[50px] font-bold leading-none tracking-tight text-fg">
                Knowledge Network Solutions
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-fg/60 sm:text-[15px]">
                <p>
                  KNS is a Sierra Leonean technology, telecommunications,
                  digital skills, and cybersecurity company based in Freetown.
                  With over 13 years of experience, it partners with government
                  ministries, banks, telecom operators, universities, and
                  private businesses across Sierra Leone and West Africa.
                </p>
                <p>
                  Recognised by the Ministry of Communication, Technology and
                  Innovation as Digital Skills Champion 2025, KNS runs diploma
                  and certificate programmes through KNS College in
                  cybersecurity, software engineering, cloud computing, data
                  analytics, and networking. It is an authorised Pearson VUE and
                  Certiport testing centre for global certifications such as
                  Cisco and (ISC)².
                </p>
                <p>
                  KNS will be facilitating this programme in partnership with
                  Sierra Leone Grammar School, and the mentors below are drawn
                  from its team.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-5 border-t border-line bg-canvas/60 p-5 sm:p-7 md:border-l md:border-t-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-display text-2xl font-bold text-fg">
                    13+
                  </p>
                  <p className="mt-1 text-xs text-fg/55">Years of experience</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-fg">
                    2025
                  </p>
                  <p className="mt-1 text-xs text-fg/55">
                    Digital Skills Champion
                  </p>
                </div>
              </div>

              <div className="h-px bg-line" />

              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                    Address
                  </p>
                  <address className="mt-2 space-y-1 text-sm not-italic leading-relaxed text-fg/65">
                    <p>18 Dundas Street</p>
                    <p>Freetown, Sierra Leone</p>
                  </address>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                    Email
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-fg/65">
                    <p>
                      <a
                        href="mailto:enquiry@kns.sl"
                        className="font-medium text-fg/75 underline decoration-line underline-offset-4 transition hover:text-brand"
                      >
                        enquiry@kns.sl
                      </a>
                    </p>
                    <p>
                      <a
                        href="mailto:admissions@kns.sl"
                        className="font-medium text-fg/75 underline decoration-line underline-offset-4 transition hover:text-brand"
                      >
                        admissions@kns.sl
                      </a>
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                    Websites
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-fg/65">
                    <p>
                      <a
                        href="https://kns.sl"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-fg/75 underline decoration-line underline-offset-4 transition hover:text-brand"
                      >
                        kns.sl
                      </a>
                    </p>
                    <p>
                      <a
                        href="https://kns.edu.sl"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-fg/75 underline decoration-line underline-offset-4 transition hover:text-brand"
                      >
                        kns.edu.sl
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MarketingCard>

        <PageIntro
          title="Mentors & judges"
          className="mb-8 sm:mb-10"
        />

        <nav
          aria-label="On this page"
          className="mb-12 flex flex-wrap items-center justify-center gap-2 sm:mb-14"
        >
          <a
            href="#judges"
            className="rounded-full border border-line bg-card/80 px-4 py-2 text-sm font-medium text-fg/70 transition hover:border-brand/40 hover:text-brand"
          >
            Judges
          </a>
          <a
            href="#mentors"
            className="rounded-full border border-line bg-card/80 px-4 py-2 text-sm font-medium text-fg/70 transition hover:border-brand/40 hover:text-brand"
          >
            Mentors
          </a>
        </nav>

        <ProfileSection
          id="judges"
          title="Meet Our Judges"
          description="For the AI Innovation Hackathon 2026"
          roleLabel="Hackathon judge"
          profiles={programmeJudges}
          emptyMessage="Judge profiles will be added here soon."
          variant="judge"
        />

        <ProfileSection
          id="mentors"
          title="Meet Our Mentors"
          description="For the AI Innovation Hackathon 2026"
          roleLabel="Programme mentor"
          profiles={programmeMentors}
          emptyMessage="Mentor profiles will appear here shortly."
          variant="mentor"
        />
      </div>
    </div>
  );
}

function ProfileSection({
  id,
  title,
  description,
  roleLabel,
  profiles,
  emptyMessage,
  variant,
}: {
  id: string;
  title: string;
  description: string;
  roleLabel: string;
  profiles: ProgrammeProfile[];
  emptyMessage: string;
  variant: "judge" | "mentor";
}) {
  return (
    <section id={id} className="scroll-mt-24 sm:scroll-mt-28">
      <div className="mb-8 sm:mb-10">
        <h2 className="font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg/55 sm:text-base">
          {description}
        </p>
        <div className="mt-4 h-1 w-12 rounded-full bg-gradient-to-r from-brand to-blue/70" />
      </div>

      {profiles.length === 0 ? (
        <div className="mb-16 rounded-2xl border border-dashed border-line bg-card/60 px-5 py-10 text-center sm:mb-20 sm:px-7">
          <p className="text-sm text-fg/55 sm:text-[15px]">{emptyMessage}</p>
        </div>
      ) : (
        <ul className="mb-16 space-y-8 sm:mb-20 sm:space-y-10">
          {profiles.map((person, i) => (
            <li key={person.id} className="list-none">
              <ProfileCard
                person={person}
                roleLabel={roleLabel}
                index={i}
                variant={variant}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ProfileCard({
  person,
  roleLabel,
  index,
  variant,
}: {
  person: ProgrammeProfile;
  roleLabel: string;
  index: number;
  variant: "judge" | "mentor";
}) {
  const isJudge = variant === "judge";

  if (isJudge) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: Math.min(index * 0.06, 0.35),
          duration: 0.45,
        }}
        className="rounded-2xl border border-line bg-card/90 px-5 py-5 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-sm sm:px-7 sm:py-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="min-w-0 text-left">
            <h3 className="font-display text-xl font-bold tracking-tight text-fg sm:text-2xl">
              {person.name}
            </h3>
            <p className="mt-1 text-sm font-medium text-fg/65 sm:text-base">
              {person.title}
            </p>
          </div>
          <Link
            href={`/mentors/judges/${person.id}`}
            className="shrink-0 text-sm font-semibold text-brand underline decoration-brand/30 underline-offset-4 transition hover:decoration-brand sm:text-right"
          >
            See full bio
          </Link>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.06, 0.35),
        duration: 0.45,
      }}
      className="overflow-hidden rounded-2xl border border-line bg-card/90 p-5 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-sm sm:p-7"
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-center md:gap-8">
        <div className="relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-xl border border-line bg-white">
          <Image
            src={person.photo}
            alt={person.name}
            fill
            priority={index === 0}
            sizes="(max-width: 768px) 88vw, 320px"
            className="object-cover"
            style={
              person.photoPosition
                ? { objectPosition: person.photoPosition }
                : undefined
            }
          />
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
            {roleLabel}
          </p>
          <h3 className="font-display mt-2 text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            {person.name}
          </h3>
          <p className="mt-1.5 text-base font-semibold text-fg/70">
            {person.title}
          </p>
          <div className="mt-4 h-1 w-12 rounded-full bg-gradient-to-r from-brand to-blue/70" />

          <div className="mt-5 space-y-3 text-sm leading-relaxed text-fg/60 sm:mt-6 sm:text-[15px]">
            {person.bio.split(/\n\n+/).map((para) => (
              <p key={para.slice(0, 48)}>{para}</p>
            ))}
          </div>

          {person.focus.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {person.focus.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-line bg-canvas/80 px-2.5 py-1 text-xs font-medium text-fg/65"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.article>
  );
}
