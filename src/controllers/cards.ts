import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { constants } from 'http2';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';
import ForbiddenError from '../errors/forbidden-error';
import Card from '../models/card';
import { CARDS_NOT_FOUND_CARD, USER_CANNOT_DELETE_CARD, INVALID_DATA_ERROR } from '../constants';
import { getValidationErrorMessage } from '../utils';
import { SessionRequest } from '../types';

export const getCards = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cards = await Card.find({});
    return res.send(cards);
  } catch (error) {
    return next(error);
  }
};

export const createCard = async (req: Request, res: Response, next: NextFunction) => {
  const owner = (req as SessionRequest).user._id;
  try {
    const { name, link } = req.body;
    const newCard = await Card.create({ name, link, owner });
    return res.status(constants.HTTP_STATUS_CREATED).send(await newCard.save());
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      const message = getValidationErrorMessage(error);
      return next(new BadRequestError(message));
    }
    return next(error);
  }
};

export const deleteCard = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as SessionRequest).user._id;
  try {
    const { cardId } = req.params;
    const card = await Card.findById(cardId)
      .orFail(() => new NotFoundError(CARDS_NOT_FOUND_CARD));

    if (card.owner.toString() !== userId) {
      return next(new ForbiddenError(USER_CANNOT_DELETE_CARD));
    }

    await Card.findByIdAndDelete(cardId);

    return res.status(constants.HTTP_STATUS_NO_CONTENT);
  } catch (error) {
    if (error instanceof MongooseError.CastError) {
      return next(new BadRequestError(CARDS_NOT_FOUND_CARD));
    }
    return next(error);
  }
};

const changeCardLikes = async (req: Request, res: Response, next: NextFunction, reaction: "like" | "dislike") => {
  const userId = (req as SessionRequest).user._id;
  try {
    const { cardId } = req.params;
    const updateOption = reaction === "like" ? { $addToSet: { likes: userId } } : { $pull: { likes: userId } };
    const card = await Card.findByIdAndUpdate(
      cardId,
      updateOption,
      { new: true },
    ).orFail(() => new NotFoundError(CARDS_NOT_FOUND_CARD));

    return res.status(constants.HTTP_STATUS_OK).send(card);
  } catch (error) {
    if (!(error instanceof MongooseError.CastError)) {
      return next(new BadRequestError(INVALID_DATA_ERROR));
    }

    return next(error);
  }
};

export const likeCard = async (req: Request, res: Response, next: NextFunction) => {
  changeCardLikes(req, res, next, "like");
};

export const dislikeCard = async (req: Request, res: Response, next: NextFunction) => {
  changeCardLikes(req, res, next, "dislike");
};
