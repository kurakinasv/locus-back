import { isAfter, isToday } from 'date-fns';
import { Response, NextFunction } from 'express';
import { Op, WhereOptions } from 'sequelize';

import { HTTPStatusCodes } from 'config/status-codes';
import { GroupLoggedInRequest } from 'controllers/group';
import { ScheduleDateService } from 'controllers/scheduleDate';
import { ApiError } from 'middleware/error';
import ChoreModel from 'models/chore.model';
import UserGroupModel from 'models/user-group.model';
import ScheduleModel, { ScheduleCreateParams } from 'models/schedule.model';

import ScheduleService from './schedule.service';
import {
  ScheduleCreateRequest,
  ScheduleEditRequest,
  ScheduleGetRequest,
  SchedulesGetRequest,
} from './types';
import { setEndOfDay } from 'utils/date';

class ScheduleController {
  // GET /api/schedule/schedule
  /** Get schedule by id */
  getSchedule = async (req: ScheduleGetRequest, res: Response, next: NextFunction) => {
    try {
      const scheduleId = req.params.id;
      const groupId = req.currentGroup?.id;

      if (!scheduleId) {
        return next(ApiError.badRequest('Не передан id расписания'));
      }

      const schedule = await ScheduleModel.findOne({
        where: { id: scheduleId },
        include: [{ model: ChoreModel, attributes: ['groupId'] }],
      });

      if (!schedule || schedule.chore.groupId !== groupId) {
        return next(ApiError.notFound('Расписание не найдено'));
      }

      res.status(HTTPStatusCodes.OK).json(schedule);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getSchedule: ${err.message}`));
      }
    }
  };

  // GET /api/schedule/schedules
  /**
   * @description Get all scheduled tasks for this group (with search and filter)
   * @returns Created schedule and all the scheduled tasks in current group
   * */
  getSchedules = async (req: SchedulesGetRequest, res: Response, next: NextFunction) => {
    try {
      const groupId = req.currentGroup?.id;
      const { from, to, name } = req.query;

      // The end date of the repeating elements of the schedule is in the range from dateFrom to dateTo
      const filterParams: WhereOptions = {
        dateEnd: from && to ? { [Op.between]: [from, setEndOfDay(to)] } : undefined,
      };

      if (!from || !to) {
        delete filterParams.dateEnd;
      }

      const attributes = ['groupId'];
      if (name) {
        attributes.push('name');
      }

      const choreNamesSearch = [{ model: ChoreModel, attributes }];

      // Search schedules in group by chore name and filter by end date
      const schedules = await ScheduleModel.findAll({
        where: filterParams,
        include: choreNamesSearch,
      });

      const schedulesWithChoreName = name
        ? schedules.filter(
            (schedule) =>
              schedule.chore.groupId === groupId && schedule.chore.name.toLowerCase().includes(name)
          )
        : schedules.filter((schedule) => schedule.chore.groupId === groupId);

      if (
        !schedulesWithChoreName ||
        !schedulesWithChoreName.every((s) => s.chore?.groupId === groupId)
      ) {
        return next(ApiError.badRequest('Расписание задач по такому запросу не найдено'));
      }

      if (!schedulesWithChoreName.length) {
        return res.status(HTTPStatusCodes.OK).json([]);
      }

      // Take all scheduled tasks from found schedules
      const scheduleDates = await ScheduleDateService.getScheduleDates({
        scheduleIds: schedulesWithChoreName.map((schedule) => schedule.id),
      });

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

      if (!(choreId && dateStart && userGroupIds)) {
        return next(ApiError.badRequest('Не переданы обязательные параметры'));
      }

      const createdByUserGroup = await UserGroupModel.findOne({ where: { userId: createdBy } });

      if (!createdByUserGroup) {
        return next(ApiError.badRequest('Не передан id создателя'));
      }

      const choreExists = await ChoreModel.findOne({ where: { id: choreId, groupId } });

      if (!choreExists) {
        return next(ApiError.badRequest('Задача не найдена'));
      }

      const createParams: ScheduleCreateParams = {
        choreId,
        dateStart: setEndOfDay(dateStart),
        dateEnd: setEndOfDay(dateEnd || dateStart),
        frequency,
        alternatingMethod,
        userGroupIds,
        createdBy: createdByUserGroup.id,
      };

      const result = await ScheduleService.checkIfUsersInGroup(userGroupIds, groupId);

      if (result !== true) {
        return next(ApiError.badRequest(result.error));
      }

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
      if (alternatingMethod && alternatingMethod === 'anyone') {
        return next(ApiError.badRequest('Данный метод чередования пока не поддерживается'));
      }

      const schedule = await ScheduleModel.create(createParams);

      if (!schedule) {
        return next(ApiError.badRequest('Не удалось создать расписание'));
      }

      // Create schedule dates
      const created = await ScheduleDateService.createScheduleDates(schedule);

      if (!created) {
        return next(ApiError.badRequest('Не удалось создать запланированные задачи'));
      }

      const schedules = await ScheduleModel.findAll({
        include: [{ model: ChoreModel, attributes: ['groupId'] }],
      });

      const groupSchedules = schedules.filter((s) => s.chore.groupId === groupId);

      const allScheduledTasks = await ScheduleDateService.getScheduleDates({
        scheduleIds: groupSchedules.map((s) => s.id),
      });

      res.status(HTTPStatusCodes.CREATED).json({ schedule, tasks: allScheduledTasks });
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

      if (schedule.isArchived) {
        return next(ApiError.badRequest('Расписание архивировано и не может быть изменено'));
      }

      console.log('dateEnd', dateEnd, new Date());
      if (dateEnd && new Date(dateEnd) < new Date()) {
        return next(ApiError.badRequest('Дата окончания не может быть меньше текущей даты'));
      }

      // Get all scheduled tasks for this schedule from today
      const scheduleDates = await ScheduleDateService.getScheduleDates({
        scheduleIds: [schedule.id],
        onlyFromToday: true,
      });

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
      const edited = await ScheduleDateService.createScheduleDates(editedSchedule, true);

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

  // PUT /api/schedule/schedule/:id
  /** Delete all not completed scheduled task from today and archives schedule */
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

      const scheduleDates = await ScheduleDateService.getScheduleDates({
        scheduleIds: [schedule.id],
      });

      if (!scheduleDates) {
        return next(ApiError.badRequest('Не удалось найти запланированные задачи'));
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

      await ScheduleDateService.getScheduleDates({ scheduleIds: [schedule.id] });

      await schedule.update({ isArchived: true });

      res.status(HTTPStatusCodes.OK).json({ message: 'Расписание успешно архивировано' });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`deleteSchedule: ${err.message}`));
      }
    }
  };

  /** Delete schedule and ALL scheduled task */
  deleteScheduleCascade = async (req: GroupLoggedInRequest, res: Response, next: NextFunction) => {
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

      if (!schedule || schedule.chore.groupId !== groupId) {
        return next(ApiError.badRequest('Расписание не найдено'));
      }

      await schedule.destroy();

      res.status(HTTPStatusCodes.OK).json({ message: 'Расписание успешно удалено' });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`deleteScheduleCascade: ${err.message}`));
      }
    }
  };
}

export default new ScheduleController();
