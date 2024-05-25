import { format } from 'date-fns';
import { Response, NextFunction } from 'express';

import { HTTPStatusCodes } from 'config/status-codes';
import { GroupLoggedInRequest } from 'controllers/group';
import { ApiError } from 'middleware/error';
import ExpenseModel from 'models/expense.model';
import UserModel from 'models/user.model';
import UserExpenseModel from 'models/user-expense.model';
import UserGroupModel from 'models/user-group.model';
import { DateString } from 'typings/common';

import { UserExpenseDebtRequest } from './types';

class UserExpenseController {
  // todo: only for dev
  // GET /api/user-expense/all
  getAllUserExpenses = async (req: GroupLoggedInRequest, res: Response, next: NextFunction) => {
    try {
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      const userExpenses = await UserExpenseModel.findAll();

      res.status(HTTPStatusCodes.OK).json(userExpenses);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getAllUserExpenses: ${err.message}`));
      }
    }
  };

  // GET /api/user-expense/user-expenses
  getUserExpenses = async (req: GroupLoggedInRequest, res: Response, next: NextFunction) => {
    try {
      const groupId = req.currentGroup?.id;
      const userId = req.user?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      const userGroup = await UserGroupModel.findOne({
        where: { groupId, userId },
      });

      const expenses = await ExpenseModel.findAll({
        where: { groupId },
        include: [{ model: UserGroupModel, where: { id: userGroup?.id } }],
      });

      // Returns all group expenses, but personal expenses only for current user
      const userExpenses2 = await ExpenseModel.findAll({
        where: { groupId },
        include: [
          {
            model: UserGroupModel,
            through: {
              attributes: ['personalAmount'],
              where: { userGroupId: userGroup?.id },
            },
          },
        ],
      });

      const currentUserExpenses = userExpenses2
        .map((userExp) =>
          userExp.userGroups.map((userGroup) => {
            const dateKey = format(new Date(userExp.purchaseDate), 'yyyy-MM');
            return [dateKey, userGroup.UserExpense.personalAmount];
          })
        )
        .flat();

      const expensesDateSumMap: Record<DateString, number[]> = currentUserExpenses.reduce(
        (currentMap: Record<DateString, number[]>, dateAmountEntry) => {
          const date = dateAmountEntry[0];
          const newAmount = Number(dateAmountEntry[1]);
          const existingAmounts = currentMap[date] ?? [];

          return {
            ...currentMap,
            [date]: [...existingAmounts, newAmount],
          };
        },
        {} as Record<DateString, number[]>
      );

      const totalPersonalSum = expenses
        .map((expense) => Number(expense.amount))
        .reduce((acc, curr) => acc + curr, 0);

      res.status(HTTPStatusCodes.OK).json({ userExpenses: expensesDateSumMap, totalPersonalSum });
    } catch (error) {
      if (error instanceof Error) {
        next(ApiError.badRequest(`getUserExpenses: ${error.message}`));
      }
    }
  };

  // GET /api/user-expense/group
  getGroupUserDebts = async (req: GroupLoggedInRequest, res: Response, next: NextFunction) => {
    try {
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      // Get users in group
      const groupUsers = await UserGroupModel.findAll({
        where: { groupId },
      });

      // Map like { userId: { expenseId: debtAmount }, userId2: { expenseId: debtAmount }, ...}
      const userGroupExpensesMap: Record<
        UserModel['id'],
        Record<ExpenseModel['id'], UserExpenseModel['debtAmount']>
      > = {};

      // Get all users in group expenses
      for (const userGroup of groupUsers) {
        const userExpenses = await UserExpenseModel.findAll({
          where: { userGroupId: userGroup.id },
        });
        console.log(
          'userExpenses',
          userGroup.id,
          userGroup.userId,
          userExpenses.map((v) => v.debtAmount)
        );

        if (!userExpenses.length) {
          continue;
        }

        for (const userExpense of userExpenses) {
          const debt = Number(userExpense.debtAmount);

          if (debt) {
            userGroupExpensesMap[userGroup.userId] = {
              ...userGroupExpensesMap[userGroup.userId],
              [userExpense.expenseId]: debt,
            };
          }
        }
      }

      res.status(HTTPStatusCodes.OK).json(userGroupExpensesMap);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getAllUserExpenses: ${err.message}`));
      }
    }
  };

  // PUT /api/user-expense/debt/:id
  closeUserDebt = async (req: UserExpenseDebtRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { amountToPay, userGroupId } = req.body;
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      if (!id || !amountToPay || !userGroupId) {
        return next(ApiError.badRequest('Не переданы обязательные параметры'));
      }

      const userExpense = await UserExpenseModel.findOne({
        where: { userGroupId, expenseId: id },
      });

      if (!userExpense) {
        return next(ApiError.badRequest('Запись о расходах не найдена'));
      }

      userExpense.debtAmount = userExpense.debtAmount - amountToPay;
      userExpense.status = userExpense.debtAmount <= 0 ? 'settled' : 'partially';

      await userExpense.save();

      const userExpenses = await UserExpenseModel.findAll({
        where: { expenseId: id },
      });

      if (userExpenses.every((u) => u.status === 'settled')) {
        await ExpenseModel.update({ expenseStatus: 'settled' }, { where: { id, groupId } });
      }

      const expenses = await ExpenseModel.findAll({
        where: { groupId },
        include: 'userGroups',
        order: [['purchaseDate', 'DESC']],
      });

      res.status(HTTPStatusCodes.OK).json(expenses);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`closeUserDebt: ${err.message}`));
      }
    }
  };
}

export default new UserExpenseController();
