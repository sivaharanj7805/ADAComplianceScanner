import type { PageScanOutcome, PageScanResult, CrawlResult } from './types';

// ============================================================================
// Remote scan client — calls the Railway scanning worker over HTTP
// ============================================================================

const SCANNER_API_URL = process.env.SCANNER_API_URL;
const SCANNER_API_KEY = process.env.SCANNER_API_KEY;

/** Timeout for single-page scan requests (45s to allow for navigation + axe-core) */
const SINGLE_PAGE_TIMEOUT = 45_000;

/** Timeout for multi-page scan requests (5 minutes for crawling + scanning) */
const MULTI_PAGE_TIMEOUT = 300_000;

/**
 * Validate that the scanner worker environment variables are configured.
 */
function ensureConfigured(): { url: string; key: string } {
  if (!SCANNER_API_URL) {
    throw new Error(
      'SCANNER_API_URL environment variable is not set. Configure the Railway worker URL.'
    );
  }
  if (!SCANNER_API_KEY) {
    throw new Error(
      'SCANNER_API_KEY environment variable is not set. Configure the Railway worker API key.'
    );
  }
  return { url: SCANNER_API_URL, key: SCANNER_API_KEY };
}

/**
 * Scan a single page by calling the remote scanning worker.
 *
 * This replaces the local `scanPage()` call that requires Puppeteer.
 * The worker runs Puppeteer + axe-core on Railway where Chromium is available.
 */
export async function remoteScanPage(url: string): Promise<PageScanOutcome> {
  const config = ensureConfigured();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SINGLE_PAGE_TIMEOUT);

  try {
    const response = await fetch(`${config.url}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.key,
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));

      // Worker returns 422 for scan failures with structured error
      if (response.status === 422 && body.error) {
        return {
          success: false,
          error: body.error,
        };
      }

      // Other errors
      const errorMessage =
        (body as { error?: string }).error ||
        `Scanner worker returned HTTP ${response.status}`;
      return {
        success: false,
        error: {
          url,
          error: errorMessage,
          errorCode: 'UNKNOWN',
          timestamp: new Date().toISOString(),
        },
      };
    }

    const body = await response.json();

    if (body.success && body.result) {
      return { success: true, result: body.result as PageScanResult };
    }

    return {
      success: false,
      error: {
        url,
        error: 'Unexpected response from scanner worker',
        errorCode: 'UNKNOWN',
        timestamp: new Date().toISOString(),
      },
    };
  } catch (err) {
    const message =
      err instanceof Error && err.name === 'AbortError'
        ? 'Scanner worker request timed out. The page may be too large or the worker may be overloaded.'
        : `Failed to connect to scanner worker: ${err instanceof Error ? err.message : String(err)}`;

    return {
      success: false,
      error: {
        url,
        error: message,
        errorCode: 'TIMEOUT',
        timestamp: new Date().toISOString(),
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Response from a multi-page scan via the remote worker.
 */
export interface RemoteMultiPageScanResult {
  crawl: {
    baseUrl: string;
    totalFound: number;
    limitApplied: number;
    skipped: { url: string; reason: string }[];
  };
  pages: PageScanOutcome[];
  summary: {
    overallScore: number;
    pagesScanned: number;
    pagesFailed: number;
    totalPages: number;
  };
}

/**
 * Crawl and scan multiple pages by calling the remote scanning worker.
 *
 * This replaces the local crawlSite() + scanPage() loop.
 * The worker handles both crawling and scanning.
 */
export async function remoteScanSite(
  url: string,
  maxPages: number
): Promise<RemoteMultiPageScanResult> {
  const config = ensureConfigured();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MULTI_PAGE_TIMEOUT);

  try {
    const response = await fetch(`${config.url}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.key,
      },
      body: JSON.stringify({ url, maxPages }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const errorMessage =
        (body as { error?: string }).error ||
        `Scanner worker returned HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    const body = await response.json();

    if (!body.success) {
      throw new Error('Scanner worker returned unsuccessful response');
    }

    return {
      crawl: body.crawl,
      pages: body.pages as PageScanOutcome[],
      summary: body.summary,
    };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(
        'Scanner worker request timed out. The site scan may be too large or the worker may be overloaded.'
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
