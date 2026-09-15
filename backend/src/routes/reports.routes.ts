import { UserRole } from '@prisma/client';
import { Router } from 'express';
import * as reportsController from '../controllers/reports.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  downloadReportSchema,
  generateReportSchema,
  myTimesheetReportQuerySchema,
  myTimesheetReportSchema,
} from '../schemas/reports.schema.js';

export const reportsRoutes = Router();

reportsRoutes.use(authenticate);

reportsRoutes.post(
  '/generate',
  authorize(UserRole.ADMIN),
  validateRequest(generateReportSchema),
  reportsController.generateReport,
);
reportsRoutes.get(
  '/download',
  authorize(UserRole.ADMIN),
  validateRequest(downloadReportSchema),
  reportsController.downloadReport,
);
reportsRoutes.post(
  '/my-timesheet',
  validateRequest(myTimesheetReportSchema),
  reportsController.myTimesheetReport,
);
reportsRoutes.get(
  '/my-timesheet/download',
  validateRequest(myTimesheetReportQuerySchema),
  reportsController.downloadMyTimesheetReport,
);
