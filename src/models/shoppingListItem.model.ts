import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { DefaultId } from 'typings/common';

import ShoppingList from './shoppingList.model';

interface ShoppingListItemModel {
  id: DefaultId;
  name: string;
  price: number | null;
  checked: boolean;
  shoppingListId: ShoppingList['id'];
}

export interface ShoppingListItemCreateParams {
  name: string;
  price?: number;
  shoppingListId: ShoppingList['id'];
}

@Table({
  modelName: 'ShoppingListItem',
  tableName: 'shopping-list-item',
})
class ShoppingListItem extends Model<ShoppingListItemModel, ShoppingListItemCreateParams> {
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
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: null,
  })
  declare price: number | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare checked: boolean;

  @ForeignKey(() => ShoppingList)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare shoppingListId: ShoppingList['id'];

  @BelongsTo(() => ShoppingList, 'shoppingListId')
  declare shoppingList: ShoppingList;
}

export default ShoppingListItem;
