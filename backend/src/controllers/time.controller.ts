import { Request, Response } from 'express';
import * as timeService from '../services/time.service.js';

export async function getStatus(req: Request, res: Response) {
  const status = await timeService.getClockStatus(req.user!.id);
  res.json({ data: status });
}

export async function clockIn(req: Request, res: Response) {
  const entry = await timeService.clockIn(req.user!.id);
  res.status(201).json({ data: entry });
}

export async function clockOut(req: Request, res: Response) {
  const entry = await timeService.clockOut(req.user!.id);
  res.json({ data: entry });
}

export async function getMyEntries(req: Request, res: Response) {
  const entries = await timeService.getMyEntries(req.user!.id, req.query as never);
  res.json({ data: entries });
}
