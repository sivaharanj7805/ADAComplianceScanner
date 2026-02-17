# AccessAudit Deployment Guide

This guide walks through deploying AccessAudit from scratch. The stack consists of three services:

| Service | Platform | Purpose |
|---------|----------|---------|
| Next.js app | Vercel | Frontend + API routes |
| Scan worker | Railway | Puppeteer-based accessibility scanning |
| Database | Supabase | Postgres, Auth, Storage |

---

## Prerequisites

- GitHub account with this repository
- [Vercel](https://vercel.com) account
- [Supabase](https://supabase.com) account
- [Stripe](https://stripe.com) account
- [Railway](https://railway.app) account
- [Resend](https://resend.com) account
- A custom domain (optional but recommended)

---

## 1. Supabase Setup

### Create Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Choose a region close to your users.
3. Save the generated database password securely.

### Run Schema

1. Open the **SQL Editor** in the Supabase dashboard.
2. Paste the contents of `supabase/schema.sql` and run it.
3. Verify tables were created under **Table Editor**.

### Enable Auth Providers

1. Go to **Authentication > Providers**.
2. Enable **Email** (enabled by default).
3. Optionally enable **Google** or **GitHub** OAuth:
   - Create OAuth credentials in the respective developer console.
   - Paste the Client ID and Secret into Supabase.

### Configure Auth URLs

1. Go to **Authentication > URL Configuration**.
2. Set **Site URL** to your production URL: `https://your-domain.com`
3. Add **Redirect URLs**:
   - `https://your-domain.com/auth/callback`
   - `https://your-domain.com/auth/callback?next=/settings`
   - `http://localhost:3000/auth/callback` (for local development)

### Copy Credentials

From **Project Settings > API**, note:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. Stripe Setup

### Create Products and Prices

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) > **Products**.
2. Create two products:
   - **Pro Plan** — recurring monthly price (e.g., $49/mo)
   - **Agency Plan** — recurring monthly price (e.g., $149/mo)
3. Copy each product's **Price ID** (starts with `price_`):
   - Pro → `STRIPE_PRICE_ID_PRO`
   - Agency → `STRIPE_PRICE_ID_AGENCY`

### API Keys

From **Developers > API keys**, copy:
- **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Secret key** → `STRIPE_SECRET_KEY`

### Webhook Endpoint

1. Go to **Developers > Webhooks** and add an endpoint.
2. Set the URL to: `https://your-domain.com/api/webhooks/stripe`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## 3. Railway Setup (Scan Worker)

### Deploy Worker

1. Go to [Railway](https://railway.app) and create a new project.
2. Connect your GitHub repo and set the **Root Directory** to `worker/`.
3. Railway will auto-detect the Node.js service.

### Configure Build

- **Build command**: `npm run build`
- **Start command**: `npm run start`

### Environment Variables

Set these in the Railway service settings:

| Variable | Value |
|----------|-------|
| `API_KEY` | Generate with `openssl rand -hex 32` |
| `PORT` | Railway sets this automatically — do not override |

### Note the URL

Once deployed, Railway provides a public URL (e.g., `https://your-worker.up.railway.app`). This becomes your `SCANNER_API_URL`.

Verify the worker is running:

```bash
curl https://your-worker.up.railway.app/health
```

---

## 4. Resend Setup

1. Sign up at [Resend](https://resend.com).
2. Add and verify your sending domain under **Domains**.
3. Create an API key under **API Keys** → `RESEND_API_KEY`.

---

## 5. Vercel Setup

### Connect Repository

1. Go to [Vercel](https://vercel.com) and import your GitHub repository.
2. Vercel auto-detects the Next.js framework.
3. Set **Root Directory** to `/` (the default).

### Environment Variables

In **Settings > Environment Variables**, add all variables from `.env.production.example`:

| Variable | Example Value |
|----------|---------------|
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `STRIPE_PRICE_ID_PRO` | `price_...` |
| `STRIPE_PRICE_ID_AGENCY` | `price_...` |
| `SCANNER_API_URL` | `https://your-worker.up.railway.app` |
| `SCANNER_API_KEY` | (same value as Railway `API_KEY`) |
| `RESEND_API_KEY` | `re_...` |
| `EMAIL_FROM` | `AccessAudit <notifications@your-domain.com>` |

### Deploy

Click **Deploy**. Vercel will build and deploy the app.

---

## 6. DNS Setup (Custom Domain)

1. In Vercel, go to **Settings > Domains** and add your domain.
2. Vercel provides DNS records to add:
   - **A record**: `76.76.21.21`
   - **CNAME**: `cname.vercel-dns.com` (for `www` subdomain)
3. Add these records in your domain registrar's DNS settings.
4. Vercel automatically provisions an SSL certificate.

---

## 7. Post-Deployment Checklist

After deployment, verify each integration end-to-end:

### Auth Flow
- [ ] Sign up with email — confirmation email arrives
- [ ] Click confirmation link — redirects to dashboard
- [ ] Sign out and sign back in
- [ ] OAuth login works (if configured)

### Scanning
- [ ] Add a site in the dashboard
- [ ] Trigger a scan — worker receives the request
- [ ] Scan results appear with violations and compliance score
- [ ] Free scanner on landing page works

### Payments
- [ ] Upgrade to Pro plan — Stripe Checkout opens
- [ ] Complete test payment (use Stripe test mode first)
- [ ] Plan updates in the dashboard after payment
- [ ] Downgrade/cancel subscription works

### Webhooks
- [ ] Stripe webhook events are received (check Stripe Dashboard > Webhooks > logs)
- [ ] Subscription status syncs correctly after payment events

### Email
- [ ] Transactional emails send successfully (check Resend dashboard)
- [ ] Email links point to the correct production domain

### Security
- [ ] No environment variables are exposed in client-side JavaScript (check page source)
- [ ] API routes return proper error responses for unauthenticated requests
- [ ] Row Level Security policies are active in Supabase

---

## Troubleshooting

### Build Fails on Vercel
- Check that all required environment variables are set.
- Run `npm run build` locally with the same env vars to reproduce.

### Auth Redirects to Wrong URL
- Verify `NEXT_PUBLIC_APP_URL` matches your actual domain.
- Verify redirect URLs in Supabase Auth settings include your production domain.

### Scans Not Working
- Verify `SCANNER_API_URL` points to the correct Railway URL.
- Verify `SCANNER_API_KEY` matches the `API_KEY` in Railway.
- Check Railway logs for errors.

### Stripe Webhooks Failing
- Verify the webhook endpoint URL is correct in Stripe Dashboard.
- Verify `STRIPE_WEBHOOK_SECRET` matches the signing secret for that endpoint.
- Check webhook logs in Stripe Dashboard for delivery errors.
