import { describe, it, expect } from 'vitest';
import { translateViolation, translateAllViolations } from '@/lib/scanner/translate';
import type { AxeViolation } from '@/lib/scanner/types';

// All 30+ mapped violation rule IDs from the VIOLATION_MAP
const MAPPED_RULE_IDS = [
  'color-contrast',
  'image-alt',
  'link-name',
  'button-name',
  'label',
  'html-has-lang',
  'document-title',
  'heading-order',
  'empty-heading',
  'frame-title',
  'html-lang-valid',
  'meta-viewport',
  'list',
  'listitem',
  'input-image-alt',
  'select-name',
  'td-headers-attr',
  'th-has-data-cells',
  'valid-lang',
  'aria-allowed-attr',
  'aria-hidden-body',
  'aria-required-attr',
  'aria-required-children',
  'aria-required-parent',
  'aria-roles',
  'aria-valid-attr-value',
  'aria-valid-attr',
  'duplicate-id',
  'bypass',
  'region',
  // Additional beyond the core 30
  'autocomplete-valid',
  'link-in-text-block',
  'tabindex',
  'focus-order-semantics',
  'landmark-one-main',
  'page-has-heading-one',
  'image-redundant-alt',
  'meta-refresh',
  'video-caption',
  'definition-list',
  'dlitem',
  'scope-attr-valid',
  'nested-interactive',
];

function createAxeViolation(
  id: string,
  impact: 'minor' | 'moderate' | 'serious' | 'critical' | null = 'serious'
): AxeViolation {
  return {
    id,
    impact,
    tags: ['wcag2a', 'wcag143'],
    description: `Axe description for ${id}`,
    help: `Axe help for ${id}`,
    helpUrl: `https://dequeuniversity.com/rules/axe/4.4/${id}`,
    nodes: [
      {
        html: '<div>Test element</div>',
        target: ['.test-element'],
        failureSummary: 'Fix this issue',
      },
    ],
  };
}

describe('translateViolation', () => {
  describe('mapped violations produce non-empty translations', () => {
    for (const ruleId of MAPPED_RULE_IDS) {
      it(`should produce a non-empty translation for "${ruleId}"`, () => {
        const axeViolation = createAxeViolation(ruleId);
        const translated = translateViolation(axeViolation);

        expect(translated.ruleId).toBe(ruleId);
        expect(translated.title).toBeTruthy();
        expect(translated.title.length).toBeGreaterThan(0);
        expect(translated.severity).toBeTruthy();
        expect(translated.description).toBeTruthy();
        expect(translated.description.length).toBeGreaterThan(0);
        expect(translated.impact).toBeTruthy();
        expect(translated.impact.length).toBeGreaterThan(0);
        expect(translated.fix).toBeTruthy();
        expect(translated.fix.length).toBeGreaterThan(0);
        expect(translated.wcagCriteria.length).toBeGreaterThan(0);
      });
    }
  });

  it('should produce a reasonable fallback for unknown rule IDs', () => {
    const axeViolation = createAxeViolation('some-unknown-rule-xyz');
    const translated = translateViolation(axeViolation);

    expect(translated.ruleId).toBe('some-unknown-rule-xyz');
    expect(translated.title).toBeTruthy();
    expect(translated.title.length).toBeGreaterThan(0);
    // Fallback title should be generated from rule ID
    expect(translated.title).toContain('Some');
    expect(translated.description).toBeTruthy();
    expect(translated.impact).toBeTruthy();
    expect(translated.fix).toBeTruthy();
    expect(translated.instanceCount).toBe(1);
  });

  it('should extract HTML snippets from nodes', () => {
    const axeViolation: AxeViolation = {
      id: 'image-alt',
      impact: 'critical',
      tags: ['wcag2a', 'wcag111'],
      description: 'Images must have alternative text',
      help: 'Images must have alternative text',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/image-alt',
      nodes: [
        { html: '<img src="photo.jpg">', target: ['img.hero'], failureSummary: 'Add alt text' },
        { html: '<img src="logo.png">', target: ['img.logo'], failureSummary: 'Add alt text' },
      ],
    };

    const translated = translateViolation(axeViolation);

    expect(translated.htmlSnippets).toEqual([
      '<img src="photo.jpg">',
      '<img src="logo.png">',
    ]);
    expect(translated.cssSelectors).toEqual(['img.hero', 'img.logo']);
    expect(translated.instanceCount).toBe(2);
  });

  describe('severity mapping', () => {
    it('should map critical impact to critical severity for known rules', () => {
      const violation = createAxeViolation('image-alt', 'critical');
      const translated = translateViolation(violation);
      expect(translated.severity).toBe('critical');
    });

    it('should map serious impact to serious severity for known rules', () => {
      const violation = createAxeViolation('color-contrast', 'serious');
      const translated = translateViolation(violation);
      expect(translated.severity).toBe('serious');
    });

    it('should map moderate impact to moderate severity for known rules', () => {
      const violation = createAxeViolation('heading-order', 'moderate');
      const translated = translateViolation(violation);
      expect(translated.severity).toBe('moderate');
    });

    it('should map minor impact to minor severity for known rules', () => {
      const violation = createAxeViolation('image-redundant-alt', 'minor');
      const translated = translateViolation(violation);
      expect(translated.severity).toBe('minor');
    });

    it('should use axe-core impact for unknown rules', () => {
      const violation = createAxeViolation('unknown-rule', 'critical');
      const translated = translateViolation(violation);
      expect(translated.severity).toBe('critical');
    });

    it('should default to moderate for null impact on unknown rules', () => {
      const violation = createAxeViolation('unknown-rule', null);
      const translated = translateViolation(violation);
      expect(translated.severity).toBe('moderate');
    });
  });
});

describe('translateAllViolations', () => {
  it('should sort violations by severity (critical first)', () => {
    const violations: AxeViolation[] = [
      createAxeViolation('image-redundant-alt', 'minor'), // minor in map
      createAxeViolation('image-alt', 'critical'), // critical in map
      createAxeViolation('color-contrast', 'serious'), // serious in map
      createAxeViolation('heading-order', 'moderate'), // moderate in map
    ];

    const translated = translateAllViolations(violations);

    expect(translated[0].severity).toBe('critical');
    expect(translated[1].severity).toBe('serious');
    expect(translated[2].severity).toBe('moderate');
    expect(translated[3].severity).toBe('minor');
  });

  it('should translate all violations', () => {
    const violations: AxeViolation[] = [
      createAxeViolation('image-alt'),
      createAxeViolation('color-contrast'),
      createAxeViolation('link-name'),
    ];

    const translated = translateAllViolations(violations);
    expect(translated).toHaveLength(3);
  });

  it('should return empty array for no violations', () => {
    const translated = translateAllViolations([]);
    expect(translated).toHaveLength(0);
  });
});
