import { Request, Response } from 'express';
import {
  createUserAsAdmin,
  getDashboard as loadDashboard,
  listAuditLogs,
  listTimeEntries,
  listUsers,
  updateTimeEntryAsAdmin,
} from '../services/admin.service.js';

export async function getUsers(_req: Request, res: Response) {
  const users = await listUsers();
  res.json({ data: users });
}

export async function createUser(req: Request, res: Response) {
  const user = await createUserAsAdmin(req.body, req.user!.id, req.ip);
  res.status(201).json({ data: user });
}

export async function getDashboard(_req: Request, res: Response) {
  const dashboard = await loadDashboard();
  res.json({ data: dashboard });
}

export async function getTimeEntries(req: Request, res: Response) {
  const entries = await listTimeEntries(req.query as never);
  res.json({ data: entries });
}

export async function updateTimeEntry(req: Request, res: Response) {
  const entryId = Array.isArray(req.params.entryId) ? req.params.entryId[0] : req.params.entryId;
  const entry = await updateTimeEntryAsAdmin(entryId, req.body, req.user!.id, req.ip);
  res.json({ data: entry });
}

export async function getAuditLogs(_req: Request, res: Response) {
  const logs = await listAuditLogs();
  res.json({ data: logs });
}
