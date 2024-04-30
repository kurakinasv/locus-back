import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';

import { DefaultId } from 'typings/common';

import Chore from './chore.model';
import ScheduleDate from './scheduleDate.model';
import UserGroup from './user-group.model';

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'custom' | 'never';

export const defaultFrequency: Frequency = 'never';

export type AlternatingMethod = 'one-by-one' | 'single' | 'anyone';

type ScheduleModel = {
  id: DefaultId;
  choreId: Chore['id'];
  dateStart: Date;
  dateEnd: Date;
  frequency: Frequency;
  alternatingMethod: AlternatingMethod;
  isArchived: boolean;
  userGroupIds: Array<UserGroup['id']>;
  createdBy: UserGroup['id'];
};

export type ScheduleCreateParams = {
  choreId: Chore['id'];
  dateStart: Date;
  dateEnd?: Date;
  frequency?: Frequency;
  alternatingMethod?: AlternatingMethod;
  userGroupIds: Array<UserGroup['id']>;
  createdBy: UserGroup['id'];
};

@Table({
  modelName: 'Schedule',
  tableName: 'schedule',
})
class Schedule extends Model<ScheduleModel, ScheduleCreateParams> {
  @Column({
    primaryKey: true,
    type: DataType.INTEGER,
    autoIncrement: true,
  })
  declare id: DefaultId;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare dateStart: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare dateEnd: Date;

  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: false,
  })
  declare userGroupIds: Array<UserGroup['id']>;

  @Column({
    type: DataType.STRING,
    defaultValue: defaultFrequency,
  })
  declare frequency: Frequency;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  declare alternatingMethod: AlternatingMethod;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isArchived: boolean;

  @ForeignKey(() => Chore)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare choreId: Chore['id'];

  @ForeignKey(() => UserGroup)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare createdBy: UserGroup['id'];

  @BelongsTo(() => Chore, 'choreId')
  declare chore: Chore;

  @BelongsTo(() => UserGroup, 'createdBy')
  declare userGroup: UserGroup;

  @HasMany(() => ScheduleDate, 'scheduleId')
  declare scheduleDates: ScheduleDate[];
}

export default Schedule;
