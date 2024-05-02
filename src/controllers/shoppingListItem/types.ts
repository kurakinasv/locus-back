import { GroupLoggedInRequest } from 'controllers/group';
import ShoppingListItem, { ShoppingListItemCreateParams } from 'models/shoppingListItem.model';
import { NumberString } from 'typings/common';

export interface ListItemGetRequest extends GroupLoggedInRequest {
  params: {
    listId: NumberString;
  };
}

export interface ListItemCreateRequest extends GroupLoggedInRequest {
  body: ShoppingListItemCreateParams;
  params: {
    listId: NumberString;
  };
}

export interface ListItemEditRequest extends GroupLoggedInRequest {
  body: {
    name?: ShoppingListItem['name'];
    price?: ShoppingListItem['price'];
    checked?: ShoppingListItem['checked'];
  };
  params: {
    id: NumberString;
    listId: NumberString;
  };
}

export interface ListItemDeleteRequest extends GroupLoggedInRequest {
  params: {
    id: NumberString;
    listId: NumberString;
  };
}
