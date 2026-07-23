"use client";

import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { PlatformLogo } from "@/components/marketing/platform-logo";
import { MarketingCard, PageIntro } from "@/components/marketing/page-chrome";
import { platforms } from "@/lib/data";

export default function PlatformPage() {
  return (
    <div className="overflow-x-hidden py-10 sm:py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <PageIntro
          title={"Tools you'll use"}
          description="Official stack for the 2026 programme. Click a logo to open the site."
          className="mb-10 sm:mb-14"
        />

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {platforms.map((p, i) => (
            <motion.a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="block"
            >
              <MarketingCard className="group flex h-full flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-fg/5 text-fg ring-1 ring-line transition group-hover:bg-brand-soft group-hover:text-brand group-hover:ring-brand/20">
                    <PlatformLogo id={p.id} />
                  </div>
                  <ExternalLink className="h-4 w-4 text-fg-subtle transition group-hover:text-brand" />
                </div>
                <div className="mt-5 flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-fg">
                    {p.name}
                  </h2>
                  {p.optional && (
                    <span className="rounded-md bg-fg/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fg-muted">
                      Optional
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm font-semibold text-brand">{p.role}</p>
                <p className="mt-2 text-sm leading-relaxed text-fg/55">{p.note}</p>
                <p className="mt-4 truncate text-xs text-fg-subtle">{p.url}</p>
              </MarketingCard>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}
