import { Response, NextFunction } from 'express';

import { HTTPStatusCodes } from 'config/status-codes';
import { ApiError } from 'middleware/error';
import ChoreCategoryModel from 'models/choreCategory.model';

import {
  ChoreCategoryCreateRequest,
  ChoreCategoryDeleteRequest,
  ChoreCategoryEditRequest,
  ChoreCategoryGetRequest,
} from './types';

class ChoreCategoryController {
  // GET /api/chore/category
  getChoreCategories = async (req: ChoreCategoryGetRequest, res: Response, next: NextFunction) => {
    try {
      const { groupId } = req.body;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      const choreCategories = await ChoreCategoryModel.findAll({ where: { groupId } });

      if (!choreCategories) {
        return next(ApiError.badRequest('Не найдено ни одной категории'));
      }

      res.status(HTTPStatusCodes.OK).json(choreCategories);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getChoreCategories: ${err.message}`));
      }
    }
  };

  // POST /api/chore/category
  createChoreCategory = async (
    req: ChoreCategoryCreateRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { groupId, name } = req.body;

      const trimmedName = name.trim();

      if (!groupId || !trimmedName) {
        return next(ApiError.badRequest('Не переданы все необходимые данные'));
      }

      const choreCategory = await ChoreCategoryModel.create({
        groupId,
        name: trimmedName,
      });

      if (!choreCategory) {
        return next(ApiError.badRequest('Не удалось создать категорию'));
      }

      res.status(HTTPStatusCodes.CREATED).json(choreCategory);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`createChoreCategory: ${err.message}`));
      }
    }
  };

  // PUT /api/chore/category/:id
  editChoreCategory = async (req: ChoreCategoryEditRequest, res: Response, next: NextFunction) => {
    try {
      const { name, icon, isArchived } = req.body;
      const { id } = req.params;

      if (!id) {
        return next(ApiError.badRequest('Не передан id категории'));
      }

      const trimmedName = name?.trim();

      if (!trimmedName && !icon && !isArchived) {
        res.status(HTTPStatusCodes.NOT_MODIFIED).json({ message: 'Данные не были изменены' });
        return;
      }

      const choreCategory = await ChoreCategoryModel.findByPk(id);

      if (!choreCategory) {
        return next(ApiError.badRequest('Категория не найдена'));
      }

      await choreCategory.update({ name: trimmedName, icon, isArchived });

      res.status(HTTPStatusCodes.OK).json(choreCategory);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`editChoreCategory: ${err.message}`));
      }
    }
  };

  // DELETE /api/chore/category/:id
  deleteChoreCategory = async (
    req: ChoreCategoryDeleteRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      if (!id) {
        return next(ApiError.badRequest('Не передан id категории'));
      }

      const choreCategory = await ChoreCategoryModel.findByPk(id);

      if (!choreCategory) {
        return next(ApiError.badRequest('Категория не найдена'));
      }

      await choreCategory.destroy();

      res.status(HTTPStatusCodes.OK).json(choreCategory);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`deleteChoreCategory: ${err.message}`));
      }
    }
  };
}

export default new ChoreCategoryController();
