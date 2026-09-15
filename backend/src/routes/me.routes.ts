import { Router } from 'express';
import { getMe } from '../controllers/me.controller.js';
import { authenticate } from '../middleware/authenticate.js';

export const meRoutes = Router();

meRoutes.get('/', authenticate, getMe);
