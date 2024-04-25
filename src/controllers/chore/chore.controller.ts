import { Request, Response, NextFunction } from 'express';

import { HTTPStatusCodes } from 'config/status-codes';
import { ApiError } from 'middleware/error';
import ChoreModel from 'models/chore.model';

import { ChoreCreateRequest, ChoreEditRequest, ChoreGetRequest } from './types';

class ChoreController {
  // GET /api/chore/chores
  getChores = async (req: ChoreGetRequest, res: Response, next: NextFunction) => {
    try {
      const { groupId } = req.body;
      const { categoryId, name } = req.query;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      const chores = await ChoreModel.findAll({ where: { groupId, categoryId } });

      if (!chores) {
        return next(
          ApiError.badRequest(`Не найдено ни одной задачи${categoryId ? ' в категории' : ''}`)
        );
      }

      const searchedByName = name?.trim()
        ? chores.filter((chore) => chore.name.includes(name.trim()))
        : chores;

      res.status(HTTPStatusCodes.OK).json(searchedByName);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getChores: ${err.message}`));
      }
    }
  };

  // POST /api/chore/chore
  createChore = async (req: ChoreCreateRequest, res: Response, next: NextFunction) => {
    try {
      const { groupId, categoryId, name, points } = req.body;

      const trimmedName = name.trim();

      if (!groupId || !categoryId || !trimmedName) {
        return next(ApiError.badRequest('Не переданы все необходимые данные'));
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
      const { name, points, categoryId } = req.body;

      if (!id) {
        return next(ApiError.badRequest('Не передан id задачи'));
      }

      const chore = await ChoreModel.findByPk(id);

      if (!chore) {
        return next(ApiError.badRequest('Задача не найдена'));
      }

      const trimmedName = name?.trim();

      chore.name = trimmedName ?? chore.name;
      chore.points = points ?? chore.points;
      chore.categoryId = categoryId ?? chore.categoryId;

      await chore.save();

      res.status(HTTPStatusCodes.OK).json(chore);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`updateChore: ${err.message}`));
      }
    }
  };

  // DELETE /api/chore/chore/:id
  deleteChore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!id) {
        return next(ApiError.badRequest('Не передан id задачи'));
      }

      const chore = await ChoreModel.findByPk(id);

      if (!chore) {
        return next(ApiError.badRequest('Задача не найдена'));
      }

      // todo: archive chore if there are/were scheduled tasks

      await chore.destroy();

      res.status(HTTPStatusCodes.OK).json(chore);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`deleteChore: ${err.message}`));
      }
    }
  };
}

export default new ChoreController();
