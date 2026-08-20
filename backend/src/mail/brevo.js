async function sendBrevoEmail({ toEmail, toName, subject, htmlContent, textContent }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName =
    process.env.BREVO_SENDER_NAME ||
    "SLGS AI Innovation Bootcamp & Challenge";

  if (!apiKey || !senderEmail) {
    const err = new Error(
      "Brevo is not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL."
    );
    err.code = "BREVO_NOT_CONFIGURED";
    throw err;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: toEmail, name: toName || toEmail }],
      subject,
      htmlContent,
      textContent,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      data.message || data.error || `Brevo request failed (${response.status})`;
    const err = new Error(message);
    err.code =
      data.code === "unauthorized" ? "BREVO_UNAUTHORIZED" : "BREVO_SEND_FAILED";
    err.details = data;
    throw err;
  }

  return data;
}

async function sendVerificationCodeEmail({ toEmail, toName, code }) {
  const subject = "Your verification code";
  const textContent = `Hi ${toName || "there"},\n\nYour verification code is ${code}.\nIt expires in 15 minutes.\n\nIf you did not create an account, you can ignore this email.`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
      <p>Hi ${toName || "there"},</p>
      <p>Use this code to confirm your account:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 24px 0;">${code}</p>
      <p>This code expires in 15 minutes.</p>
      <p style="color: #64748b; font-size: 13px;">If you did not create an account, you can ignore this email.</p>
    </div>
  `;

  return sendBrevoEmail({
    toEmail,
    toName,
    subject,
    htmlContent,
    textContent,
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendInviteEmail({
  toEmail,
  toName,
  role,
  inviterName,
  signupUrl,
}) {
  const roleLabel = role === "ADMIN" ? "administrator" : "judge";
  const roleTitle = role === "ADMIN" ? "Administrator" : "Judge";
  const greeting = toName || "there";
  const fromName = inviterName || "the programme organisers";
  const subject = `You're invited as a ${roleLabel}`;
  const textContent = `Hi ${greeting},

${fromName} invited you to join the KNS and SLGS AI Innovation Bootcamp & Challenge as a ${roleLabel}.

Complete your signup here:
${signupUrl}

This link expires in 7 days. If you were not expecting this invitation, you can ignore this email.`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
      <p>Hi ${escapeHtml(greeting)},</p>
      <p>${escapeHtml(fromName)} invited you to join the <strong>KNS and SLGS AI Innovation Bootcamp &amp; Challenge</strong> as a <strong>${escapeHtml(roleTitle)}</strong>.</p>
      <p>Use the button below to set your name and password. After that you can open your ${escapeHtml(roleLabel)} dashboard.</p>
      <p style="margin: 28px 0;">
        <a href="${escapeHtml(signupUrl)}" style="background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700;display:inline-block;">Complete signup</a>
      </p>
      <p style="font-size: 13px; color: #334155;">If the button does not work, copy this link into your browser:<br />${escapeHtml(signupUrl)}</p>
      <p style="color: #64748b; font-size: 13px;">This invitation expires in 7 days. If you were not expecting it, you can ignore this email.</p>
    </div>
  `;

  return sendBrevoEmail({
    toEmail,
    toName: toName || toEmail,
    subject,
    htmlContent,
    textContent,
  });
}

async function sendAnnouncementEmail({
  toEmail,
  toName,
  title,
  preview,
  dashboardUrl,
}) {
  const greeting = toName || "there";
  const subject = title;
  const previewText = String(preview || "").trim();
  const textContent = `Hi ${greeting},

${title}

${previewText}

Open your dashboard to read the full announcement:
${dashboardUrl}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
      <p>Hi ${escapeHtml(greeting)},</p>
      <p style="font-size: 18px; font-weight: 700; margin: 16px 0 8px;">${escapeHtml(title)}</p>
      ${
        previewText
          ? `<p style="color:#334155;">${escapeHtml(previewText)}</p>`
          : ""
      }
      <p>This is a brief notice only. Sign in to your dashboard to read the full announcement.</p>
      <p style="margin: 28px 0;">
        <a href="${escapeHtml(dashboardUrl)}" style="background:#5d2a80;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700;display:inline-block;">Open dashboard</a>
      </p>
      <p style="font-size: 13px; color: #334155;">If the button does not work, copy this link into your browser:<br />${escapeHtml(dashboardUrl)}</p>
    </div>
  `;

  return sendBrevoEmail({
    toEmail,
    toName: toName || toEmail,
    subject,
    htmlContent,
    textContent,
  });
}

async function sendPasswordResetCodeEmail({ toEmail, toName, code }) {
  const subject = "Your password reset code";
  const textContent = `Hi ${toName || "there"},\n\nYour password reset code is ${code}.\nIt expires in 15 minutes.\n\nIf you did not request a reset, you can ignore this email.`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
      <p>Hi ${toName || "there"},</p>
      <p>Use this code to reset your password:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 24px 0;">${code}</p>
      <p>This code expires in 15 minutes.</p>
      <p style="color: #64748b; font-size: 13px;">If you did not request a reset, you can ignore this email.</p>
    </div>
  `;

  return sendBrevoEmail({
    toEmail,
    toName,
    subject,
    htmlContent,
    textContent,
  });
}

module.exports = {
  sendBrevoEmail,
  sendVerificationCodeEmail,
  sendPasswordResetCodeEmail,
  sendInviteEmail,
  sendAnnouncementEmail,
};
