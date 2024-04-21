import { Request, Response, NextFunction } from 'express';

import ApiError from './ApiError.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- next is required for Express error middleware
const errorMiddleware = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  const { status, message } = err;

  if (err instanceof ApiError) {
    return res.status(status).json({ message });
  }

  return res.status(500).json({ message: 'Кажется, это необработанная ошибка :(' });
};

export default errorMiddleware;
