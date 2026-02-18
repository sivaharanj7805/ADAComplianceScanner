import { describe, it, expect } from 'vitest';
import {
  generateAccessibilityStatement,
  statementToPlainText,
} from '@/lib/reports/generate-statement';
import {
  createTestSite,
  createTestScan,
  createTestProfile,
  createTestViolation,
} from '../../setup';
import type { Violation } from '@/lib/types/database';
import type { StatementOptions } from '@/lib/reports/generate-statement';

function createDefaultOptions(overrides: Partial<StatementOptions> = {}): StatementOptions {
  return {
    companyName: 'Test Company',
    contactEmail: 'access@testcompany.com',
    additionalCommitment: '',
    ...overrides,
  };
}

describe('generateAccessibilityStatement', () => {
  it('should include the site name in the statement', () => {
    const site = createTestSite({ name: 'My Test Website' });
    const scan = createTestScan({ score: 85, completed_at: '2025-06-15T12:00:00Z' });
    const violations = [createTestViolation()];
    const profile = createTestProfile();
    const options = createDefaultOptions({ companyName: '' });

    const html = generateAccessibilityStatement(site, scan, violations, profile, options);

    // When companyName is empty, should fall back to site.name
    expect(html).toContain('My Test Website');
  });

  it('should include the company name when provided', () => {
    const site = createTestSite();
    const scan = createTestScan({ score: 85, completed_at: '2025-06-15T12:00:00Z' });
    const violations = [createTestViolation()];
    const profile = createTestProfile();
    const options = createDefaultOptions({ companyName: 'Acme Corp' });

    const html = generateAccessibilityStatement(site, scan, violations, profile, options);

    expect(html).toContain('Acme Corp');
  });

  it('should include the scan date', () => {
    const site = createTestSite();
    const scan = createTestScan({ completed_at: '2025-06-15T12:00:00Z' });
    const violations: Violation[] = [];
    const profile = createTestProfile();
    const options = createDefaultOptions();

    const html = generateAccessibilityStatement(site, scan, violations, profile, options);

    // formatDate should produce a human-readable date
    expect(html).toContain('June');
    expect(html).toContain('2025');
    expect(html).toContain('15');
  });

  it('should list known issues when critical/serious violations exist', () => {
    const site = createTestSite();
    const scan = createTestScan({
      score: 70,
      total_violations: 3,
      critical_count: 1,
      serious_count: 1,
      moderate_count: 1,
      minor_count: 0,
    });
    const violations = [
      createTestViolation({
        id: 'v1',
        severity: 'critical',
        description: 'Images are missing alt text descriptions',
      }),
      createTestViolation({
        id: 'v2',
        severity: 'serious',
        description: 'Links have no descriptive text',
      }),
      createTestViolation({
        id: 'v3',
        severity: 'moderate',
        description: 'Heading order is incorrect',
      }),
    ];
    const profile = createTestProfile();
    const options = createDefaultOptions();

    const html = generateAccessibilityStatement(site, scan, violations, profile, options);

    expect(html).toContain('Known Issues');
    expect(html).toContain('Images are missing alt text descriptions');
    expect(html).toContain('Links have no descriptive text');
    // Moderate should not be listed in Known Issues (only critical/serious)
    expect(html).not.toContain('Heading order is incorrect');
  });

  it('should include the compliance score', () => {
    const site = createTestSite();
    const scan = createTestScan({ score: 85 });
    const violations: Violation[] = [];
    const profile = createTestProfile();
    const options = createDefaultOptions();

    const html = generateAccessibilityStatement(site, scan, violations, profile, options);

    expect(html).toContain('85/100');
  });

  it('should include WCAG reference', () => {
    const site = createTestSite();
    const scan = createTestScan();
    const violations: Violation[] = [];
    const profile = createTestProfile();
    const options = createDefaultOptions();

    const html = generateAccessibilityStatement(site, scan, violations, profile, options);

    expect(html).toContain('WCAG');
    expect(html).toContain('2.1');
    expect(html).toContain('Level AA');
  });

  it('should include contact email when provided', () => {
    const site = createTestSite();
    const scan = createTestScan();
    const violations: Violation[] = [];
    const profile = createTestProfile();
    const options = createDefaultOptions({ contactEmail: 'help@example.com' });

    const html = generateAccessibilityStatement(site, scan, violations, profile, options);

    expect(html).toContain('help@example.com');
    expect(html).toContain('mailto:help@example.com');
  });

  it('should handle null scan gracefully', () => {
    const site = createTestSite({ current_score: 50 });
    const violations: Violation[] = [];
    const profile = createTestProfile();
    const options = createDefaultOptions();

    const html = generateAccessibilityStatement(site, null, violations, profile, options);

    // Should not crash and should produce valid HTML
    expect(html).toContain('Accessibility Statement');
    expect(html).toContain('Test Company');
  });

  it('should include additional commitment text when provided', () => {
    const site = createTestSite();
    const scan = createTestScan();
    const violations: Violation[] = [];
    const profile = createTestProfile();
    const options = createDefaultOptions({
      additionalCommitment: 'We hire accessibility consultants annually.',
    });

    const html = generateAccessibilityStatement(site, scan, violations, profile, options);

    expect(html).toContain('We hire accessibility consultants annually.');
  });

  it('should include pages scanned count', () => {
    const site = createTestSite();
    const scan = createTestScan({ pages_scanned: 15 });
    const violations: Violation[] = [];
    const profile = createTestProfile();
    const options = createDefaultOptions();

    const html = generateAccessibilityStatement(site, scan, violations, profile, options);

    expect(html).toContain('15 pages');
  });
});

describe('statementToPlainText', () => {
  it('should strip HTML tags and produce readable text', () => {
    const site = createTestSite();
    const scan = createTestScan();
    const violations: Violation[] = [];
    const profile = createTestProfile();
    const options = createDefaultOptions();

    const html = generateAccessibilityStatement(site, scan, violations, profile, options);
    const plainText = statementToPlainText(html);

    // Should not contain HTML tags
    expect(plainText).not.toContain('<h1');
    expect(plainText).not.toContain('<h2');
    expect(plainText).not.toContain('<p>');
    expect(plainText).not.toContain('</p>');
    // Should still contain content
    expect(plainText).toContain('Accessibility Statement');
    expect(plainText).toContain('Test Company');
  });
});
