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

export async function clockIn(userId: string) {
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
