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

## Run migrations (for pop_ads, admin_resources, etc.)

```bash
npx supabase db push --project-ref byveaoqwuwyhaykgjufj
```

Or run migrations manually in Supabase Dashboard → SQL Editor.

## Remove user manually (if admin panel fails)

Use `scripts/delete-user-by-email.sql` in Supabase Dashboard → SQL Editor.
Ensure you're in the correct project (byveaoqwuwyhaykgjufj).
