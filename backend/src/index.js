require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});

const http = require("http");
const crypto = require("crypto");
const { URL } = require("url");
const nodePath = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("./db");
const { sendVerificationCodeEmail, sendPasswordResetCodeEmail } = require("./mail/brevo");
const api = require("./handlers");
const { findInviteByToken } = require("./invite");
const {
  UPLOAD_DIR,
  ensureUploadDir,
  contentTypeFromName,
} = require("./upload");

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "ghs-dev-secret-change-me";
const CODE_TTL_MS = 15 * 60 * 1000;

function validatePassword(password) {
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

function send(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    title: user.title,
    bio: user.bio,
    onboardingCompletedAt: user.onboardingCompletedAt,
    cocAcceptedAt: user.cocAcceptedAt,
    emailVerifiedAt: user.emailVerifiedAt,
    notificationPrefs:
      user.notificationPrefs && typeof user.notificationPrefs === "object"
        ? user.notificationPrefs
        : null,
    createdAt: user.createdAt,
  };
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function getBearerUserId(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload.sub;
  } catch {
    return null;
  }
}

function createVerificationCode() {
  return String(crypto.randomInt(100000, 1000000));
}

async function issueVerificationCode(user) {
  const code = createVerificationCode();
  const verificationCodeHash = await bcrypt.hash(code, 10);
  const verificationCodeExpiresAt = new Date(Date.now() + CODE_TTL_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationCodeHash,
      verificationCodeExpiresAt,
      emailVerifiedAt: null,
    },
  });

  await sendVerificationCodeEmail({
    toEmail: user.email,
    toName: user.name,
    code,
  });

  return code;
}

async function getHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      service: "ghs-hackathon-backend",
      status: "ok",
      database: "connected",
      brevo: Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL),
    };
  } catch (error) {
    return {
      service: "ghs-hackathon-backend",
      status: "degraded",
      database: "disconnected",
      error: error.message,
    };
  }
}

async function register(body) {
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const requested = String(body.role || "PARTICIPANT").toUpperCase();
  // Signup is participant or mentor only. No self-serve admin.
  const role = requested === "MENTOR" ? "MENTOR" : "PARTICIPANT";

  if (!name || name.length < 2) {
    return { status: 400, data: { error: "Enter your full name." } };
  }
  if (!email || !email.includes("@")) {
    return { status: 400, data: { error: "Enter a valid email." } };
  }
  const passwordError = validatePassword(password);
  if (passwordError) {
    return { status: 400, data: { error: passwordError } };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.emailVerifiedAt) {
    return { status: 409, data: { error: "An account with that email already exists." } };
  }

  const pendingInvite = await prisma.invite.findFirst({
    where: {
      email,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (pendingInvite) {
    return {
      status: 409,
      data: {
        error:
          "This email has a pending invitation. Open the invite link we sent you to finish signup.",
      },
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: { name, passwordHash, role },
      })
    : await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role,
        },
      });

  try {
    await issueVerificationCode(user);
  } catch (error) {
    console.error("Brevo send failed:", error.message, error.details || "");
    let message =
      "Could not send the verification email. Try again in a moment.";
    if (error.code === "BREVO_NOT_CONFIGURED") {
      message =
        "Email service is not configured. Ask an organizer to set Brevo keys.";
    } else if (
      error.code === "BREVO_UNAUTHORIZED" ||
      /unrecognised IP|authorized_ips|authorised_ips/i.test(error.message || "")
    ) {
      message =
        "Brevo blocked this request: authorize your current IP in Brevo Security → Authorised IPs, then try again.";
    }
    return {
      status: 502,
      data: { error: message },
    };
  }

  return {
    status: 201,
    data: {
      requiresVerification: true,
      email: user.email,
      message: "We sent a verification code to your email.",
    },
  };
}

