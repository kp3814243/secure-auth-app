# SecureAuth — Advanced Authentication Demo

A full-stack reference implementation of the techniques covered in "Enhancing
Web Application Security Through Advanced Authentication Techniques":
password hashing, JWT access/refresh tokens, TOTP-based multi-factor
authentication, rate limiting, and secure session handling.

```
secure-auth-app/
├── backend/     Express API (Node.js)
└── frontend/    React app (Vite)
```

## Quick start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then edit JWT_ACCESS_SECRET / JWT_REFRESH_SECRET
npm start
```

Runs on `http://localhost:4000`. Data is stored in memory (see
`backend/models/store.js`) so it resets on restart — swap that module for a
real database in production; nothing else needs to change.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` and talks to the backend at
`http://localhost:4000/api` (override with a `VITE_API_URL` env var).

### 3. Try it

1. Register an account (password: 8+ chars, letter + number).
2. You'll land on the MFA setup screen — scan the QR code with Google
   Authenticator, Authy, or 1Password, then enter the 6-digit code to enable it.
3. Sign out and sign back in: you'll be prompted for the password, then the
   authenticator code, matching the two-step flow described in the article.
4. The dashboard shows session status, MFA status, and the current
   short-lived access token.

## What each technique looks like in code

| Technique | Where |
|---|---|
| bcrypt password hashing (12 rounds) | `backend/routes/auth.js` (`register`) |
| TOTP MFA enrollment + QR code | `backend/routes/auth.js` (`/mfa/setup`, `/mfa/verify-setup`), `frontend/src/pages/MfaSetup.jsx` |
| Two-step login (password → MFA) | `backend/routes/auth.js` (`/login`, `/mfa/verify-login`), `frontend/src/pages/Login.jsx` |
| Short-lived JWT access tokens, kept in memory only | `backend/utils/tokens.js`, `frontend/src/api.js` |
| Refresh tokens in `httpOnly`/`Secure`/`SameSite=Strict` cookies | `backend/utils/tokens.js` (`setRefreshCookie`) |
| Refresh token rotation + reuse detection | `backend/utils/tokens.js` (`rotateRefreshToken`) |
| Automatic silent token refresh on 401 | `frontend/src/api.js` (response interceptor) |
| Rate limiting on login/register | `backend/middleware/rateLimiter.js` |
| Account lockout after repeated failures | `backend/routes/auth.js` (`login`) |
| User-enumeration-safe login errors | `backend/routes/auth.js` (`login`, constant error message + dummy hash) |
| Security headers | `backend/server.js` (`helmet()`) |

## Notes on taking this further

- **Real database**: replace `backend/models/store.js` with Postgres/MySQL
  behind the same function signatures.
- **Passwordless / WebAuthn**: this demo uses TOTP for simplicity; swapping in
  `@simplewebauthn/server` and `@simplewebauthn/browser` gets you FIDO2/passkeys.
- **OAuth/OIDC**: for delegated login (Google, Microsoft, etc.), add
  `openid-client` on the backend and validate `state`/`nonce`/PKCE per the
  library's guidance.
- **Breach-password checks**: call the Have I Been Pwned k-anonymity API
  during registration/reset for an extra layer beyond pattern rules.
- **Secrets**: `.env` is for local development only — use a real secret
  manager (AWS Secrets Manager, Vault, etc.) in production, and rotate
  `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` periodically.
