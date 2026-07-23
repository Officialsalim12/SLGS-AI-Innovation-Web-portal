"use client";

import Link from "next/link";
import { LEGAL, type LegalBlock } from "@/lib/legal";
import { PageIntro } from "@/components/marketing/page-chrome";

function Section({ block }: { block: LegalBlock }) {
  if (!block.title && !block.paragraphs?.length && !block.bullets?.length) {
    return null;
  }

  return (
    <section id={block.id} className="scroll-mt-24">
      {block.title ? (
        <h2 className="font-display text-xl font-semibold text-fg sm:text-2xl">
          {block.title}
        </h2>
      ) : null}
      {block.paragraphs?.map((p) => (
        <p
          key={p.slice(0, 48)}
          className={`text-sm leading-relaxed text-fg/70 sm:text-[15px] ${
            block.title ? "mt-3" : "mt-2"
          }`}
        >
          {p}
        </p>
      ))}
      {block.bullets?.length ? (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-fg/70 sm:text-[15px]">
          {block.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {block.after?.map((p) => (
        <p
          key={p.slice(0, 48)}
          className="mt-3 text-sm leading-relaxed text-fg/70 sm:text-[15px]"
        >
          {p}
        </p>
      ))}
      {block.subsections?.map((sub) => (
        <div key={sub.id} className="mt-6">
          <h3 className="text-base font-semibold text-fg sm:text-lg">
            {sub.title}
          </h3>
          {sub.paragraphs?.map((p) => (
            <p
              key={p.slice(0, 48)}
              className="mt-2 text-sm leading-relaxed text-fg/70 sm:text-[15px]"
            >
              {p}
            </p>
          ))}
          {sub.bullets?.length ? (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-fg/70 sm:text-[15px]">
              {sub.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </section>
  );
}

export function LegalPage({
  title,
  intro,
  sections,
  relatedHref,
  relatedLabel,
}: {
  title: string;
  intro: string;
  sections: LegalBlock[];
  relatedHref: string;
  relatedLabel: string;
}) {
  return (
    <div className="overflow-x-hidden py-10 sm:py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <PageIntro title={title} description={intro} className="mb-6 sm:mb-8" />
        <p className="text-center text-xs text-fg/45 sm:text-sm">
          Last updated: {LEGAL.lastUpdated}
        </p>
        <p className="mt-2 text-center text-sm text-fg/55">
          Also see{" "}
          <Link href={relatedHref} className="font-semibold text-brand hover:underline">
            {relatedLabel}
          </Link>
          .
        </p>

        <div className="mt-10 space-y-10 rounded-2xl border border-line bg-card/90 p-5 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-sm sm:mt-12 sm:p-8 md:p-10">
          {sections.map((block) => (
            <Section key={block.id} block={block} />
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-fg/50">
          Questions?{" "}
          <a
            href={`mailto:${LEGAL.email}`}
            className="font-semibold text-brand hover:underline"
          >
            {LEGAL.email}
          </a>
          {" · "}
          <a
            href={LEGAL.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand hover:underline"
          >
            WhatsApp {LEGAL.whatsappDisplay}
          </a>
        </p>
      </div>
    </div>
  );
}
