export type AuthRole = "PARTICIPANT" | "MENTOR" | "ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  avatar?: string | null;
  title?: string | null;
  bio?: string | null;
  onboardingCompletedAt?: string | null;
  cocAcceptedAt?: string | null;
  emailVerifiedAt?: string | null;
  notificationPrefs?: Record<string, boolean> | null;
  createdAt?: string;
};

const TOKEN_KEY = "ghs-auth-token";
const USER_KEY = "ghs-auth-user";

function apiBase() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function dashboardForRole(role: AuthRole) {
  if (role === "MENTOR") return "/mentor";
  if (role === "ADMIN") return "/admin";
  return "/dashboard";
}

export function postLoginPath(user: AuthUser | AuthRole) {
  const role = typeof user === "string" ? user : user.role;
  if (role === "PARTICIPANT") {
    const completed =
      typeof user === "object"
        ? user.onboardingCompletedAt
        : typeof window !== "undefined"
          ? localStorage.getItem("ghs-onboarding-complete")
          : null;
    if (!completed) return "/onboarding";
    return "/dashboard";
  }
  return dashboardForRole(role);
}

export function validatePassword(password: string): string | null {
  if (password.length < 10) {
    return "Password must be at least 10 characters.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include at least one number.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include at least one symbol (for example ! @ # $ %).";
  }
  return null;
}

async function postJson<T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(
      data.error || "Something went wrong. Try again."
    ) as Error & {
      status?: number;
      payload?: Record<string, unknown>;
    };
    error.status = res.status;
    error.payload = data;
    throw error;
  }
  return data as T;
}

export function registerAccount(input: {
  name: string;
  email: string;
  password: string;
  role: "PARTICIPANT" | "MENTOR";
}) {
  return postJson<{
    requiresVerification: true;
    email: string;
    message: string;
  }>("/api/auth/register", input);
}

export function verifyEmailCode(input: { email: string; code: string }) {
  return postJson<{ token: string; user: AuthUser }>(
    "/api/auth/verify-email",
    input
  );
}

export function resendVerificationCode(input: { email: string }) {
  return postJson<{
    requiresVerification: true;
    email: string;
    message: string;
  }>("/api/auth/resend-code", input);
}

export function loginAccount(input: { email: string; password: string }) {
  return postJson<{
    token?: string;
    user?: AuthUser;
    requiresVerification?: boolean;
    email?: string;
  }>("/api/auth/login", input);
}

export function requestPasswordReset(input: { email: string }) {
  return postJson<{ email: string; message: string }>(
    "/api/auth/forgot-password",
    input
  );
}

export function resetPassword(input: {
  email: string;
  code: string;
  password: string;
}) {
  return postJson<{ email: string; message: string }>(
    "/api/auth/reset-password",
    input
  );
}
