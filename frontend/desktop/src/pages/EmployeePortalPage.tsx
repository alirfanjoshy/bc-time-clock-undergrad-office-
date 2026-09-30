import { ChangeEvent, useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Home,
  Mail,
  UserRound,
  BadgeCheck,
  Users,
  ShieldCheck,
  LogOut,
  ArrowUpRight,
  Clock3,
} from "lucide-react";
import { generateMyTimesheetReport } from "../api/reports";
import { getMyEntries } from "../api/time";
import { useAuth } from "../auth/AuthContext";
import { PersonalClockCard } from "../components/PersonalClockCard";
import { OfficeLocationCard } from "../components/OfficeLocationCard";
import { DashboardPage } from "./DashboardPage";
import { EmployeesPage } from "./EmployeesPage";
import { ReportsPage } from "./ReportsPage";
import { TimesheetsPage } from "./TimesheetsPage";
import { AuditLogsPage } from "./AuditLogsPage";
import { TimeEntry } from "../types/api";
import { formatMinutes, formatTime } from "../utils/time";
import { enableMfa, setupMfa } from "../api/auth";

type Tab =
  | "home"
  | "timesheet"
  | "profile"
  | "dashboard"
  | "reports"
  | "employees"
  | "team-timesheets"
  | "audit";
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const entryMinutes = (entry: TimeEntry) =>
  entry.clockOut
    ? (entry.totalMinutes ?? 0)
    : Math.max(
        0,
        Math.floor((Date.now() - new Date(entry.clockIn).getTime()) / 60000),
      );

