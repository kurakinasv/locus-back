import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { DefaultId } from 'typings/common';
import Schedule from './schedule.model';
import UserGroup from './user-group.model';

type ScheduleDateModel = {
  id: DefaultId;
  date: Date;
  completed: boolean;
  isAssigned: boolean;
  completedAt: Date | null;
  scheduleId: Schedule['id'];
  userGroupId: UserGroup['id'] | null;
};

export type ScheduleDateCreateParams = {
  /** Date when this task shuold be completed */
  date: Date;

  isAssigned?: boolean;

  /** Id of the schedule this task belongs to */
  scheduleId: Schedule['id'];

  /** Id of the user in group this task belongs to */
  userGroupId: UserGroup['id'];
};

@Table({
  modelName: 'ScheduleDate',
  tableName: 'schedule-date',
})
class ScheduleDate extends Model<ScheduleDateModel, ScheduleDateCreateParams> {
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  /** Date when this task shuold be completed */
  declare date: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  /** Whether user mark this task as completed or not */
  declare completed: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: null,
  })
  /** Date and time when this task was completed */
  declare completedAt: Date | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  /** Is this task assigned to a specific user */
  declare isAssigned: boolean;

  @ForeignKey(() => Schedule)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  /** Id of the schedule this task belongs to */
  declare scheduleId: Schedule['id'];

  @ForeignKey(() => UserGroup)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    onDelete: 'SET NULL',
  })
  /** Id of the user in group this task belongs to */
  declare userGroupId: UserGroup['id'] | null;

  @BelongsTo(() => Schedule, 'scheduleId')
  declare schedule: Schedule;

  @BelongsTo(() => UserGroup, 'userGroupId')
  declare userGroup: UserGroup;
}

export default ScheduleDate;
