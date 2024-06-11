import { BelongsToMany, Column, DataType, Model, Table } from 'sequelize-typescript';

import { DefaultId } from 'typings/common';

import Group from './group.model';
import User from './user.model';
import UserNotification from './user-notification.model';

type NotificationModel = {
  id: DefaultId;
  message: string;
  groupId: Group['id'];
  senderId: User['id'];
  recipientsIds: Array<User['id']>;
};

export type NotificationCreateParams = {
  message: string;
  groupId: Group['id'];
  senderId: User['id'];
  recipientsIds?: Array<User['id']>;
};

@Table({
  modelName: 'Notification',
  tableName: 'notification',
})
class Notification extends Model<NotificationModel, NotificationCreateParams> {
  @Column({
    primaryKey: true,
    type: DataType.INTEGER,
    autoIncrement: true,
  })
  declare id: DefaultId;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare message: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare groupId: Group['id'];

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare senderId: User['id'];

  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: false,
  })
  declare recipientsIds: Array<User['id']>;

  @BelongsToMany(() => User, () => UserNotification)
  declare users: Array<User & { UserNotification: UserNotification }>;
}

export default Notification;
