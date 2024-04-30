import { Response, NextFunction } from 'express';

import { AuthUserRequest } from 'controllers/auth';
import type { GroupLoggedInRequest } from 'controllers/group/types';
import { ApiError } from 'middleware/error';
import UserGroupModel from 'models/user-group.model';
import { getCookieByName } from 'utils/cookies';

const groupLoginMiddleware = async (req: AuthUserRequest, res: Response, next: NextFunction) => {
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

    const userId = req.user?.id;

    const userInGroup = await UserGroupModel.findOne({
      where: { userId, groupId: currentGroupId },
    });

    if (!userInGroup) {
      return next(ApiError.forbidden('Пользователь не состоит в группе'));
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
