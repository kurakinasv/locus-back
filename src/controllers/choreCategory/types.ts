import { AuthUserRequest } from 'controllers/auth';
import ChoreCategoryModel from 'models/choreCategory.model';
import { DefaultId } from 'typings/common';

export interface ChoreCategoryGetRequest extends AuthUserRequest {
  body: {
    groupId: DefaultId;
  };
}

export interface ChoreCategoryCreateRequest extends AuthUserRequest {
  body: {
    groupId: DefaultId;
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
    id: DefaultId;
  };
}

export interface ChoreCategoryDeleteRequest extends AuthUserRequest {
  params: {
    id: DefaultId;
  };
}
