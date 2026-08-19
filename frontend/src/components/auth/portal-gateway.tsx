"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Gavel, Shield } from "lucide-react";
import {
  AuthButton,
  AuthLink,
  AuthShell,
} from "@/components/auth/auth-shell";
import { PageLoader } from "@/components/ui/spinner";
import {
  clearSession,
  dashboardForRole,
  getStoredUser,
} from "@/lib/auth";

type PortalKind = "MENTOR" | "ADMIN" | "JUDGE";

const copy: Record<
  PortalKind,
  {
    title: string;
    description: string;
    eyebrow: string;
    loginHref: string;
    registerHref: string;
    icon: typeof GraduationCap;
  }
> = {
  MENTOR: {
    title: "Mentor Portal",
    description:
      "Sign in with your mentor account, or create one to get started. Administrators assign mentors to teams.",
    eyebrow: "Mentor",
    loginHref: "/login?portal=mentor",
    registerHref: "/register?portal=mentor",
    icon: GraduationCap,
  },
  ADMIN: {
    title: "Admin Portal",
    description:
      "Sign in with your administrator account to manage participants, teams, mentors, and invitations.",
    eyebrow: "Administrator",
    loginHref: "/login?portal=admin",
    registerHref: "/register?portal=participant",
    icon: Shield,
  },
  JUDGE: {
    title: "Judge Portal",
    description:
      "Sign in after an administrator invites you. Complete signup from your email, then score submissions.",
    eyebrow: "Judge",
    loginHref: "/login?portal=judge",
    registerHref: "/portal/judge",
    icon: Gavel,
  },
};

export function PortalGateway({ kind }: { kind: PortalKind }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const meta = copy[kind];
  const Icon = meta.icon;

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      setChecking(false);
      return;
    }
    if (user.role === kind) {
      router.replace(dashboardForRole(user.role));
      return;
    }
    clearSession();
    setChecking(false);
  }, [kind, router]);

  if (checking) {
    return (
      <AuthShell
        title={meta.title}
        description="Checking your session…"
        eyebrow={meta.eyebrow}
      >
        <PageLoader label="Please wait…" className="min-h-0 py-10" />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={meta.title}
      description={meta.description}
      eyebrow={meta.eyebrow}
      footer={
        kind === "MENTOR" ? (
          <p>
            No account yet?{" "}
            <AuthLink href={meta.registerHref}>Create mentor account</AuthLink>
          </p>
        ) : (
          <p>
            <AuthLink href="/">Back to home</AuthLink>
          </p>
        )
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-line-strong/35 bg-surface-muted/70 px-4 py-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Icon className="h-5 w-5" strokeWidth={2.15} />
          </span>
          <p className="pt-1.5 text-sm leading-relaxed text-fg-muted">
            {kind === "ADMIN"
              ? "Admins are invited by an existing administrator. Use the invite link from your email, or sign in if you already completed signup."
              : kind === "JUDGE"
                ? "Judges are invited by email. Open the invite link we sent you to finish signup, then sign in here."
                : "Mentors self-register, then wait for an admin to assign teams."}
          </p>
        </div>
        <AuthButton type="button" onClick={() => router.push(meta.loginHref)}>
          Sign in to {meta.title}
        </AuthButton>
        {kind === "MENTOR" && (
          <button
            type="button"
            onClick={() => router.push(meta.registerHref)}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-line-strong/40 bg-transparent px-4 text-[15px] font-semibold text-fg transition hover:border-brand/40 hover:bg-surface-muted"
          >
            Create mentor account
          </button>
        )}
        <p className="text-center text-sm text-fg-subtle">
          <Link href="/portal" className="hover:text-fg hover:underline">
            All portals
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
