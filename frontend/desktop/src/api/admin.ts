import { apiRequest } from './client';
import { AdminDashboard, AuditLog, TimeEntry, User } from '../types/api';

export function getDashboard(accessToken: string) {
  return apiRequest<AdminDashboard>('/admin/dashboard', { accessToken });
}

export function getUsers(accessToken: string) {
  return apiRequest<User[]>('/admin/users', { accessToken });
}

export function getTimeEntries(accessToken: string) {
  return apiRequest<TimeEntry[]>('/admin/time-entries', { accessToken });
}

export function getAuditLogs(accessToken: string) {
  return apiRequest<AuditLog[]>('/admin/audit-logs', { accessToken });
}
