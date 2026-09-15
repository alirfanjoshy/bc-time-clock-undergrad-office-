import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { env } from '../config/env.js';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export function signAccessToken(payload: AccessTokenPayload) {
  const options: SignOptions = {
    expiresIn: `${env.ACCESS_TOKEN_TTL_MINUTES}m`,
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function createRefreshToken() {
  return crypto.randomBytes(48).toString('base64url');
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function refreshTokenExpiry() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_TTL_DAYS);
  return expiresAt;
}
