import { Router } from 'express';

import scheduleController from 'controllers/schedule';

import { authGroupLoginMiddleware } from './config';

const router = Router();

// /api/schedule
router.get('/schedule/:id', authGroupLoginMiddleware, scheduleController.getSchedule);
router.get('/schedules', authGroupLoginMiddleware, scheduleController.getSchedules);
router.post('/schedule', authGroupLoginMiddleware, scheduleController.createSchedule);
router.put('/schedule/:id', authGroupLoginMiddleware, scheduleController.editSchedule);
router.delete('/schedule/:id', authGroupLoginMiddleware, scheduleController.deleteSchedule);
router.delete('/cascade/:id', authGroupLoginMiddleware, scheduleController.deleteScheduleCascade);

export default router;
