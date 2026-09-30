import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MAIL_FROM: z.string().optional(),
  PASSWORD_RESET_URL: z.string().url().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  GMAIL_CLIENT_ID: z.string().optional(),
  GMAIL_CLIENT_SECRET: z.string().optional(),
  GMAIL_REFRESH_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(4000),
  WEB_DIST_PATH: z.string().min(1).optional(),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:19006'),
  ADMIN_REGISTRATION_CODE: z.string().min(8).default('BCAdminSetup2026!'),
}).superRefine((config, context) => {
  if (config.NODE_ENV === 'production' &&
      (!process.env.ADMIN_REGISTRATION_CODE || config.ADMIN_REGISTRATION_CODE === 'BCAdminSetup2026!')) {
    context.addIssue({ code: 'custom', path: ['ADMIN_REGISTRATION_CODE'], message: 'Set a private admin registration code for production.' });
  }
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment configuration', parsedEnv.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = {
  ...parsedEnv.data,
  CORS_ORIGINS: parsedEnv.data.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
};
