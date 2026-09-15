import { useCallback, useEffect, useState } from "react";
import { BarChart3, BriefcaseBusiness, Clock3, Users } from "lucide-react";
import { getDashboard } from "../api/admin";
import { useAuth } from "../auth/AuthContext";
import { EmptyState } from "../components/EmptyState";
import { MetricCard } from "../components/MetricCard";
import { AdminDashboard } from "../types/api";
import { formatMinutes, formatTime } from "../utils/time";

export function DashboardPage() {
  const { accessToken } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      setDashboard(await getDashboard(accessToken));
      setError(null);
    } catch {
      setError("Unable to load dashboard from backend.");
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="dashboard-page">
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Admin Dashboard</h1>
      {error ? (
        <EmptyState title="Dashboard unavailable" message={error} />
      ) : null}

      <div className="dashboard-layout" style={{ gridTemplateColumns: "1fr" }}>
        <div className="dashboard-main">
          <div className="metrics">
            <MetricCard
              label="Total Staff"
              value={String(dashboard?.totalStaff ?? 0)}
              icon={<Users size={22} />}
            />
            <MetricCard
              label="Working Now"
              value={String(dashboard?.workingNow ?? 0)}
              icon={<BriefcaseBusiness size={22} />}
            />
            <MetricCard
              label="Clocked Out"
              value={String(dashboard?.clockedOutToday ?? 0)}
              icon={<Clock3 size={22} />}
            />
            <MetricCard
              label="Total Hours Today"
              value={formatMinutes(dashboard?.totalMinutesToday)}
              icon={<BarChart3 size={22} />}
            />
          </div>

          <div className="panel-grid">
            <section className="panel">
              <div className="panel-heading">
                <h2>Currently Working</h2>
                <button onClick={() => void load()} type="button">
                  View All
                </button>
              </div>
              <div className="table-list">
                <div className="table-head four">
                  <span>Name</span>
                  <span>Clock In</span>
                  <span>Duration</span>
                  <span>Status</span>
                </div>
                {dashboard?.currentlyWorking.length ? (
                  dashboard.currentlyWorking.map((item) => (
                    <div className="table-row four" key={item.id}>
                      <strong>{item.name}</strong>
                      <span>{formatTime(item.clockIn)}</span>
                      <b>{formatMinutes(item.minutesWorked)}</b>
                      <em>Working</em>
                    </div>
                  ))
                ) : (
                  <EmptyState title="No one is currently clocked in" />
                )}
              </div>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <h2>Recent Activity</h2>
                <button onClick={() => void load()} type="button">
                  View All
                </button>
              </div>
              <div className="table-list">
                <div className="table-head three">
                  <span>User</span>
                  <span>Action</span>
                  <span>Time</span>
                </div>
                {dashboard?.recentActivity.length ? (
                  dashboard.recentActivity.map((item) => (
                    <div className="table-row three" key={item.id}>
                      <strong>{item.label}</strong>
                      <span>{item.detail}</span>
                      <span>{formatTime(item.occurredAt)}</span>
                    </div>
                  ))
                ) : (
                  <EmptyState title="No recent activity" />
                )}
              </div>
            </section>

            <section className="panel">
              <h2>Attention Needed</h2>
              {dashboard?.attentionNeeded.length ? (
                dashboard.attentionNeeded.map((item) => (
                  <div className="mobile-shift" key={item.id}>
                    <div>
                      <strong>{item.label}</strong>
                      <p>{item.detail}</p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No issues need attention" />
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
