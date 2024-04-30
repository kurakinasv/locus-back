import { Request, Response, NextFunction } from 'express';

import { HTTPStatusCodes } from 'config/status-codes';
import { logoutFromGroup } from 'infrastructure/session';
import GroupModel from 'models/group.model';
import UserGroupModel from 'models/user-group.model';
import { ApiError } from 'middleware/error';

import { GroupCreateRequest, GroupDeleteRequest, GroupEditRequest, GroupGetRequest } from './types';

class GroupController {
  // todo: only for dev
  // GET /api/group/all
  getAllGroups = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const groups = await GroupModel.findAll();

      res.status(HTTPStatusCodes.OK).json(groups);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getAllGroups: ${err.message}`));
      }
    }
  };

  // GET /api/group/group
  getGroup = async (req: GroupGetRequest, res: Response, next: NextFunction) => {
    try {
      const { id: groupId } = req.body;

      if (!groupId) {
        return next(ApiError.unauthorized('Не передан id группы'));
      }

      const group = await GroupModel.findByPk(groupId);

      if (!group) {
        return next(ApiError.badRequest('Группа не найдена'));
      }

      res.status(HTTPStatusCodes.OK).json(group);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getGroup: ${err.message}`));
      }
    }
  };

  // POST /api/group/group
  createGroup = async (req: GroupCreateRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return next(ApiError.unauthorized('Пользователь не авторизован'));
      }

      const { name, image } = req.body;

      const trimmedName = name.trim();

      if (!trimmedName) {
        return next(ApiError.badRequest('Не передано название группы'));
      }

      const group = await GroupModel.create({ name: trimmedName, image });

      if (!group.id) {
        return next(ApiError.internal('Произошла ошибка при создании группы'));
      }

      const userInGroup = await UserGroupModel.create({
        groupId: group.id,
        userId,
        isAdmin: true,
        isLoggedIn: true,
      });

      if (!userInGroup) {
        next(ApiError.internal('Ошибка при добавлении пользователя в группу'));
      }

      res.status(HTTPStatusCodes.CREATED).json({ group, userInGroup });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`createGroup: ${err.message}`));
      }
    }
  };

  // PUT /api/group/group
  editGroup = async (req: GroupEditRequest, res: Response, next: NextFunction) => {
    try {
      const { id: toEditId, name, image } = req.body;

      const group = await GroupModel.findByPk(toEditId);

      if (!group) {
        return next(ApiError.badRequest('Группа не найдена'));
      }

      group.name = name ?? group.name;
      group.image = image ?? group.image;

      await group.save();

      res.status(HTTPStatusCodes.OK).json(group);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`editGroup: ${err.message}`));
      }
    }
  };

  // DELETE /api/group/group
  deleteGroup = async (req: GroupDeleteRequest, res: Response, next: NextFunction) => {
    try {
      const { id: toRemoveId } = req.body;

      if (!toRemoveId) {
        return next(ApiError.unauthorized('Не передан id группы'));
      }

      const group = await GroupModel.findByPk(toRemoveId);

      if (!group) {
        return next(ApiError.badRequest('Группа не найдена'));
      }

      // todo: delete all users in group

      logoutFromGroup(res);

      await group.destroy();

      res.status(HTTPStatusCodes.OK).json({ message: 'Группа удалена' });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`deleteGroup: ${err.message}`));
      }
    }
  };
}

export default new GroupController();
