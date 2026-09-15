import { useEffect, useState } from 'react';
import { getTimeEntries } from '../api/admin';
import { useAuth } from '../auth/AuthContext';
import { EmptyState } from '../components/EmptyState';
import { TimeEntry } from '../types/api';
import { formatMinutes, formatTime } from '../utils/time';

export function TimesheetsPage() {
  const { accessToken } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getTimeEntries(accessToken)
      .then(setEntries)
      .catch(() => setError('Unable to load time entries.'));
  }, [accessToken]);

  return (
    <div className="page">
      <header className="page-header">
        <div><h1>Timesheets</h1><p>Review daily employee clock sessions.</p></div>
      </header>
      {error ? <EmptyState title="Timesheets unavailable" message={error} /> : null}
      <section className="panel">
        <table>
          <thead>
            <tr><th>Employee</th><th>Clock In</th><th>Clock Out</th><th>Status</th><th>Total</th></tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : entry.userId}</td>
                <td>{formatTime(entry.clockIn)}</td>
                <td>{formatTime(entry.clockOut)}</td>
                <td><span className="badge success">{entry.status}</span></td>
                <td>{formatMinutes(entry.totalMinutes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!entries.length && !error ? <EmptyState title="No time entries found" /> : null}
      </section>
    </div>
  );
}
