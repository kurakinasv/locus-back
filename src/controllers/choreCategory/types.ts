import { GroupLoggedInRequest } from 'controllers/group/types';
import ChoreCategoryModel from 'models/choreCategory.model';
import { NumberString } from 'typings/common';

export interface ChoreCategoryCreateRequest extends GroupLoggedInRequest {
  body: {
    name: ChoreCategoryModel['name'];
    icon?: ChoreCategoryModel['icon'];
  };
}

export interface ChoreCategoryEditRequest extends GroupLoggedInRequest {
  body: {
    name?: ChoreCategoryModel['name'];
    icon?: ChoreCategoryModel['icon'];
    isArchived?: ChoreCategoryModel['isArchived'];
  };
  params: {
    id: NumberString;
  };
}

export interface ChoreCategoryDeleteRequest extends GroupLoggedInRequest {
  params: {
    id: NumberString;
  };
}
