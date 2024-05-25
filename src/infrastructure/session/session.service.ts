import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import type { UUIDString } from 'typings/common';
import type { JWTToken } from 'typings/jwt';
import { getCookieByName } from 'utils/cookies';

// group

export const checkGroupLogin = (req: Request) => {
  const cookies = req.headers.cookie;

  if (!cookies) {
    return null;
  }

  return getCookieByName(cookies, process.env.GROUP_COOKIE_NAME);
};

export const loginToGroup = (res: Response, groupId: UUIDString) => {
  return res.cookie(process.env.GROUP_COOKIE_NAME, groupId, {
    httpOnly: true,
  });
};

export const logoutFromGroup = (res: Response) => {
  return res.cookie(process.env.GROUP_COOKIE_NAME, '', {
    expires: new Date(),
  });
};

// auth

export const checkSession = (req: Request, res: Response): JWTToken | null => {
  const authCookie = getSessionToken(req);

  if (!authCookie) {
    removeSessionToken(res);

    return null;
  }

  const jwtPayload = jwt.verify(authCookie, process.env.JWT_SECRET) as JWTToken;

  return jwtPayload;
};

export const removeSessionToken = (res: Response) => {
  logoutFromGroup(res);

  return res.cookie(process.env.AUTH_COOKIE_NAME, '', {
    expires: new Date(),
  });
};

export const getSessionToken = (req: Request) => {
  const cookies = req.headers.cookie;

  if (!cookies) {
    return null;
  }

  return getCookieByName(cookies, process.env.AUTH_COOKIE_NAME);
};
