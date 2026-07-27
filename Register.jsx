import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const passwordOk = password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/register', { email, password });
      login(data.accessToken, data.user);
      navigate('/mfa-setup');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
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
          <h1>Create your account</h1>
          <p className="subtitle">Passwords are hashed with bcrypt before they ever touch storage.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
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
                autoComplete="new-password"
                required
              />
              <p className="dim" style={{ fontSize: 12, marginTop: 6 }}>
                8+ characters, at least one letter and one number.
              </p>
            </div>
            <button className="btn-primary" disabled={busy || !passwordOk || !email} type="submit">
              {busy ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="foot-note">
            Already have an account? <Link className="link" to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
