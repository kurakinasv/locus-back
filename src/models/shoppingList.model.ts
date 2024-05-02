import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';

import { DefaultId } from 'typings/common';

import Group from './group.model';
import ShoppingListItem from './shoppingListItem.model';

interface ShoppingListModel {
  id: DefaultId;
  name: string;
  description: string | null;
  purchaseDate: Date | null;
  groupId: Group['id'];
}

export interface ShoppingListCreateParams {
  name: string;
  description?: string;
  purchaseDate?: Date;
  groupId: Group['id'];
}

@Table({
  modelName: 'ShoppingList',
  tableName: 'shopping-list',
})
class ShoppingList extends Model<ShoppingListModel, ShoppingListCreateParams> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
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
    defaultValue: null,
  })
  declare description: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: null,
  })
  declare purchaseDate: Date | null;

  @ForeignKey(() => Group)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare groupId: Group['id'];

  @BelongsTo(() => Group, 'groupId')
  declare group: Group;

  @HasMany(() => ShoppingListItem, 'shoppingListId')
  declare shoppingListItems: ShoppingListItem[];
}

export default ShoppingList;
