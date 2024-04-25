import { type Express, Router } from 'express';

import choreRouter from './chore.router';
import echoRouter from './echo.router';
import userRouter from './user.router';
import authRouter from './auth.router';
import groupRouter from './group.router';
import userGroupRouter from './user-group.router';

const router = Router();

const initRoutes = (app: Express) => {
  router.use('/', echoRouter);
  router.use('/user', userRouter);
  router.use('/auth', authRouter);
  router.use('/group', groupRouter);
  router.use('/user-group', userGroupRouter);
  router.use('/chore', choreRouter);

  app.use('/api', router);
};

export default initRoutes;
