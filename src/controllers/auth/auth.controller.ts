import bcrypt from 'bcrypt';
import { HTTPStatusCodes } from 'config/status-codes';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

import { loginToGroup, logoutFromGroup, removeSessionToken } from 'infrastructure/session';
import { ApiError } from 'middleware/error';
import UserModel from 'models/user.model.js';
import UserGroupModel from 'models/user-group.model';
import { isRequiredString } from 'utils/helpers';

import { createToken } from './auth.service';
import type { UserLoginRequest, UserRegisterRequest } from './types';

class AuthController {
  // POST /api/auth/login
  login = async (req: UserLoginRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return next(
          ApiError.badRequest(
            `Некорректные данные при авторизации: ${errors.array().map((v) => v.msg)}`
          )
        );
      }

      const { email, username, password } = req.body;

      const emailOrUsername = email || username;

      if (!emailOrUsername || !isRequiredString(password)) {
        return next(ApiError.badRequest('Невалидные данные'));
      }

      const trimmedEmailOrUsername = emailOrUsername.trim();

      let user;

      if (email) {
        user = await UserModel.findOne({ where: { email: trimmedEmailOrUsername } });
      } else if (username) {
        user = await UserModel.findOne({ where: { username: trimmedEmailOrUsername } });
      }

      console.log('login: user', user);

      if (!user) {
        return next(ApiError.notFound('Пользователь не найден'));
      }

      const expectedEmail = user.email;
      const expectedUsername = user.username;
      const isPasswordCorrect = bcrypt.compareSync(password, user.password);

      if (
        (expectedEmail !== trimmedEmailOrUsername && expectedUsername !== trimmedEmailOrUsername) ||
        !isPasswordCorrect
      ) {
        return next(ApiError.notFound('Пользователь не найден'));
      }

      // just in case
      logoutFromGroup(res);

      const token = createToken(res, user.id);

      if (!token) {
        return next(ApiError.internal('Произошла ошибка при создании сессии'));
      }

      const loggedGroup = await UserGroupModel.findOne({
        where: { userId: user.id, isLoggedIn: true },
      });

      if (loggedGroup) {
        loginToGroup(res, loggedGroup.groupId);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: hashPassword, ...restUser } = user.get();

      return res.status(HTTPStatusCodes.OK).json(restUser);
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`login: ${err.message}`));
      }
    }
  };

  // POST /api/auth/register
  register = async (req: UserRegisterRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return next(
          ApiError.badRequest(
            `Некорректные данные при регистрации: ${errors.array().map((v) => v.msg)}`
          )
        );
      }

      const { email, password, username } = req.body;

      if (![email, username, password].every(isRequiredString)) {
        next(ApiError.badRequest('Некорректные данные'));
      }

      const trimmedEmail = email.trim();

      const isExist = await UserModel.findOne({ where: { email: trimmedEmail } });

      if (isExist) {
        return next(ApiError.badRequest('Такой пользователь уже существует'));
      }

      const hash = await bcrypt.hash(password, 5);

      req.body = {
        ...req.body,
        username: username.trim(),
        email: trimmedEmail,
        password: hash,
      };

      const user = await UserModel.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      });

      if (!user.id) {
        return next(ApiError.internal('Произошла ошибка'));
      }

      const token = createToken(res, user.id);

      if (!token) {
        return next(ApiError.internal('Произошла ошибка при создании сессии'));
      }

      // just in case
      logoutFromGroup(res);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: hashPassword, ...restUser } = user.get();

      res.status(HTTPStatusCodes.CREATED).json(restUser);
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

      return res.status(HTTPStatusCodes.OK).json({ message: 'Успешно выполнен выход из аккаунта' });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(`logout: ${err.message}`));
      }
    }
  };
}

export default new AuthController();
