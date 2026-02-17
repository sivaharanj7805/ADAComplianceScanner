# AccessAudit Scan Worker

Standalone Puppeteer + axe-core scanning worker designed to run on Railway. This worker handles the heavy lifting of launching headless Chrome, navigating to URLs, and running accessibility scans — something that can't run in Vercel's serverless functions due to Puppeteer's binary size and execution time limits.

## API

### `GET /health`

Health check endpoint (no auth required).

```json
{ "status": "ok", "service": "accessaudit-scan-worker", "timestamp": "..." }
```

### `POST /scan`

Run an accessibility scan. Requires `X-API-Key` header.

**Request body:**

```json
{
  "url": "https://example.com",
  "maxPages": 10
}
```

- `url` (required) — The URL to scan (must be http/https)
- `maxPages` (optional) — If > 1, crawls the site and scans multiple pages. Default: 1 (single page scan). Max: 100.

**Single page response** (maxPages omitted or 1):

```json
{
  "success": true,
  "result": {
    "url": "https://example.com",
    "score": 85,
    "violations": [...],
    "pageTitle": "Example Domain",
    "timestamp": "...",
    "passingRuleCount": 42,
    "totalRuleCount": 50
  }
}
```

**Multi-page response** (maxPages > 1):

```json
{
  "success": true,
  "crawl": { "baseUrl": "...", "totalFound": 10, "limitApplied": 10, "skipped": [] },
  "pages": [{ "success": true, "result": {...} }, ...],
  "summary": { "overallScore": 82, "pagesScanned": 8, "pagesFailed": 2, "totalPages": 10 }
}
```

## Local Development

```bash
cd worker
npm install
cp .env.example .env
# Edit .env and set API_KEY

npm run dev
```

Test the health check:

```bash
curl http://localhost:3001/health
```

Test a scan:

```bash
curl -X POST http://localhost:3001/scan \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{"url": "https://example.com"}'
```

## Deploy to Railway

### Option 1: Railway Dashboard

1. Go to [railway.app](https://railway.app) and create a new project
2. Click "New Service" → "GitHub Repo" and select this repository
3. In the service settings, set the **Root Directory** to `worker`
4. Set the **Build Command** to (leave blank — Dockerfile handles it)
5. Add environment variables:
   - `API_KEY` — Generate with `openssl rand -hex 32`
6. Railway will auto-detect the Dockerfile and deploy

### Option 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create a new project (or link to existing)
railway init

# Set the root directory
railway service

# Set environment variables
railway variables set API_KEY=$(openssl rand -hex 32)

# Deploy
railway up
```

### Post-deployment

1. Copy the Railway service URL (e.g., `https://your-worker.up.railway.app`)
2. In your Next.js app's environment variables (Vercel dashboard or `.env.local`), set:
   ```
   SCANNER_API_URL=https://your-worker.up.railway.app
   SCANNER_API_KEY=<same API_KEY you set on Railway>
   ```
3. The Next.js app will now route all scan requests to the Railway worker

## Architecture

```
Next.js App (Vercel)           Scan Worker (Railway)
┌──────────────────┐           ┌──────────────────┐
│ /api/scan/free   │──HTTP──→  │ POST /scan       │
│ /api/scan/trigger│──HTTP──→  │   - Puppeteer    │
│                  │           │   - axe-core     │
│ remote-scan.ts   │           │   - Chromium     │
└──────────────────┘           └──────────────────┘
```
