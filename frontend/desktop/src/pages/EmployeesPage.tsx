import { useEffect, useState } from 'react';
import { getUsers, resetClockDevice } from '../api/admin';
import { useAuth } from '../auth/AuthContext';
import { EmptyState } from '../components/EmptyState';
import { User } from '../types/api';

export function EmployeesPage() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getUsers(accessToken).then(setUsers).catch(() => setError('Unable to load employees.'));
  }, [accessToken]);

  async function resetDevice(user: User) {
    if (!accessToken || !window.confirm(`Reset the registered phone for ${user.firstName} ${user.lastName}?`)) return;
    setResetting(user.id);
    try { await resetClockDevice(accessToken, user.id); window.alert('Registered phone reset.'); }
    catch { setError('Unable to reset the registered phone.'); }
    finally { setResetting(null); }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div><h1>Employees</h1><p>Manage staff accounts and roles.</p></div>
      </header>
      {error ? <EmptyState title="Employees unavailable" message={error} /> : null}
      <section className="panel">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Employee ID</th><th>Phone</th></tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td><span className={user.isActive ? 'badge success' : 'badge danger'}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>{user.employeeId}</td>
                <td><button type="button" onClick={() => resetDevice(user)} disabled={resetting === user.id}>{resetting === user.id ? 'Resetting…' : 'Reset phone'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && !error ? <EmptyState title="No employees found" /> : null}
      </section>
    </div>
  );
}
