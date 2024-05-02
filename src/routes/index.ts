import { type Express, Router } from 'express';

import authRouter from './auth.router';
import choreRouter from './chore.router';
import choreCategoryRouter from './choreCategory.router';
import echoRouter from './echo.router';
import groupRouter from './group.router';
import scheduleRouter from './schedule.router';
import scheduleDateRouter from './scheduleDate.router';
import userRouter from './user.router';
import userGroupRouter from './user-group.router';

const router = Router();

const initRoutes = (app: Express) => {
  router.use('/', echoRouter);
  router.use('/user', userRouter);
  router.use('/auth', authRouter);
  router.use('/group', groupRouter);
  router.use('/user-group', userGroupRouter);
  router.use('/chore', choreRouter);
  router.use('/chore', choreCategoryRouter);
  router.use('/schedule', scheduleRouter);
  router.use('/schedule', scheduleDateRouter);

  app.use('/api', router);
};

export default initRoutes;
