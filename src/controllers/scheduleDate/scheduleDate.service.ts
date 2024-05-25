import { Op, WhereOptions } from 'sequelize';

import ScheduleService from 'controllers/schedule/schedule.service';
import { ApiError } from 'middleware/error';
import ScheduleModel from 'models/schedule.model';
import ScheduleDate from 'models/scheduleDate.model';
import ScheduleDateModel, { ScheduleDateCreateParams } from 'models/scheduleDate.model';
import { setEndOfDay } from 'utils/date';

import { SchedulesGetParams } from './types';

class ScheduleDateService {
  static getScheduleDates = async ({
    scheduleIds,
    onlyFromToday = false,
    onlyCompleted = false,
  }: SchedulesGetParams): Promise<ScheduleDate[] | undefined> => {
    try {
      const whereOptions: WhereOptions = {
        scheduleId: scheduleIds,
        date: { [Op.gte]: new Date() },
        completed: true,
      };

      if (!onlyFromToday) {
        delete whereOptions.date;
      }

      if (!onlyCompleted) {
        delete whereOptions.completed;
      }

      const scheduleDatesOrdered = await ScheduleDateModel.findAll({
        where: whereOptions,
        include: [{ model: ScheduleModel, attributes: ['choreId'] }],
        order: [['date', 'DESC']],
      });

      console.log(
        'scheduleDatesOrdered',
        scheduleDatesOrdered.map((s) => [s.id, s.date])
      );

      return scheduleDatesOrdered;
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
        return;
      }
    }
  };

  static createScheduleDate = async (data: ScheduleDateCreateParams) => {
    try {
      const scheduleDate = await ScheduleDateModel.create(data);

      if (!scheduleDate) {
        return { error: 'Не удалось создать запланированную задачу' };
      }

      return scheduleDate;
    } catch (err) {
      if (err instanceof Error) {
        ApiError.badRequest(`createScheduleDate: ${err.message}`);
      }
    }
  };

  static createScheduleDates = async (schedule: ScheduleModel, skipCompleted = false) => {
    try {
      const { id, userGroupIds, frequency, dateStart, dateEnd } = schedule;

      let completedScheduleDates = [] as ScheduleDateModel[];

      if (skipCompleted) {
        completedScheduleDates =
          (await ScheduleDateService.getScheduleDates({
            scheduleIds: [id],
            onlyCompleted: true,
            onlyFromToday: true,
          })) ?? [];

        console.log('completedScheduleDates', completedScheduleDates);
      }

      let currentUserGroupIdIndex = 0;

      const endOfDayOfEndDate = setEndOfDay(new Date(dateEnd || dateStart).toISOString());

      for (
        let currentDate = setEndOfDay(dateStart.toISOString());
        currentDate <= endOfDayOfEndDate;
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

        const scheduleDate = await ScheduleDateService.createScheduleDate({
          date: currentDate,
          scheduleId: id,
          userGroupId: userGroupIds[currentUserGroupIdIndex],
        });

        if (scheduleDate && 'error' in scheduleDate) {
          return { error: scheduleDate.error };
        }

        if (frequency === 'never') {
          break;
        }

        // Calculate index of next user in group for next iteration
        currentUserGroupIdIndex = (currentUserGroupIdIndex + 1) % userGroupIds.length;
      }

      const taskWithChoreId = await ScheduleDateService.getOrderedTasksWithChoreId([id]);

      return taskWithChoreId;
    } catch (err) {
      if (err instanceof Error) {
        ApiError.badRequest(`createScheduleDates: ${err.message}`);
      }

      return false;
    }
  };

  static getOrderedTasksWithChoreId = async (
    scheduleIds?: ScheduleModel['id'][],
    whereOpts?: WhereOptions
  ) => {
    const whereOptions: WhereOptions = {
      scheduleId: scheduleIds,
      ...whereOpts,
    };

    return await ScheduleDateModel.findAll({
      where: whereOptions,
      include: [{ model: ScheduleModel, attributes: ['choreId'] }],
      order: [['date', 'DESC']],
    });
  };
}

export default ScheduleDateService;
