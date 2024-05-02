import { Response, NextFunction } from 'express';

import { HTTPStatusCodes } from 'config/status-codes';
import { ApiError } from 'middleware/error';
import ShoppingListModel from 'models/shoppingList.model';
import ShoppingListItemModel from 'models/shoppingListItem.model';

import {
  ListItemCreateRequest,
  ListItemDeleteRequest,
  ListItemEditRequest,
  ListItemGetRequest,
} from './types';

class ShoppingListItemController {
  // GET /api/shopping-list/:listId/items
  getListItems = async (req: ListItemGetRequest, res: Response, next: NextFunction) => {
    try {
      const { listId } = req.params;
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      const shoppingList = await ShoppingListModel.findOne({ where: { id: listId, groupId } });

      if (!shoppingList) {
        return next(ApiError.badRequest('Список покупок не найден'));
      }

      const listItems = await ShoppingListItemModel.findAll({ where: { shoppingListId: listId } });

      res.status(HTTPStatusCodes.OK).json(listItems);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getListItems: ${err.message}`));
      }
    }
  };

  // POST /api/shopping-list/:listId/item
  createListItem = async (req: ListItemCreateRequest, res: Response, next: NextFunction) => {
    try {
      const { name, price } = req.body;
      const { listId } = req.params;
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      const trimmedName = name?.trim();

      if (!trimmedName) {
        return next(ApiError.badRequest('Название не может быть пустым'));
      }

      if (price && price < 0) {
        return next(ApiError.badRequest('Цена не может быть меньше 0'));
      }

      const shoppingList = await ShoppingListModel.findOne({ where: { id: listId, groupId } });

      if (!shoppingList) {
        return next(ApiError.badRequest('Список покупок не найден'));
      }

      const listItem = await ShoppingListItemModel.create({
        name: trimmedName,
        price,
        shoppingListId: Number(listId),
      });

      res.status(HTTPStatusCodes.CREATED).json(listItem);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`createListItem: ${err.message}`));
      }
    }
  };

  // PUT /api/shopping-list/:listId/item/:id
  editListItem = async (req: ListItemEditRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, price, checked } = req.body;
      const { listId } = req.params;
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      const shoppingList = await ShoppingListModel.findOne({ where: { id: listId, groupId } });

      if (!shoppingList) {
        return next(ApiError.badRequest('Список покупок не найден'));
      }

      const listItem = await ShoppingListItemModel.findOne({
        where: { id, shoppingListId: listId },
      });

      if (!listItem) {
        return next(ApiError.badRequest('Элемент не найден'));
      }

      const trimmedName = name?.trim();

      listItem.name = !trimmedName ? listItem.name : trimmedName;
      listItem.price = price === null ? null : price ? Number(price) : listItem.price;
      listItem.checked = checked ?? listItem.checked;

      if (!listItem.changed()) {
        return res.status(HTTPStatusCodes.NOT_MODIFIED).json();
      }

      const editedListItem = await listItem.save();

      res.status(HTTPStatusCodes.OK).json(editedListItem);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`editListItem: ${err.message}`));
      }
    }
  };

  // DELETE /api/shopping-list/:listId/item/:id
  deleteListItem = async (req: ListItemDeleteRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { listId } = req.params;
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      const shoppingList = await ShoppingListModel.findOne({ where: { id: listId, groupId } });

      if (!shoppingList) {
        return next(ApiError.badRequest('Список покупок не найден'));
      }

      const listItem = await ShoppingListItemModel.findOne({
        where: { id, shoppingListId: listId },
      });

      if (!listItem) {
        return next(ApiError.badRequest('Элемент не найден'));
      }

      await listItem.destroy();

      res.status(HTTPStatusCodes.OK).json({ message: 'Элемент успешно удалён' });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`deleteListItem: ${err.message}`));
      }
    }
  };
}

export default new ShoppingListItemController();
