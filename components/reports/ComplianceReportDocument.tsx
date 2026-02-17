import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type {
  Scan,
  Violation,
  Site,
  AgencySettings,
  ViolationSeverity,
} from '@/lib/types/database';
import type { ReportData } from '@/lib/reports/generate-pdf';

// ---------------------------------------------------------------------------
// Fonts – use standard PDF fonts to avoid external dependencies
// ---------------------------------------------------------------------------
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 700 },
    { src: 'Helvetica-Oblique', fontStyle: 'italic' },
  ],
});

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------
const COLORS = {
  primary: '#0F172A',       // Slate-900
  secondary: '#475569',     // Slate-500
  muted: '#94A3B8',         // Slate-400
  accent: '#EA580C',        // Orange-600 (brand)
  white: '#FFFFFF',
  bg: '#F8FAFC',            // Slate-50
  border: '#E2E8F0',        // Slate-200
  // Severity
  critical: '#DC2626',
  criticalBg: '#FEF2F2',
  serious: '#EA580C',
  seriousBg: '#FFF7ED',
  moderate: '#D97706',
  moderateBg: '#FFFBEB',
  minor: '#2563EB',
  minorBg: '#EFF6FF',
  // Score
  scoreGood: '#059669',
  scoreMedium: '#D97706',
  scoreBad: '#DC2626',
};

function getBrandColors(agency: AgencySettings | null) {
  return {
    primary: agency?.primary_color || COLORS.accent,
    secondary: agency?.secondary_color || COLORS.primary,
  };
}

function getScoreColor(score: number | null): string {
  if (score === null) return COLORS.muted;
  if (score >= 80) return COLORS.scoreGood;
  if (score >= 50) return COLORS.scoreMedium;
  return COLORS.scoreBad;
}

function getScoreLabel(score: number | null): string {
  if (score === null) return 'Not Scored';
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Needs Improvement';
  if (score >= 40) return 'Poor';
  return 'Critical';
}

const SEVERITY_META: Record<
  ViolationSeverity,
  { label: string; color: string; bg: string }
> = {
  critical: { label: 'Critical', color: COLORS.critical, bg: COLORS.criticalBg },
  serious: { label: 'Serious', color: COLORS.serious, bg: COLORS.seriousBg },
  moderate: { label: 'Moderate', color: COLORS.moderate, bg: COLORS.moderateBg },
  minor: { label: 'Minor', color: COLORS.minor, bg: COLORS.minorBg },
};

