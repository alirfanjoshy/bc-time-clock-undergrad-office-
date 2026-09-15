import PDFDocument from 'pdfkit';
import { TimeEntryWithUser } from '../repositories/timeEntry.repository.js';
import { formatDate, formatMinutes, formatTime } from '../utils/dates.js';

export function createTimesheetPdf(input: {
  reportTitle: string;
  dateStart: Date;
  dateEnd: Date;
  entries: TimeEntryWithUser[];
  employeeName?: string;
  personal?: boolean;
  supervisorName?: string;
}) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ margin: 48, size: 'LETTER' });

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.font('Helvetica-Bold').fontSize(22).text('BROOKLYN COLLEGE');
    doc.fontSize(12).text('Undergraduate Recruitment Office');
    doc.moveDown(0.5);
    doc.fontSize(18).text(input.reportTitle);
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(11).text(`Date Range: ${formatDate(input.dateStart)} - ${formatDate(input.dateEnd)}`);
    if (input.employeeName) {
      doc.text(`Employee: ${input.employeeName}`);
    }
    doc.moveDown(1);

    const tableTop = doc.y;
    const columns = {
      date: 48,
      employeeName: 125,
      clockIn: 300,
      clockOut: 385,
      worked: 475,
    };

    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Date', columns.date, tableTop);
    doc.text('Employee', columns.employeeName, tableTop);
    doc.text('Clock In', columns.clockIn, tableTop);
    doc.text('Clock Out', columns.clockOut, tableTop);
    doc.text('Worked Hours', columns.worked, tableTop);
    doc.moveTo(48, tableTop + 16).lineTo(548, tableTop + 16).stroke();

    let rowY = tableTop + 28;
    let totalMinutes = 0;
    const employeeIds = new Set<string>();

    doc.font('Helvetica').fontSize(10);
    for (const entry of input.entries) {
      if (rowY > 680) {
        doc.addPage();
        rowY = 56;
      }

      const worked = entry.totalMinutes ?? 0;
      totalMinutes += worked;
      employeeIds.add(entry.userId);
      doc.text(formatDate(entry.workDate), columns.date, rowY, { width: 68 });
      doc.text(`${entry.user.firstName} ${entry.user.lastName}`, columns.employeeName, rowY, { width: 165 });
      doc.text(formatTime(entry.clockIn), columns.clockIn, rowY);
      doc.text(formatTime(entry.clockOut), columns.clockOut, rowY);
      doc.text(entry.totalMinutes === null ? 'In progress' : formatMinutes(worked), columns.worked, rowY);
      rowY += 22;
    }

    if (input.entries.length === 0) {
      doc.text('No time entries found for this date range.', columns.date, rowY);
      rowY += 28;
    }

    doc.moveTo(48, rowY).lineTo(548, rowY).stroke();
    rowY += 18;
    doc.font('Helvetica-Bold');
    doc.text(`Employee count: ${input.personal ? 1 : employeeIds.size}`, 48, rowY);
    doc.text(`Total hours: ${formatMinutes(totalMinutes)}`, 260, rowY);
    rowY += 42;

    doc.font('Helvetica').fontSize(11);
    doc.text(
      `${input.personal ? 'Employee name' : 'Supervisor name'}: ${input.employeeName ?? input.supervisorName ?? '____________________'}`,
      48,
      rowY,
    );
    rowY += 34;
    doc.text(`${input.personal ? 'Employee signature' : 'Signature'}: ______________________________`, 48, rowY);
    rowY += 34;
    doc.text('Approval date: __________________________', 48, rowY);

    doc.end();
  });
}
