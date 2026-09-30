import { FormEvent, useCallback, useEffect, useState } from 'react';
import { generateEmployeeTimesheetReport } from '../api/reports';
import { getTimeEntries, getUsers, updateTimeEntry } from '../api/admin';
import { useAuth } from '../auth/AuthContext';
import { EmptyState } from '../components/EmptyState';
import { TimeEntry, User } from '../types/api';
import { formatMinutes, formatTime } from '../utils/time';

const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const toDateTimeInput = (value: string) => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

export function TimesheetsPage() {
  const { accessToken } = useAuth();
  const today = new Date();
  const [users, setUsers] = useState<User[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [dateStart, setDateStart] = useState(localDateKey(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [dateEnd, setDateEnd] = useState(localDateKey(today));
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [editing, setEditing] = useState<TimeEntry | null>(null);
  const [clockInValue, setClockInValue] = useState('');
  const [clockOutValue, setClockOutValue] = useState('');
  const [workDateValue, setWorkDateValue] = useState('');
  const [editReason, setEditReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState<'filled' | 'blank' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!accessToken) return;
    getUsers(accessToken)
      .then((list) => {
        const employees = list.filter((user) => user.role === 'EMPLOYEE');
        setUsers(employees);
        setEmployeeId((current) => current || employees[0]?.id || '');
      })
      .catch(() => setError('Unable to load employees.'));
  }, [accessToken]);

  const loadEntries = useCallback(async () => {
    if (!accessToken || !employeeId) {
      setEntries([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setEntries(await getTimeEntries(accessToken, { userId: employeeId, startDate: dateStart, endDate: dateEnd }));
    } catch {
      setError('Unable to load this employee’s timesheet.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, employeeId, dateStart, dateEnd]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  function beginEdit(entry: TimeEntry) {
    setEditing(entry);
    setClockInValue(toDateTimeInput(entry.clockIn));
    setClockOutValue(entry.clockOut ? toDateTimeInput(entry.clockOut) : '');
    setWorkDateValue(entry.workDate.slice(0, 10));
    setEditReason('');
    setMessage('');
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !editing) return;
    setSaving(true);
    setError(null);
    setMessage('');
    try {
      await updateTimeEntry(accessToken, editing.id, {
        workDate: workDateValue,
        clockIn: new Date(clockInValue).toISOString(),
        clockOut: clockOutValue ? new Date(clockOutValue).toISOString() : null,
        editReason: editReason.trim(),
      });
      setEditing(null);
      setMessage('Timesheet updated. The change was recorded in the audit log.');
      await loadEntries();
    } catch {
      setError('Unable to save the change. Check that clock-out is after clock-in and try again.');
    } finally {
      setSaving(false);
    }
  }

  async function downloadTimesheet(blank: boolean) {
    if (!accessToken || !employeeId || dateEnd < dateStart) return;
    setDownloading(blank ? 'blank' : 'filled');
    setError(null);
    try {
      const report = await generateEmployeeTimesheetReport(accessToken, {
        employeeId,
        dateStart,
        dateEnd,
        blank,
      });
      const url = URL.createObjectURL(report.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = report.fileName;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError(`Unable to create the ${blank ? 'blank' : 'filled'} employee PDF.`);
    } finally {
      setDownloading(null);
    }
  }

  const selectedUser = users.find((user) => user.id === employeeId);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Edit Employee Timesheet</h1>
          <p>Correct clock-in or clock-out times, such as a forgotten clock-out, and download one employee’s form.</p>
        </div>
      </header>

      <section className="panel timesheet-admin-controls">
        <div className="form-grid two">
          <label>
            Employee
            <select value={employeeId} onChange={(event) => { setEmployeeId(event.target.value); setEditing(null); }}>
              <option value="">Choose an employee</option>
              {users.map((user) => <option key={user.id} value={user.id}>{user.firstName} {user.lastName} — {user.employeeId}</option>)}
            </select>
          </label>
          <div className="form-grid two">
            <label>From<input type="date" value={dateStart} onChange={(event) => setDateStart(event.target.value)} /></label>
            <label>To<input type="date" value={dateEnd} onChange={(event) => setDateEnd(event.target.value)} /></label>
          </div>
        </div>
        <div className="timesheet-pdf-actions">
          <button type="button" disabled={!employeeId || dateEnd < dateStart || downloading !== null} onClick={() => void downloadTimesheet(false)}>
            {downloading === 'filled' ? 'Making PDF…' : 'Download Filled PDF'}
          </button>
          <button type="button" disabled={!employeeId || dateEnd < dateStart || downloading !== null} onClick={() => void downloadTimesheet(true)}>
            {downloading === 'blank' ? 'Making PDF…' : 'Download Blank Form'}
          </button>
        </div>
      </section>

      {error ? <EmptyState title="Timesheet action failed" message={error} /> : null}
      {message ? <p className="auth-success" role="status">{message}</p> : null}
      {!users.length && !error ? <EmptyState title="No employees found" /> : null}

      {selectedUser ? (
        <section className="panel">
          <header className="panel-heading">
            <div><h2>{selectedUser.firstName} {selectedUser.lastName}</h2><p>{selectedUser.employeeId} · {dateStart} to {dateEnd}</p></div>
          </header>
          {loading ? <p>Loading timesheet…</p> : null}
          <table>
            <thead><tr><th>Work Date</th><th>Clock In</th><th>Clock Out</th><th>Status</th><th>Total</th><th>Action</th></tr></thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(`${entry.workDate.slice(0, 10)}T00:00:00`).toLocaleDateString()}</td>
                  <td>{formatTime(entry.clockIn)}</td>
                  <td>{entry.clockOut ? formatTime(entry.clockOut) : 'Not clocked out'}</td>
                  <td><span className={`badge ${entry.clockOut ? 'success' : 'warning'}`}>{entry.clockOut ? entry.status : 'OPEN SHIFT'}</span></td>
                  <td>{entry.totalMinutes == null ? 'In progress' : formatMinutes(entry.totalMinutes)}</td>
                  <td><button type="button" onClick={() => beginEdit(entry)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!entries.length && !loading ? <EmptyState title="No time entries for these dates" /> : null}
        </section>
      ) : null}

      {editing ? (
        <section className="panel timesheet-edit-panel">
          <header className="panel-heading"><div><h2>Correct this shift</h2><p>Employee: {editing.user ? `${editing.user.firstName} ${editing.user.lastName}` : selectedUser?.firstName}</p></div></header>
          <form className="form-grid two" onSubmit={(event) => void saveEdit(event)}>
            <label>Work date<input required type="date" value={workDateValue} onChange={(event) => setWorkDateValue(event.target.value)} /></label>
            <label>Clock in<input required type="datetime-local" value={clockInValue} onChange={(event) => setClockInValue(event.target.value)} /></label>
            <label>Clock out<input type="datetime-local" value={clockOutValue} onChange={(event) => setClockOutValue(event.target.value)} /><small>Leave empty only if the employee is still working.</small></label>
            <label>Reason for this change<textarea required minLength={3} maxLength={500} value={editReason} onChange={(event) => setEditReason(event.target.value)} placeholder="Example: Employee forgot to clock out; supervisor confirmed 5:00 PM." /></label>
            <div className="timesheet-edit-actions">
              <button type="submit" disabled={saving || !editReason.trim()}>{saving ? 'Saving…' : 'Save timesheet correction'}</button>
              <button type="button" className="secondary-button" disabled={saving} onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}
