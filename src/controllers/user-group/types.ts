import { AuthUserRequest } from 'controllers/auth';
import { GroupLoggedInRequest } from 'controllers/group';
import GroupModel from 'models/group.model';
import UserGroupModel from 'models/user-group.model';
import { UUIDString } from 'typings/common';

export interface UserGroupLoginRequest extends AuthUserRequest {
  body: {
    groupId: UUIDString;
  };
}

export interface UserGroupJoinRequest extends AuthUserRequest {
  body: {
    code: GroupModel['inviteCode'];
  };
}

export interface UserGroupEditRequest extends AuthUserRequest {
  body: {
    groupId: UUIDString;
    isAdmin?: UserGroupModel['isAdmin'];
    debtAmount?: UserGroupModel['debtAmount'];
  };
}

export interface UserGroupLeaveRequest extends GroupLoggedInRequest {}
