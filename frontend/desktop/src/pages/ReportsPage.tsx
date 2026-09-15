import { FormEvent, useState } from 'react';
import { generateReport } from '../api/reports';
import { useAuth } from '../auth/AuthContext';
import { ReportType } from '../types/api';

const reportTypes: ReportType[] = ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM'];

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
          <label>Report Type
            <select value={type} onChange={(event) => setType(event.target.value as ReportType)}>
              {reportTypes.map((item) => <option key={item} value={item}>{item}</option>)}
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
          <button disabled={loading} type="submit">{loading ? 'Generating...' : 'Generate PDF'}</button>
          <button disabled={!pdfUrl} onClick={savePdf} type="button">Save PDF</button>
        </form>
        <div className="pdf-preview">
          {pdfUrl ? <iframe src={pdfUrl} title="PDF report preview" /> : <div className="empty-state"><strong>No report preview</strong><span>Generate a report to preview the PDF.</span></div>}
        </div>
      </section>
    </div>
  );
}
