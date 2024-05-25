import { GroupLoggedInRequest } from 'controllers/group/types';

import ChoreModel from 'models/chore.model';

import { UUIDString, DefaultId, NumberString } from 'typings/common';

export interface ChoreGetRequest extends GroupLoggedInRequest {
  params: {
    id: NumberString;
  };
}

export interface ChoresGetRequest extends GroupLoggedInRequest {
  body: {
    groupId: UUIDString;
  };
  query: {
    name?: ChoreModel['name'];
    categoryId?: NumberString;
  };
}

export interface ChoreCreateRequest extends GroupLoggedInRequest {
  body: {
    categoryId: DefaultId;
    name: ChoreModel['name'];
    points?: ChoreModel['points'];
  };
}

export interface ChoreEditRequest extends GroupLoggedInRequest {
  body: {
    categoryId?: DefaultId;
    name?: ChoreModel['name'];
    points?: ChoreModel['points'];
    isArchived?: ChoreModel['isArchived'];
  };
  params: {
    id: NumberString;
  };
}

export interface ChoreDeleteRequest extends GroupLoggedInRequest {
  params: {
    id: NumberString;
  };
}
