import { AuthUserRequest } from 'controllers/auth';
import Group from 'models/group.model';
import { DefaultId } from 'typings/common';

export interface GroupGetRequest extends AuthUserRequest {
  body: {
    id: DefaultId;
  };
}

export interface GroupCreateRequest extends AuthUserRequest {
  body: {
    name: Group['name'];
    image?: Group['image'];
  };
}

export interface GroupEditRequest extends AuthUserRequest {
  body: {
    id: DefaultId;
    name?: Group['name'];
    image?: Group['image'];
  };
}

export interface GroupDeleteRequest extends AuthUserRequest {
  body: {
    id: DefaultId;
  };
}
