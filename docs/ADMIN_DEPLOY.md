# Admin Panel & Edge Functions Deployment

## Project mismatch

Your app uses **lgtpgglphbcncrtaajsg** (from `.env`). Ensure functions are deployed to this project.

## Deploy code-engine (AI Assistant — fixes "Request failed" 404)

The AI Assistant in Web Development, App Development, and other domains calls the `code-engine` Edge Function. If you see **"Request failed"** or **404** in the console, deploy it:

```bash
npx supabase functions deploy code-engine --project-ref lgtpgglphbcncrtaajsg
```

Or with Supabase CLI:

```bash
supabase functions deploy code-engine --project-ref lgtpgglphbcncrtaajsg
```

## Deploy admin-dashboard function

```bash
npx supabase functions deploy admin-dashboard --project-ref lgtpgglphbcncrtaajsg
```

If you get 403 Forbidden:
1. Run `supabase login` and authenticate
2. Ensure your account has access to project lgtpgglphbcncrtaajsg
3. Or deploy from Supabase Dashboard: Project → Edge Functions → admin-dashboard → Deploy

## Run migrations (for pop_ads, admin_resources, etc.)

```bash
npx supabase db push --project-ref lgtpgglphbcncrtaajsg
```

Or run migrations manually in Supabase Dashboard → SQL Editor.

## Remove user manually (if admin panel fails)

Use `scripts/delete-user-by-email.sql` in Supabase Dashboard → SQL Editor.
Ensure you're in the correct project (lgtpgglphbcncrtaajsg).
