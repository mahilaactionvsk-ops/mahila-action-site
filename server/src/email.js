import nodemailer from "nodemailer";

let transporter = null;
let warnedNoSmtp = false;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

// Sends a password reset email if SMTP_* is configured in .env. If it isn't
// (e.g. local dev, or you haven't set up a mail provider yet), this just logs
// the reset link to the server console instead of failing — that's how you
// retrieve a reset link for testing without a real mailbox wired up.
export async function sendPasswordResetEmail(to, resetLink) {
  const t = getTransporter();
  if (!t) {
    if (!warnedNoSmtp) {
      console.warn(
        "\n⚠️  SMTP_* is not configured in server/.env, so password reset emails are not actually sent.\n" +
          "    Reset links will be printed here instead — copy/paste them into your browser to test.\n"
      );
      warnedNoSmtp = true;
    }
    console.log(`\n📧  Password reset requested for ${to}\n    Reset link (valid 30 min): ${resetLink}\n`);
    return;
  }

  await t.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject: "Reset your Mahila Action volunteer password",
    text:
      `We received a request to reset your volunteer account password.\n\n` +
      `Open this link within 30 minutes to choose a new one:\n${resetLink}\n\n` +
      `If you didn't request this, you can safely ignore this email.`,
    html:
      `<p>We received a request to reset your volunteer account password.</p>` +
      `<p><a href="${resetLink}">Click here to choose a new password</a> (link expires in 30 minutes).</p>` +
      `<p>If you didn't request this, you can safely ignore this email.</p>`,
  });
}
