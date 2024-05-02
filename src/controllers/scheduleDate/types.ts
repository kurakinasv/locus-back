import { GroupLoggedInRequest } from 'controllers/group/types';

import ScheduleDateModel from 'models/scheduleDate.model';
import ScheduleModel from 'models/schedule.model';
import { DateString } from 'typings/common';

export interface SchedulesGetParams {
  scheduleIds: Array<ScheduleModel['id']>;
  onlyFromToday?: boolean;
  onlyCompleted?: boolean;
}

export interface ScheduleDateEditParams {
  /** Whether user mark this task as completed or not */
  completed?: ScheduleDateModel['completed'];

  /** Date and time when this task was completed */
  completedAt?: ScheduleDateModel['completedAt'];

  /** Is this task assigned to a specific user */
  isAssigned?: ScheduleDateModel['isAssigned'];
}

export interface ScheduleDateEditRequest extends GroupLoggedInRequest {
  body: {
    /** Whether user mark this task as completed or not */
    completed?: boolean;

    /** Date and time when this task was completed */
    completedAt?: DateString | null;

    /** Is this task assigned to a specific user */
    isAssigned?: ScheduleDateModel['isAssigned'];
  };
}
