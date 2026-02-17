# AccessAudit - ADA Compliance Scanner

## What This Is
A SaaS product that scans websites for ADA/WCAG 2.1 AA accessibility violations, translates technical violations into plain English that non-technical people can understand, and provides ongoing monitoring with compliance scoring. Three buyer segments: web agencies (manage multiple client sites), e-commerce businesses (fear ADA lawsuits), and municipalities (Title II compliance deadlines).

## Tech Stack
- **Framework**: Next.js 14 with App Router, TypeScript
- **Database**: Supabase (Postgres + Auth + Row Level Security)
- **Scanning**: axe-core for violation detection, Puppeteer for headless page loading
- **Payments**: Stripe subscriptions with webhooks
- **Styling**: Tailwind CSS with shadcn/ui components
- **PDF Generation**: @react-pdf/renderer for compliance reports
- **Email**: Resend for transactional emails
- **Deployment**: Vercel (frontend) + Railway (scan worker)

## Architecture
- /app - Next.js App Router pages and API routes
- /app/api - API routes (auth callbacks, webhooks, scan endpoints)
- /app/(marketing) - Public pages (landing pages, free scanner)
- /app/(dashboard) - Authenticated dashboard pages
- /lib - Shared utilities, database client, types
- /lib/scanner - axe-core scanning engine + plain-English translation
- /lib/supabase - Supabase client and server helpers
- /components - React components (ui/, dashboard/, marketing/, reports/)
- /worker - Standalone Puppeteer scanning worker for Railway

## Code Conventions
- Use TypeScript strict mode everywhere
- Use server components by default, 'use client' only when needed
- Use Supabase RLS for authorization, never trust client-side auth alone
- Use Zod for all input validation
- Error handling: always return typed error responses, never throw in API routes
- All database queries go through /lib/supabase/queries.ts
- All scanner logic goes through /lib/scanner/
- Use environment variables for all secrets (NEXT_PUBLIC_ prefix for client-safe ones only)
- Prefer server actions over API routes for form submissions

## Key Business Logic
- Free scanner: scan 1 URL, return top 10 violations, require email for full results
- Paid plans: scheduled scans (weekly), multi-page crawling, historical tracking, PDF reports
- Compliance score: 0-100 calculated as (passing_rules / total_rules) * 100
- Violation severity: critical (blocks access), serious (major barrier), moderate (some barrier), minor (best practice)
- Agency plans include white-label: their logo, their colors, their domain on reports

## Commands
- Dev server: npm run dev
- Type check: npx tsc --noEmit
- Lint: npx next lint
- Test: npx vitest run
- Build: npm run build