const SEVERITY_ORDER: ViolationSeverity[] = [
  'critical',
  'serious',
  'moderate',
  'minor',
];

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  // Page
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 50,
  },
  coverPage: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: COLORS.primary,
    padding: 0,
  },

  // Cover
  coverBg: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'space-between',
    padding: 60,
  },
  coverTop: {
    marginTop: 40,
  },
  coverBrandName: {
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
    opacity: 0.7,
    marginBottom: 40,
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 700,
    color: COLORS.white,
    lineHeight: 1.2,
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.7,
    marginBottom: 40,
  },
  coverMeta: {
    flexDirection: 'row',
    gap: 30,
  },
  coverMetaItem: {
    marginBottom: 16,
  },
  coverMetaLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.white,
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  coverMetaValue: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.9,
  },
  coverBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  coverAccentBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  coverConfidential: {
    fontSize: 8,
    color: COLORS.white,
    opacity: 0.4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Section headers
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 10,
    color: COLORS.secondary,
    marginBottom: 20,
  },
  sectionDivider: {
    width: 40,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.accent,
    marginBottom: 20,
  },

  // Executive Summary
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    border: `1 solid ${COLORS.border}`,
    borderRadius: 6,
    padding: 14,
  },
  summaryCardLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  summaryCardValue: {
    fontSize: 22,
    fontWeight: 700,
  },
  summaryCardSub: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 2,
  },

  // Score display
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    border: `1 solid ${COLORS.border}`,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 700,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 4,
  },
  scoreScale: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 2,
  },

  // Severity breakdown bar
  severityBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  severityBarSegment: {
    height: 8,
  },
  severityLegend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  severityLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  severityLegendText: {
    fontSize: 8,
    color: COLORS.secondary,
  },

  // Violation section header
  violationGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    marginTop: 16,
    paddingBottom: 6,
    borderBottom: `1 solid ${COLORS.border}`,
  },
  violationGroupBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.white,
  },
  violationGroupCount: {
    fontSize: 9,
    color: COLORS.muted,
  },

  // Violation card
  violationCard: {
    marginBottom: 8,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    border: `1 solid ${COLORS.border}`,
  },
  violationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  violationTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.primary,
    flex: 1,
    marginRight: 8,
  },
  violationSeverityTag: {
    fontSize: 7,
    fontWeight: 700,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  violationField: {
    marginBottom: 4,
  },
  violationFieldLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  violationFieldValue: {
    fontSize: 8.5,
    color: COLORS.secondary,
    lineHeight: 1.4,
  },
  violationSnippet: {
    fontSize: 7.5,
    fontFamily: 'Courier',
    color: COLORS.secondary,
    backgroundColor: COLORS.bg,
    padding: 6,
    borderRadius: 3,
    lineHeight: 1.3,
  },
  violationWcag: {
    fontSize: 7,
    color: COLORS.muted,
    marginTop: 4,
  },
  violationPageUrl: {
    fontSize: 7,
    color: COLORS.muted,
    marginTop: 2,
  },

  // Recommendations
  recommendationCard: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    border: `1 solid ${COLORS.border}`,
  },
  recommendationNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationNumberText: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.white,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.primary,
    marginBottom: 3,
  },
  recommendationDesc: {
    fontSize: 8.5,
    color: COLORS.secondary,
    lineHeight: 1.4,
  },
  recommendationImpact: {
    fontSize: 7,
    fontWeight: 700,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },

  // WCAG Reference
  wcagTable: {
    marginBottom: 16,
  },
  wcagRow: {
    flexDirection: 'row',
    borderBottom: `1 solid ${COLORS.border}`,
    paddingVertical: 6,
  },
  wcagRowHeader: {
    flexDirection: 'row',
    borderBottom: `2 solid ${COLORS.primary}`,
    paddingVertical: 6,
    marginBottom: 2,
  },
  wcagCell: {
    fontSize: 8,
    color: COLORS.secondary,
  },
  wcagCellHeader: {
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTop: `1 solid ${COLORS.border}`,
  },
  footerText: {
    fontSize: 7,
    color: COLORS.muted,
  },
  footerPage: {
    fontSize: 7,
    color: COLORS.muted,
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function groupViolationsBySeverity(
  violations: Violation[]
): Map<ViolationSeverity, Violation[]> {
  const groups = new Map<ViolationSeverity, Violation[]>();
  for (const sev of SEVERITY_ORDER) {
    const filtered = violations.filter((v) => v.severity === sev);
    if (filtered.length > 0) {
      groups.set(sev, filtered);
    }
  }
  return groups;
}

function groupViolationsByPage(violations: Violation[]): Map<string, Violation[]> {
  const groups = new Map<string, Violation[]>();
  for (const v of violations) {
    const existing = groups.get(v.page_url) ?? [];
    existing.push(v);
    groups.set(v.page_url, existing);
  }
  return groups;
}

function cleanUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname === '/' ? u.hostname : u.hostname + u.pathname;
  } catch {
    return url;
  }
}

