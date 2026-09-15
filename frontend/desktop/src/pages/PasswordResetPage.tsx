import { AuthBrandPanel } from '../components/AuthBrandPanel';
import { FormEvent, useState } from "react";
import { forgotPassword, resetPassword } from "../api/auth";
import { ApiError } from "../api/client";

export function PasswordResetPage({
  token,
  initialEmail = "",
  onBack,
}: {
  token?: string;
  initialEmail?: string;
  onBack: () => void;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (token && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      setMessage(
        (token
          ? await resetPassword(token, password)
          : await forgotPassword(email.trim())
        ).message,
      );
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to connect. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-page">
      <header className="login-topbar">
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
        <p>
          Undergraduate Recruitment Office
          <br />
          Time Clock
        </p>
      </header>
      <AuthBrandPanel />
      <form className="login-card" onSubmit={submit}>
        <h2>{token ? "Choose a new password" : "Forgot password?"}</h2>
        <p className="auth-copy">
          {token
            ? "Use 10–72 characters for your new password."
            : "Enter your account email. We’ll send a link to choose a new password."}
        </p>
        {!message &&
          (token ? (
            <>
              <label>
                New password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={10}
                  maxLength={72}
                  required
                />
              </label>
              <label>
                Confirm password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  minLength={10}
                  maxLength={72}
                  required
                />
              </label>
            </>
          ) : (
            <label>
              Email
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
          ))}
        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="auth-success" role="status">
            {message}
          </p>
        ) : (
          <button type="submit" disabled={busy}>
            {busy
              ? "Please wait..."
              : token
                ? "Update Password"
                : "Send Reset Link"}
          </button>
        )}
        <button
          type="button"
          className="auth-back"
          onClick={onBack}
          disabled={busy}
        >
          Back to Sign In
        </button>
      </form>
    </main>
  );
}
