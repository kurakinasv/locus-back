import { BelongsToMany, Column, DataType, Model, Table } from 'sequelize-typescript';

import { UUIDString } from 'typings/common';

import Group from './group.model';
import UserGroup from './user-group.model';

@Table({
  // timestamps: true, // default, createdAt and updatedAt create automatically
  modelName: 'User',
  tableName: 'user',
})
class User extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: UUIDString;

  @Column({
    type: DataType.STRING,
    defaultValue: null,
  })
  declare name?: string | null;

  @Column({
    type: DataType.STRING,
    defaultValue: null,
  })
  declare surname?: string | null;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  declare username: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  // todo: image

  @BelongsToMany(() => Group, () => UserGroup)
  declare groups: Array<Group & { UserGroup: UserGroup }>;
}

export default User;
