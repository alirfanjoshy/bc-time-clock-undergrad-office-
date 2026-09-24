import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';

export async function setup(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found.');
  const secret = user.totpSecret ?? generateSecret();
  await prisma.user.update({ where: { id: userId }, data: { totpSecret: secret, totpEnabled: false } });
  const uri = generateURI({ secret, issuer: 'BC Time Clock', label: user.email });
  return { secret, uri, qrCode: await QRCode.toDataURL(uri) };
}

export async function enable(userId: string, token: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.totpSecret || !verifySync({ secret: user.totpSecret, token }).valid) throw new AppError(400, 'INVALID_AUTHENTICATOR_CODE', 'That authenticator code is not valid.');
  await prisma.user.update({ where: { id: userId }, data: { totpEnabled: true } });
  return { enabled: true };
}

export function verify(secret: string | null, token?: string) {
  if (!secret || !token || !/^\d{6}$/.test(token) || !verifySync({ secret, token }).valid) throw new AppError(401, 'MFA_REQUIRED', 'Enter the six-digit code from your authenticator app.');
}
