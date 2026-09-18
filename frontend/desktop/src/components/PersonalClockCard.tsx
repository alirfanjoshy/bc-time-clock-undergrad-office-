import { useCallback, useEffect, useState } from 'react';
import { clockIn, clockOut, getStatus, TimeStatus } from '../api/time';
import { useAuth } from '../auth/AuthContext';
import { formatElapsedSeconds, formatMinutes, formatTime } from '../utils/time';

export function PersonalClockCard({ onChanged }: { onChanged?: () => void } = {}) {
  const { accessToken } = useAuth();
  const [status, setStatus] = useState<TimeStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      setStatus(await getStatus(accessToken));
      setError(null);
    } catch {
      setError('Clock status is unavailable.');
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [status?.isClockedIn]);

  async function toggleClock() {
    if (!accessToken || !status) return;
    setSaving(true);
    try {
      if (status.isClockedIn) {
        await clockOut(accessToken);
      } else {
        const storageKey = 'bc-time-clock-device-id';
        let deviceId = window.localStorage.getItem(storageKey);
        if (!deviceId) {
          deviceId = crypto.randomUUID();
          window.localStorage.setItem(storageKey, deviceId);
        }
        await clockIn(accessToken, deviceId);
      }
      await load();
      onChanged?.();
    } catch {
      setError('Clock action failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rail-card time-clock-card">
      <p className="mobile-clock-date">{new Date(now).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
      <strong className="mobile-clock-time">{new Date(now).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</strong>
      <div className={status?.isClockedIn ? 'clock-state active' : 'clock-state'}>
        <strong>{status?.isClockedIn ? 'Clocked In' : 'Not clocked in'}</strong>
        <span>
          {status?.isClockedIn ? `Started ${formatTime(status.currentEntry?.clockIn)}` : 'Ready to start shift'}
        </span>
        {status?.isClockedIn ? <strong className="elapsed-time">{formatElapsedSeconds(status.currentEntry?.clockIn, now)}</strong> : null}
      </div>
      <div className="clock-metrics">
        <div><span>Today</span><strong>{formatMinutes(status?.todayMinutes)}</strong></div>
        <div><span>This Week</span><strong>{formatMinutes(status?.weekMinutes)}</strong></div>
      </div>
      {error ? <p className="error">{error}</p> : null}
      <button className={status?.isClockedIn ? 'clock-out-action' : 'clock-in-action'} disabled={saving || !status} onClick={toggleClock} type="button">
        {saving ? 'Saving...' : status?.isClockedIn ? 'Clock Out' : 'Clock In'}
      </button>
    </section>
  );
}
