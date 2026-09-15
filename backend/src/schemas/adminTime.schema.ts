import { z } from 'zod';

export const adminEntriesQuerySchema = z.object({
  query: z.object({
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
    userId: z.string().uuid().optional(),
  }),
});

export type AdminEntriesQuery = z.infer<typeof adminEntriesQuerySchema>['query'];
