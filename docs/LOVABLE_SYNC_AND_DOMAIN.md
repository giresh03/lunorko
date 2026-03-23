# Sync GitHub → Lovable & domain updates

Lovable does **not** use a separate git remote you push to from the CLI. Your project is linked to **GitHub** (`giresh03/lunorko`). Anything pushed to `main` is what Lovable can pull.

## After you push to GitHub

1. Open your project on **[lovable.dev](https://lovable.dev)**.
2. **Pull / sync from GitHub** (wording varies):
   - Use **Project → Sync with GitHub**, **Pull latest**, or open the Git panel and sync from `main`.
3. If Lovable shows merge conflicts, resolve them in the Lovable UI or locally, then push again.

Until you sync in Lovable, the hosted Lovable preview may still run older code.

## Custom domain change (Lovable + auth)

When you add or change the **production domain** (e.g. `lunor.online` or a Lovable custom domain):

### 1. Lovable

- **Project → Settings → Domains** (or **Share → Publish**): attach the new domain and wait for DNS/propagation.

### 2. Supabase (same project as `.env`: `byveaoqwuwyhaykgjufj`)

- **Authentication → URL configuration**
  - **Site URL**: your live site origin, e.g. `https://lunor.online` or `https://your-app.lovable.app`
  - **Redirect URLs**: include every origin users hit, e.g.  
    `https://lunor.online/**`, `https://www.lunor.online/**`, `https://*.lovable.app/**`, `http://localhost:8080/**`

### 3. Google Cloud Console (if using Google sign-in)

- **Authorized JavaScript origins**: add the new site origin(s).
- **Authorized redirect URIs**: keep Supabase’s callback, e.g.  
  `https://byveaoqwuwyhaykgjufj.supabase.co/auth/v1/callback`  
  (see `docs/GOOGLE_LOGIN_SETUP.md` if project refs differ).

### 4. Lovable environment variables

In **Lovable → Project → Environment variables**, set (same as production):

| Variable | Example |
|----------|---------|
| `VITE_SUPABASE_URL` | `https://byveaoqwuwyhaykgjufj.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase **anon** public key |

Then **redeploy / republish** from Lovable so the build picks up env vars.

### 5. App code (`src/lib/auth.ts`)

- Production **`lunor.online`** is handled explicitly.
- Other hosts (including `*.lovable.app`) use **`window.location.origin`** for redirects, so preview URLs usually work without code changes.

## Hackathons / Razorpay / admin (recent features)

After pulling latest `main` in Lovable:

1. Run **Supabase migration** for hackathons (or run SQL from `supabase/migrations/20260317120000_hackathons_marketplace.sql`).
2. **Deploy** edge functions: `admin-dashboard`, `create-razorpay-order`, `verify-razorpay-payment` (see `docs/ADMIN_DEPLOY.md`).

---

**Summary:** Push to **GitHub** (done from your machine). Open **Lovable** and **sync from GitHub**, then update **domain + Supabase + Google + Lovable env** as above and **republish**.
