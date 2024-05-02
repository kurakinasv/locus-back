import { Response, NextFunction } from 'express';

import { HTTPStatusCodes } from 'config/status-codes';
import { GroupLoggedInRequest } from 'controllers/group';
import { ApiError } from 'middleware/error';
import ExpenseModel from 'models/expense.model';
import UserModel from 'models/user.model';
import UserExpenseModel from 'models/user-expense.model';
import UserGroupModel from 'models/user-group.model';

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

  // GET /api/user-expense/group
  getGroupUserExpenses = async (req: GroupLoggedInRequest, res: Response, next: NextFunction) => {
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

        for (const expense of userExpenses) {
          const debt = Number(expense.debtAmount);

          if (debt) {
            userGroupExpensesMap[userGroup.userId] = {
              ...userGroupExpensesMap[userGroup.userId],
              [expense.id]: debt,
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
}

export default new UserExpenseController();
