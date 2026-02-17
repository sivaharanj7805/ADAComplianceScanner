import type { PageScanResult, PageScanError, PageScanOutcome } from './types';

// ============================================================================
// Remote scan client
//
// Calls the Railway-hosted scanning worker over HTTP instead of running
// Puppeteer locally. This is necessary because Puppeteer cannot run in
// Vercel's serverless functions.
// ============================================================================

const SCANNER_API_URL = process.env.SCANNER_API_URL;
const SCANNER_API_KEY = process.env.SCANNER_API_KEY;

/** Timeout for requests to the scan worker (2 minutes for large sites) */
const REQUEST_TIMEOUT = 120_000;

interface WorkerSuccessResponse {
  success: true;
  data: {
    pages: PageScanResult[];
    failedPages?: PageScanError[];
    overallScore: number;
    totalViolations: number;
    pagesScanned: number;
    pagesFailed: number;
    crawl?: {
      totalFound: number;
      limitApplied: number;
      skipped: { url: string; reason: string }[];
    };
  };
}

interface WorkerErrorResponse {
  success: false;
  error: PageScanError | string;
}

type WorkerResponse = WorkerSuccessResponse | WorkerErrorResponse;

/**
 * Scan a single page via the remote worker.
 * Drop-in replacement for the local scanPage() function.
 */
export async function remoteScanPage(url: string): Promise<PageScanOutcome> {
  if (!SCANNER_API_URL) {
    throw new Error('SCANNER_API_URL environment variable is not set. Cannot call remote scanner.');
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (SCANNER_API_KEY) {
      headers['X-API-Key'] = SCANNER_API_KEY;
    }

    const response = await fetch(`${SCANNER_API_URL}/scan`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url, maxPages: 1 }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const json = (await response.json()) as WorkerResponse;

    if (!response.ok || !json.success) {
      const errorResponse = json as WorkerErrorResponse;
      const errorMsg = typeof errorResponse.error === 'string'
        ? errorResponse.error
        : errorResponse.error?.error ?? 'Scan failed';
      const errorCode = typeof errorResponse.error === 'object'
        ? errorResponse.error.errorCode
        : 'UNKNOWN';

      return {
        success: false,
        error: {
          url,
          error: errorMsg,
          errorCode: errorCode as PageScanError['errorCode'],
          timestamp: new Date().toISOString(),
        },
      };
    }

    const successResponse = json as WorkerSuccessResponse;
    const pageResult = successResponse.data.pages[0];

    if (!pageResult) {
      return {
        success: false,
        error: {
          url,
          error: 'Scanner returned no results for this page.',
          errorCode: 'UNKNOWN',
          timestamp: new Date().toISOString(),
        },
      };
    }

    return { success: true, result: pageResult };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isTimeout = message.includes('abort');

    return {
      success: false,
      error: {
        url,
        error: isTimeout
          ? 'The scan took too long to complete. Please try again.'
          : `Failed to reach the scanning service: ${message}`,
        errorCode: isTimeout ? 'TIMEOUT' : 'UNKNOWN',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * Crawl and scan multiple pages via the remote worker.
 * Returns all page results from the worker.
 */
export async function remoteCrawlAndScan(
  url: string,
  maxPages: number
): Promise<{
  pages: PageScanResult[];
  failedPages: PageScanError[];
  overallScore: number;
  totalViolations: number;
  pagesScanned: number;
  pagesFailed: number;
  crawlUrls: string[];
}> {
  if (!SCANNER_API_URL) {
    throw new Error('SCANNER_API_URL environment variable is not set. Cannot call remote scanner.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (SCANNER_API_KEY) {
    headers['X-API-Key'] = SCANNER_API_KEY;
  }

  const response = await fetch(`${SCANNER_API_URL}/scan`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url, maxPages }),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  const json = (await response.json()) as WorkerResponse;

  if (!response.ok || !json.success) {
    const errorResponse = json as WorkerErrorResponse;
    const errorMsg = typeof errorResponse.error === 'string'
      ? errorResponse.error
      : errorResponse.error?.error ?? 'Scan failed';
    throw new Error(errorMsg);
  }

  const data = (json as WorkerSuccessResponse).data;

  return {
    pages: data.pages,
    failedPages: data.failedPages ?? [],
    overallScore: data.overallScore,
    totalViolations: data.totalViolations,
    pagesScanned: data.pagesScanned,
    pagesFailed: data.pagesFailed,
    crawlUrls: data.pages.map((p) => p.url),
  };
}
