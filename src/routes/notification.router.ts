import { Router } from 'express';

import NotificationController from 'controllers/notification';

import { authGroupLoginMiddleware } from './config';

const router = Router();

// /api/notification
router.get('/notifications', authGroupLoginMiddleware, NotificationController.getUserNotifications);
router.put('/notification/:id', authGroupLoginMiddleware, NotificationController.markAsRead);

export default router;
