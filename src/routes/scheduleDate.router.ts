import { Router } from 'express';

import scheduleDateController from 'controllers/scheduleDate';

import { authGroupLoginMiddleware } from './config';

const router = Router();

// /api/schedule
router.put('/task/:id', authGroupLoginMiddleware, scheduleDateController.editScheduleDate);

export default router;
