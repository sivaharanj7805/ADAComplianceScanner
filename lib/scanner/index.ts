// Scanner module entry point
// All scanner functionality exported from a single location.

// Types
export type {
  AxeNode,
  AxeViolation,
  AxeResults,
  TranslatedViolation,
  PageScanResult,
  PageScanError,
  PageScanOutcome,
  ScanErrorCode,
  CrawlResult,
  SiteScanResult,
  ViolationTranslation,
} from './types';

// Page scanning
export { scanPage } from './scan-page';

// Site crawling
export { crawlSite } from './crawl-site';

// Violation translation
export { translateViolation, translateAllViolations } from './translate';

// Compliance scoring
export { calculateScore } from './score';
