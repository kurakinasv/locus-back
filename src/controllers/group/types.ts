import { AuthUserRequest } from 'controllers/auth';
import Group, { GroupCreateParams } from 'models/group.model';
import { UUIDString } from 'typings/common';

export interface GroupLoggedInRequest extends AuthUserRequest {
  currentGroup?: {
    id: UUIDString;
  };
}

export interface GroupGetRequest extends AuthUserRequest {
  body: {
    id: UUIDString;
  };
}

export interface GroupCreateRequest extends AuthUserRequest {
  body: GroupCreateParams;
}

export interface GroupEditRequest extends AuthUserRequest {
  body: {
    id: UUIDString;
    name?: Group['name'];
    image?: Group['image'];
  };
}

export interface GroupDeleteRequest extends AuthUserRequest {
  body: {
    id: UUIDString;
  };
}
