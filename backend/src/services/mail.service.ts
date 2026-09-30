import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

const gmailApiConfigured = () =>
  !!(env.GMAIL_CLIENT_ID && env.GMAIL_CLIENT_SECRET && env.GMAIL_REFRESH_TOKEN);

export function assertMailConfigured() {
  if (
    !env.MAIL_FROM ||
    !env.PASSWORD_RESET_URL ||
    !(env.RESEND_API_KEY || gmailApiConfigured() || (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD))
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
    if (env.RESEND_API_KEY && !gmailApiConfigured()) {
      const result = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
        signal: AbortSignal.timeout(10000),
      });
      if (!result.ok) throw new Error(`Resend email request failed (HTTP ${result.status})`);
    } else if (gmailApiConfigured()) {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: env.GMAIL_CLIENT_ID!,
          client_secret: env.GMAIL_CLIENT_SECRET!,
          refresh_token: env.GMAIL_REFRESH_TOKEN!,
          grant_type: 'refresh_token',
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!tokenResponse.ok) throw new Error(`Google token refresh failed (HTTP ${tokenResponse.status})`);
      const tokenPayload: unknown = await tokenResponse.json();
      if (
        !tokenPayload ||
        typeof tokenPayload !== 'object' ||
        !('access_token' in tokenPayload) ||
        typeof tokenPayload.access_token !== 'string'
      ) throw new Error('Google did not return an access token');

      const rawMessage = [
        `From: ${env.MAIL_FROM}`,
        `To: ${to}`,
        'Subject: Reset your BC Time Clock password',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        '',
        message.text,
      ].join('\r\n');
      const raw = Buffer.from(rawMessage, 'utf8').toString('base64url');
      const result = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenPayload.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw }),
        signal: AbortSignal.timeout(10000),
      });
      if (!result.ok) throw new Error(`Gmail send request failed (HTTP ${result.status})`);
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
  } catch (error) {
    console.error(
      'Password reset email delivery failed',
      error instanceof Error ? error.message : 'Unknown provider error',
    );
    throw new AppError(
      503,
      'EMAIL_DELIVERY_FAILED',
      'We could not send the reset email. Please try again later or contact your office administrator.',
    );
  }
}
