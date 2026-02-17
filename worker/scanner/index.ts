// Scanner module entry point for the standalone worker

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
  ViolationTranslation,
  ViolationSeverity,
} from './types';

export { scanPage } from './scan-page';
export { crawlSite } from './crawl-site';
export { translateViolation, translateAllViolations } from './translate';
export { calculateScore } from './score';
