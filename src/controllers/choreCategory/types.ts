import { AuthUserRequest } from 'controllers/auth';
import ChoreCategoryModel from 'models/choreCategory.model';
import { NumberString, UUIDString } from 'typings/common';

export interface ChoreCategoryGetRequest extends AuthUserRequest {
  body: {
    groupId: UUIDString;
  };
}

export interface ChoreCategoryCreateRequest extends AuthUserRequest {
  body: {
    groupId: UUIDString;
    name: ChoreCategoryModel['name'];
  };
}

export interface ChoreCategoryEditRequest extends AuthUserRequest {
  body: {
    name?: ChoreCategoryModel['name'];
    icon?: ChoreCategoryModel['icon'];
    isArchived?: ChoreCategoryModel['isArchived'];
  };
  params: {
    id: NumberString;
  };
}

export interface ChoreCategoryDeleteRequest extends AuthUserRequest {
  params: {
    id: NumberString;
  };
}
