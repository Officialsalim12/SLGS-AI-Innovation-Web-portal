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
};
