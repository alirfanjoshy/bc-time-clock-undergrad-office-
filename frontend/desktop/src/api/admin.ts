import { apiRequest } from './client';
import { AdminDashboard, AuditLog, TimeEntry, User } from '../types/api';

export function getDashboard(accessToken: string) {
  return apiRequest<AdminDashboard>('/admin/dashboard', { accessToken });
}

export function getUsers(accessToken: string) {
  return apiRequest<User[]>('/admin/users', { accessToken });
}

export function getTimeEntries(
  accessToken: string,
  filters: { userId?: string; startDate?: string; endDate?: string } = {},
) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const suffix = query.size ? `?${query.toString()}` : '';
  return apiRequest<TimeEntry[]>(`/admin/time-entries${suffix}`, { accessToken });
}

export function updateTimeEntry(
  accessToken: string,
  entryId: string,
  input: { workDate: string; clockIn: string; clockOut: string | null; editReason: string },
) {
  return apiRequest<TimeEntry>(`/admin/time-entries/${entryId}`, {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify(input),
  });
}

export function getAuditLogs(accessToken: string) {
  return apiRequest<AuditLog[]>('/admin/audit-logs', { accessToken });
}
