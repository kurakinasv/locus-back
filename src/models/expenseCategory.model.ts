import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { ExpenseCategoryIcon } from 'config/expenses';
import { DefaultId } from 'typings/common';

import Group from './group.model';

type ExpenseCategoryModel = {
  id: DefaultId;
  name: string;
  icon: string | null;
  isArchived: boolean;
  groupId: Group['id'];
};

export type ExpenseCategoryCreateParams = {
  name: string;
  icon?: string | null;
  groupId: Group['id'];
};

@Table({
  modelName: 'ExpenseCategory',
  tableName: 'expense-category',
})
class ExpenseCategory extends Model<ExpenseCategoryModel, ExpenseCategoryCreateParams> {
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
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare icon: ExpenseCategoryIcon | null;

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
  declare groupId: Group['id'];

  @BelongsTo(() => Group, 'groupId')
  declare group: Group;
}

export default ExpenseCategory;
