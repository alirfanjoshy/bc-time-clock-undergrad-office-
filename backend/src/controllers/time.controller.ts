import { Request, Response } from 'express';
import * as timeService from '../services/time.service.js';

export async function getStatus(req: Request, res: Response) {
  const status = await timeService.getClockStatus(req.user!.id);
  res.json({ data: status });
}

export async function clockIn(req: Request, res: Response) {
  const deviceId = typeof req.body?.deviceId === 'string' ? req.body.deviceId : '';
  if (!deviceId) return res.status(400).json({ error: { code: 'CLOCK_DEVICE_REQUIRED', message: 'A registered phone is required to clock in.' } });
  const entry = await timeService.clockIn(req.user!.id, deviceId, req.ip);
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
