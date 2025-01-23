import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { constants } from 'http2';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CREATE_USER_CONFLICT_ERROR, TOKEN_KEY, USERS_UPDATE_BAD_REQUEST, USERS_UPDATE_AVATAR_BAD_REQUEST, USERS_NOT_FOUND, UNAUTHORIZED_ERROR } from '../constants';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';
import ConflictError from '../errors/conflict-error';
import UnauthorizedError from '../errors/unauthorized-error';
import User from '../models/user';
import type { IUser, SessionRequest } from "../types";
import { getValidationErrorMessage } from '../utils';

export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (error) {
    return next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).orFail(() => new NotFoundError(USERS_NOT_FOUND));
    return res.send(user);
  } catch (error) {
    if (error instanceof MongooseError.CastError) {
      return next(new BadRequestError(USERS_NOT_FOUND));
    }
    return next(error);
  }
};

export const getUserInfo = async (req: SessionRequest, res: Response, next: NextFunction) => {
  if (!req.user || typeof req.user === 'string') {
    return next(new UnauthorizedError(UNAUTHORIZED_ERROR));
  }
  const id = req.user._id;
  try {
    const user = await User.findById(id).orFail(() => new NotFoundError(USERS_NOT_FOUND));
    return res.send(user);
  } catch (error) {
    return next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({ ...req.body, password: hash });
    return res.status(constants.HTTP_STATUS_CREATED).send(await newUser.save());
  } catch (error) {
    if (error instanceof Error && error.message.includes("E11000")) {
      return next(new ConflictError(CREATE_USER_CONFLICT_ERROR));
    }

    if (error instanceof MongooseError.ValidationError) {
      const message = getValidationErrorMessage(error);
      return next(new BadRequestError(message));
    }
    return next(error);
  }
};

const updateUser = async (
  req: SessionRequest,
  res: Response,
  next: NextFunction,
  data: Partial<IUser>,
) => {
  try {
    if (!req.user || typeof req.user === 'string') {
      return next(new UnauthorizedError(UNAUTHORIZED_ERROR));
    }
    const id = req.user._id;
    const user = await User.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true },
    ).orFail(() => new NotFoundError(USERS_NOT_FOUND));

    return res.status(constants.HTTP_STATUS_OK).send(user);
  } catch (error) {
    if (error instanceof MongooseError.CastError) {
      return next(new BadRequestError(USERS_UPDATE_BAD_REQUEST));
    }
    if (error instanceof MongooseError.ValidationError) {
      const message = getValidationErrorMessage(error);
      return next(new BadRequestError(message));
    }
    return next(error);
  }
};

export const updateUserInfo = (req: SessionRequest, res: Response, next: NextFunction) => {
  const { name, about } = req.body;
  if (!name && !about) {
    return next(new BadRequestError(USERS_UPDATE_BAD_REQUEST));
  }
  return updateUser(req, res, next, { name, about });
};

export const updateUserAvatar = (req: SessionRequest, res: Response, next: NextFunction) => {
  const { avatar } = req.body;
  if (!avatar) {
    return next(new BadRequestError(USERS_UPDATE_AVATAR_BAD_REQUEST));
  }
  return updateUser(req, res, next, { avatar });
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  try {
    const user = await User.findUserByCredentials(email, password);
    const token = jwt.sign({ _id: user._id }, TOKEN_KEY, { expiresIn: '7d' });

    res.cookie('jwt', token, { httpOnly: true });
    return res.status(constants.HTTP_STATUS_CREATED).send({ message: 'Logged in' });
  } catch (error) {
    return next(error);
  }
};
