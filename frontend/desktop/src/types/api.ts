export type UserRole = 'EMPLOYEE' | 'ADMIN';

export type Department = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  role: UserRole;
  departmentId: string;
  isActive: boolean;
  department?: Department;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type TimeEntry = {
  id: string;
  userId?: string;
  workDate: string;
  clockIn: string;
  clockOut?: string | null;
  totalMinutes?: number | null;
  status: 'CLOCKED_IN' | 'CLOCKED_OUT' | 'EDITED';
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'employeeId'>;
};

export type AdminDashboard = {
  totalStaff: number;
  workingNow: number;
  clockedOutToday: number;
  totalMinutesToday: number;
  currentlyWorking: Array<{
    id: string;
    name: string;
    clockIn: string;
    minutesWorked: number;
  }>;
  recentActivity: Array<{
    id: string;
    label: string;
    detail: string;
    occurredAt: string;
  }>;
  attentionNeeded: Array<{
    id: string;
    label: string;
    detail: string;
  }>;
};

export type ReportType = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'CUSTOM';

export type AuditLog = {
  id: string;
  action: string;
  targetEntityType?: string | null;
  targetEntityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  actor?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> | null;
  targetUser?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> | null;
};
