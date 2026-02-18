# AccessAudit — Deployment Guide

Production deployment for the AccessAudit ADA Compliance Scanner.

**Architecture**: Vercel (Next.js frontend + API routes) → Railway (Puppeteer scan worker) → Supabase (Postgres + Auth)

---

## 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the schema migration:
   - Go to **SQL Editor** → **New query**
   - Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql)
   - Click **Run**
3. Enable auth providers:
   - Go to **Authentication** → **Providers**
   - Enable **Email** (magic link + password)
   - Optionally enable **Google** / **GitHub** OAuth
4. Configure redirect URLs:
   - Go to **Authentication** → **URL Configuration**
   - Set **Site URL** to `https://www.accessaudit.com`
   - Add **Redirect URLs**:
     - `https://www.accessaudit.com/auth/callback`
     - `http://localhost:3000/auth/callback` (for local dev)
5. Copy your credentials:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. Stripe Setup

1. Create a [Stripe](https://dashboard.stripe.com) account (switch to **Live mode** for production)
2. Create products and prices:
   - **Starter** — $79/month
   - **Professional** — $149/month
   - **Agency** — $299/month
3. Copy each price ID (e.g., `price_...`) for your env vars
4. Set up webhook:
   - Go to **Developers** → **Webhooks** → **Add endpoint**
   - URL: `https://www.accessaudit.com/api/webhooks/stripe`
   - Events to listen for:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
5. Copy your credentials:
   - **Secret key** → `STRIPE_SECRET_KEY`
   - **Webhook signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## 3. Railway Setup (Scan Worker)

1. Create a new project at [railway.app](https://railway.app)
2. Deploy from the `/worker` directory of this repo:
   - Connect your GitHub repo
   - Set **Root Directory** to `worker`
   - Railway will auto-detect the Node.js service
3. Configure environment variables:
   | Variable | Value |
   |----------|-------|
   | `API_KEY` | Generate a secure random string (this becomes `SCANNER_API_KEY` in Vercel) |
   | `PORT` | `3001` (Railway auto-assigns, but set as fallback) |
4. Note the deployed URL (e.g., `https://accessaudit-worker-production.up.railway.app`)
   - This becomes `SCANNER_API_URL` in Vercel
5. Verify with: `curl https://YOUR_WORKER_URL/health`

---

## 4. Vercel Setup

1. Import the repo at [vercel.com/new](https://vercel.com/new)
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `/` (default)
2. Set environment variables (Settings → Environment Variables):

   | Variable | Value | Scope |
   |----------|-------|-------|
   | `NEXT_PUBLIC_APP_URL` | `https://www.accessaudit.com` | Production |
   | `NEXT_PUBLIC_SUPABASE_URL` | From Supabase dashboard | All |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase dashboard | All |
   | `STRIPE_SECRET_KEY` | From Stripe dashboard | Production |
   | `STRIPE_WEBHOOK_SECRET` | From Stripe webhook setup | Production |
   | `SCANNER_API_URL` | Railway worker URL | Production |
   | `SCANNER_API_KEY` | Matches `API_KEY` on Railway | Production |
   | `RESEND_API_KEY` | From [resend.com](https://resend.com) | Production |
   | `EMAIL_FROM` | `AccessAudit <notifications@accessaudit.com>` | Production |

3. Deploy

---

## 5. DNS Setup

1. In Vercel → **Settings** → **Domains**, add your custom domain
2. In your DNS provider, add the records Vercel specifies:
   - **A record**: `76.76.21.21`
   - **CNAME**: `cname.vercel-dns.com` (for `www`)
3. Wait for DNS propagation and SSL certificate provisioning

---

## 6. Post-Deployment Checklist

### Auth Flow
- [ ] Sign up with email → verify email arrives → confirm redirect to dashboard
- [ ] Log in with password → dashboard loads
- [ ] Log out → redirected to home
- [ ] Access `/dashboard` while logged out → redirected to `/login`

### Scanning
- [ ] Free scan at `/scan` → results display
- [ ] Add a site in dashboard → trigger scan → results populate
- [ ] Verify scan worker responds: `curl $SCANNER_API_URL/health`

### Payments
- [ ] Visit pricing page → click upgrade → Stripe checkout opens
- [ ] Complete test payment (use Stripe test card `4242 4242 4242 4242`)
- [ ] Verify webhook delivery in Stripe dashboard → Events

### Webhooks
- [ ] Check Stripe webhook logs for successful deliveries
- [ ] Verify subscription status updates in Supabase `profiles` table

### Emails
- [ ] Trigger a scan → verify scan-complete email arrives
- [ ] Check Resend dashboard for delivery status

---

## Environment Variables Reference

See [`.env.production.example`](./.env.production.example) for the full list with descriptions.
