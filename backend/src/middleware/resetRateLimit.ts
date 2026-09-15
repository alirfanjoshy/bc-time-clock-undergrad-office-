import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';

// Bounded, per-process limits for this single-server deployment.
const attempts = new Map<string, { count: number; until: number }>();
export function resetRateLimit(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
  const keys = [`ip:${req.ip}`];
  if (typeof req.body?.email === 'string')
    keys.push(`email:${req.body.email.trim().toLowerCase()}`);
  if (
    attempts.size > 10000 ||
    keys.some((key) => (attempts.get(key)?.count ?? 0) >= (key.startsWith('ip:') ? 20 : 5))
  ) {
    res.setHeader('Retry-After', '900');
    next(
      new AppError(
        429,
        'TOO_MANY_REQUESTS',
        'Too many reset attempts. Please try again in 15 minutes.',
      ),
    );
    return;
  }
  for (const key of keys) {
    const current = attempts.get(key) ?? { count: 0, until: now + 15 * 60000 };
    current.count++;
    attempts.set(key, current);
  }
  next();
}
