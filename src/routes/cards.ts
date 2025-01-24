import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import { createCard, deleteCard, dislikeCard, getCards, likeCard } from '../controllers/cards';
import { authorizationAllowedKey, cardIDAllowedKey } from '../constants';

const router = Router();

router.get('/', celebrate({
  headers: Joi.object().keys(authorizationAllowedKey).unknown(true),
}), getCards);

router.post('/', celebrate({
  headers: Joi.object().keys(authorizationAllowedKey).unknown(true),
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    link: Joi.string().required().uri(),
  }),
}), createCard);

router.delete('/:cardId', celebrate({
  headers: Joi.object().keys(authorizationAllowedKey).unknown(true),
  params: Joi.object().keys(cardIDAllowedKey),
}), deleteCard);

router.put('/:cardId/likes', celebrate({
  headers: Joi.object().keys(authorizationAllowedKey).unknown(true),
  params: Joi.object().keys(cardIDAllowedKey),
}), likeCard);

router.delete('/:cardId/likes', celebrate({
  headers: Joi.object().keys(authorizationAllowedKey).unknown(true),
  params: Joi.object().keys(cardIDAllowedKey),
}), dislikeCard);

export default router;
