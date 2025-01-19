import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { constants } from 'http2';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';
import Card from '../models/card';
import { CARDS_NOT_FOUND_CARD, LIKE_CARD_BAD_REQUEST, DISLIKE_CARD_BAD_REQUEST, CARD_NOT_FOUND_ON_DELETE } from '../constants';
import { getValidationErrorMessage } from '../utils';

export const getCards = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cards = await Card.find({});
    return res.send(cards);
  } catch (error) {
    return next(error);
  }
};

export const createCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const owner = res.locals.user._id;
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
  try {
    const { cardId } = req.params;
    await Card.findByIdAndDelete(cardId)
      .orFail(new NotFoundError(CARD_NOT_FOUND_ON_DELETE));

    return res.status(constants.HTTP_STATUS_NO_CONTENT);
  } catch (error) {
    return next(error);
  }
};

const changeCardLikes = async (req: Request, res: Response, next: NextFunction, reaction: "like" | "dislike") => {
  const userId = res.locals.user._id;
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
      return next(error);
    }

    if (error.value === userId) {
      return next(new BadRequestError(reaction === "like" ? LIKE_CARD_BAD_REQUEST : DISLIKE_CARD_BAD_REQUEST));
    } else {
      return next(new BadRequestError(CARDS_NOT_FOUND_CARD));
    }
  }
};

export const likeCard = async (req: Request, res: Response, next: NextFunction) => {
  changeCardLikes(req, res, next, "like");
};

export const dislikeCard = async (req: Request, res: Response, next: NextFunction) => {
  changeCardLikes(req, res, next, "dislike");
};
