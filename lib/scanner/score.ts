import type { TranslatedViolation } from './types';

/**
 * Penalty weights per violation severity.
 *
 * Critical violations (like missing alt text, hidden body, blocked zoom)
 * reduce the score much more than minor best-practice issues. This reflects
 * the real-world impact: a critical violation can make a page completely
 * unusable for someone with a disability, while a minor issue is an
 * inconvenience.
 */
const SEVERITY_WEIGHTS: Record<string, number> = {
  critical: 5,
  serious: 3,
  moderate: 1.5,
  minor: 0.5,
};

/**
 * Calculate a compliance score from 0-100 based on violations found.
 *
 * Formula: Start at 100, subtract weighted penalties per violation.
 *   - Critical violations: -5 points each
 *   - Serious violations: -3 points each
 *   - Moderate violations: -1.5 points each
 *   - Minor violations: -0.5 points each
 *
 * The score is floored at 0 and capped at 100, then rounded to an integer.
 *
 * Each violation's instanceCount is factored in — a single rule affecting
 * 10 elements counts as 10 penalty instances, not 1. This gives an accurate
 * picture: a page with 50 images missing alt text should score worse than
 * one with a single missing alt text.
 */
export function calculateScore(violations: TranslatedViolation[]): number {
  let penalty = 0;

  for (const violation of violations) {
    const weight = SEVERITY_WEIGHTS[violation.severity] ?? 1;
    penalty += weight * violation.instanceCount;
  }

  const raw = 100 - penalty;
  return Math.round(Math.max(0, Math.min(100, raw)));
}
