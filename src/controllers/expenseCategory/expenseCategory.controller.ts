import { Response, NextFunction } from 'express';

import { HTTPStatusCodes } from 'config/status-codes';
import { GroupLoggedInRequest } from 'controllers/group';
import { ApiError } from 'middleware/error';
import ExpenseModel from 'models/expense.model';
import ExpenseCategoryModel from 'models/expenseCategory.model';
import GroupModel from 'models/group.model';

import {
  ExpenseCategoryCreateRequest,
  ExpenseCategoryDeleteRequest,
  ExpenseCategoryEditRequest,
} from './types';

class ExpenseCategoryController {
  // GET /api/expense/categories
  getExpenseCategories = async (req: GroupLoggedInRequest, res: Response, next: NextFunction) => {
    try {
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      const expenseCategories = await ExpenseCategoryModel.findAll({ where: { groupId } });

      res.status(HTTPStatusCodes.OK).json(expenseCategories);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getExpenseCategories: ${err.message}`));
      }
    }
  };

  // POST /api/expense/category
  createExpenseCategory = async (
    req: ExpenseCategoryCreateRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name, icon } = req.body;
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      const trimmedName = name.trim();

      if (!trimmedName) {
        return next(ApiError.badRequest('Не передано название категории'));
      }

      if (await this._checkIfCategoryExists(trimmedName, groupId)) {
        return next(ApiError.badRequest('Категория с таким именем уже существует'));
      }

      const expenseCategory = await ExpenseCategoryModel.create({ name, icon, groupId });

      res.status(HTTPStatusCodes.CREATED).json(expenseCategory);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`createExpenseCategory: ${err.message}`));
      }
    }
  };

  // PUT /api/expense/category/:id
  editExpenseCategory = async (
    req: ExpenseCategoryEditRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;
    const { name, icon, isArchived } = req.body;
    const groupId = req.currentGroup?.id;

    if (!groupId) {
      return next(ApiError.badRequest('Не передан id группы'));
    }

    const trimmedName = name?.trim();

    if (typeof trimmedName === 'string' && !trimmedName) {
      return next(ApiError.badRequest('Не передано название категории'));
    }

    const expenseCategory = await ExpenseCategoryModel.findOne({ where: { id, groupId } });

    if (!expenseCategory) {
      return next(ApiError.badRequest('Категория не найдена'));
    }

    expenseCategory.name = trimmedName || expenseCategory.name;
    expenseCategory.icon = icon !== undefined ? icon : expenseCategory.icon;
    expenseCategory.isArchived = isArchived !== undefined ? isArchived : expenseCategory.isArchived;

    if (!expenseCategory.changed()) {
      return res.status(HTTPStatusCodes.NOT_MODIFIED).json();
    }

    // If name was changed, check if there is another category with the same name
    if (
      trimmedName &&
      expenseCategory.changed('name') &&
      (await this._checkIfCategoryExists(trimmedName, groupId))
    ) {
      return next(ApiError.badRequest('Категория с таким именем уже существует'));
    }

    const editedCategory = await expenseCategory.save();

    res.status(HTTPStatusCodes.OK).json(editedCategory);
  };

  // DELETE /api/expense/category/:id
  deleteExpenseCategory = async (
    req: ExpenseCategoryDeleteRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const groupId = req.currentGroup?.id;

      if (!id) {
        return next(ApiError.badRequest('Не передан id категории'));
      }

      const expenseCategory = await ExpenseCategoryModel.findOne({ where: { id, groupId } });

      if (!expenseCategory) {
        return next(ApiError.badRequest('Категория не найдена'));
      }

      const expenses = await ExpenseModel.findAll({ where: { categoryId: expenseCategory.id } });

      for (const expense of expenses) {
        await expense.update({ categoryId: null });
      }

      await expenseCategory.destroy();

      res.status(HTTPStatusCodes.OK).json({ message: 'Категория удалена' });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`deleteExpenseCategory: ${err.message}`));
      }
    }
  };

  /**
   * Check if there is another category with the same name
   * @return {boolean} `true` if category with the same name exists, else `false`
   */
  private _checkIfCategoryExists = async (
    name: ExpenseCategoryModel['name'],
    groupId: GroupModel['id']
  ) => {
    const expenseCategory = await ExpenseCategoryModel.findOne({ where: { name, groupId } });

    if (expenseCategory?.name.toLowerCase() === name.toLowerCase()) {
      return true;
    }

    return false;
  };
}

export default new ExpenseCategoryController();
