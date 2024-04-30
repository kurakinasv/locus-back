import { Request, Response, NextFunction } from 'express';

import type { GroupLoggedInRequest } from 'controllers/group/types';
import { ApiError } from 'middleware/error';
import { getCookieByName } from 'utils/cookies';

const groupLoginMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    const cookies = req.headers.cookie;

    if (!cookies) {
      return null;
    }

    const currentGroupId = getCookieByName(cookies, process.env.GROUP_COOKIE_NAME);

    if (!currentGroupId) {
      return next(ApiError.badRequest('Не выполнен вход ни в одну группу'));
    }

    (req as GroupLoggedInRequest).currentGroup = { id: currentGroupId };

    next();
  } catch (err) {
    if (err instanceof Error) {
      return next(ApiError.badRequest(err.message));
    }
  }
};

export default groupLoginMiddleware;
