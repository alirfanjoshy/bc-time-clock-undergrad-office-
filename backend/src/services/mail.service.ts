import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

export function assertMailConfigured() {
  if (
    !env.MAIL_FROM ||
    !env.PASSWORD_RESET_URL ||
    !(env.RESEND_API_KEY || (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD))
  ) {
    throw new AppError(
      503,
      'PASSWORD_RESET_UNAVAILABLE',
      'Password reset email is not available yet. Please contact your office administrator.',
    );
  }
}
export async function sendResetEmail(to: string, url: string) {
  const message = {
    from: env.MAIL_FROM!,
    to,
    subject: 'Reset your BC Time Clock password',
    text: `BC Time Clock\n\nOpen this link to choose a new password:\n${url}\n\nThis link expires in 15 minutes and can be used once. If you did not request a reset, ignore this email.`,
  };
  try {
    if (env.RESEND_API_KEY) {
      const result = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
        signal: AbortSignal.timeout(10000),
      });
      if (!result.ok) throw new Error('Email provider rejected the message');
    } else {
      const transport = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        requireTLS: true,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
        connectionTimeout: 10000,
        socketTimeout: 10000,
      });
      await transport.sendMail(message);
    }
  } catch {
    throw new AppError(
      503,
      'EMAIL_DELIVERY_FAILED',
      'We could not send the reset email. Please try again later or contact your office administrator.',
    );
  }
}
