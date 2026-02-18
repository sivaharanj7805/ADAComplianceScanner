# AccessAudit

ADA/WCAG 2.1 AA compliance scanner and monitoring platform. Scans websites for accessibility violations, translates them into plain English, and provides ongoing monitoring with compliance scoring.

## Tech Stack

- **Framework**: Next.js 14 (App Router), TypeScript
- **Database**: Supabase (Postgres, Auth, Row Level Security)
- **Scanning**: axe-core + Puppeteer
- **Payments**: Stripe subscriptions
- **Styling**: Tailwind CSS + shadcn/ui
- **PDF Reports**: @react-pdf/renderer
- **Email**: Resend
- **Deployment**: Vercel (frontend) + Railway (scan worker)

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your Supabase, Stripe, and Resend keys in .env.local

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/                  Next.js App Router
  (marketing)/        Public pages (landing, pricing, free scanner)
  (dashboard)/        Authenticated dashboard pages
  api/                API routes (auth, webhooks, scan endpoints, cron)
lib/                  Shared utilities and types
  scanner/            axe-core scanning engine + plain-English translation
  supabase/           Supabase client, server helpers, and queries
  stripe/             Stripe product configs and helpers
components/           React components
  ui/                 shadcn/ui primitives
  dashboard/          Dashboard-specific components
  marketing/          Marketing page components
  reports/            PDF report components
worker/               Standalone Puppeteer scanning worker (Railway)
```

## Commands

| Command              | Description                |
| -------------------- | -------------------------- |
| `npm run dev`        | Start development server   |
| `npm run build`      | Production build           |
| `npx next lint`      | Run linter                 |
| `npx vitest run`     | Run tests                  |
| `npx tsc --noEmit`   | Type check                 |

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment instructions.

## License

MIT
