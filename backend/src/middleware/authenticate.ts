import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../utils/tokens.js';
import { unauthorized } from '../utils/errors.js';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization');

  if (!header?.startsWith('Bearer ')) {
    next(unauthorized());
    return;
  }

  try {
    const token = header.slice('Bearer '.length);
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
      next(unauthorized());
      return;
    }

    next(error);
  }
}
