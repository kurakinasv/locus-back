import UserExpenseModel, { UserExpenseCreateParams } from 'models/user-expense.model';

class UserExpenseService {
  static createUserExpenses = async (data: UserExpenseCreateParams) => {
    try {
      const { debtAmount, expenseId, userGroupId, status } = data;

      const userExpense = await UserExpenseModel.create({
        debtAmount,
        expenseId,
        userGroupId,
        status,
      });

      return userExpense;
    } catch (err) {
      if (err instanceof Error) {
        console.error('createUserExpenses:', err.message);
        return null;
      }
    }

    return null;
  };
}

export default UserExpenseService;
