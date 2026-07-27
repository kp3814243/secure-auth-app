import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [ticketId, setTicketId] = useState(null); // set once password step succeeds and MFA is required
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.mfaRequired) {
        setTicketId(data.ticketId);
      } else {
        login(data.accessToken, data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleCodeSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/mfa/verify-login', { ticketId, code });
      login(data.accessToken, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen-center">
      <div className="auth-shell">
        <div className="brand">
          <div className="brand-mark">SA</div>
          <div className="brand-name">SecureAuth</div>
        </div>

        <div className="card">
          <div className="stepper">
            <div className={`step ${ticketId ? 'done' : 'active'}`}>
              <div className="step-dot">{ticketId ? '✓' : '1'}</div>
              PASSWORD
            </div>
            <div className="step-line" />
            <div className={`step ${ticketId ? 'active' : ''}`}>
              <div className="step-dot">2</div>
              MFA CODE
            </div>
          </div>

          {!ticketId ? (
            <>
              <h1>Sign in</h1>
              <p className="subtitle">Enter your credentials to continue.</p>
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handlePasswordSubmit}>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <button className="btn-primary" disabled={busy} type="submit">
                  {busy ? 'Checking…' : 'Continue'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1>Enter your code</h1>
              <p className="subtitle">Open your authenticator app and enter the 6-digit code.</p>
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleCodeSubmit}>
                <div className="field">
                  <label htmlFor="code">Authentication code</label>
                  <input
                    id="code"
                    className="code-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    autoFocus
                    required
                  />
                </div>
                <button className="btn-primary" disabled={busy || code.length !== 6} type="submit">
                  {busy ? 'Verifying…' : 'Verify & sign in'}
                </button>
              </form>
            </>
          )}

          <p className="foot-note">
            {ticketId ? (
              <button className="link" style={{ background: 'none', border: 'none' }} onClick={() => setTicketId(null)}>
                Back to password
              </button>
            ) : (
              <>
                Don't have an account? <Link className="link" to="/register">Create one</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
