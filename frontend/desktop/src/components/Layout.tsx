import { ReactNode } from 'react';
import {
  BarChart3,
  Bell,
  CalendarClock,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export type Section = 'dashboard' | 'employees' | 'timesheets' | 'reports' | 'audit' | 'settings';

const navItems: Array<{ key: Section; label: string; icon: ReactNode }> = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { key: 'employees', label: 'Employees', icon: <Users size={18} /> },
  { key: 'timesheets', label: 'Timesheets', icon: <ClipboardList size={18} /> },
  { key: 'reports', label: 'Reports', icon: <FileText size={18} /> },
  { key: 'audit', label: 'Audit Logs', icon: <ShieldCheck size={18} /> },
  { key: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

const topbarItems = navItems;

export function Layout({
  active,
  onChange,
  children,
}: {
  active: Section;
  onChange: (section: Section) => void;
  children: ReactNode;
}) {
  const { user, signOut } = useAuth();

  return (
    <div className="app-shell">
      <header className="admin-topbar">
        <div className="topbar-brand">
          <div className="brand-lockup">
            <span>Brooklyn<br />College</span>
            <i />
            <b>CU<br />NY</b>
          </div>
          <div className="topbar-title">
            <strong>Undergraduate Recruitment Office</strong>
            <small>Time & Attendance System</small>
          </div>
        </div>
        <nav className="topbar-nav">
          {topbarItems.map((item) => (
            <button
              className={active === item.key ? 'active' : ''}
              key={item.key}
              onClick={() => onChange(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="topbar-user">
          <button className="topbar-signout" onClick={signOut} type="button" aria-label="Sign out"><LogOut size={18} /></button>
          <button className="notification-button" type="button" aria-label="Notifications">
            <Bell size={20} />

          </button>
          <div className="avatar">{user?.firstName[0]}{user?.lastName[0]}</div>
          <div>
            <strong>{user?.firstName} {user?.lastName}</strong>
            <small>Administrator</small>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
