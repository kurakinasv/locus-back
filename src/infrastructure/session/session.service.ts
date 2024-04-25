import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import type { JWTToken } from 'typings/jwt';

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
  return res.cookie(process.env.AUTH_COOKIE_NAME, '', { expires: new Date() });
};

export const getSessionToken = (req: Request) => {
  const cookies = req.headers.cookie;

  if (!cookies) {
    return null;
  }

  // const token = req.headers.authorization?.split(' ')[1]; // Bearer <TOKEN>
  const sessionToken = cookies
    .split(';')
    .find((cookie) => cookie.includes(process.env.AUTH_COOKIE_NAME))
    ?.split('=')[1];

  return sessionToken;
};
