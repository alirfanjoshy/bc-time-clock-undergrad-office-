import { UserRole } from '@prisma/client';
import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().trim().email().toLowerCase(),
    role: z.nativeEnum(UserRole).default(UserRole.EMPLOYEE),
    departmentId: z.string().uuid(),
    temporaryPassword: z.string().min(10).max(128),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
