import { UserRole } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { forbidden, unauthorized } from '../utils/errors.js';

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(unauthorized());
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(forbidden());
      return;
    }

    next();
  };
}
