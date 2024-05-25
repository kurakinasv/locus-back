import 'module-alias/register.js';

import express, { Response } from 'express';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import path from 'path';

import database from 'app/database.js';
import errorHandler from 'middleware/error/index.js';
import initRoutes from 'routes/index.js';
import serveStatic from 'serve-static';

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use((req, res, next) => {
  const corsWhitelist = [
    'http://localhost:5173',
    'https://locus-front.netlify.app',
    'https://dev--locus-front.netlify.app',
  ];

  if (corsWhitelist.includes(req.headers.origin ?? '')) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Request-Method', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Methods', 'PUT, DELETE');
  res.header('Content-Type', 'application/json');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

const setHeaders = (res: Response) => {
  res.setHeader('Content-Type', 'image/jpeg');
};

app.use(express.json());
app.use('/static', serveStatic(path.join(__dirname, '..', 'static'), { setHeaders: setHeaders }));
app.use(fileUpload({}));

initRoutes(app);

// todo: handle file upload

app.use(errorHandler);

const start = async () => {
  try {
    await database.connect();

    app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));
  } catch (e) {
    if (e instanceof Error) {
      console.log('Server Error', e.message);
    }
    process.exit(1);
  }
};

start();
