import { BelongsToMany, Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';

import { DefaultId } from 'typings/common';

import UserGroup from './user-group.model';
import User from './user.model';
import Chore from './chore.model';

@Table({
  modelName: 'Group',
  tableName: 'group',
})
class Group extends Model {
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
    defaultValue: null,
  })
  declare image?: string | null;

  @BelongsToMany(() => User, () => UserGroup)
  declare users: Array<User & { UserGroup: UserGroup }>;

  @HasMany(() => Chore, 'groupId')
  declare chores: Chore[];
}

export default Group;
