import { Response, NextFunction } from 'express';

import { HTTPStatusCodes } from 'config/status-codes';
import { GroupLoggedInRequest } from 'controllers/group';
import { ApiError } from 'middleware/error';
import Notification from 'models/notification.model';
import UserNotification from 'models/user-notification.model';

import { NotificationMarkAsReadRequest } from './types';

class NotificationController {
  // GET /api/notification/notifications
  /** Get current user's notifications for all groups */
  getUserNotifications = async (req: GroupLoggedInRequest, res: Response, next: NextFunction) => {
    try {
      const groupId = req.currentGroup?.id;
      const userId = req.user?.id;

      if (!userId) {
        return next(ApiError.unauthorized('Пользователь с таким id не найден'));
      }

      const userNotifications = await UserNotification.findAll({
        where: { userId, isSender: false },
        order: [['createdAt', 'DESC']],
      });

      const notifications = await Notification.findAll({
        where: { groupId, id: userNotifications.map((n) => n.notificationId) },
        order: [['createdAt', 'DESC']],
      });

      const notifsWithUser = [];

      for (const notif of notifications) {
        const userNotif = userNotifications.find((un) => un.notificationId === notif.id);

        notifsWithUser.push({
          notification: notif,
          userNotification: userNotif,
        });
      }

      res.status(HTTPStatusCodes.OK).json(notifsWithUser);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getSchedule: ${err.message}`));
      }
    }
  };

  // PUT /api/notification/notification/:id
  markAsRead = async (req: NotificationMarkAsReadRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return next(ApiError.unauthorized('Пользователь с таким id не найден'));
      }

      const userNotification = await UserNotification.findOne({ where: { id, userId } });

      if (!userNotification) {
        return next(ApiError.badRequest('Уведомление не найдено'));
      }

      await userNotification.update({ isRead: true });

      res.status(HTTPStatusCodes.OK).json(userNotification);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getSchedule: ${err.message}`));
      }
    }
  };
}

export default new NotificationController();
