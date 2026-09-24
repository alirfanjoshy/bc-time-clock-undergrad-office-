import { CampusWelcome } from '../components/CampusWelcome';
import '../styles/welcome.css';
import { AuthBrandPanel } from '../components/AuthBrandPanel';
import { PasswordResetPage } from './PasswordResetPage';
import { FormEvent, useState } from 'react';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { UserRole } from '../types/api';

export function LoginPage() {
  const { signIn, register, isSigningIn } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [mode, setMode] = useState<'signin' | 'create'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [adminRegistrationCode, setAdminRegistrationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticatorCode, setAuthenticatorCode] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSigningIn) return;
    setError(null);
    try {
      if (mode === 'signin') {
        await signIn(email, password, authenticatorCode || undefined);
      } else {
        await register({
          firstName,
          lastName,
          email,
          password,
          role,
          ...(role === 'ADMIN' ? { adminRegistrationCode } : {}),
        });
      }
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Unable to sign in.');
    }
  }

  if (!showForm) return <CampusWelcome
    onLogIn={() => { setMode('signin'); setError(null); setShowForm(true); window.scrollTo(0, 0); }}
    onSignUp={() => { setMode('create'); setError(null); setShowForm(true); window.scrollTo(0, 0); }}
  />;

  if (forgot) return <PasswordResetPage initialEmail={email} onBack={() => setForgot(false)} />;

  return (
    <main className="login-page">
      <header className="login-topbar">
        <button className="campus-return" type="button" disabled={isSigningIn} onClick={() => setShowForm(false)}>← Back to campus</button>
        <div className="brand-lockup">
          <span>Brooklyn<br />College</span>
          <i />
          <b>CU<br />NY</b>
        </div>
        <p>Undergraduate Recruitment Office<br />Time Clock</p>
      </header>
      <AuthBrandPanel />
      <form className="login-card" onSubmit={submit}>
        <div className="desktop-auth-welcome"><span>BC TIME CLOCK</span><h2>{mode === 'signin' ? 'Welcome back' : 'Join your team'}</h2><p>{mode === 'signin' ? 'Sign in to manage your time and attendance.' : 'Create your Undergraduate Recruitment account.'}</p></div>
        <div className="auth-tabs">
          <button
            className={mode === 'signin' ? 'active' : ''}
            disabled={isSigningIn}
            onClick={() => { setMode('signin'); setError(null); }}
            type="button"
          >
            Log in
          </button>
          <button
            className={mode === 'create' ? 'active' : ''}
            disabled={isSigningIn}
            onClick={() => { setMode('create'); setError(null); }}
            type="button"
          >
            Sign up
          </button>
        </div>
        {mode === 'create' ? (
          <div className="form-grid two">
            <label>
              First Name
              <input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            </label>
            <label>
              Last Name
              <input value={lastName} onChange={(event) => setLastName(event.target.value)} />
            </label>
          </div>
        ) : null}
        <label>
          Email
          <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        {mode === 'create' ? (
          <>
            <label>
              Account Type
              <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            {role === 'ADMIN' ? (
              <label>
                Admin Setup Code
                <input
                  value={adminRegistrationCode}
                  onChange={(event) => setAdminRegistrationCode(event.target.value)}
                />
              </label>
            ) : null}
          </>
        ) : null}
          <label>
            Password
          <span className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              title={showPassword ? 'Hide password' : 'Show password'}
              type="button"
            >
              <span className={showPassword ? 'eye-icon visible' : 'eye-icon'} />
            </button>
          </span>
          </label>
          {error?.includes('authenticator') || error?.includes('six-digit') ? <label>Authenticator code<input inputMode="numeric" maxLength={6} value={authenticatorCode} onChange={(event) => setAuthenticatorCode(event.target.value.replace(/\D/g, ''))} placeholder="123456" /></label> : null}
        {error ? <p className="error">{error}</p> : null}
        <button disabled={isSigningIn} type="submit">
          {isSigningIn ? (mode === 'signin' ? 'Signing in…' : 'Creating account…') : mode === 'signin' ? 'Log in' : 'Sign up'}
        </button>
        <button className="auth-back" type="button" disabled={isSigningIn} onClick={() => setForgot(true)}>Forgot password?</button>
        <small>
          Employee accounts can be created directly. Admin accounts require the office setup code.
        </small>
      </form>
    </main>
  );
}
