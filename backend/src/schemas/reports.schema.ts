import { ReportType } from '@prisma/client';
import { z } from 'zod';

export const generateReportSchema = z.object({
  body: z
    .object({
      type: z.nativeEnum(ReportType),
      dateStart: z.string().date(),
      dateEnd: z.string().date(),
      departmentId: z.string().uuid().optional(),
      supervisorName: z.string().trim().max(120).optional(),
    })
    .refine((value) => new Date(value.dateStart) <= new Date(value.dateEnd), {
      message: 'dateStart must be before or equal to dateEnd.',
      path: ['dateStart'],
    }),
});

export const downloadReportSchema = z.object({
  query: z
    .object({
      type: z.nativeEnum(ReportType),
      dateStart: z.string().date(),
      dateEnd: z.string().date(),
      supervisorName: z.string().trim().max(120).optional(),
    })
    .refine((value) => new Date(value.dateStart) <= new Date(value.dateEnd), {
      message: 'dateStart must be before or equal to dateEnd.',
      path: ['dateStart'],
    }),
});

export type GenerateReportInput = z.infer<typeof generateReportSchema>['body'];
export type DownloadReportInput = z.infer<typeof downloadReportSchema>['query'];

export const myTimesheetReportSchema = z.object({
  body: z
    .object({
      dateStart: z.string().date(),
      dateEnd: z.string().date(),
      blank: z.boolean().optional(),
    })
    .refine((value) => new Date(value.dateStart) <= new Date(value.dateEnd), {
      message: 'dateStart must be before or equal to dateEnd.',
      path: ['dateStart'],
    }),
});

export type MyTimesheetReportInput = z.infer<typeof myTimesheetReportSchema>['body'];

export const myTimesheetReportQuerySchema = z.object({
  query: z
    .object({
      dateStart: z.string().date(),
      dateEnd: z.string().date(),
      blank: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
    })
    .refine((value) => new Date(value.dateStart) <= new Date(value.dateEnd), {
      message: 'dateStart must be before or equal to dateEnd.',
      path: ['dateStart'],
    }),
});
