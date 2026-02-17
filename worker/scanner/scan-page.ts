import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import type {
  AxeResults,
  PageScanResult,
  PageScanError,
  PageScanOutcome,
  ScanErrorCode,
} from './types';
import { translateAllViolations } from './translate';
import { calculateScore } from './score';

/** Timeout for page navigation in milliseconds */
const NAVIGATION_TIMEOUT = 30_000;

/** Extra delay after domcontentloaded to let JS-rendered content settle */
const POST_LOAD_DELAY = 2_000;

/** User agent string for our scanner */
const USER_AGENT =
  'AccessAudit/1.0 (Accessibility Scanner; +https://accessaudit.com/bot)';

/**
 * Read the axe-core source from node_modules.
 * Cached in-memory after first read to avoid repeated disk I/O.
 */
let axeCoreSourceCache: string | undefined;

function getAxeCoreSource(): string {
  if (axeCoreSourceCache === undefined) {
    const axePath = resolve(
      process.cwd(),
      'node_modules',
      'axe-core',
      'axe.min.js'
    );
    axeCoreSourceCache = readFileSync(axePath, 'utf-8');
  }
  return axeCoreSourceCache;
}

/**
 * Classify a Puppeteer/network error into a ScanErrorCode and human message.
 */
function classifyError(err: unknown): { code: ScanErrorCode; message: string } {
  const msg = err instanceof Error ? err.message : String(err);

  if (msg.includes('net::ERR_NAME_NOT_RESOLVED') || msg.includes('getaddrinfo ENOTFOUND')) {
    return {
      code: 'DNS_FAILURE',
      message:
        "We couldn't reach this website. Please check the URL and make sure it's spelled correctly.",
    };
  }

  if (
    msg.includes('net::ERR_CERT') ||
    msg.includes('SSL') ||
    msg.includes('ssl') ||
    msg.includes('CERT_')
  ) {
    return {
      code: 'SSL_ERROR',
      message:
        "There's an SSL certificate issue with this site. The certificate may be expired or invalid. Try using http:// instead of https://.",
    };
  }

  if (
    msg.includes('net::ERR_CONNECTION_REFUSED') ||
    msg.includes('ECONNREFUSED')
  ) {
    return {
      code: 'CONNECTION_REFUSED',
      message:
        "We couldn't reach this website. The server may be down or blocking automated scans. Please try again later.",
    };
  }

  if (
    msg.includes('TimeoutError') ||
    msg.includes('timeout') ||
    msg.includes('Timeout') ||
    msg.includes('Navigation timeout')
  ) {
    return {
      code: 'TIMEOUT',
      message:
        'This page took too long to load. Try again or scan a different page.',
    };
  }

  if (msg.includes('net::ERR_') || msg.includes('ECONNRESET')) {
    return {
      code: 'CONNECTION_REFUSED',
      message:
        "We couldn't reach this website. The server may be experiencing network issues. Please try again later.",
    };
  }

  if (msg.includes('crashed') || msg.includes('Target closed')) {
    return {
      code: 'PAGE_CRASH',
      message:
        'The page caused the browser to crash during scanning. This usually happens with very large or resource-intensive pages. Try scanning a different page.',
    };
  }

  return {
    code: 'UNKNOWN',
    message: 'An unexpected error occurred while scanning. Please try again or contact support if the problem persists.',
  };
}

/**
 * Validate that a string is a scannable URL.
 */
function validateUrl(url: string): { valid: true } | { valid: false; error: PageScanError } {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return {
        valid: false,
        error: {
          url,
          error: `Only http:// and https:// URLs can be scanned. The URL "${url}" uses "${parsed.protocol}" which is not supported.`,
          errorCode: 'INVALID_URL',
          timestamp: new Date().toISOString(),
        },
      };
    }
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: {
        url,
        error: `"${url}" is not a valid URL. Please include the full address starting with http:// or https://.`,
        errorCode: 'INVALID_URL',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * Scan a single page for accessibility violations.
 */
export async function scanPage(url: string): Promise<PageScanOutcome> {
  const validation = validateUrl(url);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
      ],
    });

    const page = await browser.newPage();

    await page.setUserAgent(USER_AGENT);
    await page.setViewport({ width: 1366, height: 768 });

    let httpStatus: number | null = null;
    try {
      const response = await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: NAVIGATION_TIMEOUT,
      });
      httpStatus = response?.status() ?? null;
    } catch (navError) {
      const navMsg = navError instanceof Error ? navError.message : '';
      if (navMsg.includes('timeout') || navMsg.includes('Timeout')) {
        try {
          const response = await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: NAVIGATION_TIMEOUT,
          });
          httpStatus = response?.status() ?? null;
          await new Promise((r) => setTimeout(r, POST_LOAD_DELAY));
        } catch (fallbackError) {
          const classified = classifyError(fallbackError);
          return {
            success: false,
            error: {
              url,
              error: classified.message,
              errorCode: classified.code,
              timestamp: new Date().toISOString(),
            },
          };
        }
      } else {
        const classified = classifyError(navError);
        return {
          success: false,
          error: {
            url,
            error: classified.message,
            errorCode: classified.code,
            timestamp: new Date().toISOString(),
          },
        };
      }
    }

    if (httpStatus && httpStatus >= 400) {
      const statusMessages: Record<number, string> = {
        401: 'This page requires login. We can only scan publicly accessible pages.',
        403: 'This page requires login. We can only scan publicly accessible pages.',
        404: 'This page returned an error (404 Not Found). Make sure the URL is correct.',
        500: 'This page returned a server error (500). This is a problem on their end. Please try again later.',
        502: 'This page returned an error (502 Bad Gateway). This is usually a temporary server issue.',
        503: 'This page returned an error (503 Service Unavailable). It may be undergoing maintenance. Please try again later.',
      };

      const errorCode: ScanErrorCode = (httpStatus === 401 || httpStatus === 403)
        ? 'AUTH_REQUIRED'
        : 'HTTP_ERROR';

      return {
        success: false,
        error: {
          url,
          error:
            statusMessages[httpStatus] ??
            `This page returned an error (HTTP ${httpStatus}). Make sure the URL is correct and try again.`,
          errorCode,
          timestamp: new Date().toISOString(),
        },
      };
    }

    const pageTitle = await page.title();

    const axeSource = getAxeCoreSource();
    await page.evaluate(axeSource);

    const axeResults: AxeResults = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axe = (window as any).axe;
      return axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        },
        resultTypes: ['violations', 'passes', 'incomplete', 'inapplicable'],
      });
    });

    const violations = translateAllViolations(axeResults.violations);
    const score = calculateScore(violations);

    const totalRuleCount =
      axeResults.violations.length +
      axeResults.passes.length +
      axeResults.incomplete.length +
      axeResults.inapplicable.length;

    const passingRuleCount = axeResults.passes.length;

    const result: PageScanResult = {
      url,
      score,
      violations,
      pageTitle: pageTitle || '(No title)',
      timestamp: new Date().toISOString(),
      passingRuleCount,
      totalRuleCount,
    };

    return { success: true, result };
  } catch (err) {
    const classified = classifyError(err);
    return {
      success: false,
      error: {
        url,
        error: classified.message,
        errorCode: classified.code,
        timestamp: new Date().toISOString(),
      },
    };
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Browser may already be closed if it crashed
      }
    }
  }
}
