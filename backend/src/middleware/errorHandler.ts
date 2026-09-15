import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors.js';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, 'NOT_FOUND', `Route not found: ${req.method} ${req.path}`));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  ) {
    const meta = 'meta' in error && typeof error.meta === 'object' && error.meta !== null ? error.meta : null;
    const target =
      meta && 'target' in meta && Array.isArray(meta.target) ? meta.target.join(', ') : 'field';
    res.status(409).json({
      error: {
        code: 'DUPLICATE_VALUE',
        message: `An account already uses this ${target}.`,
      },
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
    },
  });
}
