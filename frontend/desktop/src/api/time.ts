import { apiRequest } from './client';
import { TimeEntry } from '../types/api';

export type TimeStatus = {
  isClockedIn: boolean;
  currentEntry: Pick<TimeEntry, 'id' | 'clockIn'> | null;
  todayMinutes: number;
  weekMinutes: number;
};

export function getStatus(accessToken: string) {
  return apiRequest<TimeStatus>('/time/status', { accessToken });
}

export function clockIn(accessToken: string, deviceId: string) {
  return apiRequest<TimeEntry>('/time/clock-in', {
    method: 'POST',
    accessToken,
    body: JSON.stringify({ deviceId }),
  });
}

export function clockOut(accessToken: string) {
  return apiRequest<TimeEntry>('/time/clock-out', {
    method: 'POST',
    accessToken,
  });
}

export function getMyEntries(accessToken: string) {
  return apiRequest<TimeEntry[]>('/time/my-entries', { accessToken });
}
