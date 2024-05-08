import { isEqual } from 'date-fns';
import { Response, NextFunction } from 'express';

import { availableCurrency } from 'config/expenses';
import { HTTPStatusCodes } from 'config/status-codes';
import { GroupLoggedInRequest } from 'controllers/group';
import { UserExpenseService } from 'controllers/user-expense';
import { ApiError } from 'middleware/error';
import ExpenseModel, { Currency } from 'models/expense.model';
import ExpenseCategoryModel from 'models/expenseCategory.model';
import GroupModel from 'models/group.model';
import UserGroupModel from 'models/user-group.model';
import UserModel from 'models/user.model';
import { setStartOfDay } from 'utils/date';

import { ExpenseCreateRequest, ExpenseDeleteRequest, ExpenseEditRequest } from './types';

class ExpenseController {
  // GET /api/expense/expenses
  getExpenses = async (req: GroupLoggedInRequest, res: Response, next: NextFunction) => {
    try {
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      const expenses = await ExpenseModel.findAll({ where: { groupId } });

      res.status(HTTPStatusCodes.OK).json(expenses);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getExpenses: ${err.message}`));
      }
    }
  };

  // POST /api/expense/expense
  createExpense = async (req: ExpenseCreateRequest, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        amount,
        categoryId,
        currency,
        purchaseDate,
        description,
        splitMethod,
        userGroupIds,
      } = req.body;
      const groupId = req.currentGroup?.id;
      const createdBy = req.user?.id;

      if (!createdBy) {
        return next(ApiError.unauthorized('Пользователь не авторизован'));
      }

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      const trimmedName = name?.trim();

      if (!trimmedName) {
        return next(ApiError.badRequest('Название не может быть пустым'));
      }

      if (amount <= 0) {
        return next(ApiError.badRequest('Сумма должна быть больше 0'));
      }

      if (!categoryId) {
        return next(ApiError.badRequest('Не передан id категории'));
      }

      if (!purchaseDate) {
        return next(ApiError.badRequest('Не передана дата покупки'));
      }

      if (!availableCurrency.includes(currency as Currency)) {
        return next(ApiError.badRequest('Валюта не поддерживается'));
      }

      // todo: add new split methods
      if (splitMethod !== 'equally') {
        return next(ApiError.badRequest('Метод распределения не поддерживается'));
      }

      if (!userGroupIds.length) {
        return next(ApiError.badRequest('Не переданы id пользователей в группе'));
      }

      const existCategory = await ExpenseCategoryModel.findOne({
        where: { id: categoryId, groupId },
      });

      if (!existCategory) {
        return next(ApiError.badRequest('Такой категории не существует'));
      }

      const expense = await ExpenseModel.create({
        name: trimmedName,
        amount,
        categoryId,
        groupId,
        currency,
        purchaseDate: setStartOfDay(purchaseDate),
        description,
        createdBy,
        splitMethod,
      });

      // Create all user-expense instances
      await this._createUserExpenses({ groupId, expense, createdBy }, req, next);

      res.status(HTTPStatusCodes.CREATED).json(expense);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`createExpense: ${err.message}`));
      }
    }
  };

  // PUT /api/expense/expense/:id
  editExpense = async (req: ExpenseEditRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, amount, categoryId, description, purchaseDate } = req.body;
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      const expense = await ExpenseModel.findOne({ where: { id, groupId } });

      if (!expense) {
        return next(ApiError.badRequest('Запись о расходах не найдена'));
      }

      const trimmedName = name?.trim();

      const editParams: Partial<ExpenseModel> = {
        name: trimmedName,
        amount,
        categoryId,
        description,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      };

      if (typeof name === 'string' && !trimmedName) {
        editParams.name = expense.name;
      }

      if (description !== undefined) {
        const trimmedDescription = description?.trim();

        editParams.description =
          typeof description === 'string' && !trimmedDescription ? null : trimmedDescription;
      }

      if (purchaseDate !== undefined) {
        if (!isEqual(setStartOfDay(purchaseDate), expense.purchaseDate)) {
          editParams.purchaseDate = setStartOfDay(purchaseDate);
          console.log('dates are equal', setStartOfDay(purchaseDate), expense.purchaseDate);
        }
      }

      if (amount !== undefined && amount <= 0) {
        editParams.amount = undefined;
      }

      const editedExpense = await expense.update(editParams);

      res.status(HTTPStatusCodes.OK).json(editedExpense);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`editExpense: ${err.message}`));
      }
    }
  };

  // DELETE /api/expense/expense/:id
  deleteExpense = async (req: ExpenseDeleteRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      const expense = await ExpenseModel.findOne({ where: { id, groupId } });

      if (!expense) {
        return next(ApiError.badRequest('Запись о расходах не найдена'));
      }

      await expense.destroy();

      res.status(HTTPStatusCodes.OK).json({ message: 'Запись о расходах удалена' });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`deleteExpense: ${err.message}`));
      }
    }
  };

  private _createUserExpenses = async (
    data: { groupId: GroupModel['id']; expense: ExpenseModel; createdBy: UserModel['id'] },
    req: ExpenseCreateRequest,
    next: NextFunction
  ) => {
    const { amount, splitMethod, userGroupIds } = req.body;
    const { groupId, expense, createdBy } = data;

    let debtAmount = 0;

    if (splitMethod === 'equally') {
      debtAmount = amount / userGroupIds.length;
    }

    // todo: other split methods

    for (const userGroupId of userGroupIds) {
      // Find user in group
      const userInGroup = await UserGroupModel.findOne({
        where: { groupId, id: userGroupId },
      });

      if (!userInGroup) {
        return next(ApiError.badRequest('Не удалось найти пользователя в группе'));
      }

      // Create user-expense instance
      const created = await UserExpenseService.createUserExpenses({
        expenseId: expense.id,
        userGroupId,
        // Author of the record is automatically pays all amount
        status: userInGroup.userId === createdBy ? 'settled' : 'pending',
        debtAmount: userInGroup.userId === createdBy ? 0 : debtAmount,
      });

      if (!created) {
        return next(ApiError.badRequest('Не удалось создать экземпляр user-expense'));
      }
    }
  };
}

export default new ExpenseController();
