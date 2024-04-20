import bcrypt from 'bcrypt';
import { HTTPStatusCodes } from 'config/status-codes';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

import { removeSessionToken } from 'infrastructure/session';
import { ApiError } from 'middleware/error';
import UserModel from 'models/user.model.js';

import userController, { type UserCreateRequest } from 'controllers/user';
import { isRequiredString } from 'utils/helpers';

import { createToken } from './auth.service';
import { UserLoginRequest } from './types';

class AuthController {
  // POST /api/auth/login
  login = async (req: UserLoginRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return next(ApiError.badRequest(`Некорректные данные при авторизации: ${errors.array()}`));
      }

      const { emailOrUsername, password } = req.body;

      if (!emailOrUsername || !isRequiredString(password)) {
        return next(ApiError.badRequest('Невалидные данные'));
      }

      const trimmedEmailOrUsername = emailOrUsername.trim();

      let user = await UserModel.findOne({ where: { email: trimmedEmailOrUsername } });
      user = user || (await UserModel.findOne({ where: { username: trimmedEmailOrUsername } }));

      if (!user) {
        return next(ApiError.badRequest('Пользователь не найден'));
      }

      const expectedEmail = user.email;
      const expectedUsername = user.username;
      const isPasswordCorrect = bcrypt.compareSync(password, user.password);

      if (
        (expectedEmail !== trimmedEmailOrUsername && expectedUsername !== trimmedEmailOrUsername) ||
        !isPasswordCorrect
      ) {
        return next(ApiError.badRequest('Пользователь не найден'));
      }

      const token = createToken(res, user.id);

      if (!token) {
        return next(ApiError.internal('Произошла ошибка при создании сессии'));
      }

      return res.status(HTTPStatusCodes.OK).json(user);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`login: ${err.message}`));
      }
    }
  };

  // POST /api/auth/register
  register = async (req: UserCreateRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return next(ApiError.badRequest(`Некорректные данные при регистрации: ${errors.array()}`));
      }

      const { email, password, username } = req.body;

      if (![email, username, password].every(isRequiredString)) {
        next(ApiError.badRequest('Некорректные данные'));
      }

      const trimmedEmail = email.trim();

      const isExist = await UserModel.findOne({ where: { email: trimmedEmail } });

      if (isExist) {
        next(ApiError.badRequest('Такой пользователь уже существует'));
      }

      const hash = await bcrypt.hash(password, 5);

      req.body = {
        ...req.body,
        username: username.trim(),
        email: trimmedEmail,
        password: hash,
      };

      const userId = await userController.createUser(req, res, next);

      if (!userId) {
        return next(ApiError.internal('Произошла ошибка'));
      }

      const token = createToken(res, userId);

      if (!token) {
        return next(ApiError.internal('Произошла ошибка при создании сессии'));
      }

      res.status(HTTPStatusCodes.OK);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`register: ${err.message}`));
      }
    }
  };

  // POST /api/auth/logout
  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      removeSessionToken(res);

      return res.status(HTTPStatusCodes.OK).json('Успешно выполнен выход из аккаунта');
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`logout: ${err.message}`));
      }
    }
  };
}

export default new AuthController();
