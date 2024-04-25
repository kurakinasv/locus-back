import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { DefaultId } from 'typings/common';

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
  declare id: DefaultId;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: DefaultId;

  @ForeignKey(() => Group)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare groupId: DefaultId;

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
}

export default UserGroup;
