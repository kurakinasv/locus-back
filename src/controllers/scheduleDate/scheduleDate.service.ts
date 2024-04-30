import { NextFunction } from 'express';
import { Op, WhereOptions } from 'sequelize';

import ScheduleService from 'controllers/schedule/schedule.service';
import { ApiError } from 'middleware/error';
import ScheduleModel from 'models/schedule.model';
import ScheduleDateModel, { ScheduleDateCreateParams } from 'models/scheduleDate.model';

import { SchedulesGetParams } from './types';

class ScheduleDateService {
  static getScheduleDates = async (
    { scheduleIds, onlyFromToday = false, onlyCompleted = false }: SchedulesGetParams,
    next: NextFunction
  ) => {
    try {
      const whereOptions: WhereOptions = {
        scheduleIds,
        date: { [Op.gte]: new Date() },
        completed: true,
      };

      if (!onlyFromToday) {
        delete whereOptions.date;
      }

      if (!onlyCompleted) {
        delete whereOptions.completed;
      }

      const scheduleDates = await ScheduleDateModel.findAll({ where: whereOptions });

      console.log('getScheduleDates sheduleDates', scheduleDates.length, scheduleDates);

      return scheduleDates;
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getScheduleDates: ${err.message}`));
      }
    }
  };

  static createScheduleDate = async (data: ScheduleDateCreateParams, next: NextFunction) => {
    try {
      const scheduleDate = await ScheduleDateModel.create(data);

      if (!scheduleDate) {
        return next(ApiError.badRequest('Не удалось создать запланированную задачу'));
      }

      return scheduleDate;
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`createScheduleDate: ${err.message}`));
      }
    }
  };

  static createScheduleDates = async (
    schedule: ScheduleModel,
    next: NextFunction,
    skipCompleted = false
  ) => {
    try {
      const { id, userGroupIds, frequency, dateStart, dateEnd } = schedule;

      let completedScheduleDates = [] as ScheduleDateModel[];

      if (skipCompleted) {
        completedScheduleDates =
          (await ScheduleDateService.getScheduleDates(
            { scheduleIds: [id], onlyCompleted: true, onlyFromToday: true },
            next
          )) ?? [];

        console.log('completedScheduleDates', completedScheduleDates);
      }

      let currentUserGroupIdIndex = 0;

      for (
        let currentDate = new Date(dateStart);
        currentDate <= new Date(dateEnd || dateStart);
        // Count from each iteration start date
        currentDate = ScheduleService.getNextDateByFrequency(currentDate, frequency)
      ) {
        if (skipCompleted) {
          completedScheduleDates.findIndex((task) => {
            console.log(
              'completedScheduleDates find',
              task.date,
              currentDate,
              task.date === currentDate
            );

            return (
              task.userGroupId === userGroupIds[currentUserGroupIdIndex] &&
              task.date === currentDate
            );
          });
        }

        const scheduleDate = await ScheduleDateService.createScheduleDate(
          {
            date: currentDate,
            scheduleId: id,
            userGroupId: userGroupIds[currentUserGroupIdIndex],
          },
          next
        );
        console.log('new scheduleDate', scheduleDate);

        if (frequency === 'never') {
          break;
        }

        // Calculate index of next user in group for next iteration
        currentUserGroupIdIndex = (currentUserGroupIdIndex + 1) % userGroupIds.length;
      }

      return true;
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`_createScheduleDates: ${err.message}`));
      }

      return false;
    }
  };
}

export default ScheduleDateService;
