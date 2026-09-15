import { useEffect, useState } from 'react';
import { getAuditLogs } from '../api/admin';
import { useAuth } from '../auth/AuthContext';
import { EmptyState } from '../components/EmptyState';
import { AuditLog } from '../types/api';

export function AuditLogsPage() {
  const { accessToken } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getAuditLogs(accessToken)
      .then(setLogs)
      .catch(() => setError('Unable to load audit logs.'));
  }, [accessToken]);

  return (
    <div className="page">
      <header className="page-header">
        <div><h1>Audit Logs</h1><p>Review administrative and security-sensitive activity.</p></div>
      </header>
      {error ? <EmptyState title="Audit logs unavailable" message={error} /> : null}
      <section className="panel">
        <table>
          <thead>
            <tr><th>Action</th><th>Actor</th><th>Target</th><th>Created</th></tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.action}</td>
                <td>{log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : 'System'}</td>
                <td>{log.targetUser ? `${log.targetUser.firstName} ${log.targetUser.lastName}` : log.targetEntityType ?? '--'}</td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!logs.length && !error ? <EmptyState title="No audit logs found" /> : null}
      </section>
    </div>
  );
}
