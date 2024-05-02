import { Response, NextFunction } from 'express';

import { HTTPStatusCodes } from 'config/status-codes';
import { GroupLoggedInRequest } from 'controllers/group';
import { ApiError } from 'middleware/error';
import ShoppingListModel, { ShoppingListCreateParams } from 'models/shoppingList.model';
import { setEndOfDay } from 'utils/date';

import {
  ShoppingListCreateRequest,
  ShoppingListDeleteRequest,
  ShoppingListEditRequest,
} from './types';

class ShoppingListController {
  // GET /api/shopping-list/lists
  getShoppingLists = async (req: GroupLoggedInRequest, res: Response, next: NextFunction) => {
    try {
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      const shoppingLists = await ShoppingListModel.findAll({ where: { groupId } });

      res.json(shoppingLists);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getShoppingLists: ${err.message}`));
      }
    }
  };

  // POST /api/shopping-list/list
  createShoppingList = async (
    req: ShoppingListCreateRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name, description, purchaseDate } = req.body;
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      const trimmedName = name?.trim();

      if (!trimmedName) {
        return next(ApiError.badRequest('Не передано название списка покупок'));
      }

      const createParams: ShoppingListCreateParams = {
        name: trimmedName,
        groupId,
        description,
        purchaseDate: purchaseDate ? setEndOfDay(purchaseDate) : undefined,
      };

      if (!purchaseDate) {
        delete createParams.purchaseDate;
      }

      const shoppingList = await ShoppingListModel.create(createParams);

      res.status(HTTPStatusCodes.CREATED).json(shoppingList);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`createShoppingList: ${err.message}`));
      }
    }
  };

  // PUT /api/shopping-list/list/:id
  editShoppingList = async (req: ShoppingListEditRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, description, purchaseDate } = req.body;
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      const shoppingList = await ShoppingListModel.findOne({ where: { id, groupId } });

      if (!shoppingList) {
        return next(ApiError.badRequest('Список покупок не найден'));
      }

      const trimmedName = name?.trim();

      if (!trimmedName) {
        return next(ApiError.badRequest('Название не может быть пустым'));
      }

      const editParams: Partial<ShoppingListModel> = {
        name: trimmedName,
        description,
        purchaseDate: purchaseDate ? setEndOfDay(purchaseDate) : undefined,
      };

      const editedList = await shoppingList.update(editParams);

      res.status(HTTPStatusCodes.OK).json(editedList);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`editShoppingList: ${err.message}`));
      }
    }
  };

  // DELETE /api/shopping-list/list/:id
  // ! Delete all list items
  deleteShoppingList = async (
    req: ShoppingListDeleteRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      const shoppingList = await ShoppingListModel.findOne({ where: { id, groupId } });

      if (!shoppingList) {
        return next(ApiError.badRequest('Список покупок не найден'));
      }

      await shoppingList.destroy();

      res.status(HTTPStatusCodes.OK).json({ message: 'Список покупок успешно удалён' });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`deleteShoppingList: ${err.message}`));
      }
    }
  };
}

export default new ShoppingListController();
