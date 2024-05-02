import { GroupLoggedInRequest } from 'controllers/group';
import ShoppingList, { ShoppingListCreateParams } from 'models/shoppingList.model';
import { DateString, NumberString } from 'typings/common';

export interface ShoppingListCreateRequest extends GroupLoggedInRequest {
  body: Omit<ShoppingListCreateParams, 'purchaseDate'> & {
    purchaseDate?: DateString;
  };
}

export interface ShoppingListEditRequest extends GroupLoggedInRequest {
  body: {
    name?: ShoppingList['name'];
    description?: ShoppingList['description'];
    purchaseDate?: DateString;
  };
}

export interface ShoppingListDeleteRequest extends GroupLoggedInRequest {
  params: {
    id: NumberString;
  };
}
