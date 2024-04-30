import {
  Column,
  DataType,
  Table,
  Model,
  BelongsTo,
  ForeignKey,
  HasMany,
} from 'sequelize-typescript';

import { UUIDString, DefaultId } from 'typings/common';

import Group from './group.model';
import ChoreCategory from './choreCategory.model';
import Schedule from './schedule.model';

@Table({
  modelName: 'Chore',
  tableName: 'chore',
})
class Chore extends Model {
  @ForeignKey(() => Group)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare groupId: UUIDString;

  @ForeignKey(() => ChoreCategory)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare categoryId: DefaultId;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
  })
  declare points: number;

  @BelongsTo(() => Group, 'groupId')
  declare group: Group;

  @BelongsTo(() => ChoreCategory, 'categoryId')
  declare category: ChoreCategory;

  @HasMany(() => Schedule, 'choreId')
  declare schedules: Schedule[];
}

export default Chore;
