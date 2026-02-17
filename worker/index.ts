import express from 'express';
import cors from 'cors';
import { scanPage } from './scanner/scan-page';
import { crawlSite } from './scanner/crawl-site';
import type { PageScanOutcome } from './scanner/types';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const API_KEY = process.env.API_KEY;

app.use(cors());
app.use(express.json());

// ============================================================================
// API key authentication middleware
// ============================================================================

function authenticate(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  if (!API_KEY) {
    // If no API_KEY is set, skip auth (dev mode)
    next();
    return;
  }

  const provided = req.headers['x-api-key'];
  if (!provided || provided !== API_KEY) {
    res.status(401).json({ error: 'Unauthorized. Provide a valid X-API-Key header.' });
    return;
  }

  next();
}

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
// POST /scan — Run an accessibility scan
// ============================================================================

interface ScanRequestBody {
  url?: string;
  maxPages?: number;
}

app.post('/scan', authenticate, async (req: express.Request, res: express.Response) => {
  try {
    const body = req.body as ScanRequestBody;

    if (!body.url || typeof body.url !== 'string') {
      res.status(400).json({ error: 'Missing required field: "url" (string).' });
      return;
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(body.url);
    } catch {
      res.status(400).json({ error: 'Invalid URL format. Include the full address starting with http:// or https://.' });
      return;
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      res.status(400).json({ error: 'URL must start with http:// or https://.' });
      return;
    }

    const maxPages = typeof body.maxPages === 'number' && body.maxPages > 0
      ? Math.min(body.maxPages, 100)
      : 1;

    // Single page scan
    if (maxPages === 1) {
      const outcome = await scanPage(body.url);

      if (!outcome.success) {
        res.status(422).json({
          success: false,
          error: outcome.error,
        });
        return;
      }

      res.json({
        success: true,
        data: {
          pages: [outcome.result],
          overallScore: outcome.result.score,
          totalViolations: outcome.result.violations.length,
          pagesScanned: 1,
          pagesFailed: 0,
        },
      });
      return;
    }

    // Multi-page scan: crawl then scan each page
    const crawlResult = await crawlSite(body.url, maxPages);
    const urls = crawlResult.urls;

    const pageResults: PageScanOutcome[] = [];
    let totalScore = 0;
    let pagesScanned = 0;
    let pagesFailed = 0;

    for (const pageUrl of urls) {
      const outcome = await scanPage(pageUrl);
      pageResults.push(outcome);

      if (outcome.success) {
        pagesScanned++;
        totalScore += outcome.result.score;
      } else {
        pagesFailed++;
      }
    }

    const overallScore = pagesScanned > 0
      ? Math.round(totalScore / pagesScanned)
      : 0;

    // Count total violations across successful pages
    let totalViolations = 0;
    const successfulPages = [];
    const failedPages = [];

    for (const outcome of pageResults) {
      if (outcome.success) {
        totalViolations += outcome.result.violations.length;
        successfulPages.push(outcome.result);
      } else {
        failedPages.push(outcome.error);
      }
    }

    res.json({
      success: true,
      data: {
        pages: successfulPages,
        failedPages,
        overallScore,
        totalViolations,
        pagesScanned,
        pagesFailed,
        crawl: {
          totalFound: crawlResult.totalFound,
          limitApplied: crawlResult.limitApplied,
          skipped: crawlResult.skipped,
        },
      },
    });
  } catch (err) {
    console.error('[POST /scan] Unhandled error:', err);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
    });
  }
});

// ============================================================================
// Start server
// ============================================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AccessAudit scan worker listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API key auth: ${API_KEY ? 'enabled' : 'disabled (dev mode)'}`);
});
