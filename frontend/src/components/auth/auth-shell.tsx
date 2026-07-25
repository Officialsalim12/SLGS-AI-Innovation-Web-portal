"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { BrandLogo, BrandMark } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function AuthShell({
  title,
  description,
  children,
  footer,
  eyebrow,
  wide = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  eyebrow?: string;
  wide?: boolean;
}) {
  const { theme } = useTheme();

  return (
    <div className="relative min-h-dvh bg-canvas text-fg">
      <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
          <div
            className="absolute inset-0 bg-[linear-gradient(155deg,#1a1025_0%,#2d1848_42%,#5d2a80_78%,#3b1d5c_100%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 22%, rgba(255,255,255,0.18), transparent 42%), radial-gradient(circle at 82% 12%, rgba(96,165,250,0.22), transparent 36%), radial-gradient(circle at 70% 78%, rgba(255,255,255,0.08), transparent 40%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage:
                "linear-gradient(to bottom, black 0%, transparent 78%)",
            }}
          />
          <motion.div
            className="pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl"
            aria-hidden
            animate={{ y: [0, 18, 0], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute -right-10 bottom-28 h-64 w-64 rounded-full bg-blue-light/25 blur-3xl"
            aria-hidden
            animate={{ y: [0, -22, 0], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/95 p-2 shadow-lg shadow-black/20">
                <BrandLogo size={52} priority />
              </span>
            </Link>
          </div>

          <div className="relative z-10 max-w-md py-16">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55"
            >
              AI Innovation Programme 2026
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.06 }}
              className="font-display mt-4 text-[2.15rem] font-semibold leading-[1.15] tracking-tight text-white xl:text-[2.45rem]"
            >
              Build solutions that matter for Sierra Leone.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="mt-4 text-[15px] leading-relaxed text-white/70"
            >
              Collaborate with instructors, mentors, and teammates across a
              four week bootcamp and build challenge. Facilitated by KNS in
              partnership with Sierra Leone Grammar School.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scaleX: 0.6 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.55, delay: 0.18 }}
              className="mt-8 h-1 w-16 origin-left rounded-full bg-gradient-to-r from-white to-white/30"
            />
          </div>

          <p className="relative z-10 text-xs text-white/45">
              Secure access facilitated by KNS in partnership with SLGS.
            </p>
        </aside>

        <section className="relative flex min-h-dvh flex-col">
          <div
            className="pointer-events-none absolute inset-0 lg:hidden"
            aria-hidden
          >
            <div className="absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,rgba(93,42,128,0.16),transparent)]" />
            <div className="absolute -right-12 top-8 h-40 w-40 rounded-full bg-brand/15 blur-3xl" />
          </div>

          <header className="relative z-10 flex items-center justify-between gap-3 px-5 py-5 sm:px-8 lg:px-10 lg:py-7">
            <Link href="/" className="min-w-0 lg:invisible lg:pointer-events-none">
              <BrandMark size={52} priority light={theme === "light"} />
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/portal"
                className="hidden rounded-full border border-line px-3 py-1.5 text-xs font-medium text-fg-muted transition hover:border-brand/35 hover:text-fg sm:inline-flex"
              >
                All portals
              </Link>
              <ThemeToggle />
            </div>
          </header>

          <main className="relative z-10 flex flex-1 flex-col justify-center px-5 pb-10 pt-2 sm:px-8 lg:px-10 xl:px-14">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={cn(
                "mx-auto w-full",
                wide ? "max-w-lg" : "max-w-[24rem]"
              )}
            >
              {eyebrow ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                  {eyebrow}
                </p>
              ) : null}
              <h1
                className={cn(
                  "font-display font-semibold tracking-tight text-fg",
                  eyebrow ? "mt-2" : undefined,
                  "text-[1.85rem] leading-tight sm:text-[2.05rem]"
                )}
              >
                {title}
              </h1>
              {description ? (
                <p className="mt-2.5 text-[15px] leading-relaxed text-fg-muted">
                  {description}
                </p>
              ) : null}

              <div className="mt-8">{children}</div>

              {footer ? (
                <div className="mt-8 border-t border-line/80 pt-6 text-sm leading-relaxed text-fg-subtle">
                  {footer}
                </div>
              ) : null}
            </motion.div>
          </main>
        </section>
      </div>
    </div>
  );
}

export function AuthInput({
  id,
  label,
  error,
  className,
  type = "text",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <div className="w-full space-y-1.5">
      {label ? (
        <label htmlFor={id} className="block text-[13px] font-medium text-fg">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className={cn(
            "h-12 w-full rounded-xl border border-line-strong/40 bg-input px-3.5 text-[15px] text-fg outline-none transition placeholder:text-fg-subtle",
            "hover:border-line-strong/70 focus:border-brand focus:ring-[3px] focus:ring-brand/15",
            isPassword && "pr-12",
            error &&
              "border-red-500/60 focus:border-red-500 focus:ring-red-500/15",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-fg-subtle transition hover:text-fg"
            aria-label={visible ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-300">{error}</p>}
    </div>
  );
}

export function AuthButton({
  children,
  className,
  loading = false,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      className={cn(
        "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-[15px] font-semibold text-white shadow-[0_12px_28px_-14px_rgba(93,42,128,0.7)] transition",
        "hover:bg-brand-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 dark:text-navy dark:shadow-brand/25",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-navy/30 dark:border-t-navy"
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  );
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-xl border border-red-500/25 bg-red-500/8 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-300"
    >
      {message}
    </p>
  );
}

export function AuthInfo({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="rounded-xl border border-brand/20 bg-brand/8 px-3.5 py-2.5 text-sm text-fg-muted">
      {message}
    </p>
  );
}

export function AuthLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "font-semibold text-brand transition hover:text-brand-hover hover:underline",
        className
      )}
    >
      {children}
    </Link>
  );
}
