import express from 'express';
import cors from 'cors';
import { scanPage } from './scanner/scan-page';
import { crawlSite } from './scanner/crawl-site';
import type { PageScanOutcome } from './scanner/types';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const API_KEY = process.env.API_KEY;

// ============================================================================
// Middleware
// ============================================================================

// Restrict CORS to the main application origin in production.
// Falls back to allowing all origins in development.
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : undefined;

app.use(
  cors(
    ALLOWED_ORIGINS
      ? { origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'] }
      : undefined
  )
);
app.use(express.json({ limit: '1mb' }));

/**
 * API key authentication middleware.
 * Checks the X-API-Key header against the configured API_KEY env var.
 * Skipped for the health check endpoint.
 */
function authenticate(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  // Skip auth for health check
  if (req.path === '/health') {
    next();
    return;
  }

  if (!API_KEY) {
    console.error('API_KEY environment variable is not set. Rejecting all authenticated requests.');
    res.status(500).json({ error: 'Server misconfiguration: API key not set' });
    return;
  }

  const providedKey = req.headers['x-api-key'];
  if (!providedKey || providedKey !== API_KEY) {
    res.status(401).json({ error: 'Invalid or missing API key' });
    return;
  }

  next();
}

app.use(authenticate);

// ============================================================================
// GET /health — Health check endpoint
// ============================================================================

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'accessaudit-scan-worker',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// POST /scan — Single page or multi-page scan
// ============================================================================

interface ScanRequestBody {
  url: string;
  maxPages?: number;
}

app.post('/scan', async (req, res) => {
  try {
    const { url, maxPages } = req.body as ScanRequestBody;

    // Validate URL
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'Missing or invalid "url" field. Provide a valid HTTP/HTTPS URL.' });
      return;
    }

    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        res.status(400).json({ error: 'URL must start with http:// or https://' });
        return;
      }
    } catch {
      res.status(400).json({ error: `"${url}" is not a valid URL.` });
      return;
    }

    // Validate maxPages if provided
    if (maxPages !== undefined) {
      if (typeof maxPages !== 'number' || maxPages < 1 || maxPages > 100) {
        res.status(400).json({ error: 'maxPages must be a number between 1 and 100.' });
        return;
      }
    }

    console.log(`[POST /scan] Starting scan for ${url}${maxPages ? ` (maxPages: ${maxPages})` : ''}`);
    const startTime = Date.now();

    // Single page scan (no maxPages or maxPages === 1)
    if (!maxPages || maxPages === 1) {
      const outcome = await scanPage(url);
      const elapsed = Date.now() - startTime;
      console.log(`[POST /scan] Completed single-page scan for ${url} in ${elapsed}ms`);

      if (!outcome.success) {
        res.status(422).json({
          success: false,
          error: outcome.error,
        });
        return;
      }

      res.json({
        success: true,
        result: outcome.result,
      });
      return;
    }

    // Multi-page scan: crawl first, then scan each page
    console.log(`[POST /scan] Crawling ${url} for up to ${maxPages} pages`);
    const crawlResult = await crawlSite(url, maxPages);
    console.log(`[POST /scan] Found ${crawlResult.urls.length} pages to scan`);

    const pageOutcomes: PageScanOutcome[] = [];
    let pagesScanned = 0;
    let pagesFailed = 0;
    let totalScore = 0;

    for (const pageUrl of crawlResult.urls) {
      console.log(`[POST /scan] Scanning page ${pagesScanned + pagesFailed + 1}/${crawlResult.urls.length}: ${pageUrl}`);
      const outcome = await scanPage(pageUrl);
      pageOutcomes.push(outcome);

      if (outcome.success) {
        pagesScanned++;
        totalScore += outcome.result.score;
      } else {
        pagesFailed++;
      }
    }

    const overallScore = pagesScanned > 0 ? Math.round(totalScore / pagesScanned) : 0;

    const elapsed = Date.now() - startTime;
    console.log(`[POST /scan] Completed multi-page scan for ${url} in ${elapsed}ms (${pagesScanned} scanned, ${pagesFailed} failed)`);

    res.json({
      success: true,
      crawl: {
        baseUrl: crawlResult.baseUrl,
        totalFound: crawlResult.totalFound,
        limitApplied: crawlResult.limitApplied,
        skipped: crawlResult.skipped,
      },
      pages: pageOutcomes,
      summary: {
        overallScore,
        pagesScanned,
        pagesFailed,
        totalPages: crawlResult.urls.length,
      },
    });
  } catch (err) {
    console.error('[POST /scan] Unhandled error:', err);
    res.status(500).json({
      error: 'An unexpected error occurred during scanning.',
    });
  }
});

// ============================================================================
// Start server
// ============================================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AccessAudit scan worker listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API key configured: ${API_KEY ? 'yes' : 'NO (all authenticated requests will be rejected)'}`);
});
