import { FormEvent, useState } from 'react';
import { CalendarDays, FileText } from 'lucide-react';
import { generateReport } from '../api/reports';
import { useAuth } from '../auth/AuthContext';
import { ReportType } from '../types/api';

const reportTypes: ReportType[] = ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM'];
const reportLabels: Record<ReportType, string> = {
  DAILY: 'Daily report',
  WEEKLY: 'Weekly report',
  BIWEEKLY: 'Two-week report',
  MONTHLY: 'Monthly report',
  CUSTOM: 'Custom date range',
};

export function ReportsPage() {
  const { accessToken } = useAuth();
  const [type, setType] = useState<ReportType>('DAILY');
  const [dateStart, setDateStart] = useState(new Date().toISOString().slice(0, 10));
  const [dateEnd, setDateEnd] = useState(new Date().toISOString().slice(0, 10));
  const [supervisorName, setSupervisorName] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    setLoading(true);
    setError(null);
    try {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const report = await generateReport(accessToken, {
        type,
        dateStart,
        dateEnd,
        supervisorName: supervisorName || undefined,
      });
      setPdfUrl(URL.createObjectURL(report.blob));
      setFileName(report.fileName);
    } catch {
      setError('Unable to generate PDF report from backend.');
    } finally {
      setLoading(false);
    }
  }

  function savePdf() {
    if (!pdfUrl || !fileName) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    link.click();
  }

  return (
    <div className="page">
      <header className="page-header">
        <div><h1>Reports</h1><p>Generate, preview, and save official PDF timesheet reports.</p></div>
      </header>
      <section className="report-workspace">
        <form className="report-form" onSubmit={submit}>
          <div className="report-form-heading"><span className="report-icon"><CalendarDays size={19} /></span><div><h2>Build a report</h2><p>Choose the report period and download a PDF.</p></div></div>
          <label>Report Type
            <select value={type} onChange={(event) => setType(event.target.value as ReportType)}>
              {reportTypes.map((item) => <option key={item} value={item}>{reportLabels[item]}</option>)}
            </select>
          </label>
          <label>Start Date
            <input type="date" value={dateStart} onChange={(event) => setDateStart(event.target.value)} />
          </label>
          <label>End Date
            <input type="date" value={dateEnd} onChange={(event) => setDateEnd(event.target.value)} />
          </label>
          <label>Supervisor Name
            <input value={supervisorName} onChange={(event) => setSupervisorName(event.target.value)} />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <p className="report-form-note">The preview will appear here after you generate the report.</p>
          <button disabled={loading || dateEnd < dateStart} type="submit">{loading ? 'Generating...' : 'Generate PDF report'}</button>
          <button className="report-save-button" disabled={!pdfUrl} onClick={savePdf} type="button">Download PDF</button>
        </form>
        <div className={`pdf-preview${pdfUrl ? ' has-report' : ''}`}>
          {pdfUrl ? (
            <iframe src={pdfUrl} title={`PDF report preview: ${fileName ?? 'generated report'}`} />
          ) : (
            <div className="pdf-preview-empty">
              <span className="pdf-preview-icon"><FileText size={28} /></span>
              <span className="timesheet-section-label">PDF PREVIEW</span>
              <h2>Your report will appear here</h2>
              <p>This page creates reports. Choose a report type and date range, then select <strong>Generate PDF report</strong>.</p>
              <div className="pdf-preview-steps"><span><b>1</b> Choose dates</span><span><b>2</b> Generate the PDF</span><span><b>3</b> Preview or download it</span></div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
