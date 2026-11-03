import { Resend } from "resend";

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY or RESEND_FROM is not set");
  }

  // بننشئ العميل جوا الـ function (مش فوق الملف) حتى ما يفشل الـ build إذا المفتاح مش موجود وقتها
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Reset your password",
    text: `We received a request to reset your password.\n\nOpen this link to choose a new one (valid for 15 minutes):\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #0f172a;">
        <h2 style="margin: 0 0 12px;">Reset your password</h2>
        <p style="line-height: 1.6;">We received a request to reset your password. This link is valid for <strong>15 minutes</strong>.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Choose a new password</a>
        </p>
        <p style="font-size: 13px; color: #64748b; line-height: 1.6;">If the button doesn't work, copy this link into your browser:<br>${resetUrl}</p>
        <p style="font-size: 13px; color: #64748b;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
