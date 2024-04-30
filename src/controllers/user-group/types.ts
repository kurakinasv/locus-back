import { AuthUserRequest } from 'controllers/auth';
import UserGroupModel from 'models/user-group.model';
import { UUIDString } from 'typings/common';

export interface UserGroupJoinRequest extends AuthUserRequest {
  body: {
    groupId: UUIDString;
  };
}

export interface UserGroupEditRequest extends AuthUserRequest {
  body: {
    groupId: UUIDString;
    isAdmin?: UserGroupModel['isAdmin'];
    debtAmount?: UserGroupModel['debtAmount'];
  };
}

export interface UserGroupLeaveRequest extends AuthUserRequest {
  body: {
    groupId: UUIDString;
  };
}
