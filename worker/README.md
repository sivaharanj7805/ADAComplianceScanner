# AccessAudit Scan Worker

Standalone Puppeteer + axe-core scanning worker for Railway deployment. This worker runs headless Chrome to scan websites for ADA/WCAG 2.1 AA accessibility violations — something that can't run in Vercel's serverless functions.

## API Endpoints

### `GET /health`

Health check. Returns `{ status: "ok" }`.

### `POST /scan`

Run an accessibility scan on a URL.

**Headers:**
- `X-API-Key: <your-api-key>` (required in production)
- `Content-Type: application/json`

**Request body:**
```json
{
  "url": "https://example.com",
  "maxPages": 1
}
```

- `url` (required): The URL to scan
- `maxPages` (optional, default: 1): Number of pages to crawl and scan. Set to 1 for a single page scan, or higher for multi-page site scans.

**Response:**
```json
{
  "success": true,
  "data": {
    "pages": [{ "url": "...", "score": 85, "violations": [...], ... }],
    "overallScore": 85,
    "totalViolations": 12,
    "pagesScanned": 1,
    "pagesFailed": 0
  }
}
```

## Local Development

```bash
cd worker
npm install
npm run dev
```

The server starts on `http://localhost:3001` by default.

Test it:
```bash
curl http://localhost:3001/health

curl -X POST http://localhost:3001/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## Deploy to Railway

### 1. Create a Railway Project

- Go to [railway.app](https://railway.app) and create a new project
- Choose "Deploy from GitHub repo" or use the Railway CLI

### 2. Configure the Dockerfile

Railway auto-detects the Dockerfile. Point it to `worker/Dockerfile`:

- In your Railway service settings, set the **Dockerfile path** to `worker/Dockerfile`
- Or set the **Root Directory** to `/` and Railway will find the Dockerfile

### 3. Set Environment Variables

In the Railway dashboard, add these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `3001` | Port for the Express server (Railway sets this automatically) |
| `API_KEY` | `<generate-a-strong-key>` | API key for authenticating requests |

Generate a secure API key:
```bash
openssl rand -hex 32
```

### 4. Deploy

Push to your connected GitHub branch, or deploy via Railway CLI:

```bash
railway up
```

### 5. Update the Next.js App

After deploying, copy your Railway service URL and add it to your Next.js environment:

```env
SCANNER_API_URL=https://your-worker.up.railway.app
SCANNER_API_KEY=<same-key-you-set-in-railway>
```

## Docker Build (Manual)

```bash
# From the repo root
docker build -f worker/Dockerfile -t accessaudit-worker .
docker run -p 3001:3001 -e API_KEY=test-key accessaudit-worker
```
