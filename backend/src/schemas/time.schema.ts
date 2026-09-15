import { z } from 'zod';

export const myEntriesQuerySchema = z.object({
  query: z.object({
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
  }),
});

export type MyEntriesQuery = z.infer<typeof myEntriesQuerySchema>['query'];
