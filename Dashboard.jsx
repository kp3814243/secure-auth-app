import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getAccessToken } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/user/me').then(({ data }) => setProfile(data)).catch(() => {});
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  async function handleDisableMfa() {
    await api.post('/auth/mfa/disable');
    setProfile((p) => (p ? { ...p, mfaEnabled: false } : p));
  }

  const token = getAccessToken() || '';

  return (
    <div className="dash-shell">
      <div className="dash-header">
        <div className="brand">
          <div className="brand-mark">SA</div>
          <div className="brand-name">SecureAuth</div>
        </div>
        <button className="btn-ghost" onClick={handleLogout}>
          Sign out
        </button>
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, margin: '0 0 6px' }}>
        Welcome back
      </h1>
      <p className="dim">{user?.email}</p>

      <div className="status-grid">
        <div className="status-card">
          <div className="label">Two-factor authentication</div>
          <div className="value">
            {profile?.mfaEnabled ? (
              <span className="pill pill-on">● ENABLED</span>
            ) : (
              <span className="pill pill-off">○ DISABLED</span>
            )}
          </div>
        </div>
        <div className="status-card">
          <div className="label">Session</div>
          <div className="value" style={{ color: 'var(--success)' }}>
            ● ACTIVE
          </div>
        </div>
        <div className="status-card">
          <div className="label">Password hashing</div>
          <div className="value">bcrypt · 12 rounds</div>
        </div>
        <div className="status-card">
          <div className="label">Account created</div>
          <div className="value">
            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 16 }}>Security actions</h1>
        <p className="subtitle" style={{ marginBottom: 16 }}>
          Manage how this account is protected.
        </p>
        <div className="row">
          {profile?.mfaEnabled ? (
            <button className="btn-danger" onClick={handleDisableMfa}>
              Disable two-factor
            </button>
          ) : (
            <Link to="/mfa-setup">
              <button className="btn-primary">Enable two-factor</button>
            </Link>
          )}
        </div>
      </div>

      <div className="card">
        <h1 style={{ fontSize: 16 }}>Your access token</h1>
        <p className="subtitle" style={{ marginBottom: 12 }}>
          Short-lived (15 min), kept in memory only — never in localStorage — and attached as a
          Bearer header on API calls. The refresh token that renews it lives in an httpOnly cookie
          this page can't read.
        </p>
        <div className="token-preview">{token || '(none)'}</div>
      </div>
    </div>
  );
}
