import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TOKEN_KEY, UNAUTHORIZED_ERROR } from '../constants';
import UnauthorizedError from '../errors/unauthorized-error';
import type { SessionRequest } from '../types';

const extractBearerToken = (header: string) => header.replace('Bearer ', '');

export const auth = (req: SessionRequest, _res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError(UNAUTHORIZED_ERROR));
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, TOKEN_KEY);
  } catch {
    return next(new UnauthorizedError(UNAUTHORIZED_ERROR));
  }

  req.user = payload;

  return next();
};