function generateRecommendations(
  violations: Violation[]
): { title: string; description: string; impact: string; count: number }[] {
  // Group by rule_id and count occurrences, prioritizing by severity
  const ruleMap = new Map<
    string,
    { rule_id: string; severity: ViolationSeverity; description: string; help_text: string; count: number }
  >();

  for (const v of violations) {
    const existing = ruleMap.get(v.rule_id);
    if (existing) {
      existing.count++;
    } else {
      ruleMap.set(v.rule_id, {
        rule_id: v.rule_id,
        severity: v.severity,
        description: v.description,
        help_text: v.help_text,
        count: 1,
      });
    }
  }

  // Sort by severity weight * count
  const severityWeight: Record<ViolationSeverity, number> = {
    critical: 40,
    serious: 20,
    moderate: 10,
    minor: 5,
  };

  const sorted = [...ruleMap.values()].sort(
    (a, b) =>
      severityWeight[b.severity] * b.count -
      severityWeight[a.severity] * a.count
  );

  return sorted.slice(0, 5).map((rule) => ({
    title: rule.description,
    description: rule.help_text,
    impact: `${SEVERITY_META[rule.severity].label} severity — found ${rule.count} time${rule.count === 1 ? '' : 's'}`,
    count: rule.count,
  }));
}

function getUniqueWcagCriteria(
  violations: Violation[]
): { criterion: string; count: number; severities: ViolationSeverity[] }[] {
  const map = new Map<
    string,
    { count: number; severities: Set<ViolationSeverity> }
  >();

  for (const v of violations) {
    for (const c of v.wcag_criteria) {
      const existing = map.get(c);
      if (existing) {
        existing.count++;
        existing.severities.add(v.severity);
      } else {
        map.set(c, { count: 1, severities: new Set([v.severity]) });
      }
    }
  }

  return [...map.entries()]
    .map(([criterion, data]) => ({
      criterion,
      count: data.count,
      severities: [...data.severities] as ViolationSeverity[],
    }))
    .sort((a, b) => b.count - a.count);
}

// ---------------------------------------------------------------------------
// Page Footer (rendered on every content page)
// ---------------------------------------------------------------------------

