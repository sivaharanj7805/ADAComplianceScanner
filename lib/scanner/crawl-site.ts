import puppeteer from 'puppeteer';

import type { CrawlResult } from './types';

/** User agent string for our crawler */
const CRAWLER_USER_AGENT =
  'AccessAudit/1.0 (Accessibility Scanner; +https://accessaudit.com/bot)';

/** Timeout for each page load during crawling */
const CRAWL_PAGE_TIMEOUT = 15_000;

/** File extensions to skip (not HTML pages) */
const SKIP_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.bmp', '.tiff',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.zip', '.rar', '.tar', '.gz', '.7z',
  '.mp3', '.mp4', '.wav', '.avi', '.mov', '.wmv', '.flv', '.webm',
  '.css', '.js', '.json', '.xml', '.rss', '.atom',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
]);

/**
 * Normalize a URL for deduplication.
 * - Removes trailing slashes
 * - Removes fragment identifiers (#section)
 * - Removes common tracking query parameters
 * - Lowercases the hostname
 */
function normalizeUrl(urlStr: string, baseOrigin: string): string | null {
  try {
    const parsed = new URL(urlStr, baseOrigin);

    // Only follow http/https links
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    // Remove fragment
    parsed.hash = '';

    // Remove tracking query params but keep meaningful ones
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'msclkid', 'ref', 'source',
    ];
    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }

    // Rebuild the URL
    let normalized = parsed.toString();

    // Remove trailing slash (but keep root path "/")
    if (normalized.endsWith('/') && parsed.pathname !== '/') {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  } catch {
    return null;
  }
}

/**
 * Check if a URL should be skipped based on its extension or pattern.
 */
function shouldSkipUrl(urlStr: string): { skip: boolean; reason?: string } {
  try {
    const parsed = new URL(urlStr);
    const pathname = parsed.pathname.toLowerCase();

    // Skip mailto and tel links
    if (['mailto:', 'tel:', 'javascript:', 'data:'].includes(parsed.protocol)) {
      return { skip: true, reason: `Non-HTTP protocol: ${parsed.protocol}` };
    }

    // Skip file extensions that aren't HTML pages
    const lastSegment = pathname.split('/').pop() ?? '';
    const dotIndex = lastSegment.lastIndexOf('.');
    if (dotIndex !== -1) {
      const ext = lastSegment.substring(dotIndex).toLowerCase();
      if (SKIP_EXTENSIONS.has(ext)) {
        return { skip: true, reason: `Skipped file type: ${ext}` };
      }
    }

    return { skip: false };
  } catch {
    return { skip: true, reason: 'Invalid URL' };
  }
}

/**
 * Parse and check robots.txt for our user agent.
 * Returns true if the path is allowed, false if disallowed.
 */
async function isAllowedByRobotsTxt(
  baseOrigin: string,
  pathname: string,
  browser: Awaited<ReturnType<typeof puppeteer.launch>>
): Promise<boolean> {
  try {
    const page = await browser.newPage();
    try {
      const response = await page.goto(`${baseOrigin}/robots.txt`, {
        waitUntil: 'domcontentloaded',
        timeout: 5_000,
      });

      if (!response || response.status() !== 200) {
        // No robots.txt or error — assume everything is allowed
        return true;
      }

      const text = await page.evaluate(() => document.body?.innerText ?? '');
      return parseRobotsTxt(text, pathname);
    } finally {
      await page.close();
    }
  } catch {
    // If we can't fetch robots.txt, assume allowed
    return true;
  }
}

/**
 * Parse robots.txt content and check if a path is allowed for our agent.
 * Checks rules for "AccessAudit" user agent first, then "*" wildcard.
 */
function parseRobotsTxt(robotsTxt: string, pathname: string): boolean {
  const lines = robotsTxt.split('\n').map((l) => l.trim());

  let currentAgentMatches = false;
  let foundSpecificAgent = false;
  const disallowRules: string[] = [];
  const allowRules: string[] = [];
  const wildcardDisallowRules: string[] = [];
  const wildcardAllowRules: string[] = [];

  for (const line of lines) {
    // Skip comments and empty lines
    if (line.startsWith('#') || line === '') continue;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const directive = line.substring(0, colonIdx).trim().toLowerCase();
    const value = line.substring(colonIdx + 1).trim();

    if (directive === 'user-agent') {
      const agent = value.toLowerCase();
      if (agent === 'accessaudit' || agent === 'accessaudit/1.0') {
        currentAgentMatches = true;
        foundSpecificAgent = true;
      } else if (agent === '*') {
        currentAgentMatches = true;
      } else {
        currentAgentMatches = false;
      }
    } else if (directive === 'disallow' && value && currentAgentMatches) {
      if (foundSpecificAgent) {
        disallowRules.push(value);
      } else {
        wildcardDisallowRules.push(value);
      }
    } else if (directive === 'allow' && value && currentAgentMatches) {
      if (foundSpecificAgent) {
        allowRules.push(value);
      } else {
        wildcardAllowRules.push(value);
      }
    }
  }

  // Check specific agent rules first, then wildcard
  const effectiveDisallow = disallowRules.length > 0 ? disallowRules : wildcardDisallowRules;
  const effectiveAllow = allowRules.length > 0 ? allowRules : wildcardAllowRules;

  // Check allow rules first (they take precedence for matching paths)
  for (const rule of effectiveAllow) {
    if (pathname.startsWith(rule)) {
      return true;
    }
  }

  // Check disallow rules
  for (const rule of effectiveDisallow) {
    if (pathname.startsWith(rule)) {
      return false;
    }
  }

  return true;
}

