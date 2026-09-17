import { AppError } from '../utils/errors.js';
import {
  createClockInEntry,
  closeTimeEntry,
  findOpenEntryForUser,
  listEntriesForUser,
  sumMinutesForUser,
} from '../repositories/timeEntry.repository.js';
import { endOfDay, minutesBetween, startOfDay, startOfWeek } from '../utils/dates.js';
import { MyEntriesQuery } from '../schemas/time.schema.js';
import { createHash } from 'node:crypto';
import { bindClockDevice, findClockDeviceByHash, findClockDeviceForUser } from '../repositories/timeEntry.repository.js';

export async function getClockStatus(userId: string) {
  const now = new Date();
  const [openEntry, todayTotal, weekTotal] = await Promise.all([
    findOpenEntryForUser(userId),
    sumMinutesForUser(userId, startOfDay(now), endOfDay(now)),
    sumMinutesForUser(userId, startOfWeek(now), endOfDay(now)),
  ]);

  const openMinutes = openEntry ? minutesBetween(openEntry.clockIn, now) : 0;

  return {
    isClockedIn: Boolean(openEntry),
    currentEntry: openEntry ? { id: openEntry.id, clockIn: openEntry.clockIn } : null,
    todayMinutes: (todayTotal._sum.totalMinutes ?? 0) + openMinutes,
    weekMinutes: (weekTotal._sum.totalMinutes ?? 0) + openMinutes,
  };
}

export async function clockIn(userId: string, deviceId: string, ipAddress?: string) {
  const deviceHash = createHash('sha256').update(deviceId).digest('hex');
  const [claimed, userDevice] = await Promise.all([
    findClockDeviceByHash(deviceHash),
    findClockDeviceForUser(userId),
  ]);
  if (claimed && claimed.userId !== userId) {
    throw new AppError(403, 'CLOCK_DEVICE_IN_USE', 'This phone is already registered to another employee.');
  }
  if (userDevice && userDevice.deviceHash !== deviceHash) {
    throw new AppError(403, 'NEW_CLOCK_DEVICE', 'Clock in from your registered phone. Ask an administrator to reset it if needed.');
  }
  if (!claimed && !userDevice) await bindClockDevice(userId, deviceHash, ipAddress);
  const existing = await findOpenEntryForUser(userId);

  if (existing) {
    throw new AppError(409, 'ALREADY_CLOCKED_IN', 'You are already clocked in.');
  }

  const now = new Date();
  return createClockInEntry(userId, now, startOfDay(now));
}

export async function clockOut(userId: string) {
  const openEntry = await findOpenEntryForUser(userId);

  if (!openEntry) {
    throw new AppError(409, 'NOT_CLOCKED_IN', 'You are not currently clocked in.');
  }

  const now = new Date();
  return closeTimeEntry(openEntry.id, now, minutesBetween(openEntry.clockIn, now));
}

export function getMyEntries(userId: string, query: MyEntriesQuery) {
  return listEntriesForUser(
    userId,
    query.startDate ? startOfDay(new Date(query.startDate)) : undefined,
    query.endDate ? startOfDay(new Date(query.endDate)) : undefined,
  );
}
