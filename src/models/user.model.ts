import { Column, DataType, Model, Table } from 'sequelize-typescript';

import { DefaultId } from 'typings/common';

@Table({
  // timestamps: true, // default, createdAt and updatedAt create automatically
  modelName: 'User',
  tableName: 'user',
})
class User extends Model {
  @Column({
    primaryKey: true,
    // autoIncrement: true, // puts an error
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: DefaultId;

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
}

export default User;
