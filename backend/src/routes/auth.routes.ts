import { requestPasswordReset, resetPassword } from '../services/passwordReset.service.js';
import { resetRateLimit } from '../middleware/resetRateLimit.js';
import { forgotPasswordSchema, resetPasswordSchema } from '../schemas/auth.schema.js';
import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
} from '../schemas/auth.schema.js';

export const authRoutes = Router();

authRoutes.post('/register', validateRequest(registerSchema), authController.register);
authRoutes.post('/login', validateRequest(loginSchema), authController.login);
authRoutes.post('/refresh', validateRequest(refreshSchema), authController.refresh);
authRoutes.post('/logout', validateRequest(logoutSchema), authController.logout);

authRoutes.post(
  '/forgot-password',
  resetRateLimit,
  validateRequest(forgotPasswordSchema),
  async (req, res) => {
    res.json({ data: await requestPasswordReset(req.body.email) });
  },
);
authRoutes.post(
  '/reset-password',
  resetRateLimit,
  validateRequest(resetPasswordSchema),
  async (req, res) => {
    res.json({ data: await resetPassword(req.body.token, req.body.password) });
  },
);
