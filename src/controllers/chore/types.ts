import { AuthUserRequest } from 'controllers/auth';

import ChoreModel from 'models/chore.model';

import { UUIDString, DefaultId, NumberString } from 'typings/common';

export interface ChoreGetRequest extends AuthUserRequest {
  body: {
    groupId: UUIDString;
  };
  query: {
    name?: ChoreModel['name'];
    categoryId?: NumberString;
  };
}

export interface ChoreCreateRequest extends AuthUserRequest {
  body: {
    groupId: UUIDString;
    categoryId: DefaultId;
    name: ChoreModel['name'];
    points?: ChoreModel['points'];
  };
}

export interface ChoreEditRequest extends AuthUserRequest {
  body: {
    groupId: UUIDString;
    categoryId?: DefaultId;
    name?: ChoreModel['name'];
    points?: ChoreModel['points'];
  };
  params: {
    id: NumberString;
  };
}

export interface ChoreDeleteRequest extends AuthUserRequest {
  body: {
    groupId: UUIDString;
  };
  params: {
    id: NumberString;
  };
}
