import { apiBlob } from './client';
import { ReportType } from '../types/api';

export function generateReport(
  accessToken: string,
  input: {
    type: ReportType;
    dateStart: string;
    dateEnd: string;
    supervisorName?: string;
  },
) {
  return apiBlob('/reports/generate', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(input),
  });
}

export function generateMyTimesheetReport(
  accessToken: string,
  input: {
    dateStart: string;
    dateEnd: string;
  },
) {
  return apiBlob('/reports/my-timesheet', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(input),
  });
}
