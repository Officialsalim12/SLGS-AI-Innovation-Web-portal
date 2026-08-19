"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AuthButton,
  AuthError,
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
  acceptInvite,
  dashboardForRole,
  getInvite,
  roleLabel,
  saveSession,
  validatePassword,
} from "@/lib/auth";
import { setAcceptedLegal } from "@/lib/legal";

function InviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "JUDGE" | "">("");
  const [invitedBy, setInvitedBy] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedLegal, setAcceptedLegalState] = useLegalAcceptance();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setInviteError("This invitation link is missing a token.");
        setLoadingInvite(false);
        return;
      }
      try {
        const invite = await getInvite(token);
        if (cancelled) return;
        setEmail(invite.email);
        setRole(invite.role);
        setInvitedBy(invite.invitedBy);
        if (invite.name) setName(invite.name);
      } catch (err) {
        if (!cancelled) {
          setInviteError(
            err instanceof Error
              ? err.message
              : "This invitation is invalid or has expired."
          );
        }
      } finally {
        if (!cancelled) setLoadingInvite(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!acceptedLegal) {
      setError("Please accept the Terms of Use and Privacy Policy to continue.");
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const result = await acceptInvite({ token, name, password });
      setAcceptedLegal();
      saveSession(result.token, result.user);
      router.replace(dashboardForRole(result.user.role));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not complete signup."
      );
    } finally {
      setLoading(false);
    }
  }

  const eyebrow = role ? roleLabel(role) : "Invitation";

  if (loadingInvite) {
    return (
      <AuthShell
        title="Complete your signup"
        description="Checking your invitation…"
        eyebrow="Invitation"
      >
        <PageLoader label="Please wait…" className="min-h-0 py-10" />
      </AuthShell>
    );
  }

  if (inviteError) {
    return (
      <AuthShell
        title="Invitation unavailable"
        description={inviteError}
        eyebrow="Invitation"
        footer={
          <p>
            Already registered? <AuthLink href="/login">Sign in</AuthLink>
          </p>
        }
      >
        <AuthError message={inviteError} />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Complete your signup"
      description={
        invitedBy
          ? `${invitedBy} invited you as a ${roleLabel(role).toLowerCase()}. Set your password to open your dashboard.`
          : `You’ve been invited as a ${roleLabel(role).toLowerCase()}. Set your password to open your dashboard.`
      }
      eyebrow={eyebrow}
      footer={
        <p>
          Already finished signup?{" "}
          <AuthLink
            href={role === "ADMIN" ? "/login?portal=admin" : "/login?portal=judge"}
          >
            Sign in
          </AuthLink>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <AuthInput
          id="email"
          label="Email"
          type="email"
          value={email}
          disabled
        />
        <AuthInput
          id="name"
          label="Full name"
          autoComplete="name"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <AuthInput
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 10 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={10}
          required
        />
        <AuthInput
          id="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={10}
          required
        />
        <p className="text-xs leading-relaxed text-fg-subtle">
          Use at least 10 characters, including a number and a symbol.
        </p>
        <AuthLegalAccept
          checked={acceptedLegal}
          onChange={setAcceptedLegalState}
        />
        <AuthError message={error} />
        <AuthButton
          type="submit"
          loading={loading}
          disabled={!acceptedLegal}
          className="mt-1"
        >
          {loading ? "Creating account…" : "Complete signup"}
        </AuthButton>
      </form>
    </AuthShell>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          title="Complete your signup"
          description="Loading…"
          eyebrow="Invitation"
        >
          <PageLoader label="Please wait…" className="min-h-0 py-10" />
        </AuthShell>
      }
    >
      <InviteForm />
    </Suspense>
  );
}
