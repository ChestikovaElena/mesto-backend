import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import { getUsers, getUserById, updateUserInfo, updateUserAvatar, getUserInfo } from '../controllers/users';
import { authorizationAllowedKey } from '../constants';

const router = Router();

router.get('/', celebrate({
  headers: Joi.object().keys(authorizationAllowedKey).unknown(true),
}), getUsers);

router.get('/me', celebrate({
  headers: Joi.object().keys(authorizationAllowedKey).unknown(true),
}), getUserInfo);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().hex().length(24),
  }),
  headers: Joi.object().keys(authorizationAllowedKey).unknown(true),
}), getUserById);

router.patch('/me', celebrate({
  headers: Joi.object().keys(authorizationAllowedKey).unknown(true),
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(200),
  }),
}), updateUserInfo);

router.patch('/me/avatar', celebrate({
  headers: Joi.object().keys(authorizationAllowedKey).unknown(true),
  body: Joi.object().keys({
    avatar: Joi.string().required().uri(),
  }),
}), updateUserAvatar);

export default router;
