import { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import * as mfaService from '../services/mfa.service.js';

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

export async function mfaSetup(req: Request, res: Response) { res.json({ data: await mfaService.setup(req.user!.id) }); }
export async function mfaEnable(req: Request, res: Response) { res.json({ data: await mfaService.enable(req.user!.id, req.body.code) }); }
