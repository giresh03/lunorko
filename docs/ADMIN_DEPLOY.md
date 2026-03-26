# Admin Panel & Edge Functions Deployment

## Project mismatch

Your app uses **byveaoqwuwyhaykgjufj** (from `.env`). Ensure functions are deployed to this project.

### Fix "AI credits exhausted" (402)

1. **Local dev**: Ensure `.env` has `VITE_SUPABASE_URL=https://byveaoqwuwyhaykgjufj.supabase.co`. Then set the Gemini key:
   ```bash
   supabase secrets set GEMINI_API_KEY=your_key --project-ref byveaoqwuwyhaykgjufj
   supabase functions deploy code-engine --project-ref byveaoqwuwyhaykgjufj
   ```

2. **Deployed on Lovable**: Lovable may use a different Supabase project. In Lovable → Project Settings → Environment Variables, add:
   - `VITE_SUPABASE_URL` = `https://byveaoqwuwyhaykgjufj.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = your anon key from Supabase Dashboard → API
   Then redeploy. This makes the deployed app call your project (where `GEMINI_API_KEY` is set).

## Deploy code-engine (AI Assistant — fixes "Request failed" 404)

The AI Assistant in Web Development, App Development, and other domains calls the `code-engine` Edge Function. If you see **"Request failed"** or **404** in the console:

1. **Authenticate** (if you get 403 Forbidden):
   ```bash
   supabase login
   ```

2. **Deploy the function**:
   ```bash
   supabase functions deploy code-engine --project-ref byveaoqwuwyhaykgjufj
   ```

3. **Set the AI API key** (required for AI to work). Use either:
   - **Gemini/Google AI** (recommended): Get key from [Google AI Studio](https://aistudio.google.com/apikey)
     ```bash
     supabase secrets set GEMINI_API_KEY=your_gemini_api_key --project-ref byveaoqwuwyhaykgjufj
     ```
   - Optional: override model (default `gemini-2.5-flash`; older `gemini-2.0-flash` is deprecated):
     ```bash
     supabase secrets set GEMINI_MODEL=gemini-2.5-flash --project-ref byveaoqwuwyhaykgjufj
     ```
   - **Lovable** (fallback): Get key from [Lovable](https://lovable.dev) → Project Settings → API Keys
     ```bash
     supabase secrets set LOVABLE_API_KEY=your_lovable_api_key --project-ref byveaoqwuwyhaykgjufj
     ```

## Razorpay payment gateway

1. **Deploy Razorpay edge functions**:
   ```bash
   npx supabase functions deploy create-razorpay-order --project-ref byveaoqwuwyhaykgjufj
   npx supabase functions deploy verify-razorpay-payment --project-ref byveaoqwuwyhaykgjufj
   ```

2. **Set Razorpay secrets** (required for payments to work):
   ```bash
   supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxx --project-ref byveaoqwuwyhaykgjufj
   supabase secrets set RAZORPAY_KEY_SECRET=your_secret --project-ref byveaoqwuwyhaykgjufj
   ```
   Get these from [Razorpay Dashboard](https://dashboard.razorpay.com) → Settings → API Keys.

## Deploy admin-dashboard function

```bash
npx supabase functions deploy admin-dashboard --project-ref byveaoqwuwyhaykgjufj
```

If you get 403 Forbidden:
1. Run `supabase login` and authenticate
2. Ensure your account has access to project byveaoqwuwyhaykgjufj
3. Or deploy from Supabase Dashboard: Project → Edge Functions → admin-dashboard → Deploy

## Run migrations (for pop_ads, admin_resources, hackathons, etc.)

`db push` does **not** take `--project-ref`. Link the project once, then push:

```bash
npx supabase login
npx supabase link --project-ref byveaoqwuwyhaykgjufj
npx supabase db push
```

### “Found local migration files to be inserted before the last migration on remote”

**What it means:** Your **remote** database already recorded a **newer** migration as applied (e.g. hackathons), but an **older** migration file in the repo (e.g. `20260316174242_...sql` — security fix dropping a permissive policy on `subscriptions`) was never applied or never recorded. Supabase refuses a normal `db push` so history stays consistent.

**Fix (recommended):** apply pending migrations including those “out of order”:

```bash
npx supabase db push --include-all
```

Use `--yes` if the CLI asks for confirmation. This is the supported way to reconcile local files with remote history.

**Why it happens:** Migrations were applied on the server in a different order (manual SQL, another machine, or only some files pushed), or a migration was added to git with a timestamp **between** two migrations already on production.

**If `--include-all` fails:** In Dashboard → **Database → Migrations**, inspect what’s applied. Advanced recovery: `supabase migration repair` (see [Supabase CLI docs](https://supabase.com/docs/guides/cli/managing-environments)) — only if you know what you’re doing.

**Without CLI:** Supabase Dashboard → **SQL Editor** → paste and run, in order:

1. `supabase/migrations/20260317120000_hackathons_marketplace.sql`
2. `supabase/migrations/20260318100000_seed_hackathons_sample.sql` (optional sample rows)

Or run migrations manually in Supabase Dashboard → **Database → Migrations** if your workflow uses that.

**Sample hackathons & winner projects:** migration `20260318100000_seed_hackathons_sample.sql` inserts **6 global events** and **10 marketplace projects** (with placeholder GitHub deliverable links). Replace links in **Admin → Hackathons** after deploy. Re-running the migration is safe (`ON CONFLICT DO NOTHING` / upsert deliverables).

## Remove user manually (if admin panel fails)

Use `scripts/delete-user-by-email.sql` in Supabase Dashboard → SQL Editor.
Ensure you're in the correct project (byveaoqwuwyhaykgjufj).
