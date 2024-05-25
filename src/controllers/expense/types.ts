import { GroupLoggedInRequest } from 'controllers/group';
import ExpenseModel, { ExpenseCreateParams } from 'models/expense.model';
import ExpenseCategoryModel from 'models/expenseCategory.model';
import UserGroupModel from 'models/user-group.model';
import { DateString, NumberString } from 'typings/common';

export interface ExpensesGetRequest extends GroupLoggedInRequest {
  query: {
    from?: DateString;
    to?: DateString;
    categoryId?: NumberString;
  };
}

export interface ExpenseGetRequest extends GroupLoggedInRequest {
  params: {
    id: NumberString;
  };
}

export interface ExpenseCreateRequest extends GroupLoggedInRequest {
  body: Omit<ExpenseCreateParams, 'createdBy' | 'groupId' | 'purchaseDate'> & {
    purchaseDate: DateString;
    userGroupIds: Array<UserGroupModel['id']>;
  };
}

export interface ExpenseEditRequest extends GroupLoggedInRequest {
  body: {
    name?: ExpenseModel['name'];
    amount?: ExpenseModel['amount'];
    description?: ExpenseModel['description'];
    purchaseDate?: DateString;
    categoryId?: ExpenseCategoryModel['id'];
    userGroupIds: Array<UserGroupModel['id']>;
    // todo: edit splitMethod
  };
  params: {
    id: NumberString;
  };
}

export interface ExpenseDeleteRequest extends GroupLoggedInRequest {
  params: {
    id: NumberString;
  };
}
