import { z } from 'zod';

export const adminEntriesQuerySchema = z.object({
  query: z.object({
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
    userId: z.string().uuid().optional(),
  }),
});

export type AdminEntriesQuery = z.infer<typeof adminEntriesQuerySchema>['query'];


export const adminTimeEntryUpdateSchema = z.object({
  params: z.object({ entryId: z.string().uuid() }),
  body: z.object({
    workDate: z.string().date(),
    clockIn: z.string().datetime({ offset: true }),
    clockOut: z.string().datetime({ offset: true }).nullable(),
    editReason: z.string().trim().min(3).max(500),
  }).refine((value) => !value.clockOut || new Date(value.clockOut) > new Date(value.clockIn), {
    message: 'Clock out must be after clock in.',
    path: ['clockOut'],
  }),
});

export type AdminTimeEntryUpdateInput = z.infer<typeof adminTimeEntryUpdateSchema>['body'];
