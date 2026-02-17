import { describe, it, expect } from 'vitest';
import { calculateScore } from '@/lib/scanner/score';
import type { TranslatedViolation } from '@/lib/scanner/types';
import { createTestTranslatedViolation } from '../../setup';

function makeViolation(
  severity: 'critical' | 'serious' | 'moderate' | 'minor',
  instanceCount: number
): TranslatedViolation {
  return createTestTranslatedViolation({ severity, instanceCount });
}

describe('calculateScore', () => {
  it('should return 100 for no violations (perfect score)', () => {
    const score = calculateScore([]);
    expect(score).toBe(100);
  });

  it('should calculate score with mixed violations', () => {
    const violations = [
      makeViolation('critical', 1), // -5
      makeViolation('serious', 2), // -6
      makeViolation('moderate', 3), // -4.5
      makeViolation('minor', 4), // -2
    ];
    // Total penalty: 5 + 6 + 4.5 + 2 = 17.5
    // Score: 100 - 17.5 = 82.5 → rounded to 83
    const score = calculateScore(violations);
    expect(score).toBe(83);
  });

  it('should floor score at 0', () => {
    const violations = [
      makeViolation('critical', 50), // -250 points
    ];
    const score = calculateScore(violations);
    expect(score).toBe(0);
  });

  it('should cap score at 100', () => {
    // No violations = 100
    const score = calculateScore([]);
    expect(score).toBeLessThanOrEqual(100);
    expect(score).toBe(100);
  });

  it('should apply critical weight correctly (-5 per instance)', () => {
    const violations = [makeViolation('critical', 1)];
    const score = calculateScore(violations);
    // 100 - 5 = 95
    expect(score).toBe(95);
  });

  it('should apply serious weight correctly (-3 per instance)', () => {
    const violations = [makeViolation('serious', 1)];
    const score = calculateScore(violations);
    // 100 - 3 = 97
    expect(score).toBe(97);
  });

  it('should apply moderate weight correctly (-1.5 per instance)', () => {
    const violations = [makeViolation('moderate', 2)];
    const score = calculateScore(violations);
    // 100 - 3 = 97
    expect(score).toBe(97);
  });

  it('should apply minor weight correctly (-0.5 per instance)', () => {
    const violations = [makeViolation('minor', 2)];
    const score = calculateScore(violations);
    // 100 - 1 = 99
    expect(score).toBe(99);
  });

  it('should factor in instanceCount (50 images missing alt = 50 penalties)', () => {
    const violations = [makeViolation('critical', 50)];
    // 50 * 5 = 250 penalty, clamped to 0
    const score = calculateScore(violations);
    expect(score).toBe(0);
  });

  it('should round to nearest integer', () => {
    // 1 moderate instance: 100 - 1.5 = 98.5 → 99 (rounds up)
    const violations = [makeViolation('moderate', 1)];
    const score = calculateScore(violations);
    expect(score).toBe(99);
    expect(Number.isInteger(score)).toBe(true);
  });

  it('should never return below 0', () => {
    const violations = [
      makeViolation('critical', 100),
      makeViolation('serious', 100),
      makeViolation('moderate', 100),
      makeViolation('minor', 100),
    ];
    const score = calculateScore(violations);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBe(0);
  });

  it('should never return above 100', () => {
    const score = calculateScore([]);
    expect(score).toBeLessThanOrEqual(100);
  });
});
