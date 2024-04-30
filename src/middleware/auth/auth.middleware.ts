import { Request, Response, NextFunction } from 'express';

import { type AuthUserRequest, REFRESH_TIME, createToken } from 'controllers/auth';
import { checkSession } from 'infrastructure/session';
import { ApiError } from 'middleware/error';

const authMiddleware = (req: Request | AuthUserRequest, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    const jwtPayload = checkSession(req, res);

    if (!jwtPayload || !jwtPayload.user?.id || !jwtPayload?.exp) {
      return next(ApiError.unauthorized('Пользователь не авторизован'));
    }

    (req as AuthUserRequest).user = { id: jwtPayload.user.id };

    // jwtPayload.exp in seconds, Date.now() in milliseconds
    if (jwtPayload.exp * 1000 - Date.now() > REFRESH_TIME) {
      return next();
    }

    console.log('refresh');

    createToken(res, jwtPayload.user.id);

    next();
  } catch (err) {
    if (err instanceof Error) {
      return next(ApiError.unauthorized(err.message));
    }
  }
};

export default authMiddleware;
