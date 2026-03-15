# Google Login Setup (Local Testing & Production)

Fix `redirect_uri_mismatch` (Error 400) and make Google sign-in work during local development.

---

## Quick Fix for Local Testing

**1. Supabase Dashboard** → [supabase.com/dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **URL Configuration**

- **Site URL**: `http://localhost:8080` (or your dev port)
- **Redirect URLs**: Add `http://localhost:8080/auth` (and `http://localhost:5173/auth` if using a different port)

**2. Google Cloud Console** → [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

- **Authorized JavaScript origins**: Add `http://localhost:8080` (and your dev port)
- **Authorized redirect URIs**: Add `https://lgtpgglphbcncrtaajsg.supabase.co/auth/v1/callback`

**3. Clear cookies** for localhost and Google, then try again.

---

## 1. Supabase Dashboard

Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **URL Configuration**.

### Site URL

- **Local dev**: `http://localhost:8080` (matches `vite.config.ts` port)
- **Production**: `https://lunor.online`

### Redirect URLs (required)

Add every URL where your app runs:

| URL | Use |
|-----|-----|
| `http://localhost:8080/auth` | Local dev (default port) |
| `http://localhost:5173/auth` | If port differs |
| `https://lunor.online/auth` | Production |

Or use wildcard for any localhost port: `http://localhost:*/auth`

---

## 2. Google Cloud Console

Go to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials).

### OAuth 2.0 Client (Web application)

1. Open your **Web application** OAuth client (or create one).
2. **Authorized redirect URIs** — add:
   ```
   https://lgtpgglphbcncrtaajsg.supabase.co/auth/v1/callback
   ```
3. **Authorized JavaScript origins** — add:
   - `https://lunor.online`
   - `http://localhost:8080`
   - `http://localhost:5173` (if you use a different port)
4. **Save** changes.

---

## 3. Verify

1. Run `npm run dev` — app should be at `http://localhost:8080`
2. Clear cookies for localhost and accounts.google.com
3. Click "Sign in with Google"
4. You should be redirected back to `/auth` and signed in

---

## Quick Reference

| Where | What to add |
|-------|-------------|
| **Supabase** → Redirect URLs | `http://localhost:8080/auth`, `https://lunor.online/auth` |
| **Supabase** → Site URL | `http://localhost:8080` (dev) or `https://lunor.online` (prod) |
| **Google** → Authorized redirect URIs | `https://lgtpgglphbcncrtaajsg.supabase.co/auth/v1/callback` |
| **Google** → Authorized JavaScript origins | `https://lunor.online`, `http://localhost:8080` |
