import { Column, DataType, Table, Model, BelongsTo, ForeignKey } from 'sequelize-typescript';

import { DefaultId } from 'typings/common';

import Group from './group.model';
import ChoreCategory from './choreCategory.model';

@Table({
  modelName: 'Chore',
  tableName: 'chore',
})
class Chore extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: DefaultId;

  @ForeignKey(() => Group)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare groupId: DefaultId;

  @ForeignKey(() => ChoreCategory)
  @Column({
    type: DataType.UUID,
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
}

export default Chore;
