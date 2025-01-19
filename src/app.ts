import express, { json, NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { NON_EXISTENT_ADDRESS } from './constants';
import NotFoundError from './errors/not-found-error';
import usersRouter from './routes/users';
import cardsRouter from './routes/cards';
import errorHandler from './middleware/error-handler';
import { AuthContext } from './types/auth-context';

const { PORT = 3000, MONGO_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
const app = express();

mongoose.connect(MONGO_URL);

app.use(json());

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 5 minutes',
});

app.use(limiter);

app.use((
  _req: Request,
  res: Response<unknown, AuthContext>,
  next: NextFunction,
) => {
  res.locals.user = {
    _id: '67895f0c2c2bf210fc9dfaa7',
  };
  next();
});

app.use('/users', usersRouter);
app.use('/cards', cardsRouter);
app.use('*', (_req: Request, _res: Response, next: NextFunction) => next(new NotFoundError(NON_EXISTENT_ADDRESS)));

app.use(errorHandler);

const connect = async () => {
  await mongoose.connect(MONGO_URL);
  await app.listen(PORT);
};

connect();
