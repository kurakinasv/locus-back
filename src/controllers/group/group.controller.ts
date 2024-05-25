import { addHours, isAfter } from 'date-fns';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { v4 } from 'uuid';

import { HTTPStatusCodes } from 'config/status-codes';
import { loginToGroup, logoutFromGroup } from 'infrastructure/session';
import GroupModel from 'models/group.model';
import UserGroupModel from 'models/user-group.model';
import { ApiError } from 'middleware/error';
import { getImagePath } from 'utils/getImagePath';

import {
  GroupCreateRequest,
  GroupEditRequest,
  GroupGetRequest,
  GroupLoggedInRequest,
} from './types';

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

  // GET /api/group/group/:id
  getGroup = async (req: GroupGetRequest, res: Response, next: NextFunction) => {
    try {
      const { id: groupId } = req.params;

      if (!groupId) {
        return next(ApiError.unauthorized('Не передан id группы'));
      }

      const group = await GroupModel.findOne({ where: { id: groupId }, include: ['users'] });

      if (!group) {
        return next(ApiError.badRequest('Группа не найдена'));
      }

      // Delete invite code from group if it is expired
      if (group.inviteCode && group.inviteExpiresAt && isAfter(new Date(), group.inviteExpiresAt)) {
        group.inviteCode = null;
        group.inviteExpiresAt = null;
      }

      const responseGroup = await group.save();

      res.status(HTTPStatusCodes.OK).json(responseGroup);
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

      const { name } = req.body;

      const trimmedName = name.trim();

      if (!trimmedName) {
        return next(ApiError.badRequest('Имя группы не может быть пустым'));
      }

      const group = await GroupModel.create({ name: trimmedName });

      if (!group.id) {
        return next(ApiError.internal('Произошла ошибка при создании группы'));
      }

      // todo: control amount of groups user is in
      const userInGroup = await UserGroupModel.create({
        groupId: group.id,
        userId,
        isAdmin: true,
        isLoggedIn: true,
      });

      if (!userInGroup) {
        next(ApiError.internal('Ошибка при добавлении пользователя в группу'));
      }

      loginToGroup(res, group.id);

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
      const { name } = req.body;
      const toEditId = req.currentGroup?.id;
      const image = req.files?.files;

      const group = await GroupModel.findOne({ where: { id: toEditId }, include: ['users'] });

      if (!group) {
        return next(ApiError.badRequest('Группа не найдена'));
      }

      let fileName = group.image;

      if (image) {
        fileName = v4() + '.jpg';

        if (!Array.isArray(image)) {
          if (group.image && fs.existsSync(getImagePath(group.image))) {
            fs.unlinkSync(getImagePath(group.image));
          }

          await image.mv(getImagePath(fileName));
        }
      }

      group.name = name ?? group.name;
      group.image = fileName;

      const newGroup = await group.save();

      res.status(HTTPStatusCodes.OK).json(newGroup);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`editGroup: ${err.message}`));
      }
    }
  };

  // DELETE /api/group/group
  deleteGroup = async (req: GroupLoggedInRequest, res: Response, next: NextFunction) => {
    try {
      const toRemoveId = req.currentGroup?.id;

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

  // PUT /api/group/invite
  generateInviteCode = async (req: GroupLoggedInRequest, res: Response, next: NextFunction) => {
    try {
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.unauthorized('Не передан id группы'));
      }

      const group = await GroupModel.findByPk(groupId);

      if (!group) {
        return next(ApiError.badRequest('Группа не найдена'));
      }

      group.inviteCode = v4();
      group.inviteExpiresAt = addHours(new Date(), 24);

      const { inviteCode, inviteExpiresAt } = await group.save();

      res.status(HTTPStatusCodes.OK).json({ inviteCode, inviteExpiresAt });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`deleteGroup: ${err.message}`));
      }
    }
  };
}

export default new GroupController();
