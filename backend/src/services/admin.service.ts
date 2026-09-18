import { AuditAction } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { CreateUserInput } from '../schemas/admin.schema.js';
import { AppError } from '../utils/errors.js';
import { hashPassword } from '../utils/password.js';
import { createUser, findDepartmentById, findSafeUsers } from '../repositories/user.repository.js';
import { recordAuditLog } from './audit.service.js';
import { endOfDay, formatMinutes, minutesBetween, startOfDay } from '../utils/dates.js';
import { AdminEntriesQuery } from '../schemas/adminTime.schema.js';
import { resetClockDevice } from '../repositories/timeEntry.repository.js';

export function listUsers() {
  return findSafeUsers();
}

export async function resetEmployeeClockDevice(userId: string) {
  await resetClockDevice(userId);
}

export async function createUserAsAdmin(input: CreateUserInput, actorUserId: string, ipAddress?: string) {
  const department = await findDepartmentById(input.departmentId);

  if (!department) {
    throw new AppError(400, 'INVALID_DEPARTMENT', 'Department does not exist.');
  }

  const user = await createUser({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    departmentId: input.departmentId,
    role: input.role,
    passwordHash: await hashPassword(input.temporaryPassword),
  });

  await recordAuditLog({
    actorUserId,
    targetUserId: user.id,
    targetEntityType: 'User',
    targetEntityId: user.id,
    action: AuditAction.EMPLOYEE_CREATED,
    metadata: {
      role: user.role,
      email: user.email,
    },
    ipAddress,
  });

  return user;
}

export async function getDashboard() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const [totalStaff, workingEntries, clockedOutToday, todayMinutes, recentEntries] =
    await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.timeEntry.findMany({
        where: { clockOut: null },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { clockIn: 'asc' },
      }),
      prisma.timeEntry.count({
        where: {
          clockOut: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.timeEntry.aggregate({
        where: {
          clockIn: { gte: todayStart, lte: todayEnd },
        },
        _sum: { totalMinutes: true },
      }),
      prisma.timeEntry.findMany({
        take: 8,
        include: {
          user: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

  const currentlyWorking = workingEntries.map((entry) => ({
    id: entry.id,
    name: `${entry.user.firstName} ${entry.user.lastName}`,
    clockIn: entry.clockIn,
    minutesWorked: minutesBetween(entry.clockIn, now),
  }));

  const openMinutes = currentlyWorking.reduce((sum, item) => sum + item.minutesWorked, 0);
  const attentionNeeded = workingEntries
    .filter((entry) => minutesBetween(entry.clockIn, now) >= 10 * 60)
    .map((entry) => ({
      id: entry.id,
      label: `${entry.user.firstName} ${entry.user.lastName}`,
      detail: 'Shift has been open for more than 10 hours.',
    }));

  return {
    totalStaff,
    workingNow: workingEntries.length,
    clockedOutToday,
    totalMinutesToday: (todayMinutes._sum.totalMinutes ?? 0) + openMinutes,
    currentlyWorking,
    recentActivity: recentEntries.map((entry) => ({
      id: entry.id,
      label: `${entry.user.firstName} ${entry.user.lastName}`,
      detail:
        entry.clockOut && entry.totalMinutes !== null
          ? `Clocked out after ${formatMinutes(entry.totalMinutes)}`
          : 'Currently working',
      occurredAt: entry.updatedAt,
    })),
    attentionNeeded,
  };
}

export function listTimeEntries(query: AdminEntriesQuery) {
  return prisma.timeEntry.findMany({
    where: {
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.startDate || query.endDate
        ? {
            workDate: {
              ...(query.startDate ? { gte: startOfDay(new Date(query.startDate)) } : {}),
              ...(query.endDate ? { lte: startOfDay(new Date(query.endDate)) } : {}),
            },
          }
        : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          employeeId: true,
        },
      },
    },
    orderBy: { clockIn: 'desc' },
  });
}

export function listAuditLogs() {
  return prisma.auditLog.findMany({
    take: 100,
    include: {
      actor: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      targetUser: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
