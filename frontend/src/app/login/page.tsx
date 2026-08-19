"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AuthButton,
  AuthError,
  AuthInfo,
  AuthInput,
  AuthLink,
  AuthShell,
} from "@/components/auth/auth-shell";
import {
  AuthLegalAccept,
  useLegalAcceptance,
} from "@/components/auth/legal-accept";
import { PageLoader } from "@/components/ui/spinner";
import {
  clearSession,
  dashboardForRole,
  getStoredUser,
  postLoginPath,
  loginAccount,
  saveSession,
  type AuthRole,
} from "@/lib/auth";
import { setAcceptedLegal } from "@/lib/legal";

const portalMeta: Record<
  string,
  {
    title: string;
    description: string;
    eyebrow: string;
    expectedRole?: AuthRole;
  }
> = {
  participant: {
    title: "Welcome back",
    description: "Open your team workspace and continue building.",
    eyebrow: "Participant",
    expectedRole: "PARTICIPANT",
  },
  mentor: {
    title: "Welcome back",
    description: "Guide your assigned teams through the programme.",
    eyebrow: "Mentor",
    expectedRole: "MENTOR",
  },
  admin: {
    title: "Welcome back",
    description: "Manage teams, mentors, and programme operations.",
    eyebrow: "Administrator",
    expectedRole: "ADMIN",
  },
  judge: {
    title: "Welcome back",
    description: "Review submissions and score projects for the leaderboard.",
    eyebrow: "Judge",
    expectedRole: "JUDGE",
  },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const portal = (searchParams.get("portal") || "").toLowerCase();
  const meta = useMemo(
    () =>
      portalMeta[portal] || {
        title: "Welcome back",
        description: "Use your programme account to continue.",
        eyebrow: "Account",
      },
    [portal]
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info] = useState(() =>
    searchParams.get("reset") === "1"
      ? "Password updated. Sign in with your new password."
      : ""
  );
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [acceptedLegal, setAcceptedLegalState] = useLegalAcceptance();

  useEffect(() => {
    const existing = getStoredUser();
    if (existing && meta.expectedRole && existing.role === meta.expectedRole) {
      router.replace(dashboardForRole(existing.role));
      return;
    }
    clearSession();
    setReady(true);
  }, [meta.expectedRole, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!acceptedLegal) {
      setError("Please accept the Terms of Use and Privacy Policy to continue.");
      return;
    }
    setLoading(true);
    try {
      const result = await loginAccount({ email, password });
      if (result.requiresVerification && result.email) {
        router.push(`/verify-email?email=${encodeURIComponent(result.email)}`);
        return;
      }
      if (!result.token || !result.user) {
        throw new Error("Could not sign in.");
      }
      if (meta.expectedRole && result.user.role !== meta.expectedRole) {
        clearSession();
        const portalLabel =
          result.user.role === "MENTOR"
            ? "Mentor Portal"
            : result.user.role === "ADMIN"
              ? "Admin Portal"
              : result.user.role === "JUDGE"
                ? "Judge Portal"
                : "Participant Portal";
        setError(
          `Those credentials belong to a different portal. Sign in through the ${portalLabel} instead.`
        );
        return;
      }
      setAcceptedLegal();
      saveSession(result.token, result.user);
      if (meta.expectedRole) {
        router.push(dashboardForRole(result.user.role));
      } else {
        router.push(postLoginPath(result.user));
      }
    } catch (err) {
      const payload =
        err && typeof err === "object" && "payload" in err
          ? (err as { payload?: { requiresVerification?: boolean; email?: string } })
              .payload
          : undefined;
      if (payload?.requiresVerification && payload.email) {
        router.push(`/verify-email?email=${encodeURIComponent(payload.email)}`);
        return;
      }
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <AuthShell title={meta.title} description="Loading…" eyebrow={meta.eyebrow}>
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
        <>
          {(portal === "participant" || portal === "mentor" || !portal) && (
            <p>
              No account yet?{" "}
              <AuthLink
                href={
                  portal === "mentor"
                    ? "/register?portal=mentor"
                    : "/register?portal=participant"
                }
              >
                {portal === "mentor"
                  ? "Create a mentor account"
                  : "Create a participant account"}
              </AuthLink>
            </p>
          )}
          <p className={portal === "participant" || portal === "mentor" || !portal ? "mt-2" : undefined}>
            Need help?{" "}
            <Link href="/#organizers" className="font-medium text-fg hover:underline">
              Contact organisers
            </Link>
          </p>
        </>
      }
    >
      <form className="space-y-5" onSubmit={onSubmit} autoComplete="on">
        <AuthInput
          id="email"
          label="Email"
          type="email"
          name="email"
          autoComplete="username"
          placeholder="you@slgs.edu.sl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="password" className="text-[13px] font-medium text-fg">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-brand hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <AuthInput
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <AuthError message={error} />
        <AuthInfo message={info && !error ? info : ""} />
        <AuthLegalAccept
          checked={acceptedLegal}
          onChange={setAcceptedLegalState}
        />
        <AuthButton type="submit" loading={loading} disabled={!acceptedLegal}>
          {loading ? "Signing in…" : "Sign in"}
        </AuthButton>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Welcome back" description="Loading…" eyebrow="Account">
          <PageLoader label="Please wait…" className="min-h-0 py-10" />
        </AuthShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
