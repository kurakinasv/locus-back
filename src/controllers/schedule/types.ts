import { GroupLoggedInRequest } from 'controllers/group/types';

import ChoreModel from 'models/chore.model';
import ScheduleModel, { ScheduleCreateParams } from 'models/schedule.model';

import { UUIDString, DateString, NumberString } from 'typings/common';

export interface ScheduleGetRequest extends GroupLoggedInRequest {
  params: {
    id: NumberString;
  };
}

export interface SchedulesGetRequest extends GroupLoggedInRequest {
  body: {
    groupId: UUIDString;
  };
  query: {
    name?: ChoreModel['name'];
    from?: DateString; // first day of the period
    to?: DateString; // last day of the period
  };
}

export interface ScheduleCreateRequest extends GroupLoggedInRequest {
  body: ScheduleCreateParams & {
    dateStart: DateString;
    dateEnd?: DateString;
  };
}

export interface ScheduleEditRequest extends GroupLoggedInRequest {
  body: {
    dateEnd?: DateString;
    alternatingMethod?: ScheduleModel['alternatingMethod'];
    userGroupIds?: ScheduleModel['userGroupIds'];
  };
  params: {
    id: NumberString;
  };
}
