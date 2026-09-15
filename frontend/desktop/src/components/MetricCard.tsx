import { ReactNode } from 'react';

export function MetricCard({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <section className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </section>
  );
}
