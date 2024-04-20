import { Response } from 'express';
import jwt from 'jsonwebtoken';

import { DefaultId } from 'typings/common';

export const EXPIRY_TIME = 60 * 1000; // 60 sec

export const REFRESH_TIME = 10 * 1000; // 10 sec

export const createToken = (res: Response, userId: DefaultId, isAdmin = false) => {
  const token = jwt.sign({ userId, isAdmin }, process.env.JWT_SECRET, {
    expiresIn: `${EXPIRY_TIME}ms`,
  });

  const now = new Date();
  const expiresAt = new Date(+now + EXPIRY_TIME);

  res.cookie(process.env.AUTH_COOKIE_NAME, token, {
    expires: expiresAt,
    httpOnly: true,
    // todo: secure
  });

  return token;
};
