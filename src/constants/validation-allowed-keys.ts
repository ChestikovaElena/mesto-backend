import { Joi } from "celebrate";

export const authorizationAllowedKey = {
  authorization: Joi.string().required().regex(/^Bearer\s[a-zA-Z0-9._-]+$/),
};

export const cardIDAllowedKey = {
  cardId: Joi.string().required().alphanum().length(24),
};