function PageFooter({
  brandName,
  footerText,
  brandColor,
}: {
  brandName: string;
  footerText: string | null;
  brandColor: string;
}) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>
        {footerText || `${brandName} — Confidential Compliance Report`}
      </Text>
      <Text style={s.footerText}>
        Generated {formatDate(new Date().toISOString())}
      </Text>
      <Text
        style={[s.footerPage, { color: brandColor }]}
        render={({ pageNumber, totalPages }) =>
          `${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Cover Page
// ---------------------------------------------------------------------------

function CoverPage({
  scan,
  site,
  brandName,
  brandColor,
}: {
  scan: Scan;
  site: Site;
  brandName: string;
  brandColor: string;
}) {
  return (
    <Page size="A4" style={s.coverPage}>
      <View style={[s.coverBg, { backgroundColor: COLORS.primary }]}>
        <View style={s.coverTop}>
          <Text style={s.coverBrandName}>{brandName}</Text>

          <Text style={s.coverTitle}>
            WCAG 2.1 AA{'\n'}Compliance Report
          </Text>
          <Text style={s.coverSubtitle}>{site.name}</Text>

          <View style={s.coverMeta}>
            <View>
              <View style={s.coverMetaItem}>
                <Text style={s.coverMetaLabel}>Website</Text>
                <Text style={s.coverMetaValue}>{site.url}</Text>
              </View>
              <View style={s.coverMetaItem}>
                <Text style={s.coverMetaLabel}>Scan Date</Text>
                <Text style={s.coverMetaValue}>
                  {formatDateTime(scan.created_at)}
                </Text>
              </View>
            </View>
            <View>
              <View style={s.coverMetaItem}>
                <Text style={s.coverMetaLabel}>Pages Scanned</Text>
                <Text style={s.coverMetaValue}>
                  {scan.pages_scanned} of {scan.pages_total}
                </Text>
              </View>
              <View style={s.coverMetaItem}>
                <Text style={s.coverMetaLabel}>Compliance Score</Text>
                <Text style={[s.coverMetaValue, { fontSize: 18, fontWeight: 700 }]}>
                  {scan.score !== null ? `${scan.score}/100` : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={s.coverBottom}>
          <View>
            <View
              style={[s.coverAccentBar, { backgroundColor: brandColor }]}
            />
            <Text style={s.coverConfidential}>Confidential</Text>
          </View>
          <Text style={[s.footerText, { color: COLORS.white, opacity: 0.3 }]}>
            Report ID: {scan.id.slice(0, 8).toUpperCase()}
          </Text>
        </View>
      </View>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Executive Summary Page
// ---------------------------------------------------------------------------

function ExecutiveSummaryPage({
  scan,
  site,
  violations,
  brandName,
  brandColor,
  footerText,
}: {
  scan: Scan;
  site: Site;
  violations: Violation[];
  brandName: string;
  brandColor: string;
  footerText: string | null;
}) {
  const totalViolations = scan.total_violations;
  const pageCount = scan.pages_scanned;
  const duration =
    scan.started_at && scan.completed_at
      ? Math.round(
          (new Date(scan.completed_at).getTime() -
            new Date(scan.started_at).getTime()) /
            1000
        )
      : null;

  // Count unique pages with violations
  const pagesWithViolations = new Set(violations.map((v) => v.page_url)).size;

  return (
    <Page size="A4" style={[s.page, { backgroundColor: COLORS.bg }]}>
      <View style={s.sectionDivider} />
      <Text style={s.sectionTitle}>Executive Summary</Text>
      <Text style={s.sectionSubtitle}>
        High-level overview of accessibility compliance for {site.name}
      </Text>

      {/* Score */}
      <View style={s.scoreContainer}>
        <Text style={[s.scoreValue, { color: getScoreColor(scan.score) }]}>
          {scan.score ?? '—'}
        </Text>
        <Text
          style={[s.scoreLabel, { color: getScoreColor(scan.score) }]}
        >
          {getScoreLabel(scan.score)}
        </Text>
        <Text style={s.scoreScale}>WCAG 2.1 AA Compliance Score (0–100)</Text>
      </View>

      {/* Stats grid */}
      <View style={s.summaryGrid}>
        <View style={s.summaryCard}>
          <Text style={s.summaryCardLabel}>Total Violations</Text>
          <Text style={[s.summaryCardValue, { color: totalViolations > 0 ? COLORS.critical : COLORS.scoreGood }]}>
            {totalViolations}
          </Text>
          <Text style={s.summaryCardSub}>
            across {pagesWithViolations} page{pagesWithViolations === 1 ? '' : 's'}
          </Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryCardLabel}>Pages Scanned</Text>
          <Text style={[s.summaryCardValue, { color: COLORS.primary }]}>
            {pageCount}
          </Text>
          <Text style={s.summaryCardSub}>
            of {scan.pages_total} total page{scan.pages_total === 1 ? '' : 's'}
          </Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryCardLabel}>Scan Duration</Text>
          <Text style={[s.summaryCardValue, { color: COLORS.primary }]}>
            {duration !== null ? `${duration}s` : '—'}
          </Text>
          <Text style={s.summaryCardSub}>completed scan</Text>
        </View>
      </View>

      {/* Severity breakdown */}
      <Text style={[s.summaryCardLabel, { marginBottom: 8 }]}>
        Violation Severity Breakdown
      </Text>

      {totalViolations > 0 && (
        <>
          <View style={s.severityBar}>
            {SEVERITY_ORDER.map((sev) => {
              const count =
                sev === 'critical'
                  ? scan.critical_count
                  : sev === 'serious'
                    ? scan.serious_count
                    : sev === 'moderate'
                      ? scan.moderate_count
                      : scan.minor_count;
              const pct = (count / totalViolations) * 100;
              if (pct === 0) return null;
              return (
                <View
                  key={sev}
                  style={[
                    s.severityBarSegment,
                    {
                      width: `${pct}%`,
                      backgroundColor: SEVERITY_META[sev].color,
                    },
                  ]}
                />
              );
            })}
          </View>
          <View style={s.severityLegend}>
            {SEVERITY_ORDER.map((sev) => {
              const count =
                sev === 'critical'
                  ? scan.critical_count
                  : sev === 'serious'
                    ? scan.serious_count
                    : sev === 'moderate'
                      ? scan.moderate_count
                      : scan.minor_count;
              return (
                <View key={sev} style={s.severityLegendItem}>
                  <View
                    style={[
                      s.severityDot,
                      { backgroundColor: SEVERITY_META[sev].color },
                    ]}
                  />
                  <Text style={s.severityLegendText}>
                    {SEVERITY_META[sev].label}: {count}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* Summary stats cards */}
      <View style={s.summaryGrid}>
        <View style={[s.summaryCard, { borderLeft: `3 solid ${COLORS.critical}` }]}>
          <Text style={s.summaryCardLabel}>Critical</Text>
          <Text style={[s.summaryCardValue, { color: COLORS.critical }]}>
            {scan.critical_count}
          </Text>
          <Text style={s.summaryCardSub}>Blocks access entirely</Text>
        </View>
        <View style={[s.summaryCard, { borderLeft: `3 solid ${COLORS.serious}` }]}>
          <Text style={s.summaryCardLabel}>Serious</Text>
          <Text style={[s.summaryCardValue, { color: COLORS.serious }]}>
            {scan.serious_count}
          </Text>
          <Text style={s.summaryCardSub}>Major barrier to access</Text>
        </View>
        <View style={[s.summaryCard, { borderLeft: `3 solid ${COLORS.moderate}` }]}>
          <Text style={s.summaryCardLabel}>Moderate</Text>
          <Text style={[s.summaryCardValue, { color: COLORS.moderate }]}>
            {scan.moderate_count}
          </Text>
          <Text style={s.summaryCardSub}>Partial barrier</Text>
        </View>
        <View style={[s.summaryCard, { borderLeft: `3 solid ${COLORS.minor}` }]}>
          <Text style={s.summaryCardLabel}>Minor</Text>
          <Text style={[s.summaryCardValue, { color: COLORS.minor }]}>
            {scan.minor_count}
          </Text>
          <Text style={s.summaryCardSub}>Best practice</Text>
        </View>
      </View>

      <PageFooter
        brandName={brandName}
        footerText={footerText}
        brandColor={brandColor}
      />
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Violations Detail Pages
// ---------------------------------------------------------------------------

function ViolationDetailPages({
  violations,
  brandName,
  brandColor,
  footerText,
}: {
  violations: Violation[];
  brandName: string;
  brandColor: string;
  footerText: string | null;
}) {
  if (violations.length === 0) {
    return (
      <Page size="A4" style={[s.page, { backgroundColor: COLORS.bg }]}>
        <View style={s.sectionDivider} />
        <Text style={s.sectionTitle}>Violation Details</Text>
        <Text style={s.sectionSubtitle}>
          No WCAG 2.1 AA violations were detected during this scan.
        </Text>
        <View
          style={{
            padding: 24,
            backgroundColor: COLORS.white,
            borderRadius: 8,
            border: `1 solid ${COLORS.border}`,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: 700, color: COLORS.scoreGood }}>
            Congratulations!
          </Text>
          <Text style={{ fontSize: 10, color: COLORS.secondary, marginTop: 4 }}>
            Your website passed all automated accessibility checks.
          </Text>
        </View>
        <PageFooter
          brandName={brandName}
          footerText={footerText}
          brandColor={brandColor}
        />
      </Page>
    );
  }

  const bySeverity = groupViolationsBySeverity(violations);

  // Build all violation entries as a flat list of renderable items
  const items: React.ReactElement[] = [];

  for (const [severity, sevViolations] of bySeverity.entries()) {
    const meta = SEVERITY_META[severity];

    // Severity group header
    items.push(
      <View key={`header-${severity}`} style={s.violationGroupHeader}>
        <View
          style={[s.violationGroupBadge, { backgroundColor: meta.color }]}
        >
          <Text style={{ color: COLORS.white, fontSize: 9, fontWeight: 700 }}>
            {meta.label}
          </Text>
        </View>
        <Text style={s.violationGroupCount}>
          {sevViolations.length} violation{sevViolations.length === 1 ? '' : 's'}
        </Text>
      </View>
    );

    // Group by page within each severity
    const byPage = groupViolationsByPage(sevViolations);

    for (const [pageUrl, pageViolations] of byPage.entries()) {
      // Page sub-header
      items.push(
        <View
          key={`page-${severity}-${pageUrl}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginTop: 8,
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontSize: 8,
              fontWeight: 700,
              color: COLORS.secondary,
            }}
          >
            {cleanUrl(pageUrl)}
          </Text>
          <Text style={{ fontSize: 7, color: COLORS.muted }}>
            ({pageViolations.length})
          </Text>
        </View>
      );

      // Individual violation cards
      for (const v of pageViolations) {
        items.push(
          <View key={v.id} style={s.violationCard} wrap={false}>
            <View style={s.violationHeader}>
              <Text style={s.violationTitle}>{v.description}</Text>
              <Text
                style={[
                  s.violationSeverityTag,
                  { color: meta.color, backgroundColor: meta.bg },
                ]}
              >
                {meta.label}
              </Text>
            </View>

            <View style={s.violationField}>
              <Text style={s.violationFieldLabel}>Impact</Text>
              <Text style={s.violationFieldValue}>{v.impact}</Text>
            </View>

            <View style={s.violationField}>
              <Text style={s.violationFieldLabel}>How to Fix</Text>
              <Text style={s.violationFieldValue}>{v.help_text}</Text>
            </View>

            {v.html_snippet && (
              <View style={s.violationField}>
                <Text style={s.violationFieldLabel}>HTML Snippet</Text>
                <Text style={s.violationSnippet}>
                  {v.html_snippet.length > 300
                    ? v.html_snippet.slice(0, 300) + '…'
                    : v.html_snippet}
                </Text>
              </View>
            )}

            {v.css_selector && (
              <View style={s.violationField}>
                <Text style={s.violationFieldLabel}>CSS Selector</Text>
                <Text style={s.violationSnippet}>{v.css_selector}</Text>
              </View>
            )}

            {v.wcag_criteria.length > 0 && (
              <Text style={s.violationWcag}>
                WCAG: {v.wcag_criteria.join(', ')}
              </Text>
            )}
          </View>
        );
      }
    }
  }

  return (
    <Page size="A4" style={[s.page, { backgroundColor: COLORS.bg }]}>
      <View style={s.sectionDivider} />
      <Text style={s.sectionTitle}>Violation Details</Text>
      <Text style={s.sectionSubtitle}>
        All {violations.length} violation{violations.length === 1 ? '' : 's'} grouped
        by severity, then by page
      </Text>

      {items}

      <PageFooter
        brandName={brandName}
        footerText={footerText}
        brandColor={brandColor}
      />
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Recommendations Page
// ---------------------------------------------------------------------------

function RecommendationsPage({
  violations,
  brandName,
  brandColor,
  footerText,
}: {
  violations: Violation[];
  brandName: string;
  brandColor: string;
  footerText: string | null;
}) {
  const recommendations = generateRecommendations(violations);

  if (recommendations.length === 0) return null;

  return (
    <Page size="A4" style={[s.page, { backgroundColor: COLORS.bg }]}>
      <View style={s.sectionDivider} />
      <Text style={s.sectionTitle}>Top Recommendations</Text>
      <Text style={s.sectionSubtitle}>
        Priority remediation actions ranked by severity and frequency
      </Text>

      {recommendations.map((rec, i) => (
        <View key={i} style={s.recommendationCard} wrap={false}>
          <View
            style={[
              s.recommendationNumber,
              { backgroundColor: brandColor },
            ]}
          >
            <Text style={s.recommendationNumberText}>{i + 1}</Text>
          </View>
          <View style={s.recommendationContent}>
            <Text style={s.recommendationTitle}>{rec.title}</Text>
            <Text style={s.recommendationDesc}>{rec.description}</Text>
            <Text style={s.recommendationImpact}>{rec.impact}</Text>
          </View>
        </View>
      ))}

      <View
        style={{
          marginTop: 16,
          padding: 14,
          backgroundColor: COLORS.white,
          borderRadius: 6,
          border: `1 solid ${COLORS.border}`,
        }}
      >
        <Text
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: COLORS.primary,
            marginBottom: 6,
          }}
        >
          About These Recommendations
        </Text>
        <Text style={{ fontSize: 8, color: COLORS.secondary, lineHeight: 1.5 }}>
          Recommendations are automatically prioritized based on violation severity
          and frequency. Critical and serious violations that appear on multiple pages
          are prioritized first, as they affect the most users and carry the highest
          legal risk. Begin remediation with item #1 and work through the list in
          order for maximum compliance impact.
        </Text>
      </View>

      <PageFooter
        brandName={brandName}
        footerText={footerText}
        brandColor={brandColor}
      />
    </Page>
  );
}

