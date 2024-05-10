import { AuthUserRequest } from 'controllers/auth';
import { FileArray } from 'express-fileupload';
import Group, { GroupCreateParams } from 'models/group.model';
import { UUIDString } from 'typings/common';

export interface GroupLoggedInRequest extends AuthUserRequest {
  currentGroup?: {
    id: UUIDString;
  };
}

export interface GroupGetRequest extends AuthUserRequest {
  query: {
    id: UUIDString;
  };
}

export interface GroupCreateRequest extends AuthUserRequest {
  body: GroupCreateParams;
}

export interface GroupEditRequest extends GroupLoggedInRequest {
  body: {
    name?: Group['name'];
    image?: Group['image'];
  };
  files?: FileArray | null;
}
