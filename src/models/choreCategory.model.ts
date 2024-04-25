import {
  Column,
  DataType,
  Table,
  Model,
  HasMany,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';

import { DefaultId } from 'typings/common';

import Chore from './chore.model';
import Group from './group.model';

type ChoreCategoryIcon = 'home' | 'work' | 'shopping' | 'other';

@Table({
  modelName: 'ChoreCategory',
  tableName: 'chore_category',
})
class ChoreCategory extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: DefaultId;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare icon: ChoreCategoryIcon;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isArchived: boolean;

  @ForeignKey(() => Group)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare groupId: DefaultId;

  @BelongsTo(() => Group, 'groupId')
  declare group: Group;

  @HasMany(() => Chore, 'categoryId')
  declare chores: Chore[];
}

export default ChoreCategory;
