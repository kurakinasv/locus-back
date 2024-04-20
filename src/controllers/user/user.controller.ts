import { Request, Response, NextFunction } from 'express';

import { HTTPStatusCodes } from 'config/status-codes';
import UserModel from 'models/user.model.js';
import { ApiError } from 'middleware/error';
import { returnTrimOrNull } from 'utils/helpers';

import { UserCreateRequest, UserDeleteRequest, UserEditRequest, UserGetRequest } from './types';

class UserController {
  // GET /api/user/user
  getUser = async (req: UserGetRequest, res: Response, next: NextFunction) => {
    try {
      const { id: userId } = req.body;

      if (!userId) {
        next(ApiError.unauthorized('Пользователь с таким id не найден'));
      }

      const user = await UserModel.findByPk(userId);

      if (!user) {
        next(ApiError.badRequest('Пользователь не найден'));
      }

      res.status(HTTPStatusCodes.OK).json(user);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`getUser: ${err.message}`));
      }
    }
  };

  // Used in register route
  createUser = async (req: UserCreateRequest, res: Response, next: NextFunction) => {
    try {
      console.log('createUser req.body', req.body);

      const user = await UserModel.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      });

      res.status(HTTPStatusCodes.CREATED).json(user);

      return user.id;
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`createUser: ${err.message}`));
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

      await user.update({ name, surname, email });

      res.status(HTTPStatusCodes.OK).json({ message: 'Пользователь изменен' });
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

      const { id: toRemoveId } = req.body;

      const user = await UserModel.findByPk(toRemoveId);

      if (!user) {
        return next(ApiError.badRequest('Пользователь не найден'));
      }

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
