"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MarketingCard, PageIntro } from "@/components/marketing/page-chrome";
import { programmeMentors } from "@/lib/data";

export default function MentorsPage() {
  const mentors = programmeMentors;

  return (
    <div className="overflow-x-hidden pb-16 pt-8 sm:pb-20 sm:pt-12 md:pb-28 md:pt-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <MarketingCard
          className="mb-10 overflow-hidden sm:mb-14"
          hover={false}
        >
          <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
            <div className="p-5 sm:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                About the programme partner
              </p>
              <h2 className="font-display mt-2 text-[50px] font-bold leading-none tracking-tight text-fg">
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
          title="Meet the mentors"
          description="These are the mentors who will help teams during the build weeks. Read their profiles so you know who is supporting the programme."
          className="mb-10 sm:mb-14"
        />

        <ul className="space-y-8 sm:space-y-10">
          {mentors.map((mentor, i) => (
            <li key={mentor.id} className="list-none">
              <motion.article
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: Math.min(i * 0.06, 0.35),
                  duration: 0.45,
                }}
                className="overflow-hidden rounded-2xl border border-line bg-card/90 p-5 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-sm sm:p-7"
              >
                <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-center md:gap-8">
                  <div className="relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-xl border border-line bg-white">
                    <Image
                      src={mentor.photo}
                      alt={mentor.name}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 768px) 88vw, 320px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col justify-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                      Programme mentor
                    </p>
                    <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-fg sm:text-3xl">
                      {mentor.name}
                    </h2>
                    <p className="mt-1.5 text-base font-semibold text-fg/70">
                      {mentor.title}
                    </p>
                    <div className="mt-4 h-1 w-12 rounded-full bg-gradient-to-r from-brand to-blue/70" />

                    <div className="mt-5 space-y-3 text-sm leading-relaxed text-fg/60 sm:mt-6 sm:text-[15px] sm:leading-relaxed">
                      {mentor.bio.split(/\n\n+/).map((para) => (
                        <p key={para.slice(0, 48)}>{para}</p>
                      ))}
                    </div>

                    {mentor.focus.length > 0 && (
                      <ul className="mt-6 flex flex-wrap gap-2">
                        {mentor.focus.map((item) => (
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
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
