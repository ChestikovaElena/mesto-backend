import express, { json, NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { NON_EXISTENT_ADDRESS } from './constants';
import { login, createUser } from './controllers/users';
import NotFoundError from './errors/not-found-error';
import usersRouter from './routes/users';
import cardsRouter from './routes/cards';
import { auth } from './middleware/auth';
import errorHandler from './middleware/error-handler';
import { requestLogger, errorLogger } from './middleware/logger';

const { PORT = 3000, MONGO_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
const app = express();

mongoose.connect(MONGO_URL);

app.use(json());
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 5 minutes',
});

app.use(limiter);

app.use(requestLogger);

app.post('/signup', createUser);
app.post('/signin', login);

app.use(auth);

app.use('/users', usersRouter);
app.use('/cards', cardsRouter);
app.use('*', (_req: Request, _res: Response, next: NextFunction) => next(new NotFoundError(NON_EXISTENT_ADDRESS)));

app.use(errorLogger);

app.use(errorHandler);

const connect = async () => {
  await mongoose.connect(MONGO_URL);
  await app.listen(PORT);
};

connect();
