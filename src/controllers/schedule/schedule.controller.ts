import { isAfter, isToday } from 'date-fns';
import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';

import { HTTPStatusCodes } from 'config/status-codes';
import { GroupLoggedInRequest } from 'controllers/group';
import { ScheduleDateService } from 'controllers/scheduleDate';
import { ApiError } from 'middleware/error';
import ChoreModel from 'models/chore.model';
import ScheduleModel, { ScheduleCreateParams } from 'models/schedule.model';

import ScheduleService from './schedule.service';
import { ScheduleCreateRequest, ScheduleEditRequest, SchedulesGetRequest } from './types';

class ScheduleController {
  // GET /api/schedule/schedules
  getSchedules = async (req: SchedulesGetRequest, res: Response, next: NextFunction) => {
    try {
      const groupId = req.currentGroup?.id;
      const { dateFrom, dateTo, name } = req.query;

      // The end date of the repeating elements of the schedule is in the range from dateFrom to dateTo
      const filterParams = {
        groupId,
        dateEnd: dateFrom && dateTo ? { [Op.between]: [dateFrom, dateTo] } : undefined,
      };

      if (!dateFrom || !dateTo) {
        delete filterParams.dateEnd;
      }

      const choreNamesSearch = name ? [{ model: ChoreModel, attributes: ['name'] }] : [];

      // Search schedules in group by chore name and filter by end date
      const schedulesWithChoreName = await ScheduleModel.findAll({
        where: filterParams,
        include: choreNamesSearch,
      });

      console.log('schedulesWithChoreName', schedulesWithChoreName.length, schedulesWithChoreName);

      if (!schedulesWithChoreName) {
        return next(ApiError.badRequest('Расписание задач по такому запросу не найдено'));
      }

      // Take all scheduled tasks from found schedules
      const scheduleDates = await ScheduleDateService.getScheduleDates(
        { scheduleIds: schedulesWithChoreName.map((schedule) => schedule.id) },
        next
      );

      res.status(HTTPStatusCodes.OK).json(scheduleDates);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getSchedules: ${err.message}`));
      }
    }
  };

  // POST /api/schedule/schedule
  createSchedule = async (req: ScheduleCreateRequest, res: Response, next: NextFunction) => {
    try {
      const { choreId, dateStart, dateEnd, frequency, alternatingMethod, userGroupIds } = req.body;
      const groupId = req.currentGroup?.id;
      const createdBy = req.user?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      if (!createdBy) {
        return next(ApiError.badRequest('Не передан id создателя'));
      }

      const createParams: ScheduleCreateParams = {
        choreId,
        dateStart: new Date(dateStart),
        dateEnd: new Date(dateEnd || dateStart),
        frequency,
        alternatingMethod,
        userGroupIds,
        createdBy,
      };

      await ScheduleService.checkIfUsersInGroup(userGroupIds, groupId, next);

      // If frequency is 'never', then dateStart and dateEnd should be equal
      if (frequency === 'never' && !dateEnd) {
        delete createParams.alternatingMethod;
      }

      // If alternatingMethod is 'single', then pass only one task performer
      if (alternatingMethod && alternatingMethod === 'single') {
        createParams.userGroupIds = [userGroupIds[0]];
      }

      // todo: implement custom frequency
      if (frequency === 'custom') {
        return next(ApiError.badRequest('Данный тип частоты пока не поддерживается'));
      }

      // todo: implement anyone alternating method
      if (alternatingMethod && alternatingMethod !== 'anyone') {
        return next(ApiError.badRequest('Данный метод чередования пока не поддерживается'));
      }

      const schedule = await ScheduleModel.create(createParams);

      if (!schedule) {
        return next(ApiError.badRequest('Не удалось создать расписание'));
      }

      // Create schedule dates
      const created = await ScheduleDateService.createScheduleDates(schedule, next);

      if (!created) {
        return next(ApiError.badRequest('Не удалось создать запланированные задачи'));
      }

      res.status(HTTPStatusCodes.CREATED).json(schedule);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`createSchedule: ${err.message}`));
      }
    }
  };

  // PUT /api/schedule/schedule/:id
  editSchedule = async (req: ScheduleEditRequest, res: Response, next: NextFunction) => {
    try {
      const { dateEnd, alternatingMethod, userGroupIds } = req.body;
      const { id } = req.params;
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      // Seacrh schedule by its id with groupId column
      const schedule = await ScheduleModel.findOne({
        where: { id },
        include: [{ model: ChoreModel, attributes: ['groupId'] }],
      });
      console.log('editSChedule schedule', schedule, schedule?.chore.groupId);

      if (!schedule || schedule.chore.groupId !== groupId) {
        return next(ApiError.badRequest('Расписание не найдено'));
      }

      console.log('dateEnd', dateEnd, new Date());
      if (dateEnd && new Date(dateEnd) < new Date()) {
        return next(ApiError.badRequest('Дата окончания не может быть меньше текущей даты'));
      }

      // Get all scheduled tasks for this schedule from today
      const scheduleDates = await ScheduleDateService.getScheduleDates(
        {
          scheduleIds: [schedule.id],
          onlyFromToday: true,
        },
        next
      );

      if (!scheduleDates) {
        return next(ApiError.badRequest('Не удалось найти запланированные задачи'));
      }

      // Delete all not completed scheduled tasks from today for this schedule
      for (const scheduleDate of scheduleDates) {
        if (scheduleDate.completed === false) {
          console.log('destroy scheduleDate', scheduleDate);
          await scheduleDate.destroy();
          return;
        }
        console.log('not destroy scheduleDate', scheduleDate);
      }

      // Edit schedule
      const editedSchedule = await schedule.update({
        dateEnd: dateEnd ? new Date(dateEnd) : undefined,
        alternatingMethod,
        userGroupIds,
      });

      if (!editedSchedule) {
        return next(ApiError.badRequest('Не удалось изменить расписание'));
      }

      // Create new schedule dates from today (without editing completed tasks)
      const edited = await ScheduleDateService.createScheduleDates(editedSchedule, next, true);

      if (!edited) {
        return next(ApiError.badRequest('Не удалось изменить расписание'));
      }

      res.status(HTTPStatusCodes.OK).json(editedSchedule);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`editSchedule: ${err.message}`));
      }
    }
  };

  // DELETE /api/schedule/schedule/:id
  deleteSchedule = async (req: GroupLoggedInRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      // Seacrh schedule by its id with groupId column
      const schedule = await ScheduleModel.findOne({
        where: { id },
        include: [{ model: ChoreModel, attributes: ['groupId'] }],
      });
      console.log('deleteSchedule schedule', schedule, schedule?.chore.groupId);

      if (!schedule || schedule.chore.groupId !== groupId) {
        return next(ApiError.badRequest('Расписание не найдено'));
      }

      // todo: check initial schedule dates
      const initialScheduleDates = await ScheduleDateService.getScheduleDates(
        {
          scheduleIds: [schedule.id],
        },
        next
      );
      console.log('deleteSchedule initialScheduleDates', initialScheduleDates?.length);

      await schedule.destroy();

      // todo: check schedule dates after deletion
      const scheduleDates = await ScheduleDateService.getScheduleDates(
        {
          scheduleIds: [schedule.id],
        },
        next
      );
      console.log('deleteSchedule initial scheduleDates', scheduleDates?.length);

      if (initialScheduleDates?.length !== scheduleDates?.length) {
        return next(
          ApiError.badRequest('При удалении расписания были удалены запланированные задачи')
        );
      }

      if (!scheduleDates) {
        console.error('no scheduleDates');

        return;
      }

      // Delete all not completed schedule dates from today
      for (const scheduleDate of scheduleDates) {
        if (
          (isToday(scheduleDate.date) || isAfter(scheduleDate.date, new Date())) &&
          !scheduleDate.completed
        ) {
          await scheduleDate.destroy();
        }
      }

      res.status(HTTPStatusCodes.OK).json({ message: 'Расписание успешно удалено' });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`deleteSchedule: ${err.message}`));
      }
    }
  };
}

export default new ScheduleController();
