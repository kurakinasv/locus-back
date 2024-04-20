import { Response } from 'express';
import jwt from 'jsonwebtoken';

import { DefaultId } from 'typings/common';

const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

export const REFRESH_TIME = 10 * 60 * 1000; // 10 min

export const createToken = (res: Response, userId: DefaultId, isAdmin = false) => {
  const token = jwt.sign({ user: { id: userId, isAdmin } }, process.env.JWT_SECRET, {
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
