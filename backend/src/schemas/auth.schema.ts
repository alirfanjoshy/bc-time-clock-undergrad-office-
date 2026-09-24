import { UserRole } from '@prisma/client';
import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(10).max(128),
    role: z.nativeEnum(UserRole).default(UserRole.EMPLOYEE),
    adminRegistrationCode: z.string().optional(),
    departmentId: z.string().uuid().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(1).max(128),
    authenticatorCode: z.string().regex(/^\d{6}$/).optional(),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(40),
  }),
});

export const logoutSchema = refreshSchema;

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshInput = z.infer<typeof refreshSchema>['body'];

export const forgotPasswordSchema = z.object({
  body: z.object({ email: z.string().trim().email().toLowerCase() }),
});
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1).max(2048),
    password: z
      .string()
      .min(10)
      .max(72)
      .refine(
        (value) => Buffer.byteLength(value, 'utf8') <= 72,
        'Password must be at most 72 UTF-8 bytes.',
      ),
  }),
});
