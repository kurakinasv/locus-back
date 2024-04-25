import { AuthUserRequest } from 'controllers/auth';

import ChoreModel from 'models/chore.model';

import { DefaultId } from 'typings/common';

export interface ChoreGetRequest extends AuthUserRequest {
  body: {
    groupId: DefaultId;
  };
  query: {
    name?: ChoreModel['name'];
    categoryId?: DefaultId;
  };
}

export interface ChoreCreateRequest extends AuthUserRequest {
  body: {
    groupId: DefaultId;
    categoryId: DefaultId;
    name: ChoreModel['name'];
    points?: ChoreModel['points'];
  };
}

export interface ChoreEditRequest extends AuthUserRequest {
  body: {
    categoryId?: DefaultId;
    name?: ChoreModel['name'];
    points?: ChoreModel['points'];
  };
  params: {
    id: DefaultId;
  };
}

export interface ChoreDeleteRequest extends AuthUserRequest {
  params: {
    id: DefaultId;
  };
}
