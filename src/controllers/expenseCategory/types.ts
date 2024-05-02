import { GroupLoggedInRequest } from 'controllers/group';
import ExpenseCategory, { ExpenseCategoryCreateParams } from 'models/expenseCategory.model';
import { NumberString } from 'typings/common';

export interface ExpenseCategoryCreateRequest extends GroupLoggedInRequest {
  body: ExpenseCategoryCreateParams;
}

export interface ExpenseCategoryEditRequest extends GroupLoggedInRequest {
  body: {
    name?: ExpenseCategory['name'];
    icon?: ExpenseCategory['icon'];
    isArchived?: ExpenseCategory['isArchived'];
  };
  params: {
    id: NumberString;
  };
}

export interface ExpenseCategoryDeleteRequest extends GroupLoggedInRequest {
  params: {
    id: NumberString;
  };
}
