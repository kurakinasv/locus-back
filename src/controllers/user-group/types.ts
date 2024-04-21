import { AuthUserRequest } from 'controllers/auth';
import UserGroupModel from 'models/user-group.model';
import { DefaultId } from 'typings/common';

export interface UserGroupJoinRequest extends AuthUserRequest {
  body: {
    groupId: DefaultId;
  };
}

export interface UserGroupEditRequest extends AuthUserRequest {
  body: {
    groupId: DefaultId;
    isAdmin?: UserGroupModel['isAdmin'];
    debtAmount?: UserGroupModel['debtAmount'];
  };
}

export interface UserGroupLeaveRequest extends AuthUserRequest {
  body: {
    groupId: DefaultId;
  };
}
