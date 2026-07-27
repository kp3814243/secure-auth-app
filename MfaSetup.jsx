import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function MfaSetup() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  async function startSetup() {
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/mfa/setup');
      setQrCode(data.qrCode);
      setSecret(data.secret);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start MFA setup.');
    } finally {
      setBusy(false);
    }
  }

  async function confirmSetup(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/auth/mfa/verify-setup', { code });
      setSuccess('Two-factor authentication is now enabled.');
      setUser({ ...user, mfaEnabled: true });
      setTimeout(() => navigate('/dashboard'), 1200);
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
          <h1>Set up two-factor authentication</h1>
          <p className="subtitle">
            Add an authenticator app (Google Authenticator, Authy, 1Password) as a second factor.
          </p>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {!qrCode ? (
            <>
              <button className="btn-primary" onClick={startSetup} disabled={busy}>
                {busy ? 'Generating…' : 'Generate QR code'}
              </button>
              <p className="foot-note">
                <Link className="link" to="/dashboard">Skip for now</Link>
              </p>
            </>
          ) : (
            <>
              <div className="qr-wrap">
                <img src={qrCode} alt="MFA enrollment QR code" width={200} height={200} />
              </div>
              <p className="dim" style={{ fontSize: 12, marginBottom: 8 }}>
                Can't scan? Enter this key manually:
              </p>
              <div className="secret-chip">{secret}</div>

              <form onSubmit={confirmSetup}>
                <div className="field">
                  <label htmlFor="code">Enter the 6-digit code to confirm</label>
                  <input
                    id="code"
                    className="code-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    required
                  />
                </div>
                <button className="btn-primary" disabled={busy || code.length !== 6} type="submit">
                  {busy ? 'Verifying…' : 'Confirm & enable'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
