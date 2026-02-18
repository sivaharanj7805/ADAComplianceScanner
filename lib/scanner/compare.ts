import type { Violation } from '@/lib/types/database';

// ============================================================================
// Types
// ============================================================================

/** Summary of differences between two scans */
export interface ScanComparison {
  /** Violations present in the current scan but not the previous one */
  newViolations: Violation[];
  /** Violations present in the previous scan but not the current one (fixed) */
  resolvedViolations: Violation[];
  /** Violations present in both scans */
  persistingViolations: Violation[];
  /** Change in compliance score (positive = improvement) */
  scoreChange: number | null;
  /** Previous scan score */
  previousScore: number | null;
  /** Current scan score */
  currentScore: number | null;
}

/** Minimal scan shape needed for comparison */
export interface ComparableScan {
  score: number | null;
}

// ============================================================================
// Comparison logic
// ============================================================================

/**
 * Build a fingerprint key for a violation so we can match the "same"
 * violation across two scans.  Key = rule_id + css_selector + page_url.
 */
function violationKey(v: Pick<Violation, 'rule_id' | 'css_selector' | 'page_url'>): string {
  return `${v.rule_id}::${v.css_selector ?? ''}::${v.page_url}`;
}

/**
 * Compare two scans and categorise every violation as new, resolved, or
 * persisting.  The previous scan's violations are used as the baseline.
 *
 * @param previousScan  - The older scan to compare against
 * @param currentScan   - The newer (just-completed) scan
 * @param previousViolations - Violations from the previous scan
 * @param currentViolations  - Violations from the current scan
 */
export function compareScans(
  previousScan: ComparableScan,
  currentScan: ComparableScan,
  previousViolations: Violation[],
  currentViolations: Violation[],
): ScanComparison {
  // Index previous violations by their fingerprint
  const prevByKey = new Map<string, Violation>();
  for (const v of previousViolations) {
    prevByKey.set(violationKey(v), v);
  }

  // Index current violations by their fingerprint
  const currByKey = new Map<string, Violation>();
  for (const v of currentViolations) {
    currByKey.set(violationKey(v), v);
  }

  const newViolations: Violation[] = [];
  const persistingViolations: Violation[] = [];

  // Walk current violations: if the key existed in previous, it's persisting;
  // otherwise it's new.
  for (const [key, v] of currByKey) {
    if (prevByKey.has(key)) {
      persistingViolations.push(v);
    } else {
      newViolations.push(v);
    }
  }

  // Resolved = anything in previous that is NOT in current
  const resolvedViolations: Violation[] = [];
  for (const [key, v] of prevByKey) {
    if (!currByKey.has(key)) {
      resolvedViolations.push(v);
    }
  }

  const scoreChange =
    previousScan.score !== null && currentScan.score !== null
      ? currentScan.score - previousScan.score
      : null;

  return {
    newViolations,
    resolvedViolations,
    persistingViolations,
    scoreChange,
    previousScore: previousScan.score,
    currentScore: currentScan.score,
  };
}

/**
 * Determine `is_new` for each violation insert based on a set of previous
 * violation fingerprints.  Returns the same array with `is_new` set.
 */
export function markNewViolations<
  T extends { rule_id: string; css_selector?: string | null; page_url: string; is_new?: boolean },
>(
  violations: T[],
  previousViolations: Pick<Violation, 'rule_id' | 'css_selector' | 'page_url'>[],
): T[] {
  const prevKeys = new Set(previousViolations.map(violationKey));

  for (const v of violations) {
    const key = `${v.rule_id}::${v.css_selector ?? ''}::${v.page_url}`;
    v.is_new = !prevKeys.has(key);
  }

  return violations;
}
