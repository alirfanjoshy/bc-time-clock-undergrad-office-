import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';
import { AppError } from '../utils/errors.js';

type ParsedRequest = {
  body?: unknown;
  params?: Request['params'];
};

export function validateRequest(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      next(new AppError(400, 'VALIDATION_ERROR', result.error.issues[0]?.message ?? 'Invalid input.'));
      return;
    }

    const parsed = result.data as ParsedRequest;
    req.body = parsed.body ?? req.body;
    req.params = parsed.params ?? req.params;
    next();
  };
}