async function verifyEmail(body) {
  const email = String(body.email || "").trim().toLowerCase();
  const code = String(body.code || "").trim();

  if (!email || !code) {
    return { status: 400, data: { error: "Email and verification code are required." } };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.verificationCodeHash || !user.verificationCodeExpiresAt) {
    return { status: 400, data: { error: "No pending verification for this email." } };
  }

  if (user.verificationCodeExpiresAt.getTime() < Date.now()) {
    return { status: 400, data: { error: "That code has expired. Request a new one." } };
  }

  const matches = await bcrypt.compare(code, user.verificationCodeHash);
  if (!matches) {
    return { status: 400, data: { error: "Incorrect verification code." } };
  }

  const verified = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: new Date(),
      verificationCodeHash: null,
      verificationCodeExpiresAt: null,
    },
  });

  return {
    status: 200,
    data: {
      token: signToken(verified),
      user: publicUser(verified),
    },
  };
}

async function resendCode(body) {
  const email = String(body.email || "").trim().toLowerCase();
  if (!email) {
    return { status: 400, data: { error: "Email is required." } };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { status: 404, data: { error: "No account found for that email." } };
  }
  if (user.emailVerifiedAt) {
    return { status: 400, data: { error: "This email is already verified. Sign in instead." } };
  }

  try {
    await issueVerificationCode(user);
  } catch (error) {
    console.error("Brevo resend failed:", error.message, error.details || "");
    return {
      status: 502,
      data: { error: "Could not resend the verification email. Try again shortly." },
    };
  }

  return {
    status: 200,
    data: {
      requiresVerification: true,
      email: user.email,
      message: "A new verification code was sent.",
    },
  };
}

async function login(body) {
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return { status: 400, data: { error: "Email and password are required." } };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return { status: 401, data: { error: "Invalid email or password." } };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return { status: 401, data: { error: "Invalid email or password." } };
  }

  if (
    user.role !== "PARTICIPANT" &&
    user.role !== "MENTOR" &&
    user.role !== "ADMIN" &&
    user.role !== "JUDGE"
  ) {
    return { status: 403, data: { error: "This account cannot sign in here." } };
  }

  if (!user.emailVerifiedAt) {
    try {
      await issueVerificationCode(user);
    } catch (error) {
      console.error("Brevo login resend failed:", error.message);
    }
    return {
      status: 403,
      data: {
        error: "Confirm your email before signing in. We sent a new code.",
        requiresVerification: true,
        email: user.email,
      },
    };
  }

  return {
    status: 200,
    data: { token: signToken(user), user: publicUser(user) },
  };
}

async function issuePasswordResetCode(user) {
  const code = createVerificationCode();
  const passwordResetCodeHash = await bcrypt.hash(code, 10);
  const passwordResetCodeExpiresAt = new Date(Date.now() + CODE_TTL_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetCodeHash,
      passwordResetCodeExpiresAt,
    },
  });

  await sendPasswordResetCodeEmail({
    toEmail: user.email,
    toName: user.name,
    code,
  });

  return code;
}

async function forgotPassword(body) {
  const email = String(body.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { status: 400, data: { error: "Enter a valid email." } };
  }

  const generic = {
    status: 200,
    data: {
      email,
      message:
        "If that email is registered, we sent a password reset code.",
    },
  };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash || !user.emailVerifiedAt) {
    return generic;
  }

  try {
    await issuePasswordResetCode(user);
  } catch (error) {
    console.error("Brevo password reset failed:", error.message, error.details || "");
    let message =
      "Could not send the reset email. Try again in a moment.";
    if (error.code === "BREVO_NOT_CONFIGURED") {
      message =
        "Email service is not configured. Ask an organizer to set Brevo keys.";
    } else if (
      error.code === "BREVO_UNAUTHORIZED" ||
      /unrecognised IP|authorized_ips|authorised_ips/i.test(error.message || "")
    ) {
      message =
        "Brevo blocked this request: authorize your current IP in Brevo Security → Authorised IPs, then try again.";
    }
    return { status: 502, data: { error: message } };
  }

  return generic;
}

