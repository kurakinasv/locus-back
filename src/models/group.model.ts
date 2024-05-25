import { BelongsToMany, Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';

import { UUIDString } from 'typings/common';

import UserGroup from './user-group.model';
import User from './user.model';
import Chore from './chore.model';
import ChoreCategory from './choreCategory.model';
import ExpenseCategory from './expenseCategory.model';
import Expense from './expense.model';
import ShoppingList from './shoppingList.model';

type GroupModel = {
  id: UUIDString;
  name: string;
  image: string | null;
  inviteCode: UUIDString | null;
  inviteExpiresAt: Date | null;
};

export type GroupCreateParams = {
  name: string;
};

@Table({
  modelName: 'Group',
  tableName: 'group',
})
class Group extends Model<GroupModel, GroupCreateParams> {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: UUIDString;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    defaultValue: null,
  })
  declare image: string | null;

  @Column({
    type: DataType.STRING,
    defaultValue: null,
  })
  declare inviteCode: string | null;

  @Column({
    type: DataType.DATE,
    defaultValue: null,
  })
  declare inviteExpiresAt: Date | null;

  @BelongsToMany(() => User, () => UserGroup)
  declare users: Array<User & { UserGroup: UserGroup }>;

  @HasMany(() => Chore, 'groupId')
  declare chores: Chore[];

  @HasMany(() => ChoreCategory, 'groupId')
  declare choreCategories: ChoreCategory[];

  @HasMany(() => ExpenseCategory, 'groupId')
  declare expenseCategory: ExpenseCategory[];

  @HasMany(() => Expense, 'groupId')
  declare expenses: Expense[];

  @HasMany(() => ShoppingList, 'groupId')
  declare shoppingLists: ShoppingList[];
}

export default Group;
