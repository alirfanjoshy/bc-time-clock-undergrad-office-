import { useEffect, useState, useSyncExternalStore } from 'react';
import { getPendingRequests, subscribeToActivity } from '../api/activity';

export function CampusLoader({ overlay = false }: { overlay?: boolean }) {
  return (
    <section className={`campus-loader${overlay ? ' campus-loader-overlay' : ''}`} role="status" aria-live="polite" aria-label="Loading BC Time Clock">
      <div className="campus-loader-card">
        <div className="campus-loader-brand" aria-hidden="true">Brooklyn College<span>BC TIME CLOCK</span></div>
        <div className="campus-loader-scene" aria-hidden="true">
          <img className="campus-loader-building" src={`${import.meta.env.BASE_URL}loading/campus.png`} alt="" />
          <div className="campus-loader-track" />
          <div className="campus-loader-shadow" />
          <div className="campus-loader-runner"><div className="campus-loader-dog" /></div>
          <div className="campus-loader-speed"><i /><i /><i /></div>
        </div>
        <p className="campus-loader-title">Making every moment count<span className="campus-loader-dots" aria-hidden="true">…</span></p>
        <p className="campus-loader-caption">Loading your time clock</p>
        <div className="campus-loader-progress" aria-hidden="true"><span /></div>
      </div>
    </section>
  );
}

export function RequestLoader() {
  const pending = useSyncExternalStore(subscribeToActivity, getPendingRequests);
  const [visible, setVisible] = useState(false);
  const active = pending > 0;
  useEffect(() => {
    if (!active) { setVisible(false); return; }
    const timer = window.setTimeout(() => setVisible(true), 350);
    return () => window.clearTimeout(timer);
  }, [active]);
  return active && visible ? <CampusLoader overlay /> : null;
}
