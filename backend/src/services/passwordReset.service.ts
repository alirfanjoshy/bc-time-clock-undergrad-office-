import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { hashPassword } from '../utils/password.js';
import { assertMailConfigured, sendResetEmail } from './mail.service.js';

const invalidLink = () =>
  new AppError(
    400,
    'INVALID_RESET_LINK',
    'This reset link is invalid or expired. Request a new link.',
  );
// Changing the stored password also invalidates every previously issued reset link.
const resetSecret = (passwordHash: string) =>
  crypto
    .createHmac('sha256', env.JWT_REFRESH_SECRET)
    .update(`password-reset:${passwordHash}`)
    .digest('hex');
export function createPasswordResetToken(user: { id: string; passwordHash: string }) {
  return jwt.sign({ purpose: 'password-reset' }, resetSecret(user.passwordHash), {
    subject: user.id,
    audience: 'bc-password-reset',
    expiresIn: '15m',
    algorithm: 'HS256',
    jwtid: crypto.randomUUID(),
  });
}
export function verifyPasswordResetToken(
  token: string,
  user: { id: string; passwordHash: string },
) {
  try {
    return jwt.verify(token, resetSecret(user.passwordHash), {
      algorithms: ['HS256'],
      audience: 'bc-password-reset',
      subject: user.id,
    });
  } catch {
    throw invalidLink();
  }
}
export async function requestPasswordReset(email: string) {
  assertMailConfigured();
  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.isActive) {
    const url = new URL(env.PASSWORD_RESET_URL!);
    // Keep the credential out of HTTP logs and referrers.
    url.hash = new URLSearchParams({ resetToken: createPasswordResetToken(user) }).toString();
    await sendResetEmail(user.email, url.toString());
  }
  return {
    message:
      'If an active account uses this email, a password reset link will arrive shortly. Check your inbox and spam folder.',
  };
}
export async function resetPassword(token: string, password: string) {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded === 'string' || typeof decoded.sub !== 'string')
    throw invalidLink();
  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user?.isActive) throw invalidLink();
  verifyPasswordResetToken(token, user);
  const passwordHash = await hashPassword(password);
  await prisma.$transaction(async (tx) => {
    // Compare-and-swap makes concurrent reuse fail, including across servers.
    const updated = await tx.user.updateMany({
      where: { id: user.id, passwordHash: user.passwordHash, isActive: true },
      data: { passwordHash },
    });
    if (updated.count !== 1) throw invalidLink();
    await tx.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await tx.auditLog.create({
      data: {
        targetUserId: user.id,
        action: 'PASSWORD_CHANGED',
        metadata: { method: 'email-reset' },
      },
    });
  });
  return { message: 'Your password has been updated. Sign in with your new password.' };
}
