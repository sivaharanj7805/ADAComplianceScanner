import puppeteer from 'puppeteer';
import type { CrawlResult } from './types';

const CRAWLER_USER_AGENT =
  'AccessAudit/1.0 (Accessibility Scanner; +https://accessaudit.com/bot)';
const CRAWL_PAGE_TIMEOUT = 15_000;

const SKIP_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.bmp', '.tiff',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.zip', '.rar', '.tar', '.gz', '.7z',
  '.mp3', '.mp4', '.wav', '.avi', '.mov', '.wmv', '.flv', '.webm',
  '.css', '.js', '.json', '.xml', '.rss', '.atom',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
]);

function normalizeUrl(urlStr: string, baseOrigin: string): string | null {
  try {
    const parsed = new URL(urlStr, baseOrigin);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    parsed.hash = '';
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'msclkid', 'ref', 'source',
    ];
    for (const param of trackingParams) parsed.searchParams.delete(param);
    let normalized = parsed.toString();
    if (normalized.endsWith('/') && parsed.pathname !== '/') {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return null;
  }
}

function shouldSkipUrl(urlStr: string): { skip: boolean; reason?: string } {
  try {
    const parsed = new URL(urlStr);
    const pathname = parsed.pathname.toLowerCase();
    if (['mailto:', 'tel:', 'javascript:', 'data:'].includes(parsed.protocol)) {
      return { skip: true, reason: `Non-HTTP protocol: ${parsed.protocol}` };
    }
    const lastSegment = pathname.split('/').pop() ?? '';
    const dotIndex = lastSegment.lastIndexOf('.');
    if (dotIndex !== -1) {
      const ext = lastSegment.substring(dotIndex).toLowerCase();
      if (SKIP_EXTENSIONS.has(ext)) return { skip: true, reason: `Skipped file type: ${ext}` };
    }
    return { skip: false };
  } catch {
    return { skip: true, reason: 'Invalid URL' };
  }
}

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
      if (!response || response.status() !== 200) return true;
      const text = await page.evaluate(() => document.body?.innerText ?? '');
      return parseRobotsTxt(text, pathname);
    } finally {
      await page.close();
    }
  } catch {
    return true;
  }
}

function parseRobotsTxt(robotsTxt: string, pathname: string): boolean {
  const lines = robotsTxt.split('\n').map((l) => l.trim());
  let currentAgentMatches = false;
  let foundSpecificAgent = false;
  const disallowRules: string[] = [];
  const allowRules: string[] = [];
  const wildcardDisallowRules: string[] = [];
  const wildcardAllowRules: string[] = [];

  for (const line of lines) {
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
      if (foundSpecificAgent) disallowRules.push(value);
      else wildcardDisallowRules.push(value);
    } else if (directive === 'allow' && value && currentAgentMatches) {
      if (foundSpecificAgent) allowRules.push(value);
      else wildcardAllowRules.push(value);
    }
  }

  const effectiveDisallow = disallowRules.length > 0 ? disallowRules : wildcardDisallowRules;
  const effectiveAllow = allowRules.length > 0 ? allowRules : wildcardAllowRules;

  for (const rule of effectiveAllow) {
    if (pathname.startsWith(rule)) return true;
  }
  for (const rule of effectiveDisallow) {
    if (pathname.startsWith(rule)) return false;
  }
  return true;
}

export async function crawlSite(
  baseUrl: string,
  maxPages: number = 25
): Promise<CrawlResult> {
  const baseOrigin = new URL(baseUrl).origin;
  const normalizedBase = normalizeUrl(baseUrl, baseOrigin);
  if (!normalizedBase) {
    return { baseUrl, urls: [baseUrl], totalFound: 1, limitApplied: maxPages, skipped: [] };
  }

  const visited = new Set<string>();
  const queue: string[] = [normalizedBase];
  const discovered: string[] = [];
  const skipped: { url: string; reason: string }[] = [];
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });

    const robotsAllowed = await isAllowedByRobotsTxt(baseOrigin, new URL(normalizedBase).pathname, browser);
    if (!robotsAllowed) {
      skipped.push({ url: normalizedBase, reason: 'Blocked by robots.txt' });
      return { baseUrl, urls: [], totalFound: 0, limitApplied: maxPages, skipped };
    }

    while (queue.length > 0 && discovered.length < maxPages) {
      const currentUrl = queue.shift()!;
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);

      const currentPath = new URL(currentUrl).pathname;
      const allowed = await isAllowedByRobotsTxt(baseOrigin, currentPath, browser);
      if (!allowed) {
        skipped.push({ url: currentUrl, reason: 'Blocked by robots.txt' });
        continue;
      }

      const skipCheck = shouldSkipUrl(currentUrl);
      if (skipCheck.skip) {
        skipped.push({ url: currentUrl, reason: skipCheck.reason ?? 'Skipped' });
        continue;
      }

      discovered.push(currentUrl);
      if (discovered.length >= maxPages) break;

      let page: Awaited<ReturnType<Awaited<ReturnType<typeof puppeteer.launch>>['newPage']>> | null = null;
      try {
        page = await browser.newPage();
        await page.setUserAgent(CRAWLER_USER_AGENT);
        await page.goto(currentUrl, { waitUntil: 'domcontentloaded', timeout: CRAWL_PAGE_TIMEOUT });

        const links: string[] = await page.evaluate(() => {
          const anchors = document.querySelectorAll('a[href]');
          return Array.from(anchors).map((a) => (a as HTMLAnchorElement).href);
        });

        for (const link of links) {
          const normalized = normalizeUrl(link, baseOrigin);
          if (!normalized) continue;
          if (visited.has(normalized)) continue;
          try {
            const linkOrigin = new URL(normalized).origin;
            if (linkOrigin !== baseOrigin) continue;
          } catch { continue; }
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
        skipped.push({ url: currentUrl, reason: 'Failed to load page' });
      } finally {
        if (page) {
          try { await page.close(); } catch { /* Page may already be closed */ }
        }
      }
    }

    return { baseUrl, urls: discovered, totalFound: discovered.length, limitApplied: maxPages, skipped };
  } catch (err) {
    return {
      baseUrl,
      urls: [baseUrl],
      totalFound: 1,
      limitApplied: maxPages,
      skipped: [{ url: baseUrl, reason: `Crawler error: ${err instanceof Error ? err.message : String(err)}` }],
    };
  } finally {
    if (browser) {
      try { await browser.close(); } catch { /* Browser may already be closed */ }
    }
  }
}
