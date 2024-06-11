import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { DefaultId } from 'typings/common';
import Notification from './notification.model';
import User from './user.model';

type UserNotificationModel = {
  id: DefaultId;
  isRead: boolean;
  isSender: boolean;
  notificationId: Notification['id'];
  userId: User['id'];
};

export type UserNotificationCreateParams = {
  isSender: boolean;
  notificationId: Notification['id'];
  userId: User['id'];
};

@Table({
  modelName: 'UserNotification',
  tableName: 'user_notification',
})
class UserNotification extends Model<UserNotificationModel, UserNotificationCreateParams> {
  @Column({
    primaryKey: true,
    type: DataType.INTEGER,
    autoIncrement: true,
  })
  declare id: DefaultId;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isRead: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isSender: boolean;

  @ForeignKey(() => Notification)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare notificationId: Notification['id'];

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: User['id'];
}

export default UserNotification;