async function resetPassword(body) {
  const email = String(body.email || "").trim().toLowerCase();
  const code = String(body.code || "").trim();
  const password = String(body.password || "");

  if (!email || !code) {
    return {
      status: 400,
      data: { error: "Email and reset code are required." },
    };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return { status: 400, data: { error: passwordError } };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (
    !user ||
    !user.passwordResetCodeHash ||
    !user.passwordResetCodeExpiresAt
  ) {
    return {
      status: 400,
      data: { error: "No pending password reset for this email." },
    };
  }

  if (user.passwordResetCodeExpiresAt.getTime() < Date.now()) {
    return {
      status: 400,
      data: { error: "That code has expired. Request a new one." },
    };
  }

  const matches = await bcrypt.compare(code, user.passwordResetCodeHash);
  if (!matches) {
    return { status: 400, data: { error: "Incorrect reset code." } };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetCodeHash: null,
      passwordResetCodeExpiresAt: null,
    },
  });

  return {
    status: 200,
    data: {
      message: "Password updated. You can sign in with your new password.",
      email: user.email,
    },
  };
}

async function lookupInvite(token) {
  const value = String(token || "").trim();
  if (!value) {
    return { status: 400, data: { error: "Invite token is required." } };
  }

  const invite = await findInviteByToken(value);
  if (!invite || invite.acceptedAt) {
    return {
      status: 404,
      data: { error: "This invitation is invalid or has already been used." },
    };
  }
  if (invite.expiresAt.getTime() < Date.now()) {
    return {
      status: 410,
      data: { error: "This invitation has expired. Ask an administrator to send a new one." },
    };
  }

  return {
    status: 200,
    data: {
      email: invite.email,
      name: invite.name || "",
      role: invite.role,
      expiresAt: invite.expiresAt,
      invitedBy: invite.invitedBy?.name || null,
    },
  };
}

async function acceptInvite(body) {
  const token = String(body.token || "").trim();
  const name = String(body.name || "").trim();
  const password = String(body.password || "");

  if (!token) {
    return { status: 400, data: { error: "Invite token is required." } };
  }
  if (!name || name.length < 2) {
    return { status: 400, data: { error: "Enter your full name." } };
  }
  const passwordError = validatePassword(password);
  if (passwordError) {
    return { status: 400, data: { error: passwordError } };
  }

  const invite = await findInviteByToken(token);
  if (!invite || invite.acceptedAt) {
    return {
      status: 404,
      data: { error: "This invitation is invalid or has already been used." },
    };
  }
  if (invite.expiresAt.getTime() < Date.now()) {
    return {
      status: 410,
      data: { error: "This invitation has expired. Ask an administrator to send a new one." },
    };
  }

  const existing = await prisma.user.findUnique({ where: { email: invite.email } });
  if (existing?.emailVerifiedAt) {
    return {
      status: 409,
      data: { error: "An account with that email already exists. Sign in instead." },
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date();
  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          passwordHash,
          role: invite.role,
          emailVerifiedAt: now,
          verificationCodeHash: null,
          verificationCodeExpiresAt: null,
        },
      })
    : await prisma.user.create({
        data: {
          name,
          email: invite.email,
          passwordHash,
          role: invite.role,
          emailVerifiedAt: now,
        },
      });

  await prisma.invite.update({
    where: { id: invite.id },
    data: { acceptedAt: now, name },
  });

  return {
    status: 200,
    data: {
      token: signToken(user),
      user: publicUser(user),
    },
  };
}

