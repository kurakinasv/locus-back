import { Response, NextFunction } from 'express';

import { HTTPStatusCodes } from 'config/status-codes';
import { ApiError } from 'middleware/error';
import ChoreCategoryModel from 'models/choreCategory.model';
import type { GroupLoggedInRequest } from 'controllers/group';

import {
  ChoreCategoryCreateRequest,
  ChoreCategoryDeleteRequest,
  ChoreCategoryEditRequest,
} from './types';

class ChoreCategoryController {
  // GET /api/chore/category
  getChoreCategories = async (req: GroupLoggedInRequest, res: Response, next: NextFunction) => {
    try {
      const groupId = req.currentGroup?.id;

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
      const { name, icon } = req.body;
      const groupId = req.currentGroup?.id;

      const trimmedName = name?.trim();

      if (!groupId || !trimmedName) {
        return next(ApiError.badRequest('Не переданы все необходимые данные'));
      }

      const existCategory = await ChoreCategoryModel.findOne({
        where: { name: trimmedName, groupId },
      });

      if (existCategory?.name.toLowerCase() === trimmedName.toLowerCase()) {
        return next(ApiError.badRequest('Категория с таким именем уже существует'));
      }

      const choreCategory = await ChoreCategoryModel.create({
        groupId,
        name: trimmedName,
        icon,
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
      const groupId = req.currentGroup?.id;

      if (!id) {
        return next(ApiError.badRequest('Не передан id категории'));
      }

      const trimmedName = name?.trim();

      if (!trimmedName && !icon && !isArchived) {
        res.status(HTTPStatusCodes.NOT_MODIFIED).json({ message: 'Данные не были изменены' });
        return;
      }

      const existCategory = await ChoreCategoryModel.findOne({
        where: { name: trimmedName, groupId },
      });

      if (
        existCategory?.name.toLowerCase() === trimmedName?.toLowerCase() &&
        existCategory?.id !== id
      ) {
        return next(ApiError.badRequest('Категория с таким именем уже существует'));
      }

      const choreCategory = await ChoreCategoryModel.findOne({ where: { id, groupId } });

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
      const groupId = req.currentGroup?.id;

      if (!id) {
        return next(ApiError.badRequest('Не передан id категории'));
      }

      const choreCategory = await ChoreCategoryModel.findOne({ where: { id, groupId } });

      if (!choreCategory) {
        return next(ApiError.badRequest('Категория не найдена'));
      }

      await choreCategory.destroy();

      res.status(HTTPStatusCodes.OK).json({ message: 'Категория удалена' });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`deleteChoreCategory: ${err.message}`));
      }
    }
  };
}

export default new ChoreCategoryController();
