"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, Gavel, Shield, Users } from "lucide-react";
import { AuthLink, AuthShell } from "@/components/auth/auth-shell";

const portals = [
  {
    loginHref: "/login?portal=participant",
    registerHref: "/register?portal=participant",
    title: "Participant",
    body: "Join your team workspace and submit your project.",
    icon: Users,
    canRegister: true,
  },
  {
    loginHref: "/portal/mentor",
    registerHref: "/register?portal=mentor",
    title: "Mentor",
    body: "Guide assigned teams through the challenge.",
    icon: GraduationCap,
    canRegister: true,
  },
  {
    loginHref: "/portal/admin",
    title: "Administrator",
    body: "Manage people, teams, invitations, and programme operations.",
    icon: Shield,
    canRegister: false,
  },
  {
    loginHref: "/portal/judge",
    title: "Judge",
    body: "Score submitted projects after an administrator invites you.",
    icon: Gavel,
    canRegister: false,
  },
];

export default function PortalsPage() {
  return (
    <AuthShell
      title="Choose your portal"
      description="Select how you’re joining the AI Innovation Programme."
      wide
      footer={
        <p>
          <AuthLink href="/">Back to home</AuthLink>
        </p>
      }
    >
      <div className="space-y-3">
        {portals.map((portal) => (
          <div
            key={portal.title}
            className="rounded-2xl border border-line-strong/35 bg-surface/70 p-4 transition hover:border-brand/35 hover:bg-surface"
          >
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <portal.icon className="h-5 w-5" strokeWidth={2.15} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15px] font-semibold tracking-tight text-fg">
                  {portal.title}
                </p>
                <p className="mt-0.5 text-sm text-fg-muted">{portal.body}</p>
                <div className="mt-3.5 flex flex-wrap gap-2">
                  <Link
                    href={portal.loginHref}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-brand-hover dark:text-navy"
                  >
                    Sign in
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  {portal.canRegister && portal.registerHref && (
                    <Link
                      href={portal.registerHref}
                      className="inline-flex items-center justify-center rounded-xl border border-line-strong/40 px-3.5 py-2 text-xs font-semibold text-fg transition hover:border-brand/40 hover:bg-surface-muted"
                    >
                      Sign up
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AuthShell>
  );
}
