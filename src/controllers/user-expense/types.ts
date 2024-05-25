import { GroupLoggedInRequest } from 'controllers/group';
import UserGroup from 'models/user-group.model';
import { NumberString } from 'typings/common';

export interface UserExpenseDebtRequest extends GroupLoggedInRequest {
  params: {
    id: NumberString;
  };
  body: {
    userGroupId: UserGroup['id'];
    amountToPay: number;
  };
}
