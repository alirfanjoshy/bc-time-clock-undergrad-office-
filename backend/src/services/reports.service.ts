import fs from 'node:fs/promises';
import path from 'node:path';
import { AuditAction, ReportType } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { GenerateReportInput, MyTimesheetReportInput } from '../schemas/reports.schema.js';
import { listEntriesForRange } from '../repositories/timeEntry.repository.js';
import { addDays, endOfDay, endOfMonth, startOfDay, startOfMonth, startOfWeek } from '../utils/dates.js';
import { createTimesheetPdf } from './pdf.service.js';
import { recordAuditLog } from './audit.service.js';
import { findSafeUserById } from '../repositories/user.repository.js';

function resolveRange(input: GenerateReportInput) {
  const requestedStart = startOfDay(new Date(input.dateStart));

  if (input.type === ReportType.WEEKLY) {
    const start = startOfWeek(requestedStart);
    return { start, end: endOfDay(addDays(start, 6)) };
  }

  if (input.type === ReportType.BIWEEKLY) {
    return { start: requestedStart, end: endOfDay(addDays(requestedStart, 13)) };
  }

  if (input.type === ReportType.MONTHLY) {
    return { start: startOfMonth(requestedStart), end: endOfMonth(requestedStart) };
  }

  return {
    start: requestedStart,
    end: endOfDay(new Date(input.dateEnd)),
  };
}

function reportTitle(type: ReportType) {
  return `${type.replaceAll('_', ' ')} TIMESHEET REPORT`;
}

export async function generateReport(input: GenerateReportInput, actorUserId: string, ipAddress?: string) {
  const { start, end } = resolveRange(input);
  const entries = await listEntriesForRange(start, end, { departmentId: input.departmentId });
  const title = reportTitle(input.type);
  const pdf = await createTimesheetPdf({
    reportTitle: title,
    dateStart: start,
    dateEnd: end,
    entries,
    supervisorName: input.supervisorName,
  });
  const fileName = `BC_URO_${input.type}_${input.dateStart}_${input.dateEnd}.pdf`;
  const storageDir = path.resolve(process.cwd(), 'storage', 'reports');
  const storageKey = path.join(storageDir, fileName);

  await fs.mkdir(storageDir, { recursive: true });
  await fs.writeFile(storageKey, pdf);

  const exportRecord = await prisma.reportExport.create({
    data: {
      type: input.type,
      generatedBy: actorUserId,
      departmentId: input.departmentId,
      dateStart: start,
      dateEnd: end,
      fileName,
      storageKey,
    },
  });

  await recordAuditLog({
    actorUserId,
    targetEntityType: 'ReportExport',
    targetEntityId: exportRecord.id,
    action: AuditAction.REPORT_GENERATED,
    metadata: {
      type: input.type,
      dateStart: start.toISOString(),
      dateEnd: end.toISOString(),
      fileName,
    },
    ipAddress,
  });

  return { pdf, fileName };
}

export async function generateMyTimesheetReport(
  input: MyTimesheetReportInput,
  userId: string,
  ipAddress?: string,
) {
  const start = startOfDay(new Date(input.dateStart));
  const end = endOfDay(new Date(input.dateEnd));
  const entries = input.blank ? [] : await listEntriesForRange(start, end, { userId });
  const user = input.blank ? null : await findSafeUserById(userId);
  const pdf = await createTimesheetPdf({
    reportTitle: 'PERSONAL EMPLOYEE TIMESHEET',
    dateStart: start,
    dateEnd: end,
    entries,
    employeeName: user ? `${user.firstName} ${user.lastName}` : undefined,
    personal: true,
    blank: input.blank,
  });
  const fileName = `BC_URO_MY_TIMESHEET_${input.blank ? 'BLANK' : 'FILLED'}_${input.dateStart}_${input.dateEnd}.pdf`;
  const storageDir = path.resolve(process.cwd(), 'storage', 'reports');
  const storageKey = path.join(storageDir, fileName);

  await fs.mkdir(storageDir, { recursive: true });
  await fs.writeFile(storageKey, pdf);

  const exportRecord = await prisma.reportExport.create({
    data: {
      type: ReportType.CUSTOM,
      generatedBy: userId,
      dateStart: start,
      dateEnd: end,
      fileName,
      storageKey,
    },
  });

  await recordAuditLog({
    actorUserId: userId,
    targetEntityType: 'ReportExport',
    targetEntityId: exportRecord.id,
    action: AuditAction.REPORT_GENERATED,
    metadata: {
      type: 'MY_TIMESHEET',
      dateStart: start.toISOString(),
      dateEnd: end.toISOString(),
      fileName,
    },
    ipAddress,
  });

  return { pdf, fileName };
}
