import { Request, Response } from 'express';
import { getCurrentUser } from '../services/auth.service.js';

export async function getMe(req: Request, res: Response) {
  const user = await getCurrentUser(req.user!.id);
  res.json({ data: user });
}
