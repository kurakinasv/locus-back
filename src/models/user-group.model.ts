import { Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';

import { UUIDString } from 'typings/common';

import User from './user.model';
import Group from './group.model';
import Schedule from './schedule.model';
import ScheduleDate from './scheduleDate.model';

type UserGroupModel = {
  id: UUIDString;
  debtAmount: number;
  isAdmin: boolean;
  isLoggedIn: boolean;
  userId: UUIDString;
  groupId: UUIDString;
};

export type UserGroupCreateParams = {
  debtAmount?: number;
  isAdmin?: boolean;
  isLoggedIn: boolean;
  userId: UUIDString;
  groupId: UUIDString;
};

@Table({
  modelName: 'UserGroup',
  tableName: 'user_group',
})
class UserGroup extends Model<UserGroupModel, UserGroupCreateParams> {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: UUIDString;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: UUIDString;

  @ForeignKey(() => Group)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare groupId: UUIDString;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    defaultValue: 0,
  })
  declare debtAmount: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isAdmin: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isLoggedIn: boolean;

  @HasMany(() => Schedule, 'createdBy')
  declare schedules: Schedule[];

  @HasMany(() => ScheduleDate, 'userGroupId')
  declare scheduleDates: ScheduleDate[];
}

export default UserGroup;
