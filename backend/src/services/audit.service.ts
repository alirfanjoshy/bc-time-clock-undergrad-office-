import { AuditAction, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export function recordAuditLog(input: {
  actorUserId?: string;
  targetUserId?: string;
  targetEntityType?: string;
  targetEntityId?: string;
  action: AuditAction;
  metadata?: Prisma.InputJsonObject;
  ipAddress?: string;
  userAgent?: string;
}) {
  const data: Prisma.AuditLogUncheckedCreateInput = {
    actorUserId: input.actorUserId,
    targetUserId: input.targetUserId,
    targetEntityType: input.targetEntityType,
    targetEntityId: input.targetEntityId,
    action: input.action,
    metadata: input.metadata,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  };

  return prisma.auditLog.create({
    data,
  });
}
