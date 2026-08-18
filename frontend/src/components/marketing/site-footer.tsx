import Link from "next/link";
import { BrandMark } from "@/components/brand-logo";

const columns = [
  {
    title: "Programme",
    links: [
      { href: "/challenges", label: "Challenges" },
      { href: "/timeline", label: "Timeline" },
      { href: "/mentors", label: "Mentors & Judges" },
      { href: "/grading", label: "Grading" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/portal", label: "Portals" },
      { href: "/portal/mentor", label: "Mentor Portal" },
      { href: "/portal/admin", label: "Admin Portal" },
      { href: "/platform", label: "Tools" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Sign up" },
      { href: "/terms", label: "Terms of Use" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
];
export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-footer text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-brand/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-blue/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_2fr] md:gap-12">
          <div className="min-w-0">
            <BrandMark size={64} />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
              Facilitated by KNS in partnership with Sierra Leone Grammar
              School. Selected students, mentors, and real Sierra Leone
              problems. AI Innovation Programme 2026.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title} className="min-w-0">
                <p className="text-sm font-semibold text-white">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="break-words text-sm text-white/50 transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/40 sm:mt-14">
          <p>KNS © 2026 · In partnership with Sierra Leone Grammar School</p>
        </div>
      </div>
    </footer>
  );
}
