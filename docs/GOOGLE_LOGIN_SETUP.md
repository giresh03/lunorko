# Fix Google Login: redirect_uri_mismatch (Error 400)

The `redirect_uri_mismatch` error occurs when the redirect URI sent in the OAuth request doesn't match what's configured in Google Cloud Console. Follow these steps to fix it.

---

## 1. Google Cloud Console

Go to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials).

### OAuth 2.0 Client (Web application)

1. Open your **Web application** OAuth client (or create one if needed).
2. Under **Authorized redirect URIs**, add:

   ```
   https://lgtpgglphbcncrtaajsg.supabase.co/auth/v1/callback
   ```

   This is Supabase’s callback URL. Google redirects here after sign-in; Supabase then redirects to your app.

3. Under **Authorized JavaScript origins**, add:

   | Origin |
   |--------|
   | `https://lunor.online` |
   | `http://localhost:8080` |

   Add any other origins where you run the app (e.g. `http://localhost:8081`).

4. Save changes.

---

## 2. Supabase Dashboard

Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **URL Configuration**.

### Site URL

Set to your main app URL, e.g.:

- Production: `https://lunor.online`
- Local dev: `http://localhost:8080`

### Redirect URLs

Add these to the **Redirect URLs** list:

| URL |
|-----|
| `https://lunor.online/auth` |
| `http://localhost:8080/auth` |

Or use a wildcard for local dev:

- `http://localhost:*/auth` (covers any port)

---

## 3. Verify

1. Clear cookies for your app and Google.
2. Try signing in with Google again.

If it still fails:

- Confirm the Supabase callback URL in Google matches exactly (no trailing slash).
- Check that your app’s redirect URL (e.g. `https://lunor.online/auth`) is in Supabase’s Redirect URLs list.
- Ensure you’re using a **Web application** OAuth client, not a Chrome extension or other type.

---

## Quick reference

| Where | What to add |
|-------|-------------|
| **Google** → Authorized redirect URIs | `https://lgtpgglphbcncrtaajsg.supabase.co/auth/v1/callback` |
| **Google** → Authorized JavaScript origins | `https://lunor.online`, `http://localhost:8080` |
| **Supabase** → Redirect URLs | `https://lunor.online/auth`, `http://localhost:8080/auth` |
