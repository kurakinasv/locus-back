import { GroupLoggedInRequest } from 'controllers/group';
import { NumberString } from 'typings/common';

export interface NotificationMarkAsReadRequest extends GroupLoggedInRequest {
  params: {
    id: NumberString;
  };
}
