import { Request, Response, NextFunction } from 'express';

import { HTTPStatusCodes } from 'config/status-codes.js';

import ApiError from './ApiError.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- next is required for Express error middleware
const errorMiddleware = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  const { status, message } = err;

  if (err instanceof ApiError) {
    return res.status(status).json({ message });
  }

  return res
    .status(HTTPStatusCodes.INTERNAL_SERVER_ERROR)
    .json({ message: 'Кажется, это необработанная ошибка :(' });
};

export default errorMiddleware;
