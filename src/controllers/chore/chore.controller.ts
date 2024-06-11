import { Response, NextFunction } from 'express';

import { NotificationType } from 'config/notifications';
import { HTTPStatusCodes } from 'config/status-codes';
import { NotificationService } from 'controllers/notification';
import { ApiError } from 'middleware/error';
import ChoreModel from 'models/chore.model';
import ChoreCategoryModel from 'models/choreCategory.model';
import UserGroupModel from 'models/user-group.model';

import {
  ChoreCreateRequest,
  ChoreDeleteRequest,
  ChoreEditRequest,
  ChoreGetRequest,
  ChoresGetRequest,
} from './types';

class ChoreController {
  // GET /api/chore/chores
  getChores = async (req: ChoresGetRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const groupId = req.currentGroup?.id;
      const { categoryId, name } = req.query;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      const userInGroup = await UserGroupModel.findOne({ where: { userId, groupId } });

      if (!userInGroup) {
        return next(ApiError.forbidden('Пользователь не состоит в группе'));
      }

      const filterParams = { groupId, categoryId };

      if (!categoryId) {
        delete filterParams.categoryId;
      }

      const chores = await ChoreModel.findAll({ where: filterParams });

      if (!chores) {
        return next(
          ApiError.badRequest(`Не найдено ни одной задачи${categoryId ? ' в категории' : ''}`)
        );
      }

      const searchedByName = name?.trim()
        ? chores.filter((chore) => chore.name.toLowerCase().includes(name.trim().toLowerCase()))
        : chores;

      res.status(HTTPStatusCodes.OK).json(searchedByName);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getChores: ${err.message}`));
      }
    }
  };

  // GET /api/chore/chore/:id
  getChore = async (req: ChoreGetRequest, res: Response, next: NextFunction) => {
    try {
      const choreId = req.params.id;
      const groupId = req.currentGroup?.id;

      if (!groupId || !choreId) {
        return next(ApiError.badRequest('Не передан id группы или задачи'));
      }

      const chore = await ChoreModel.findOne({ where: { id: Number(choreId), groupId } });

      if (!chore) {
        return next(ApiError.badRequest(`Не найдено ни одной задачи`));
      }

      res.status(HTTPStatusCodes.OK).json(chore);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getChore: ${err.message}`));
      }
    }
  };

  // POST /api/chore/chore
  createChore = async (req: ChoreCreateRequest, res: Response, next: NextFunction) => {
    try {
      const { categoryId, name, points } = req.body;
      const groupId = req.currentGroup?.id;
      const userId = req.user?.id;

      const trimmedName = name?.trim();

      if (!groupId || !categoryId || !trimmedName || !userId) {
        return next(ApiError.badRequest('Не переданы все необходимые данные'));
      }

      const hasCategory = await ChoreCategoryModel.findOne({ where: { id: categoryId, groupId } });

      if (!hasCategory) {
        return next(ApiError.badRequest('Категория не найдена'));
      }

      const existChore = await ChoreModel.findOne({ where: { name: trimmedName, groupId } });

      if (existChore?.name.trim().toLowerCase() === trimmedName.toLowerCase()) {
        return next(ApiError.badRequest('Задача с таким именем уже существует'));
      }

      const chore = await ChoreModel.create({
        groupId,
        categoryId,
        name: trimmedName,
        points,
      });

      if (!chore) {
        return next(ApiError.badRequest('Не удалось создать задачу'));
      }

      const notificationResult = await NotificationService.sendNotification({
        type: NotificationType.choreCreated,
        groupId,
        userId,
      });

      if ('error' in notificationResult) {
        return next(ApiError.internal(notificationResult.error));
      }

      res.status(HTTPStatusCodes.CREATED).json(chore);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`createChore: ${err.message}`));
      }
    }
  };

  // PUT /api/chore/chore/:id
  editChore = async (req: ChoreEditRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, points, categoryId, isArchived } = req.body;
      const groupId = req.currentGroup?.id;
      const userId = req.user?.id;

      if (!id || !groupId || !userId) {
        return next(ApiError.badRequest('Не передан id задачи или группы'));
      }

      const chore = await ChoreModel.findOne({ where: { id, groupId } });

      if (!chore) {
        return next(ApiError.badRequest('Задача не найдена'));
      }

      const trimmedName = name?.trim();

      if (trimmedName) {
        const existChore = await ChoreModel.findOne({ where: { name: trimmedName, groupId } });

        if (
          existChore?.name.toLowerCase() === trimmedName.toLowerCase() &&
          existChore?.id !== chore.id
        ) {
          return next(ApiError.badRequest('Задача с таким именем уже существует'));
        }
      }

      // todo: create new chore if there are/were scheduled tasks to save history

      chore.name = trimmedName ?? chore.name;
      chore.points = points ?? chore.points;
      chore.categoryId = categoryId ?? chore.categoryId;
      chore.isArchived = isArchived ?? chore.isArchived;

      await chore.save();

      const chores = await ChoreModel.findAll({ where: { groupId } });

      const notificationResult = await NotificationService.sendNotification({
        type: NotificationType.choreCreated,
        groupId,
        userId,
      });

      if ('error' in notificationResult) {
        return next(ApiError.internal(notificationResult.error));
      }

      res.status(HTTPStatusCodes.OK).json(chores);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`updateChore: ${err.message}`));
      }
    }
  };

  // DELETE /api/chore/chore/:id
  deleteChore = async (req: ChoreDeleteRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const groupId = req.currentGroup?.id;
      const userId = req.user?.id;

      if (!id || !groupId || !userId) {
        return next(ApiError.badRequest('Не передан id задачи'));
      }

      const chore = await ChoreModel.findOne({ where: { id, groupId } });

      if (!chore) {
        return next(ApiError.badRequest('Задача не найдена'));
      }

      // todo: archive chore if there are/were scheduled tasks

      await chore.destroy();

      const notificationResult = await NotificationService.sendNotification({
        type: NotificationType.choreCreated,
        groupId,
        userId,
      });

      if ('error' in notificationResult) {
        return next(ApiError.internal(notificationResult.error));
      }

      res.status(HTTPStatusCodes.OK).json({ message: 'Задача удалена' });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`deleteChore: ${err.message}`));
      }
    }
  };
}

export default new ChoreController();
