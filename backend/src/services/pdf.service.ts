import PDFDocument from 'pdfkit';
import { TimeEntryWithUser } from '../repositories/timeEntry.repository.js';
import { formatDate, formatMinutes, formatTime } from '../utils/dates.js';

const maroon = '#7f1d35';
const gold = '#d59b2a';
const paper = '#fffdf8';
const days = ['SUN', 'MON', 'TUES', 'WED', 'THURS', 'FRI', 'SAT'];
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const shortDate = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;

function cell(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number, value = '', bold = false, align: PDFKit.Mixins.TextOptions['align'] = 'center') {
  doc.rect(x, y, w, h).strokeColor('#b8b3aa').lineWidth(0.5).stroke();
  if (value) doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(7).fillColor('#242424').text(value, x + 2, y + (h - 8) / 2, { width: w - 4, align, lineBreak: false });
}

function renderPage(doc: PDFKit.PDFDocument, input: { dateStart: Date; dateEnd: Date; entries: TimeEntryWithUser[]; employeeName?: string; supervisorName?: string; personal?: boolean }) {
  const left = 38; const right = 574; const width = right - left;
  doc.rect(0, 0, 612, 792).fill(paper);
  doc.fillColor('#111111').font('Helvetica-Bold').fontSize(12).text('COLLEGE ASSISTANT / STUDENT AIDE', left, 34, { width, align: 'center' });
  doc.fontSize(11).text('EMPLOYEE TIME SHEET', left, 50, { width, align: 'center' });
  doc.font('Helvetica').fontSize(9).text('BROOKLYN COLLEGE', left, 66, { width, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(9).text('PAYROLL OFFICE', left, 80, { width, align: 'center' });
  const infoY = 105;
  doc.rect(left, infoY, width, 72).strokeColor('#9e9a92').stroke();
  doc.moveTo(left, infoY + 20).lineTo(right, infoY + 20).stroke();
  doc.moveTo(left, infoY + 38).lineTo(right, infoY + 38).stroke();
  doc.moveTo(left, infoY + 56).lineTo(right, infoY + 56).stroke();
  doc.moveTo(left + 280, infoY + 20).lineTo(left + 280, infoY + 72).stroke();
  doc.fillColor('#262626').font('Helvetica-Bold').fontSize(8).text('TO BE COMPLETED BY SUPERVISOR', left, infoY + 6, { width, align: 'center' });
  doc.font('Helvetica').fontSize(8).text('CA', left + 8, infoY + 25);
  doc.rect(left + 25, infoY + 24, 9, 9).strokeColor('#262626').lineWidth(0.7).stroke();
  doc.moveTo(left + 27, infoY + 28).lineTo(left + 30, infoY + 31).lineTo(left + 34, infoY + 25).strokeColor('#262626').lineWidth(1).stroke();
  doc.text('SA', left + 96, infoY + 25);
  doc.rect(left + 113, infoY + 24, 9, 9).strokeColor('#262626').lineWidth(0.7).stroke();
  doc.text('APPOINTED HOURS:  __________', left + 288, infoY + 25);
  doc.text('DEPT#:  ____________________', left + 8, infoY + 43);
  doc.text('TOTAL HOURS USED TO DATE:  __________', left + 288, infoY + 43);
  doc.text('RATE $:  __________', left + 8, infoY + 61);
  doc.text('BALANCE HOURS:  __________', left + 288, infoY + 61);
  const detailY = 188;
  doc.font('Helvetica-Bold').text('PAYROLL PERIOD:', left + 110, detailY); doc.font('Helvetica').text(`${formatDate(input.dateStart)} - ${formatDate(input.dateEnd)}`, left + 210, detailY);
  const first = input.employeeName?.split(' ').slice(0, -1).join(' ') ?? ''; const last = input.employeeName?.split(' ').slice(-1)[0] ?? '';
  doc.font('Helvetica-Bold').text('LAST NAME:', left, detailY + 26); doc.font('Helvetica').text(last || '________________', left + 64, detailY + 26); doc.font('Helvetica-Bold').text('FIRST NAME:', left + 250, detailY + 26); doc.font('Helvetica').text(first || '________________', left + 319, detailY + 26);
  doc.font('Helvetica-Bold').text('EMPL ID#:', left, detailY + 42); doc.font('Helvetica').text('________________', left + 64, detailY + 42); doc.font('Helvetica-Bold').text('DEPARTMENT:', left + 250, detailY + 42); doc.font('Helvetica').text('Admissions', left + 319, detailY + 42);
  // Keep every column inside the 536pt printable width, including Signature.
  const widths = [20, 42, 46, 43, 52, 43, 57, 42, 42, 40, 44, 65];
  const headers = ['No.', 'Day', 'Date', 'Time\nIn', 'Meal\nPeriod', 'Time\nOut', '#Hours\nWorked', 'Sick\nHours', 'Annual\nHours', 'Total', 'Shift\nHours', 'Signature'];
  let y = 238; let x = left; headers.forEach((h, i) => { cell(doc, x, y, widths[i], 32, h, true); x += widths[i]; });
  const count = 14; let total = 0; let weekTotal = 0; let row = 0;
  for (let i = 0; i < count; i += 1) {
    const date = addDays(input.dateStart, i); const entry = input.entries.find((e) => e.workDate.toDateString() === date.toDateString()); const mins = entry?.totalMinutes ?? 0; total += mins; x = left;
    const hourText = mins && mins % 60 === 0 ? String(mins / 60) : (mins ? formatMinutes(mins) : '');
    const values = [String(i + 1), days[date.getDay()], shortDate(date), entry ? formatTime(entry.clockIn) : '', entry ? '1 hour' : '', entry?.clockOut ? formatTime(entry.clockOut) : '', entry?.totalMinutes == null && entry ? 'In progress' : hourText, '', '', hourText, hourText, entry ? (input.personal ? input.employeeName ?? '' : `${entry.user.firstName} ${entry.user.lastName}`) : ''];
    values.forEach((v, col) => { cell(doc, x, y + 32 + row * 21, widths[col], 21, v, false, col === 11 ? 'left' : 'center'); x += widths[col]; });
    weekTotal += mins; row += 1;
    if (i === 6 || i === 13) {
      const subtotalY = y + 32 + row * 21; x = left;
      const mergedLabelWidth = widths[0] + widths[1] + widths[2];
      cell(doc, left, subtotalY, mergedLabelWidth, 23, 'WEEK SUB-TOTAL', true, 'left');
      x = left + mergedLabelWidth;
      widths.slice(3).forEach((w, index) => { const col = index + 3; cell(doc, x, subtotalY, w, 23, col === 6 || col === 9 ? (weekTotal && weekTotal % 60 === 0 ? String(weekTotal / 60) : formatMinutes(weekTotal)) : '', true, 'center'); x += w; });
      row += 23 / 21; weekTotal = 0;
    }
  }
  const totalY = y + 32 + row * 21; const mergedLabelWidth = widths[0] + widths[1] + widths[2]; cell(doc, left, totalY, mergedLabelWidth, 27, 'TOTAL HOURS', true, 'left'); x = left + mergedLabelWidth; widths.slice(3).forEach((w, index) => { const col = index + 3; cell(doc, x, totalY, w, 27, col === 6 || col === 9 ? (total && total % 60 === 0 ? String(total / 60) : formatMinutes(total)) : '', true, 'center'); x += w; });
  const footerY = totalY + 53; doc.fillColor('#242424').font('Helvetica').fontSize(8).text('I certify that the hours above have been worked. Sick and/or annual leave hours have to be taken as indicated.', left, footerY, { width, align: 'center' }); doc.text('All computations are correct and there are sufficient funds in my allocation to pay this expenditure.', left, footerY + 12, { width, align: 'center' });
  doc.moveTo(left, footerY + 55).lineTo(left + 170, footerY + 55).strokeColor('#777').stroke(); doc.moveTo(left + 195, footerY + 55).lineTo(left + 365, footerY + 55).stroke(); doc.moveTo(left + 390, footerY + 55).lineTo(right, footerY + 55).stroke();
  doc.fontSize(7).text(input.employeeName ?? 'Prepared by', left, footerY + 60, { width: 170, align: 'center' }); doc.text(input.supervisorName ?? "Department's Extension", left + 195, footerY + 60, { width: 170, align: 'center' }); doc.text('Chairperson/Authorized Representative', left + 390, footerY + 60, { width: 184, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(8).fillColor(gold).text(input.personal ? 'EMPLOYEE COPY' : 'SUPERVISOR / ADMIN COPY', left, 760, { width, align: 'right' });
}

export function createTimesheetPdf(input: { reportTitle: string; dateStart: Date; dateEnd: Date; entries: TimeEntryWithUser[]; employeeName?: string; personal?: boolean; supervisorName?: string }) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []; const doc = new PDFDocument({ margin: 0, size: 'LETTER' }); doc.on('data', (chunk: Buffer) => chunks.push(chunk)); doc.on('end', () => resolve(Buffer.concat(chunks))); doc.on('error', reject);
    const names = input.personal ? [input.employeeName ?? ''] : [...new Set(input.entries.map((e) => `${e.user.firstName} ${e.user.lastName}`))]; if (!names.length) names.push(input.employeeName ?? 'All employees');
    const periodDays = Math.max(1, Math.ceil((input.dateEnd.getTime() - input.dateStart.getTime()) / 86400000) + 1);
    let page = 0;
    names.forEach((name) => {
      const employeeEntries = input.personal ? input.entries : input.entries.filter((e) => `${e.user.firstName} ${e.user.lastName}` === name);
      for (let offset = 0; offset < periodDays; offset += 14) {
        if (page) doc.addPage();
        const start = addDays(input.dateStart, offset);
        const end = new Date(Math.min(input.dateEnd.getTime(), addDays(start, 13).getTime()));
        renderPage(doc, { ...input, dateStart: start, dateEnd: end, employeeName: name, entries: employeeEntries.filter((e) => e.workDate >= start && e.workDate <= end) });
        page += 1;
      }
    });
    doc.end();
  });
}
