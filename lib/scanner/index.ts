// Scanner module entry point
// All scanner functionality exported from a single location.

// Types
export type {
  ViolationSeverity,
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

export type {
  ScanComparison,
  ComparableScan,
} from './compare';

// Page scanning
export { scanPage } from './scan-page';

// Site crawling
export { crawlSite } from './crawl-site';

// Violation translation
export { translateViolation, translateAllViolations } from './translate';

// Compliance scoring
export { calculateScore } from './score';

// Scan comparison
export { compareScans, markNewViolations } from './compare';

// Remote scanning (Railway worker)
export { remoteScanPage, remoteScanSite } from './remote-scan';
export type { RemoteMultiPageScanResult } from './remote-scan';
