import { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';

function metaFromRequest(req: Request) {
  return {
    ipAddress: req.ip,
    userAgent: req.header('user-agent'),
  };
}

export async function register(req: Request, res: Response) {
  const data = await authService.registerEmployee(req.body, metaFromRequest(req));
  res.status(201).json({ data });
}

export async function login(req: Request, res: Response) {
  const data = await authService.login(req.body, metaFromRequest(req));
  res.json({ data });
}

export async function refresh(req: Request, res: Response) {
  const data = await authService.refresh(req.body, metaFromRequest(req));
  res.json({ data });
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.body, metaFromRequest(req));
  res.status(204).send();
}
