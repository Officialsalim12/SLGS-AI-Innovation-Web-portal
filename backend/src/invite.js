const crypto = require("crypto");
const { prisma } = require("./db");
const { sendInviteEmail } = require("./mail/brevo");

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function createPlainToken() {
  return crypto.randomBytes(32).toString("hex");
}

function frontendBaseUrl(req) {
  const origin = req?.headers?.origin;
  if (origin) return String(origin).replace(/\/$/, "");
  const referer = req?.headers?.referer;
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      /* ignore */
    }
  }
  const configured = process.env.FRONTEND_URL || process.env.APP_URL;
  if (configured) return configured.replace(/\/$/, "");
  return "http://localhost:3000";
}

function inviteUrl(req, token) {
  return `${frontendBaseUrl(req)}/invite?token=${encodeURIComponent(token)}`;
}

function roleLabel(role) {
  if (role === "ADMIN") return "administrator";
  if (role === "JUDGE") return "judge";
  return String(role || "").toLowerCase();
}

function publicInvite(invite) {
  return {
    id: invite.id,
    email: invite.email,
    name: invite.name || null,
    role: invite.role,
    expiresAt: invite.expiresAt,
    acceptedAt: invite.acceptedAt,
    createdAt: invite.createdAt,
    invitedBy: invite.invitedBy
      ? { id: invite.invitedBy.id, name: invite.invitedBy.name }
      : null,
  };
}

async function issueInvite({ email, name, role, invitedBy, req }) {
  const token = createPlainToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
  const displayName = name || null;

  const existing = await prisma.invite.findFirst({
    where: { email, acceptedAt: null },
    orderBy: { createdAt: "desc" },
  });

  const invite = existing
    ? await prisma.invite.update({
        where: { id: existing.id },
        data: {
          name: displayName,
          role,
          tokenHash,
          expiresAt,
          invitedById: invitedBy.id,
        },
        include: { invitedBy: true },
      })
    : await prisma.invite.create({
        data: {
          email,
          name: displayName,
          role,
          tokenHash,
          expiresAt,
          invitedById: invitedBy.id,
        },
        include: { invitedBy: true },
      });

  await sendInviteEmail({
    toEmail: email,
    toName: displayName,
    role,
    inviterName: invitedBy.name,
    signupUrl: inviteUrl(req, token),
  });

  return invite;
}

async function findInviteByToken(token) {
  const tokenHash = hashToken(token);
  return prisma.invite.findUnique({
    where: { tokenHash },
    include: { invitedBy: true },
  });
}

module.exports = {
  INVITE_TTL_MS,
  hashToken,
  createPlainToken,
  frontendBaseUrl,
  inviteUrl,
  roleLabel,
  publicInvite,
  issueInvite,
  findInviteByToken,
};
