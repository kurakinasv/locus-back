import { GroupLoggedInRequest } from 'controllers/group/types';

import ChoreModel from 'models/chore.model';
import ScheduleModel, { ScheduleCreateParams } from 'models/schedule.model';

import { UUIDString, DateString, NumberString } from 'typings/common';

export interface SchedulesGetRequest extends GroupLoggedInRequest {
  body: {
    groupId: UUIDString;
  };
  query: {
    name?: ChoreModel['name'];
    dateFrom?: DateString; // first day of the period
    dateTo?: DateString; // last day of the period
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
