import type { TranslatedViolation } from './types';

/**
 * Penalty weights per violation severity.
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
 * Each violation's instanceCount is factored in.
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
