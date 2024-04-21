import { Request, Response, NextFunction } from 'express';

import { HTTPStatusCodes } from 'config/status-codes';
import { AuthUserRequest } from 'controllers/auth';
import { removeSessionToken } from 'infrastructure/session';
import UserModel from 'models/user.model';
import { ApiError } from 'middleware/error';
import { returnTrimOrNull } from 'utils/helpers';

import { UserDeleteRequest, UserEditRequest } from './types';

class UserController {
  // todo: only for dev
  // GET /api/user/all
  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await UserModel.findAll();

      res.status(HTTPStatusCodes.OK).json(users);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getAllUsers: ${err.message}`));
      }
    }
  };

  // GET /api/user/user
  getUser = async (req: AuthUserRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return next(ApiError.unauthorized('Пользователь с таким id не найден'));
      }

      const user = await UserModel.findByPk(userId);

      if (!user) {
        return next(ApiError.badRequest('Пользователь не найден'));
      }

      // todo: send password on dev only
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...restUser } = user.get();
      res.status(HTTPStatusCodes.OK).json(restUser);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getUser: ${err.message}`));
      }
    }
  };

  // PUT /api/user/user
  editUser = async (req: UserEditRequest, res: Response, next: NextFunction) => {
    try {
      console.log('editUser req.body', req.body);

      const { id: toEditId, name, surname, email } = req.body;

      const user = await UserModel.findByPk(toEditId);

      if (!user) {
        return next(ApiError.badRequest('Пользователь не найден'));
      }

      user.email = email ? email.trim() : user.email;
      user.name = name !== undefined ? returnTrimOrNull(name) : user.name;
      user.surname = surname !== undefined ? returnTrimOrNull(surname) : user.surname;
      // todo: add password change

      if (!user.changed('email') && !user.changed('name') && !user.changed('surname')) {
        return res.status(HTTPStatusCodes.OK).send();
      }

      await user.save();

      res.status(HTTPStatusCodes.OK).json({ message: 'Данные пользователя успешно изменены' });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`editUser: ${err.message}`));
      }
    }
  };

  // DELETE /api/user/user
  deleteUser = async (req: UserDeleteRequest, res: Response, next: NextFunction) => {
    try {
      console.log('deleteUser', req.params, req.body);

      const toRemoveId = req.user?.id;

      const user = await UserModel.findByPk(toRemoveId);

      if (!user) {
        return next(ApiError.badRequest('Пользователь не найден'));
      }

      removeSessionToken(res);

      await user.destroy();

      res.status(HTTPStatusCodes.OK).json({ message: 'Пользователь удален' });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`deleteUser: ${err.message}`));
      }
    }
  };
}

export default new UserController();
