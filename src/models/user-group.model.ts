import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { UUIDString } from 'typings/common';

import User from './user.model';
import Group from './group.model';

@Table({
  modelName: 'UserGroup',
  tableName: 'user_group',
})
class UserGroup extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: UUIDString;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: UUIDString;

  @ForeignKey(() => Group)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare groupId: UUIDString;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    defaultValue: 0,
  })
  declare debtAmount: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isAdmin: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isLoggedIn: boolean;
}

export default UserGroup;
