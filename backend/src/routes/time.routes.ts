import { Router } from 'express';
import * as timeController from '../controllers/time.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { myEntriesQuerySchema } from '../schemas/time.schema.js';

export const timeRoutes = Router();

timeRoutes.use(authenticate);

timeRoutes.get('/status', timeController.getStatus);
timeRoutes.post('/clock-in', timeController.clockIn);
timeRoutes.post('/clock-out', timeController.clockOut);
timeRoutes.get('/my-entries', validateRequest(myEntriesQuerySchema), timeController.getMyEntries);
