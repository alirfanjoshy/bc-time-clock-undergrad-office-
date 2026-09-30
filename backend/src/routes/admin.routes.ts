import { UserRole } from '@prisma/client';
import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { adminEntriesQuerySchema, adminTimeEntryUpdateSchema } from '../schemas/adminTime.schema.js';
import { createUserSchema } from '../schemas/admin.schema.js';

export const adminRoutes = Router();

adminRoutes.use(authenticate);
adminRoutes.use(authorize(UserRole.ADMIN));

adminRoutes.get('/dashboard', adminController.getDashboard);
adminRoutes.get('/users', adminController.getUsers);
adminRoutes.post('/users', validateRequest(createUserSchema), adminController.createUser);
adminRoutes.get(
  '/time-entries',
  validateRequest(adminEntriesQuerySchema),
  adminController.getTimeEntries,
);
adminRoutes.patch(
  '/time-entries/:entryId',
  validateRequest(adminTimeEntryUpdateSchema),
  adminController.updateTimeEntry,
);
adminRoutes.get('/audit-logs', adminController.getAuditLogs);
