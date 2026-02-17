import type { ViolationSeverity } from '@/lib/types/database';

// ============================================================================
// axe-core input types (subset of axe-core's own types we actually use)
// ============================================================================

/** A single node instance that triggered an axe-core violation */
export interface AxeNode {
  html: string;
  target: string[];
  failureSummary?: string;
}

/** A single axe-core violation result */
export interface AxeViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical' | null;
  tags: string[];
  description: string;
  help: string;
  helpUrl: string;
  nodes: AxeNode[];
}

/** The full result object returned by axe.run() */
export interface AxeResults {
  violations: AxeViolation[];
  passes: { id: string; nodes: AxeNode[] }[];
  incomplete: { id: string; nodes: AxeNode[] }[];
  inapplicable: { id: string }[];
  timestamp: string;
  url: string;
}

// ============================================================================
// Scanner output types
// ============================================================================

/** A single violation translated into plain English */
export interface TranslatedViolation {
  /** The axe-core rule ID (e.g., "color-contrast") */
  ruleId: string;
  /** Plain-English title (e.g., "Text Color Too Hard to Read") */
  title: string;
  /** Severity level */
  severity: ViolationSeverity;
  /** Plain-English description of what's wrong */
  description: string;
  /** Plain-English explanation of who is affected and how */
  impact: string;
  /** Plain-English step-by-step fix instructions */
  fix: string;
  /** WCAG success criteria references (e.g., ["1.4.3 Contrast (Minimum)"]) */
  wcagCriteria: string[];
  /** The HTML snippet of the offending element(s) */
  htmlSnippets: string[];
  /** CSS selectors targeting the offending element(s) */
  cssSelectors: string[];
  /** Number of element instances affected by this violation */
  instanceCount: number;
}

/** The result of scanning a single page */
export interface PageScanResult {
  /** The URL that was scanned */
  url: string;
  /** Compliance score from 0-100 */
  score: number;
  /** All translated violations found on this page */
  violations: TranslatedViolation[];
  /** The <title> of the scanned page */
  pageTitle: string;
  /** ISO timestamp of when the scan completed */
  timestamp: string;
  /** Total rules that passed */
  passingRuleCount: number;
  /** Total rules that were checked */
  totalRuleCount: number;
}

/** Error result when a page scan fails */
export interface PageScanError {
  /** The URL that failed to scan */
  url: string;
  /** Human-readable error message */
  error: string;
  /** Error category for programmatic handling */
  errorCode: ScanErrorCode;
  /** ISO timestamp of when the error occurred */
  timestamp: string;
}

/** Possible error codes for scan failures */
export type ScanErrorCode =
  | 'TIMEOUT'
  | 'DNS_FAILURE'
  | 'SSL_ERROR'
  | 'HTTP_ERROR'
  | 'CONNECTION_REFUSED'
  | 'PAGE_CRASH'
  | 'INVALID_URL'
  | 'UNKNOWN';

/** Union type: a page scan either succeeds or fails */
export type PageScanOutcome =
  | { success: true; result: PageScanResult }
  | { success: false; error: PageScanError };

/** Result of crawling a site for URLs to scan */
export interface CrawlResult {
  /** The starting URL */
  baseUrl: string;
  /** All discovered URLs (including the base URL) */
  urls: string[];
  /** Number of pages discovered */
  totalFound: number;
  /** Number of pages capped by maxPages limit */
  limitApplied: number;
  /** URLs that were skipped (with reasons) */
  skipped: { url: string; reason: string }[];
}

/** Full site scan result (multiple pages) */
export interface SiteScanResult {
  /** The base URL of the site */
  baseUrl: string;
  /** Results for each page that was scanned */
  pages: PageScanOutcome[];
  /** Overall compliance score (average of successful page scores) */
  overallScore: number;
  /** All unique violations across all pages */
  allViolations: TranslatedViolation[];
  /** Violation counts by severity */
  violationCounts: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    total: number;
  };
  /** Total pages scanned successfully */
  pagesScanned: number;
  /** Total pages that failed */
  pagesFailed: number;
  /** ISO timestamp */
  timestamp: string;
}

// ============================================================================
// Translation map types
// ============================================================================

/** A pre-defined translation entry for a known axe-core rule */
export interface ViolationTranslation {
  title: string;
  severity: ViolationSeverity;
  impact: string;
  description: string;
  fix: string;
  wcagCriteria: string[];
}
