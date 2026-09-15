import { prisma } from '../config/prisma.js';

export function createRefreshTokenRecord(data: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdByIp?: string;
}) {
  return prisma.refreshToken.create({
    data,
  });
}

export function findRefreshToken(tokenHash: string) {
  return prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: {
      user: true,
    },
  });
}

export function revokeRefreshToken(tokenHash: string, revokedByIp?: string) {
  return prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
      revokedByIp,
    },
  });
}
