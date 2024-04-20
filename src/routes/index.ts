import { type Express, Router } from 'express';

import testRouter from './test.router.js';
import userRouter from './user.router.js';

const router = Router();

const initRoutes = (app: Express) => {
  app.get('/', (req, res) => {
    console.log('Hello World!');

    res.send('Hello World!');
  });

  router.use('/test', testRouter);
  router.use('/user', userRouter);

  app.use('/api', router);
};

export default initRoutes;
