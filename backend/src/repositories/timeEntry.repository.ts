import { Prisma, TimeEntryStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export const timeEntryInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      employeeId: true,
    },
  },
} satisfies Prisma.TimeEntryInclude;

export type TimeEntryWithUser = Prisma.TimeEntryGetPayload<{ include: typeof timeEntryInclude }>;

export function findOpenEntryForUser(userId: string) {
  return prisma.timeEntry.findFirst({
    where: {
      userId,
      clockOut: null,
    },
    orderBy: {
      clockIn: 'desc',
    },
  });
}

export function createClockInEntry(userId: string, timestamp: Date, workDate: Date) {
  return prisma.timeEntry.create({
    data: {
      userId,
      clockIn: timestamp,
      workDate,
      status: TimeEntryStatus.CLOCKED_IN,
    },
  });
}

export function closeTimeEntry(id: string, clockOut: Date, totalMinutes: number) {
  return prisma.timeEntry.update({
    where: { id },
    data: {
      clockOut,
      totalMinutes,
      status: TimeEntryStatus.CLOCKED_OUT,
    },
  });
}

export function listEntriesForUser(userId: string, startDate?: Date, endDate?: Date) {
  return prisma.timeEntry.findMany({
    where: {
      userId,
      ...(startDate || endDate
        ? {
            workDate: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    },
    orderBy: {
      clockIn: 'desc',
    },
  });
}

export function sumMinutesForUser(userId: string, start: Date, end: Date) {
  return prisma.timeEntry.aggregate({
    where: {
      userId,
      clockIn: {
        gte: start,
        lte: end,
      },
    },
    _sum: {
      totalMinutes: true,
    },
  });
}

export function listEntriesForRange(start: Date, end: Date, filters?: { departmentId?: string; userId?: string }) {
  return prisma.timeEntry.findMany({
    where: {
      clockIn: {
        gte: start,
        lte: end,
      },
      ...(filters?.userId ? { userId: filters.userId } : {}),
      ...(filters?.departmentId
        ? {
            user: {
              departmentId: filters.departmentId,
            },
          }
        : {}),
    },
    include: timeEntryInclude,
    orderBy: [{ clockIn: 'asc' }],
  });
}
