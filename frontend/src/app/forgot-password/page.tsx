"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthButton,
  AuthError,
  AuthInput,
  AuthLink,
  AuthShell,
} from "@/components/auth/auth-shell";
import { requestPasswordReset } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await requestPasswordReset({ email: email.trim().toLowerCase() });
      router.push(
        `/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send reset code."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      description="Enter your account email and we’ll send a 6-digit code if it exists."
      eyebrow="Account recovery"
      footer={
        <p>
          Remembered it? <AuthLink href="/login">Back to sign in</AuthLink>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={onSubmit}>
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
        <AuthError message={error} />
        <AuthButton type="submit" loading={loading}>
          {loading ? "Sending…" : "Send reset code"}
        </AuthButton>
      </form>
    </AuthShell>
  );
}
