import { ApiError } from 'middleware/error';

import Notification from 'models/notification.model';
import UserNotification from 'models/user-notification.model';
import UserGroup from 'models/user-group.model';

import { NotificationType, formNotification } from 'config/notifications';
import User from 'models/user.model';
import Group from 'models/group.model';

const DEFAULT_ERROR = 'Не удалось отправить уведомление';

class NotificationService {
  static sendNotification = async (data: {
    userId: User['id'];
    groupId: Group['id'];
    type: NotificationType;
    recipientsIds?: Notification['recipientsIds'];
  }): Promise<
    | { error: string }
    | {
        notification: Notification;
        userNotifications: UserNotification[];
      }
  > => {
    try {
      const { userId, groupId, type, recipientsIds } = data;

      const groupMembers = await UserGroup.findAll({
        where: { groupId },
      });

      const sender = await User.findOne({ where: { id: userId } });

      if (!sender) {
        return { error: 'Пользователь с таким id не найден' };
      }

      // if no recipientsIds provided, send to all group members
      const recipients =
        recipientsIds && !!recipientsIds.length ? recipientsIds : groupMembers.map((m) => m.userId);

      const notification = await Notification.create({
        message: formNotification({
          userName: sender.username,
          messageType: type,
        }),
        groupId,
        senderId: userId,
        recipientsIds: recipients,
      });

      console.log('notification', notification);

      const createdUserNotifications = [];

      for (const recipientId of recipients) {
        const userNotification = await UserNotification.create({
          isSender: recipientId === userId,
          userId: recipientId,
          notificationId: notification.id,
        });

        createdUserNotifications.push(userNotification);
      }

      console.log('createdUserNotifications', createdUserNotifications);

      return { notification, userNotifications: createdUserNotifications };
    } catch (err) {
      if (err instanceof Error) {
        return { error: `getSchedule: ${err.message}` };
      }
    }

    return { error: DEFAULT_ERROR };
  };
}

export default NotificationService;