// ---------------------------------------------------------------------------
// WCAG Criteria Reference Page
// ---------------------------------------------------------------------------

function WcagReferencePage({
  violations,
  brandName,
  brandColor,
  footerText,
}: {
  violations: Violation[];
  brandName: string;
  brandColor: string;
  footerText: string | null;
}) {
  const criteria = getUniqueWcagCriteria(violations);

  if (criteria.length === 0) return null;

  return (
    <Page size="A4" style={[s.page, { backgroundColor: COLORS.bg }]}>
      <View style={s.sectionDivider} />
      <Text style={s.sectionTitle}>WCAG 2.1 AA Criteria Reference</Text>
      <Text style={s.sectionSubtitle}>
        All WCAG success criteria violated during this scan
      </Text>

      <View style={s.wcagTable}>
        {/* Header */}
        <View style={s.wcagRowHeader}>
          <Text style={[s.wcagCellHeader, { width: '25%' }]}>Criterion</Text>
          <Text style={[s.wcagCellHeader, { width: '20%' }]}>Violations</Text>
          <Text style={[s.wcagCellHeader, { width: '55%' }]}>
            Highest Severity
          </Text>
        </View>
        {/* Rows */}
        {criteria.map((c) => {
          // Pick highest severity
          const highest = SEVERITY_ORDER.find((sev) =>
            c.severities.includes(sev)
          );
          const highestMeta = highest
            ? SEVERITY_META[highest]
            : SEVERITY_META.minor;

          return (
            <View key={c.criterion} style={s.wcagRow}>
              <Text style={[s.wcagCell, { width: '25%', fontWeight: 700 }]}>
                {c.criterion}
              </Text>
              <Text style={[s.wcagCell, { width: '20%' }]}>{c.count}</Text>
              <View
                style={{
                  width: '55%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <View
                  style={[
                    s.severityDot,
                    { backgroundColor: highestMeta.color },
                  ]}
                />
                <Text style={s.wcagCell}>{highestMeta.label}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View
        style={{
          padding: 14,
          backgroundColor: COLORS.white,
          borderRadius: 6,
          border: `1 solid ${COLORS.border}`,
        }}
      >
        <Text
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: COLORS.primary,
            marginBottom: 6,
          }}
        >
          About WCAG 2.1 Level AA
        </Text>
        <Text style={{ fontSize: 8, color: COLORS.secondary, lineHeight: 1.5 }}>
          The Web Content Accessibility Guidelines (WCAG) 2.1 Level AA is the
          internationally recognized standard for web accessibility. It is the
          legal standard referenced by the ADA (Americans with Disabilities Act),
          Section 508, and the European Accessibility Act. Achieving Level AA
          compliance ensures your website is usable by people with a wide range
          of disabilities, including visual, auditory, physical, speech,
          cognitive, language, learning, and neurological disabilities.
        </Text>
      </View>

      <PageFooter
        brandName={brandName}
        footerText={footerText}
        brandColor={brandColor}
      />
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Disclaimer Page
// ---------------------------------------------------------------------------

function DisclaimerPage({
  brandName,
  brandColor,
  footerText,
}: {
  brandName: string;
  brandColor: string;
  footerText: string | null;
}) {
  return (
    <Page size="A4" style={[s.page, { backgroundColor: COLORS.bg }]}>
      <View style={s.sectionDivider} />
      <Text style={s.sectionTitle}>Methodology & Disclaimer</Text>

      <View
        style={{
          padding: 16,
          backgroundColor: COLORS.white,
          borderRadius: 6,
          border: `1 solid ${COLORS.border}`,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: COLORS.primary,
            marginBottom: 8,
          }}
        >
          Scanning Methodology
        </Text>
        <Text style={{ fontSize: 8, color: COLORS.secondary, lineHeight: 1.6 }}>
          This report was generated using automated accessibility testing powered
          by axe-core, the industry-standard accessibility testing engine. The
          scanner loads each page in a headless browser environment to evaluate
          the rendered DOM against WCAG 2.1 Level AA success criteria.{'\n\n'}
          Automated testing can identify approximately 30–40% of all possible
          accessibility issues. The remaining issues — including those related to
          logical reading order, meaningful sequence, sensory characteristics, and
          cognitive accessibility — require manual expert review.
        </Text>
      </View>

      <View
        style={{
          padding: 16,
          backgroundColor: COLORS.white,
          borderRadius: 6,
          border: `1 solid ${COLORS.border}`,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: COLORS.primary,
            marginBottom: 8,
          }}
        >
          Legal Disclaimer
        </Text>
        <Text style={{ fontSize: 8, color: COLORS.secondary, lineHeight: 1.6 }}>
          This report is provided for informational purposes only and does not
          constitute legal advice. While this automated scan identifies many
          common accessibility issues, it does not guarantee full WCAG 2.1 AA
          compliance. A comprehensive accessibility audit should include manual
          testing, assistive technology testing, and review by accessibility
          experts.{'\n\n'}
          Compliance scores are based on automated rule checks only and may not
          reflect the complete accessibility status of the website. Organizations
          are encouraged to pursue a combination of automated and manual testing
          to achieve and maintain full accessibility compliance.
        </Text>
      </View>

      <PageFooter
        brandName={brandName}
        footerText={footerText}
        brandColor={brandColor}
      />
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Main Document
// ---------------------------------------------------------------------------

export function ComplianceReportDocument({ data }: { data: ReportData }) {
  const { scan, violations, site, agencySettings } = data;
  const brand = getBrandColors(agencySettings);
  const brandName = agencySettings?.agency_name || 'AccessAudit';
  const footerText = agencySettings?.report_footer_text || null;

  return (
    <Document
      title={`Compliance Report — ${site.name}`}
      author={brandName}
      subject="WCAG 2.1 AA Compliance Report"
      creator={brandName}
    >
      <CoverPage
        scan={scan}
        site={site}
        brandName={brandName}
        brandColor={brand.primary}
      />

      <ExecutiveSummaryPage
        scan={scan}
        site={site}
        violations={violations}
        brandName={brandName}
        brandColor={brand.primary}
        footerText={footerText}
      />

      <ViolationDetailPages
        violations={violations}
        brandName={brandName}
        brandColor={brand.primary}
        footerText={footerText}
      />

      <RecommendationsPage
        violations={violations}
        brandName={brandName}
        brandColor={brand.primary}
        footerText={footerText}
      />

      <WcagReferencePage
        violations={violations}
        brandName={brandName}
        brandColor={brand.primary}
        footerText={footerText}
      />

      <DisclaimerPage
        brandName={brandName}
        brandColor={brand.primary}
        footerText={footerText}
      />
    </Document>
  );
}