const server = http.createServer(async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const path = url.pathname;

  try {
    if ((path === "/health" || path === "/") && req.method === "GET") {
      const health = await getHealth();
      send(res, health.status === "ok" ? 200 : 503, health);
      return;
    }

    if (path === "/api/auth/register" && req.method === "POST") {
      const body = await readBody(req);
      const result = await register(body);
      send(res, result.status, result.data);
      return;
    }

    if (path === "/api/auth/verify-email" && req.method === "POST") {
      const body = await readBody(req);
      const result = await verifyEmail(body);
      send(res, result.status, result.data);
      return;
    }

    if (path === "/api/auth/resend-code" && req.method === "POST") {
      const body = await readBody(req);
      const result = await resendCode(body);
      send(res, result.status, result.data);
      return;
    }

    if (path === "/api/auth/login" && req.method === "POST") {
      const body = await readBody(req);
      const result = await login(body);
      send(res, result.status, result.data);
      return;
    }

    if (path === "/api/auth/forgot-password" && req.method === "POST") {
      const body = await readBody(req);
      const result = await forgotPassword(body);
      send(res, result.status, result.data);
      return;
    }

    if (path === "/api/auth/reset-password" && req.method === "POST") {
      const body = await readBody(req);
      const result = await resetPassword(body);
      send(res, result.status, result.data);
      return;
    }

    if (path === "/api/auth/invite" && req.method === "GET") {
      const result = await lookupInvite(url.searchParams.get("token"));
      send(res, result.status, result.data);
      return;
    }

    if (path === "/api/auth/invite/accept" && req.method === "POST") {
      const body = await readBody(req);
      const result = await acceptInvite(body);
      send(res, result.status, result.data);
      return;
    }

    if (path === "/api/auth/me" && req.method === "GET") {
      await api.handleMe(req, res);
      return;
    }

    if (path === "/api/onboarding" && req.method === "POST") {
      const body = await readBody(req);
      await api.handleOnboarding(req, res, body);
      return;
    }

    if (path === "/api/profile" && req.method === "PUT") {
      const body = await readBody(req);
      await api.handleProfile(req, res, body);
      return;
    }

    if (path === "/api/dashboard" && req.method === "GET") {
      await api.handleDashboard(req, res);
      return;
    }

    if (path === "/api/leaderboard" && req.method === "GET") {
      await api.handleLeaderboard(req, res);
      return;
    }

    if (path === "/api/leaderboard" && req.method === "POST") {
      const body = await readBody(req);
      await api.handleSetLeaderboardScore(req, res, body);
      return;
    }

    if (path === "/api/announcements" && req.method === "GET") {
      await api.handleAnnouncements(req, res);
      return;
    }

    if (path === "/api/announcements" && req.method === "POST") {
      const body = await readBody(req);
      await api.handleCreateAnnouncement(req, res, body);
      return;
    }

    if (path === "/api/notifications" && req.method === "GET") {
      await api.handleNotifications(req, res);
      return;
    }

    if (path === "/api/notifications/read" && req.method === "POST") {
      const body = await readBody(req);
      await api.handleReadNotifications(req, res, body);
      return;
    }

    if (path === "/api/notifications/clear" && req.method === "POST") {
      const body = await readBody(req);
      await api.handleClearNotifications(req, res, body);
      return;
    }

    if (path === "/api/teams" && req.method === "GET") {
      await api.handleTeamsList(req, res);
      return;
    }

    if (path === "/api/teams" && req.method === "POST") {
      const body = await readBody(req);
      await api.handleCreateTeam(req, res, body);
      return;
    }

    if (path === "/api/admin/teams/lock" && req.method === "POST") {
      const body = await readBody(req);
      await api.handleSetTeamsLocked(req, res, body);
      return;
    }

    const teamIdMatch = path.match(/^\/api\/teams\/([^/]+)$/);
    if (
      teamIdMatch &&
      teamIdMatch[1] !== "mine" &&
      req.method === "DELETE"
    ) {
      await api.handleDeleteTeam(req, res, teamIdMatch[1]);
      return;
    }

    const teamMembersMatch = path.match(/^\/api\/teams\/([^/]+)\/members$/);
    if (
      teamMembersMatch &&
      teamMembersMatch[1] !== "mine" &&
      req.method === "PUT"
    ) {
      const body = await readBody(req);
      await api.handleSetTeamMembers(req, res, teamMembersMatch[1], body);
      return;
    }

    if (path === "/api/teams/mine" && req.method === "GET") {
      await api.handleMyTeam(req, res);
      return;
    }

    if (path === "/api/responsibilities" && req.method === "GET") {
      await api.handleResponsibilities(req, res);
      return;
    }

    if (path === "/api/responsibilities" && req.method === "PUT") {
      const body = await readBody(req);
      await api.handleSaveResponsibilities(req, res, body);
      return;
    }

    if (path === "/api/tasks" && req.method === "GET") {
      await api.handleTasks(req, res);
      return;
    }

    if (path === "/api/tasks" && req.method === "POST") {
      const body = await readBody(req);
      await api.handleCreateTask(req, res, body);
      return;
    }

    const taskCommentsMatch = path.match(/^\/api\/tasks\/([^/]+)\/comments$/);
    if (taskCommentsMatch && req.method === "GET") {
      await api.handleTaskComments(req, res, taskCommentsMatch[1]);
      return;
    }

    if (taskCommentsMatch && req.method === "POST") {
      const body = await readBody(req);
      await api.handlePostTaskComment(req, res, body, taskCommentsMatch[1]);
      return;
    }

    const taskAttachMatch = path.match(/^\/api\/tasks\/([^/]+)\/attachments$/);
    if (taskAttachMatch && req.method === "POST") {
      const body = await readBody(req);
      await api.handleAttachTaskFile(req, res, body, taskAttachMatch[1]);
      return;
    }

    if (path === "/api/upload" && req.method === "POST") {
      const body = await readBody(req);
      await api.handleUpload(req, res, body);
      return;
    }

    if (path === "/api/tasks/move" && req.method === "POST") {
      const body = await readBody(req);
      await api.handleMoveTask(req, res, body);
      return;
    }

    if (path === "/api/workspace" && req.method === "GET") {
      await api.handleWorkspace(req, res);
      return;
    }

    if (path === "/api/workspace" && req.method === "POST") {
      const body = await readBody(req);
      await api.handleCreateWorkspaceSection(req, res, body);
      return;
    }

    if (path === "/api/workspace" && req.method === "PUT") {
      const body = await readBody(req);
      await api.handleSaveWorkspace(req, res, body);
      return;
    }

    if (path === "/api/chat/team" && req.method === "GET") {
      await api.handleChat(req, res, "team");
      return;
    }

    if (path === "/api/chat/team" && req.method === "POST") {
      const body = await readBody(req);
      await api.handlePostChat(req, res, body, "team");
      return;
    }

    if (path === "/api/chat/mentor" && req.method === "GET") {
      await api.handleChat(req, res, "mentor");
      return;
    }

    if (path === "/api/chat/mentor" && req.method === "POST") {
      const body = await readBody(req);
      await api.handlePostChat(req, res, body, "mentor");
      return;
    }

    if (path === "/api/chat/judges" && req.method === "GET") {
      await api.handleChat(req, res, "judges");
      return;
    }

    if (path === "/api/chat/judges" && req.method === "POST") {
      const body = await readBody(req);
      await api.handlePostChat(req, res, body, "judges");
      return;
    }

    if (path === "/api/chat/staff" && req.method === "GET") {
      await api.handleChat(req, res, "staff");
      return;
    }

    if (path === "/api/chat/staff" && req.method === "POST") {
      const body = await readBody(req);
      await api.handlePostChat(req, res, body, "staff");
      return;
    }

    if (path === "/api/chat/react" && req.method === "POST") {
      const body = await readBody(req);
      await api.handleReactChat(req, res, body);
      return;
    }

    if (path === "/api/chat/forward" && req.method === "POST") {
      const body = await readBody(req);
      await api.handleForwardChat(req, res, body);
      return;
    }

    if (path === "/api/chat/delete" && req.method === "POST") {
      const body = await readBody(req);
      await api.handleDeleteChat(req, res, body.messageId);
      return;
    }

    const chatMessageMatch = path.match(/^\/api\/chat\/messages\/([^/]+)$/);
    if (chatMessageMatch && req.method === "DELETE") {
      await api.handleDeleteChat(req, res, chatMessageMatch[1]);
      return;
    }

    if (path === "/api/submission" && req.method === "GET") {
      await api.handleSubmission(req, res);
      return;
    }

    if (path === "/api/submission" && req.method === "PUT") {
      const body = await readBody(req);
      await api.handleSaveSubmission(req, res, body);
      return;
    }

    if (path === "/api/admin/participants" && req.method === "GET") {
      await api.handleAdminParticipants(req, res);
      return;
    }

    const adminParticipantMoveMatch = path.match(
      /^\/api\/admin\/participants\/([^/]+)\/move$/
    );
    if (adminParticipantMoveMatch && req.method === "POST") {
      const body = await readBody(req);
      await api.handleAdminMoveParticipant(
        req,
        res,
        adminParticipantMoveMatch[1],
        body
      );
      return;
    }

    const adminParticipantRoleMatch = path.match(
      /^\/api\/admin\/participants\/([^/]+)\/role$/
    );
    if (adminParticipantRoleMatch && req.method === "POST") {
      const body = await readBody(req);
      await api.handleAdminSetParticipantRole(
        req,
        res,
        adminParticipantRoleMatch[1],
        body
      );
      return;
    }

    const adminParticipantMatch = path.match(
      /^\/api\/admin\/participants\/([^/]+)$/
    );
    if (adminParticipantMatch && req.method === "DELETE") {
      await api.handleAdminDeleteParticipant(
        req,
        res,
        adminParticipantMatch[1]
      );
      return;
    }

    const adminMentorMatch = path.match(/^\/api\/admin\/mentors\/([^/]+)$/);
    if (adminMentorMatch && req.method === "DELETE") {
      await api.handleAdminDeleteMentor(req, res, adminMentorMatch[1]);
      return;
    }

    if (path === "/api/admin/submissions" && req.method === "GET") {
      await api.handleAdminSubmissions(req, res);
      return;
    }

    if (path === "/api/admin/submissions" && req.method === "POST") {
      const body = await readBody(req);
      await api.handleAdminUpdateSubmission(req, res, body);
      return;
    }

    if (path === "/api/admin/staff" && req.method === "GET") {
      await api.handleAdminStaff(req, res);
      return;
    }

    if (path === "/api/admin/invites" && req.method === "POST") {
      const body = await readBody(req);
      await api.handleCreateInvite(req, res, body);
      return;
    }

    const adminInviteResendMatch = path.match(
      /^\/api\/admin\/invites\/([^/]+)\/resend$/
    );
    if (adminInviteResendMatch && req.method === "POST") {
      await api.handleResendInvite(req, res, adminInviteResendMatch[1]);
      return;
    }

    const adminInviteMatch = path.match(/^\/api\/admin\/invites\/([^/]+)$/);
    if (adminInviteMatch && req.method === "DELETE") {
      await api.handleRevokeInvite(req, res, adminInviteMatch[1]);
      return;
    }

    const adminStaffMatch = path.match(/^\/api\/admin\/staff\/([^/]+)$/);
    if (adminStaffMatch && req.method === "DELETE") {
      await api.handleAdminRevokeStaff(req, res, adminStaffMatch[1]);
      return;
    }

    if (path === "/api/judge-resources" && req.method === "GET") {
      await api.handleJudgeResources(req, res);
      return;
    }

    if (path === "/api/judge-resources" && req.method === "POST") {
      const body = await readBody(req);
      await api.handleCreateJudgeResource(req, res, body);
      return;
    }

    const judgeResourceMatch = path.match(/^\/api\/judge-resources\/([^/]+)$/);
    if (judgeResourceMatch && req.method === "DELETE") {
      await api.handleDeleteJudgeResource(req, res, judgeResourceMatch[1]);
      return;
    }

    if (path === "/api/mentors" && req.method === "GET") {
      await api.handleMentors(req, res);
      return;
    }

    if (path === "/api/public/mentors" && req.method === "GET") {
      await api.handlePublicMentors(req, res);
      return;
    }

    if (path === "/api/mentors/assign" && req.method === "POST") {
      const body = await readBody(req);
      await api.handleAssignMentors(req, res, body);
      return;
    }

    if (path === "/api/challenges" && req.method === "GET") {
      const challenges = await prisma.challenge.findMany({
        orderBy: [{ featured: "desc" }, { title: "asc" }],
      });
      send(res, 200, { challenges });
      return;
    }

    if (path === "/api/faqs" && req.method === "GET") {
      const faqs = await prisma.faq.findMany({
        where: { published: true },
        orderBy: { sortOrder: "asc" },
      });
      send(res, 200, { faqs });
      return;
    }

    if (path.startsWith("/uploads/") && req.method === "GET") {
      ensureUploadDir();
      const name = nodePath.basename(path);
      const filePath = nodePath.join(UPLOAD_DIR, name);
      if (!name || name.includes("..") || !fs.existsSync(filePath)) {
        send(res, 404, { error: "File not found" });
        return;
      }
      const data = fs.readFileSync(filePath);
      res.writeHead(200, {
        "Content-Type": contentTypeFromName(name),
        "Content-Length": data.length,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(data);
      return;
    }

    send(res, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    send(res, 500, { error: error.message || "Server error" });
  }
});

server.listen(PORT, () => {
  console.log(`GHS Hackathon backend listening on http://localhost:${PORT}`);
});
