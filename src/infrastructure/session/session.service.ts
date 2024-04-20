import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { ApiError } from 'middleware/error';
import type { JWTToken } from 'typings/jwt';

export const checkSession = (req: Request, res: Response, next: NextFunction) => {
  const sessionToken = getSessionToken(req, next);

  const authCookie = req.cookies[process.env.AUTH_COOKIE_NAME];

  if (!authCookie) {
    removeSessionToken(res);

    return next(ApiError.unauthorized('Нет авторизации'));
  }

  const jwtPayload = jwt.verify(authCookie, process.env.JWT_SECRET) as JWTToken;

  return jwtPayload;
};

export const removeSessionToken = (res: Response) => {
  return res.cookie(process.env.AUTH_COOKIE_NAME, '', { expires: new Date() });
};

export const getSessionToken = (req: Request, next: NextFunction) => {
  if (!req.cookies) {
    return next(ApiError.unauthorized('No authorization'));
  }

  const sessionToken = req.cookies[process.env.AUTH_COOKIE_NAME];

  if (!sessionToken) {
    return next(ApiError.unauthorized('No authorization'));
  }

  return sessionToken;
};
