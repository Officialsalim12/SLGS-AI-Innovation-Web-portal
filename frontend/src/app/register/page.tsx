"use client";

import { Suspense, useMemo, useState } from "react";
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
import { registerAccount, validatePassword, type AuthRole } from "@/lib/auth";
import { setAcceptedLegal } from "@/lib/legal";

type SignupRole = Extract<AuthRole, "PARTICIPANT" | "MENTOR">;

const portalToRole: Record<string, SignupRole> = {
  participant: "PARTICIPANT",
  mentor: "MENTOR",
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const portal = (searchParams.get("portal") || "").toLowerCase();
  const role: SignupRole = portalToRole[portal] || "PARTICIPANT";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedLegal, setAcceptedLegalState] = useLegalAcceptance();

  const meta = useMemo(() => {
    if (role === "MENTOR") {
      return {
        title: "Create your account",
        description:
          "Register as a mentor. After email verification, administrators can assign you to teams.",
        eyebrow: "Mentor",
        loginHref: "/login?portal=mentor",
      };
    }
    return {
      title: "Create your account",
      description:
        "Join the programme. We’ll email a 6-digit code to confirm your address.",
      eyebrow: "Participant",
      loginHref: "/login?portal=participant",
    };
  }, [role]);

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
      const result = await registerAccount({
        name,
        email,
        password,
        role,
      });
      setAcceptedLegal();
      const params = new URLSearchParams({
        email: result.email,
        portal: role === "MENTOR" ? "mentor" : "participant",
      });
      router.push(`/verify-email?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={meta.title}
      description={meta.description}
      eyebrow={meta.eyebrow}
      footer={
        <p>
          Already registered?{" "}
          <AuthLink href={meta.loginHref}>Sign in</AuthLink>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
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
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@slgs.edu.sl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          {loading ? "Sending code…" : "Continue to verification"}
        </AuthButton>
      </form>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          title="Create your account"
          description="Loading…"
          eyebrow="Register"
        >
          <PageLoader label="Please wait…" className="min-h-0 py-10" />
        </AuthShell>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
