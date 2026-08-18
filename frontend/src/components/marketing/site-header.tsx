"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { BrandMark } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export const marketingNav = [
  { href: "/challenges", label: "Challenges" },
  { href: "/timeline", label: "Timeline" },
  { href: "/mentors", label: "Mentors & Judges" },
  { href: "/grading", label: "Grading" },
  { href: "/faq", label: "FAQ" },
  { href: "/platform", label: "Tools" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const mobileMenu =
    mounted &&
    menuOpen &&
    createPortal(
      <div
        className="fixed inset-0 z-[100] flex flex-col bg-canvas lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex h-[64px] shrink-0 items-center justify-between gap-3 border-b border-line px-4 pt-[env(safe-area-inset-top)] sm:h-[72px] sm:px-6">
          <Link
            href="/"
            className="flex min-w-0 items-center"
            onClick={() => setMenuOpen(false)}
          >
            <BrandMark size={56} priority light={theme === "light"} />
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-fg hover:bg-fg/5"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
            <div className="flex flex-col gap-1">
              {marketingNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "rounded-xl px-4 py-4 text-base font-medium",
                    pathname === item.href ||
                      pathname.startsWith(item.href + "/")
                      ? "bg-brand-soft text-brand"
                      : "text-fg hover:bg-brand-soft"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-3 border-t border-line pt-6">
              <Link
                href="/portal"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl border border-line px-4 py-3.5 text-center text-[15px] font-semibold text-fg"
              >
                Portals
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl border border-line px-4 py-3.5 text-center text-[15px] font-semibold text-fg"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl bg-brand px-4 py-3.5 text-center text-[15px] font-semibold text-white dark:text-navy"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-line bg-canvas/90 backdrop-blur-md supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-[64px] max-w-6xl items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-6">
          <Link
            href="/"
            className="flex min-w-0 items-center"
            onClick={() => setMenuOpen(false)}
          >
            <BrandMark size={56} priority light={theme === "light"} />
          </Link>
          <div className="hidden items-center gap-6 xl:gap-7 lg:flex">
            {marketingNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[15px] font-medium transition",
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "text-fg"
                    : "text-fg-muted hover:text-fg"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle />
            <Link
              href="/portal"
              className="text-[15px] font-medium text-fg-muted transition hover:text-fg"
            >
              Portals
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-brand px-4 py-2.5 text-[15px] font-semibold text-white transition hover:bg-brand-hover dark:text-navy"
            >
              Sign in
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-fg hover:bg-fg/5"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>
      {mobileMenu}
    </>
  );
}
