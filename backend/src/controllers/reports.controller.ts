import { Request, Response } from 'express';
import {
  generateMyTimesheetReport,
  generateReport as generateReportPdf,
} from '../services/reports.service.js';

export async function generateReport(req: Request, res: Response) {
  const report = await generateReportPdf(req.body, req.user!.id, req.ip);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${report.fileName}"`);
  res.send(report.pdf);
}

export async function downloadReport(req: Request, res: Response) {
  const report = await generateReportPdf(req.query as never, req.user!.id, req.ip);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${report.fileName}"`);
  res.send(report.pdf);
}

export async function myTimesheetReport(req: Request, res: Response) {
  const report = await generateMyTimesheetReport(req.body, req.user!.id, req.ip);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${report.fileName}"`);
  res.send(report.pdf);
}

export async function downloadMyTimesheetReport(req: Request, res: Response) {
  const report = await generateMyTimesheetReport(req.query as never, req.user!.id, req.ip);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${report.fileName}"`);
  res.send(report.pdf);
}
