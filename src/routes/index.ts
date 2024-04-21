import { type Express, Router } from 'express';

import testRouter from './test.router';
import userRouter from './user.router';
import authRouter from './auth.router';
import groupRouter from './group.router';
import userGroupRouter from './user-group.router';

const router = Router();

const initRoutes = (app: Express) => {
  app.get('/', (req, res) => {
    console.log('Hello World!');

    res.send('Hello World!');
  });

  router.use('/test', testRouter);
  router.use('/user', userRouter);
  router.use('/auth', authRouter);
  router.use('/group', groupRouter);
  router.use('/user-group', userGroupRouter);

  app.use('/api', router);
};

export default initRoutes;