export function EmployeePortalPage() {
  const { accessToken, user, signOut } = useAuth();
  const admin = user?.role === "ADMIN";
  const [tab, setTab] = useState<Tab>(admin ? "dashboard" : "home");
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [error, setError] = useState("");
  const [sharing, setSharing] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(() => user ? window.localStorage.getItem(`bc-avatar-${user.id}`) : null);
  const [mfaSetup, setMfaSetup] = useState<{ qrCode: string; secret: string } | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaMessage, setMfaMessage] = useState('');
  async function beginMfa() { if (!accessToken || mfaSetup) return; setMfaSetup(await setupMfa(accessToken)); setMfaMessage(''); }
  async function confirmMfa() { if (!accessToken) return; try { await enableMfa(accessToken, mfaCode); window.location.reload(); } catch { setMfaMessage('That code is not valid. Try the current six-digit code.'); } }
  const today = new Date();
  const [dateStart, setDateStart] = useState(
    dateKey(new Date(today.getFullYear(), today.getMonth(), 1)),
  );
  const [dateEnd, setDateEnd] = useState(dateKey(today));
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(
    weekStart.getDate() - weekStart.getDay() + weekOffset * 7,
  );
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + index);
    return day;
  });
  const entriesFor = (day: Date) =>
    entries.filter((entry) => entry.workDate.slice(0, 10) === dateKey(day));
  const weeklyTotal = days.reduce(
    (sum, day) =>
      sum + entriesFor(day).reduce((n, entry) => n + entryMinutes(entry), 0),
    0,
  );
  const loadEntries = useCallback(async () => {
    if (!accessToken) return;
    try {
      setEntries(await getMyEntries(accessToken));
      setError("");
    } catch {
      setError("Unable to load your shifts. Please try again.");
    }
  }, [accessToken]);
  useEffect(() => {
    void loadEntries();
  }, [loadEntries, tab]);
  async function printTimesheet(blank = false) {
    if (!accessToken || sharing) return;
    setSharing(true);
    setError("");
    try {
      const report = await generateMyTimesheetReport(accessToken, {
        dateStart,
        dateEnd,
        blank,
      });
      const url = URL.createObjectURL(report.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = report.fileName;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("Unable to generate your PDF timesheet.");
    } finally {
      setSharing(false);
    }
  }
  const initials = `${user?.firstName[0] ?? ""}${user?.lastName[0] ?? ""}`;
  function chooseAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !user || file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => { const value = String(reader.result); window.localStorage.setItem(`bc-avatar-${user.id}`, value); setAvatar(value); };
    reader.readAsDataURL(file);
  }
  const avatarImage = avatar ?? `${import.meta.env.BASE_URL}loading/bulldog-face.png`;
  const tabs = admin
    ? [
        { key: "dashboard" as Tab, label: "Dashboard", icon: BarChart3 },
        { key: "home" as Tab, label: "Clock", icon: Home },
        { key: "timesheet" as Tab, label: "Timesheet", icon: ClipboardList },
        { key: "reports" as Tab, label: "Reports", icon: FileText },
        { key: "profile" as Tab, label: "Profile", icon: UserRound },
      ]
    : [
        { key: "home" as Tab, label: "Home", icon: Home },
        { key: "timesheet" as Tab, label: "Timesheet", icon: ClipboardList },
        { key: "profile" as Tab, label: "Profile", icon: UserRound },
      ];
  const desktopTabs = admin
    ? [
        { key: "dashboard" as Tab, label: "Overview", icon: BarChart3 },
        { key: "home" as Tab, label: "My Time Clock", icon: Clock3 },
        { key: "timesheet" as Tab, label: "My Timesheet", icon: ClipboardList },
        { key: "employees" as Tab, label: "Employees", icon: Users },
        {
          key: "team-timesheets" as Tab,
          label: "Edit Timesheets",
          icon: CalendarDays,
        },
        { key: "reports" as Tab, label: "Reports", icon: FileText },
        { key: "audit" as Tab, label: "Audit Logs", icon: ShieldCheck },
        { key: "profile" as Tab, label: "My Profile", icon: UserRound },
      ]
    : [
        { key: "home" as Tab, label: "My Time Clock", icon: Clock3 },
        { key: "timesheet" as Tab, label: "My Timesheet", icon: ClipboardList },
        { key: "profile" as Tab, label: "My Profile", icon: UserRound },
      ];
  return (
    <main
      className={`mobile-web-app ${admin && ["dashboard", "reports", "employees", "team-timesheets", "audit"].includes(tab) ? "admin-workspace" : ""}`}
    >
      <aside className="desktop-navigation">
        <div className="desktop-brand">
          <div className="brand-lockup">
            <span>
              Brooklyn
              <br />
              College
            </span>
            <i />
            <b>
              CU
              <br />
              NY
            </b>
          </div>
          <p>UNDERGRADUATE RECRUITMENT</p>
        </div>
        <div className="desktop-nav-label">WORKSPACE</div>
        <nav aria-label="Desktop navigation">
          {desktopTabs.map((item) => (
            <button
              key={item.key}
              className={tab === item.key ? "active" : ""}
              aria-current={tab === item.key ? "page" : undefined}
              onClick={() => setTab(item.key)}
            >
              <item.icon size={19} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="desktop-nav-footer">
          <div className="desktop-account">
            <img src={avatarImage} alt="" className={`desktop-account-avatar ${avatar ? '' : 'default-bulldog-avatar'}`} />
            <div>
              <strong>
                {user?.firstName} {user?.lastName}
              </strong>
              <small>{admin ? "Administrator" : "Employee"}</small>
            </div>
          </div>
          <button onClick={signOut}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
      <header className="mobile-web-header">
        <div className="brand-lockup">
          <span>
            Brooklyn
            <br />
            College
          </span>
          <i />
          <b>
            CU
            <br />
            NY
          </b>
        </div>
        <div className="desktop-header-title">
          <span>Time & Attendance</span>
          <strong>{desktopTabs.find((item) => item.key === tab)?.label}</strong>
        </div>
        <div className="desktop-header-date">
          <CalendarDays size={16} />
          {today.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
        <button
          className="mobile-web-avatar"
          onClick={() => setTab("profile")}
          aria-label="Open Profile"
        >
          <img src={avatarImage} alt="Profile" className={`header-avatar-image ${avatar ? '' : 'default-bulldog-avatar'}`} />
        </button>
      </header>
      <div className="desktop-workspace">
        {tab === "home" ? (
          <>
            <section className="mobile-web-greeting">
              <span>
                {today.getHours() < 12
                  ? "Good morning,"
                  : today.getHours() < 18
                    ? "Good afternoon,"
                    : "Good evening,"}
              </span>
              <h1>
                {user?.firstName} {user?.lastName}
              </h1>
              <p>
                {user?.department?.name ?? "Undergraduate Recruitment Office"}
              </p>
            </section>
            <div className="mobile-web-content desktop-clock-grid">
              <PersonalClockCard onChanged={loadEntries} />
              <section className="desktop-recent-panel">
                <div className="mobile-section-heading">
                  <h2>Recent Activity</h2>
                  <button onClick={() => setTab("timesheet")}>View All</button>
                </div>
                {entries.slice(0, 3).map((entry) => (
                  <div className="mobile-shift" key={entry.id}>
                    <div>
                      <strong>
                        {new Date(entry.clockIn).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </strong>
                      <p>
                        {formatTime(entry.clockIn)} –{" "}
                        {entry.clockOut
                          ? formatTime(entry.clockOut)
                          : "Working"}
                      </p>
                    </div>
                    <b>{formatMinutes(entryMinutes(entry))}</b>
                  </div>
                ))}
                {!entries.length && !error ? (
                  <p className="auth-copy">
                    Your shifts will appear here after you clock in.
                  </p>
                ) : null}
                {error ? (
                  <p className="error" role="alert">
                    {error}{" "}
                    <button onClick={() => void loadEntries()}>Retry</button>
                  </p>
                ) : null}
              </section>
              <section className="desktop-shortcut">
                <div>
                  <span>YOUR ATTENDANCE</span>
                  <h2>Every shift, in one place.</h2>
                  <p>
                    Review your weekly hours and download a timesheet whenever
                    you need it.
                  </p>
                </div>
                <button onClick={() => setTab("timesheet")}>
                  View My Timesheet <ArrowUpRight size={17} />
                </button>
              </section>
            </div>
          </>
        ) : null}
        {tab === "timesheet" ? (
          <section className="mobile-web-content desktop-timesheet">
            <div className="desktop-page-heading">
              <div>
                <span className="desktop-eyebrow">YOUR ATTENDANCE</span>
                <h1>My Timesheet</h1>
                <p>
                  Review your shifts, track your hours, and export your records.
                </p>
              </div>
            </div>
            <div className="mobile-week-picker">
              <button
                aria-label="Previous week"
                onClick={() => setWeekOffset((value) => value - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <span>
                <CalendarDays size={16} />
                {weekStart.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                –{" "}
                {days[6].toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <button
                aria-label="Next week"
                onClick={() => setWeekOffset((value) => value + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
            {error ? (
              <p className="error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="desktop-week-list">
              <div className="desktop-timesheet-columns">
                <span>Day / Date</span>
                <span>Shift details</span>
                <span>Total hours</span>
              </div>
              {days.map((day) => {
                const shifts = entriesFor(day);
                return (
                  <div
                    className={`mobile-shift ${dateKey(day) === dateKey(today) ? "today" : ""}`}
                    key={dateKey(day)}
                  >
                    <div>
                      <strong>
                        {day.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </strong>
                      {shifts.length ? (
                        shifts.map((entry) => (
                          <p key={entry.id}>
                            {formatTime(entry.clockIn)} –{" "}
                            {entry.clockOut
                              ? formatTime(entry.clockOut)
                              : "Working"}
                          </p>
                        ))
                      ) : (
                        <p>No shift recorded</p>
                      )}
                    </div>
                    <b>
                      {shifts.length
                        ? formatMinutes(
                            shifts.reduce(
                              (sum, entry) => sum + entryMinutes(entry),
                              0,
                            ),
                          )
                        : "—"}
                    </b>
                  </div>
                );
              })}
            </div>
            <aside className="desktop-timesheet-summary">
              <div className="mobile-week-total">
                <span>Weekly Total</span>
                <strong>{formatMinutes(weeklyTotal)}</strong>
              </div>
              <details className="mobile-report">
                <summary>Download a PDF timesheet</summary>
                <div className="form-grid two">
                  <label>
                    Start Date
                    <input
                      type="date"
                      value={dateStart}
                      onChange={(event) => setDateStart(event.target.value)}
                    />
                  </label>
                  <label>
                    End Date
                    <input
                      type="date"
                      value={dateEnd}
                      onChange={(event) => setDateEnd(event.target.value)}
                    />
                  </label>
                </div>
                <div className="timesheet-pdf-actions">
                  <button
                    disabled={sharing || dateEnd < dateStart}
                    onClick={() => void printTimesheet(false)}
                  >
                    {sharing ? "Generating..." : "Download Filled PDF"}
                  </button>
                  <button
                    disabled={sharing || dateEnd < dateStart}
                    onClick={() => void printTimesheet(true)}
                  >
                    {sharing ? "Generating..." : "Download Blank Form"}
                  </button>
                </div>
              </details>
            </aside>
          </section>
        ) : null}
        {tab === "profile" ? (
          <section className="mobile-web-content desktop-profile">
            <div className="desktop-page-heading">
              <div>
                <span className="desktop-eyebrow">YOUR ACCOUNT</span>
                <h1>My Profile</h1>
                <p>Your office, account details, and contact information.</p>
              </div>
            </div>
            <div className="mobile-profile-card">
              <label className="mobile-profile-avatar profile-avatar-upload" title="Choose profile picture">
                <img src={avatarImage} alt="Profile" className={avatar ? '' : 'default-bulldog-avatar'} />
                <span>Change profile picture</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseAvatar} />
              </label>
              <h2>
                {user?.firstName} {user?.lastName}
              </h2>
              <p>{admin ? "Administrator" : "Employee"}</p>
              <div className="mobile-profile-rows">
                <p>
                  <Mail size={18} />
                  {user?.email}
                </p>
                <p>
                  <Building2 size={18} />
                  {user?.department?.name ?? "Undergraduate Recruitment Office"}
                </p>
                <p>
                  <UserRound size={18} />
                  {admin ? "Administrator" : "Employee"}
                </p>
                <p>
                  <BadgeCheck size={18} />
                  EMPLID: {user?.employeeId}
                </p>
              </div>
              {!user?.totpEnabled && (!mfaSetup ? <div className="security-setup"><strong>Account security</strong><p>Set up Microsoft Authenticator once. It will be required whenever you sign in.</p><button type="button" onClick={() => void beginMfa()}>Set up once</button></div> : <div className="mfa-setup"><strong>Finish account security setup</strong><p>Scan this QR code in Microsoft Authenticator, then enter the six-digit code.</p><img src={mfaSetup.qrCode} alt="Authenticator setup QR code" /><small>Or enter this key: {mfaSetup.secret}</small><input inputMode="numeric" maxLength={6} placeholder="6-digit code" value={mfaCode} onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, ''))} /><button type="button" onClick={() => void confirmMfa()}>Confirm setup</button><p>{mfaMessage}</p></div>)}
            </div>
            <OfficeLocationCard />
            <button className="mobile-signout" onClick={signOut}>
              Sign Out
            </button>
          </section>
        ) : null}
        {admin &&
        ["dashboard", "employees", "team-timesheets", "audit"].includes(tab) ? (
          <nav className="mobile-admin-tools" aria-label="Admin tools">
            <button
              onClick={() => setTab("dashboard")}
              aria-pressed={tab === "dashboard"}
            >
              <BarChart3 size={16} />
              Overview
            </button>
            <button
              onClick={() => setTab("employees")}
              aria-pressed={tab === "employees"}
            >
              <Users size={16} />
              Employees
            </button>
            <button
              onClick={() => setTab("team-timesheets")}
              aria-pressed={tab === "team-timesheets"}
            >
              <ClipboardList size={16} />
              Edit Timesheets
            </button>
            <button
              onClick={() => setTab("audit")}
              aria-pressed={tab === "audit"}
            >
              <ShieldCheck size={16} />
              Audit Logs
            </button>
          </nav>
        ) : null}
        {admin && tab === "dashboard" ? <DashboardPage /> : null}
        {admin && tab === "employees" ? <EmployeesPage /> : null}
        {admin && tab === "team-timesheets" ? <TimesheetsPage /> : null}
        {admin && tab === "audit" ? <AuditLogsPage /> : null}
        {admin && tab === "reports" ? <ReportsPage /> : null}
      </div>
      <nav className="mobile-web-tabs" aria-label="Main navigation">
        {tabs.map((item) => (
          <button
            key={item.key}
            className={
              tab === item.key ||
              (item.key === "dashboard" &&
                ["employees", "team-timesheets", "audit"].includes(tab))
                ? "active"
                : ""
            }
            aria-current={tab === item.key ? "page" : undefined}
            onClick={() => setTab(item.key)}
          >
            <item.icon size={22} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
