import { Request, Response, NextFunction } from 'express';

import { HTTPStatusCodes } from 'config/status-codes';
import { type AuthUserRequest, REFRESH_TIME, createToken } from 'controllers/auth';
import { checkSession } from 'infrastructure/session';
import { ApiError } from 'middleware/error';

const authMiddleware = (req: Request | AuthUserRequest, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    const jwtPayload = checkSession(req, res, next);

    if (!jwtPayload?.user?.userId || !jwtPayload?.exp) {
      return next(ApiError.unauthorized('Нет авторизации'));
    }

    req = {
      ...req,
      user: { userId: jwtPayload.user.userId },
    } as AuthUserRequest;

    if (jwtPayload.exp - Date.now() > REFRESH_TIME) {
      return next();
    }

    const newToken = createToken(res, jwtPayload.user.userId);

    if (newToken) {
      res.status(HTTPStatusCodes.OK).json('Токен был обновлен');
    }

    next();
  } catch (err) {
    if (err instanceof Error) {
      return next(ApiError.unauthorized(err.message));
    }
  }
};

export default authMiddleware;
