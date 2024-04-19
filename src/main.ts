import 'module-alias/register.js';

import express from 'express';
import dotenv from 'dotenv';

import database from 'app/database.js';
import errorHandler from 'middleware/error/index.js';
import initRoutes from 'routes/index.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Request-Method', 'GET, POST');
  res.header('Content-Type', 'application/json');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

app.use(express.json());

initRoutes(app);

// todo: handle file upload

app.use(errorHandler);

const start = async () => {
  try {
    // await database.connect()

    app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));
  } catch (e) {
    if (e instanceof Error) {
      console.log('Server Error', e.message);
    }
    process.exit(1);
  }
};

start();
