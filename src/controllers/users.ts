import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { constants } from 'http2';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';
import User from '../models/user';
import type { IUser } from "../types/user";
import { USERS_CREATE_BAD_REQUEST, USERS_UPDATE_BAD_REQUEST, USERS_UPDATE_AVATAR_BAD_REQUEST, USERS_NOT_FOUND } from '../constants';

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

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser = await User.create(req.body);
    return res.status(constants.HTTP_STATUS_CREATED).send(await newUser.save());
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(USERS_CREATE_BAD_REQUEST));
    }
    return next(error);
  }
};

const updateUser = async (
  res: Response,
  next: NextFunction,
  data: Partial<IUser>,
) => {
  try {
    const id = res.locals.user._id;
    const user = await User.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true },
    ).orFail(() => new NotFoundError(USERS_NOT_FOUND));

    return res.status(constants.HTTP_STATUS_OK).send(user);
  } catch (error) {
    if (error instanceof MongooseError.CastError) {
      return next(new NotFoundError(USERS_NOT_FOUND));
    }
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(USERS_UPDATE_BAD_REQUEST));
    }
    return next(error);
  }
};

export const updateUserInfo = (req: Request, res: Response, next: NextFunction) => {
  const { name, about } = req.body;
  if (!name && !about) {
    return next(new BadRequestError(USERS_UPDATE_BAD_REQUEST));
  }
  return updateUser(res, next, { name, about });
};

export const updateUserAvatar = (req: Request, res: Response, next: NextFunction) => {
  const { avatar } = req.body;
  if (!avatar) {
    return next(new BadRequestError(USERS_UPDATE_AVATAR_BAD_REQUEST));
  }
  return updateUser(res, next, { avatar });
};
