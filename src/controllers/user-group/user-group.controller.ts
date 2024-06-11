import { isAfter } from 'date-fns';
import { Response, NextFunction } from 'express';

import { NotificationType } from 'config/notifications';
import { HTTPStatusCodes } from 'config/status-codes';
import { AuthUserRequest } from 'controllers/auth';
import { GroupLoggedInRequest } from 'controllers/group';
import { NotificationService } from 'controllers/notification';
import { loginToGroup } from 'infrastructure/session';
import { ApiError } from 'middleware/error';
import UserGroupModel from 'models/user-group.model';
import GroupModel from 'models/group.model';
import { UUIDString } from 'typings/common';

import {
  UserGroupEditRequest,
  UserGroupJoinRequest,
  UserGroupLeaveRequest,
  UserGroupLoginRequest,
} from './types';

class UserGroupController {
  // GET /api/user-group/current
  getCurrentUserGroup = async (req: AuthUserRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return next(ApiError.unauthorized('Пользователь с таким id не найден'));
      }

      const userGroup = await UserGroupModel.findOne({ where: { userId, isLoggedIn: true } });

      if (!userGroup) {
        return res
          .status(HTTPStatusCodes.NOT_FOUND)
          .json({ message: 'Пользователь не вошел ни в одну группу' });
      }

      loginToGroup(res, userGroup.groupId);

      res.status(HTTPStatusCodes.OK).json(userGroup);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getCurrentUserGroup: ${err.message}`));
      }
    }
  };

  // GET /api/user-group/user-groups
  /** Get current user's user group instances */
  getUserUserGroups = async (req: AuthUserRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return next(ApiError.unauthorized('Пользователь с таким id не найден'));
      }

      const userGroups = await UserGroupModel.findAll({ where: { userId } });

      res.status(HTTPStatusCodes.OK).json(userGroups);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getUserUserGroups: ${err.message}`));
      }
    }
  };

  // GET /api/user-group/group-members
  getGroupMembers = async (req: GroupLoggedInRequest, res: Response, next: NextFunction) => {
    try {
      const groupId = req.currentGroup?.id;

      if (!groupId) {
        return next(ApiError.badRequest('Не передан id группы'));
      }

      const groupMembers = await UserGroupModel.findAll({ where: { groupId } });

      res.status(HTTPStatusCodes.OK).json(groupMembers);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getGroupMembers: ${err.message}`));
      }
    }
  };

  // POST /api/user-group/join
  joinGroup = async (req: UserGroupJoinRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { code } = req.body;

      if (!userId || !code) {
        return next(ApiError.badRequest('Не переданы данные'));
      }

      const group = await GroupModel.findOne({ where: { inviteCode: code }, include: ['users'] });

      if (!group) {
        return next(ApiError.badRequest('Приглашение недействительно'));
      }

      if (group.inviteExpiresAt && isAfter(new Date(), group.inviteExpiresAt)) {
        return next(ApiError.badRequest('Приглашение недействительно'));
      }

      if (await this._isUserExistInGroup(userId, group.id)) {
        return next(ApiError.badRequest('Пользователь уже состоит в группе'));
      }

      const userInGroup = await UserGroupModel.create({
        userId,
        groupId: group.id,
        isLoggedIn: true,
      });

      loginToGroup(res, group.id);

      const notificationResult = await NotificationService.sendNotification({
        type: NotificationType.userJoinedGroup,
        groupId: group.id,
        userId,
      });

      if ('error' in notificationResult) {
        return next(ApiError.internal(notificationResult.error));
      }

      res.status(HTTPStatusCodes.OK).json({ group, userInGroup });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`joinGroup: ${err.message}`));
      }
    }
  };

  // PUT /api/user-group/login
  loginToGroup = async (req: UserGroupLoginRequest, res: Response, next: NextFunction) => {
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
      const groupId = req.currentGroup?.id;

      if (!userId || !groupId) {
        return next(ApiError.badRequest('Не переданы данные'));
      }

      if (!(await this._isUserExistInGroup(userId, groupId))) {
        return next(ApiError.badRequest('Пользователь не найден в группе'));
      }

      // todo: handle single admin exit
      // todo: handle single person exit

      await UserGroupModel.destroy({ where: { userId, groupId } });

      const notificationResult = await NotificationService.sendNotification({
        type: NotificationType.groupSettingsChanged,
        groupId,
        userId,
      });

      if ('error' in notificationResult) {
        return next(ApiError.internal(notificationResult.error));
      }

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
