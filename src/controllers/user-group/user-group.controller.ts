import { Response, NextFunction } from 'express';

import { HTTPStatusCodes } from 'config/status-codes';
import { loginToGroup } from 'infrastructure/session';
import { ApiError } from 'middleware/error';
import UserGroupModel from 'models/user-group.model';
import { UUIDString } from 'typings/common';

import { UserGroupEditRequest, UserGroupJoinRequest, UserGroupLeaveRequest } from './types';

class UserGroupController {
  // POST /api/user-group/join
  joinGroup = async (req: UserGroupJoinRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const groupId = req.body?.groupId;

      if (!userId || !groupId) {
        return next(ApiError.badRequest('Не переданы данные'));
      }

      const isGroupExist = await UserGroupModel.findOne({ where: { groupId } });

      if (!isGroupExist) {
        return next(ApiError.badRequest('Такой группы не существует'));
      }

      if (await this._isUserExistInGroup(userId, groupId)) {
        return next(ApiError.badRequest('Пользователь уже состоит в группе'));
      }

      await UserGroupModel.create({ userId, groupId, isLoggedIn: true });

      loginToGroup(res, groupId);

      res.status(HTTPStatusCodes.OK).json({ message: 'Пользователь добавлен в группу' });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`joinGroup: ${err.message}`));
      }
    }
  };

  // PUT /api/user-group/login
  loginToGroup = async (req: UserGroupJoinRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const groupId = req.body?.groupId;

      if (!userId || !groupId) {
        return next(ApiError.badRequest('Не переданы данные'));
      }

      if (!(await this._isUserExistInGroup(userId, groupId))) {
        return next(ApiError.badRequest('Пользователь не найден в группе'));
      }

      await UserGroupModel.update({ isLoggedIn: true }, { where: { userId, groupId } });

      loginToGroup(res, groupId);

      res.status(HTTPStatusCodes.OK).json({ message: 'Пользователь вошел в группу' });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`loginToGroup: ${err.message}`));
      }
    }
  };

  // todo: test
  // PUT /api/user-group/edit
  editUserGroup = async (req: UserGroupEditRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { groupId, debtAmount, isAdmin } = req.body;

      if (!userId || !groupId) {
        return next(ApiError.badRequest('Не переданы данные'));
      }

      if (!(await this._isUserExistInGroup(userId, groupId))) {
        return next(ApiError.badRequest('Пользователь не найден в группе'));
      }

      await UserGroupModel.update({ isAdmin, debtAmount }, { where: { userId, groupId } });

      res
        .status(HTTPStatusCodes.OK)
        .json({ message: 'Пользователь назначен администратором группы' });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`editUserGroup: ${err.message}`));
      }
    }
  };

  // DELETE /api/user-group/leave
  leaveGroup = async (req: UserGroupLeaveRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const groupId = req.body?.groupId;

      if (!userId || !groupId) {
        return next(ApiError.badRequest('Не переданы данные'));
      }

      if (!(await this._isUserExistInGroup(userId, groupId))) {
        return next(ApiError.badRequest('Пользователь не найден в группе'));
      }

      // todo: handle single admin exit

      await UserGroupModel.destroy({ where: { userId, groupId } });

      res.status(HTTPStatusCodes.OK).json({ message: 'Пользователь вышел из группы' });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`leaveGroup: ${err.message}`));
      }
    }
  };

  private _isUserExistInGroup = async (userId: UUIDString, groupId: UUIDString) => {
    const isExist = await UserGroupModel.findOne({ where: { userId, groupId } });
    return !!isExist;
  };
}

export default new UserGroupController();
