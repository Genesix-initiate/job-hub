# Supabase Edge Functions - Automated Email Notifications

This directory contains production-ready Supabase Edge Functions built on the Deno runtime to dispatch automated email notifications for:
1. **Job Application Status Changes** (`applied`, `shortlisted`, `interview`, `offer`, `hired`, `rejected`)
2. **Subscription & Billing Updates** (`subscription_created`, `plan_price_changed`, `subscription_renewed`, `payment_received`, `subscription_cancelled`)

## Quick Deploy via Supabase CLI

```bash
# 1. Login to Supabase CLI
supabase login

# 2. Link your Supabase project (find project-ref in your project settings)
supabase link --project-ref your-project-id

# 3. Deploy the unified notification dispatcher Edge Function
supabase functions deploy dispatch-notification --no-verify-jwt

# 4. Optional: Set secrets for external email delivery (Resend, SendGrid, Postmark)
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

## Function Endpoints

- **Unified Dispatcher**: `POST https://<project-ref>.supabase.co/functions/v1/dispatch-notification`
- Authorization: `Bearer <SUPABASE_ANON_KEY>` or Service Role Key
- Content-Type: `application/json`
