import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { DefaultId } from 'typings/common';

import ExpenseCategory from './expenseCategory.model';
import UserExpense from './user-expense.model';
import UserGroup from './user-group.model';
import Group from './group.model';
import User from './user.model';

export type Currency = 'RUB' | 'USD' | 'EUR';

export type SplitMethod = 'equally' | 'unequally' | 'personal';

export type ExpenseStatus = 'pending' | 'settled';

type ExpenseModel = {
  id: DefaultId;
  name: string;
  amount: number;
  currency: string;
  description: string | null;
  purchaseDate: Date;
  splitMethod: SplitMethod;
  status: ExpenseStatus;
  createdBy: User['id'];
  groupId: Group['id'];
  categoryId: ExpenseCategory['id'] | null;
};

export type ExpenseCreateParams = {
  name: string;
  amount: number;
  currency: string;
  description?: string | null;
  purchaseDate: Date;
  splitMethod: SplitMethod;
  createdBy: User['id'];
  groupId: Group['id'];
  categoryId?: ExpenseCategory['id'];
};

@Table({
  modelName: 'Expense',
  tableName: 'expense',
})
class Expense extends Model<ExpenseModel, ExpenseCreateParams> {
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
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare amount: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare currency: Currency;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare description: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare purchaseDate: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare splitMethod: SplitMethod;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'pending',
  })
  declare expenseStatus: ExpenseStatus;

  @ForeignKey(() => Group)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare groupId: Group['id'];

  @ForeignKey(() => ExpenseCategory)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare categoryId: ExpenseCategory['id'] | null;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare createdBy: User['id'];

  @BelongsTo(() => ExpenseCategory, 'expenseCategoryId')
  declare expenseCategory: ExpenseCategory;

  @BelongsTo(() => Group, 'groupId')
  declare group: Group;

  @BelongsToMany(() => UserGroup, () => UserExpense)
  declare userGroups: Array<UserGroup & { UserExpense: UserExpense }>;
}

export default Expense;