/**
 * Crawl a website starting from a base URL, discovering internal links.
 *
 * Uses breadth-first search to discover pages up to a maximum limit.
 * - Only follows internal links (same domain)
 * - Skips images, PDFs, external links, anchor-only links, mailto/tel
 * - Normalizes URLs for deduplication
 * - Respects robots.txt
 *
 * @param baseUrl - The starting URL to crawl from
 * @param maxPages - Maximum number of pages to discover (including the base URL)
 * @returns Array of unique URLs found on the site
 */
export async function crawlSite(
  baseUrl: string,
  maxPages: number = 25
): Promise<CrawlResult> {
  const baseOrigin = new URL(baseUrl).origin;
  const normalizedBase = normalizeUrl(baseUrl, baseOrigin);
  if (!normalizedBase) {
    return {
      baseUrl,
      urls: [baseUrl],
      totalFound: 1,
      limitApplied: maxPages,
      skipped: [],
    };
  }

  const visited = new Set<string>();
  const queue: string[] = [normalizedBase];
  const discovered: string[] = [];
  const skipped: { url: string; reason: string }[] = [];

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    // Check robots.txt once upfront for the base path
    const robotsAllowed = await isAllowedByRobotsTxt(
      baseOrigin,
      new URL(normalizedBase).pathname,
      browser
    );
    if (!robotsAllowed) {
      skipped.push({ url: normalizedBase, reason: 'Blocked by robots.txt' });
      return {
        baseUrl,
        urls: [],
        totalFound: 0,
        limitApplied: maxPages,
        skipped,
      };
    }

    // BFS crawl
    while (queue.length > 0 && discovered.length < maxPages) {
      const currentUrl = queue.shift()!;

      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);

      // Check robots.txt for this path
      const currentPath = new URL(currentUrl).pathname;
      const allowed = await isAllowedByRobotsTxt(baseOrigin, currentPath, browser);
      if (!allowed) {
        skipped.push({ url: currentUrl, reason: 'Blocked by robots.txt' });
        continue;
      }

      // Check if this URL should be skipped
      const skipCheck = shouldSkipUrl(currentUrl);
      if (skipCheck.skip) {
        skipped.push({ url: currentUrl, reason: skipCheck.reason ?? 'Skipped' });
        continue;
      }

      discovered.push(currentUrl);

      // Don't crawl more pages if we've hit the limit
      if (discovered.length >= maxPages) break;

      // Extract links from this page
      let page: Awaited<ReturnType<Awaited<ReturnType<typeof puppeteer.launch>>['newPage']>> | null = null;
      try {
        page = await browser.newPage();
        await page.setUserAgent(CRAWLER_USER_AGENT);

        await page.goto(currentUrl, {
          waitUntil: 'domcontentloaded',
          timeout: CRAWL_PAGE_TIMEOUT,
        });

        // Extract all links from the page
        const links: string[] = await page.evaluate(() => {
          const anchors = document.querySelectorAll('a[href]');
          return Array.from(anchors).map((a) => (a as HTMLAnchorElement).href);
        });

        // Process discovered links
        for (const link of links) {
          const normalized = normalizeUrl(link, baseOrigin);
          if (!normalized) continue;

          // Skip if already visited or queued
          if (visited.has(normalized)) continue;

          // Only follow internal links (same origin)
          try {
            const linkOrigin = new URL(normalized).origin;
            if (linkOrigin !== baseOrigin) {
              continue; // External link
            }
          } catch {
            continue;
          }

          // Check if it should be skipped
          const linkSkipCheck = shouldSkipUrl(normalized);
          if (linkSkipCheck.skip) {
            if (!skipped.some((s) => s.url === normalized)) {
              skipped.push({ url: normalized, reason: linkSkipCheck.reason ?? 'Skipped' });
            }
            continue;
          }

          queue.push(normalized);
        }
      } catch {
        // If a page fails to load during crawling, skip it and continue
        skipped.push({ url: currentUrl, reason: 'Failed to load page' });
      } finally {
        if (page) {
          try {
            await page.close();
          } catch {
            // Page may already be closed
          }
        }
      }
    }

    return {
      baseUrl,
      urls: discovered,
      totalFound: discovered.length,
      limitApplied: maxPages,
      skipped,
    };
  } catch (err) {
    // If the browser fails to launch or something goes fundamentally wrong,
    // return just the base URL so the caller can at least scan one page
    return {
      baseUrl,
      urls: [baseUrl],
      totalFound: 1,
      limitApplied: maxPages,
      skipped: [
        {
          url: baseUrl,
          reason: `Crawler error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ],
    };
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Browser may already be closed
      }
    }
  }
}
