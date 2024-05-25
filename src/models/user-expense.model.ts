import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { DefaultId } from 'typings/common';

import Expense from './expense.model';
import UserGroup from './user-group.model';

export type UserExpenseStatus = 'pending' | 'partially' | 'settled';

type UserExpenseModel = {
  id: DefaultId;
  status: UserExpenseStatus;
  personalAmount: number;
  debtAmount: number;
  userGroupId: UserGroup['id'];
  expenseId: Expense['id'];
};

export type UserExpenseCreateParams = {
  status: UserExpenseStatus;
  personalAmount: number;
  debtAmount?: number;
  userGroupId: UserGroup['id'];
  expenseId: Expense['id'];
};

@Table({
  modelName: 'UserExpense',
  tableName: 'user_expense',
})
class UserExpense extends Model<UserExpenseModel, UserExpenseCreateParams> {
  @Column({
    primaryKey: true,
    type: DataType.INTEGER,
    autoIncrement: true,
  })
  declare id: DefaultId;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'pending',
  })
  declare status: UserExpenseStatus;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  declare personalAmount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  declare debtAmount: number;

  @ForeignKey(() => UserGroup)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userGroupId: UserGroup['id'];

  @ForeignKey(() => Expense)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare expenseId: Expense['id'];
}

export default UserExpense;
