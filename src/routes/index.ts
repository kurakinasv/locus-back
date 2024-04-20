import { type Express, Router } from 'express';

import testRouter from './test.router.js';
import userRouter from './user.router.js';
import authRouter from './auth.router.js';

const router = Router();

const initRoutes = (app: Express) => {
  app.get('/', (req, res) => {
    console.log('Hello World!');

    res.send('Hello World!');
  });

  router.use('/test', testRouter);
  router.use('/user', userRouter);
  router.use('/auth', authRouter);

  app.use('/api', router);
};

export default initRoutes;
