"use client";

import Link from "next/link";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import {
  AuthButton,
  AuthError,
  AuthInfo,
  AuthInput,
  AuthLink,
  AuthShell,
} from "@/components/auth/auth-shell";
import { PageLoader } from "@/components/ui/spinner";
import {
  requestPasswordReset,
  resetPassword,
  validatePassword,
} from "@/lib/auth";
import { cn } from "@/lib/utils";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SEC = 60;
const CODE_TTL_SEC = 15 * 60;

function formatTime(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0] || "*"}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = useMemo(
    () => searchParams.get("email") || "",
    [searchParams]
  );

  const [email] = useState(emailFromQuery);
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length: CODE_LENGTH }, () => "")
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState(
    emailFromQuery
      ? "A 6-digit code was sent to your email."
      : "Request a reset code from the forgot password page first."
  );
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendIn, setResendIn] = useState(
    emailFromQuery ? RESEND_COOLDOWN_SEC : 0
  );
  const [expiresIn, setExpiresIn] = useState(
    emailFromQuery ? CODE_TTL_SEC : 0
  );
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join("");

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => {
      setResendIn((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  useEffect(() => {
    if (expiresIn <= 0) return;
    const id = window.setTimeout(() => {
      setExpiresIn((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [expiresIn]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const setDigitAt = useCallback((index: number, value: string) => {
    const char = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = char;
      return next;
    });
    if (char && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }, []);

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = Array.from({ length: CODE_LENGTH }, (_, i) => pasted[i] || "");
    setDigits(next);
    const focusAt = Math.min(pasted.length, CODE_LENGTH - 1);
    inputsRef.current[focusAt]?.focus();
  }

  function onKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      e.preventDefault();
      setDigits((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email) {
      setError("Missing email. Start again from forgot password.");
      return;
    }
    if (code.length !== CODE_LENGTH) {
      setError("Enter the full 6-digit code.");
      return;
    }
    if (expiresIn <= 0) {
      setError("This code has expired. Request a new one.");
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
      await resetPassword({ email, code, password });
      router.push("/login?reset=1");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not reset password."
      );
      setDigits(Array.from({ length: CODE_LENGTH }, () => ""));
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setError("");
    setInfo("");
    if (!email) {
      setError("Missing email. Start again from forgot password.");
      return;
    }
    if (resendIn > 0) return;
    setResending(true);
    try {
      const result = await requestPasswordReset({ email });
      setInfo(result.message || "A new code was sent.");
      setResendIn(RESEND_COOLDOWN_SEC);
      setExpiresIn(CODE_TTL_SEC);
      setDigits(Array.from({ length: CODE_LENGTH }, () => ""));
      inputsRef.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend code.");
    } finally {
      setResending(false);
    }
  }

  if (!email) {
    return (
      <div className="space-y-4 text-center">
        <AuthError message="Open this page from Forgot password so we know which email to reset." />
        <Link
          href="/forgot-password"
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white"
        >
          Go to forgot password
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="flex items-start gap-3 rounded-xl border border-line bg-canvas px-4 py-3">
        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-fg/45">
            Code sent to
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-fg">
            {maskEmail(email)}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-medium text-fg/70">Reset code</label>
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              expiresIn <= 0
                ? "text-red-600 dark:text-red-300"
                : expiresIn <= 60
                  ? "text-orange-600 dark:text-orange-300"
                  : "text-fg/45"
            )}
          >
            {expiresIn > 0
              ? `Expires in ${formatTime(expiresIn)}`
              : "Code expired"}
          </span>
        </div>
        <div className="flex justify-between gap-2 sm:gap-2.5">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${index + 1}`}
              maxLength={1}
              value={digit}
              onChange={(e) => setDigitAt(index, e.target.value)}
              onKeyDown={(e) => onKeyDown(index, e)}
              onPaste={onPaste}
              className={cn(
                "h-12 w-10 rounded-xl border border-line-strong/40 bg-input text-center font-display text-xl font-bold text-fg outline-none transition sm:h-14 sm:w-12 sm:text-2xl",
                "hover:border-line-strong/70 focus:border-brand focus:ring-[3px] focus:ring-brand/15",
                digit && "border-brand/40"
              )}
            />
          ))}
        </div>
      </div>

      <AuthInput
        id="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 10 chars, number + symbol"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <AuthInput
        id="confirmPassword"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        placeholder="Re-enter your new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <AuthError message={error} />
      <AuthInfo message={info && !error ? info : ""} />

      <AuthButton
        type="submit"
        loading={loading}
        disabled={code.length !== CODE_LENGTH || expiresIn <= 0}
      >
        {loading ? "Updating…" : "Update password"}
      </AuthButton>

      <div className="space-y-2 text-center">
        <p className="text-sm text-fg-subtle">Didn’t receive the code?</p>
        <button
          type="button"
          onClick={onResend}
          disabled={resending || resendIn > 0 || !email}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-line-strong/40 bg-transparent px-4 text-[15px] font-semibold text-fg transition hover:border-brand/40 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resending
            ? "Sending..."
            : resendIn > 0
              ? `Resend code in ${formatTime(resendIn)}`
              : "Resend code"}
        </button>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          title="Choose a new password"
          description="Loading…"
          eyebrow="Account recovery"
        >
          <PageLoader label="Please wait…" className="min-h-0 py-10" />
        </AuthShell>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  return (
    <AuthShell
      title="Choose a new password"
      description="Enter the 6-digit code from your email, then set a new password."
      eyebrow="Account recovery"
      footer={
        <p>
          <AuthLink href="/login">Back to sign in</AuthLink>
        </p>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
