import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface SiteSummary {
  name: string;
  url: string;
  score: number | null;
  previousScore: number | null;
  totalViolations: number;
  newViolations: number;
  resolvedViolations: number;
}

interface WeeklyDigestEmailProps {
  userName: string;
  sites: SiteSummary[];
  weekStart: string;
  weekEnd: string;
  dashboardUrl: string;
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#16a34a';
  if (score >= 70) return '#ca8a04';
  if (score >= 50) return '#ea580c';
  return '#dc2626';
}

function getChangeIndicator(
  current: number | null,
  previous: number | null
): { text: string; color: string } {
  if (current === null || previous === null) {
    return { text: '', color: '#94a3b8' };
  }
  const diff = current - previous;
  if (diff > 0) return { text: `+${diff}`, color: '#16a34a' };
  if (diff < 0) return { text: `${diff}`, color: '#dc2626' };
  return { text: '±0', color: '#94a3b8' };
}

export function WeeklyDigestEmail({
  userName,
  sites,
  weekStart,
  weekEnd,
  dashboardUrl,
}: WeeklyDigestEmailProps) {
  const sitesWithScores = sites.filter((s) => s.score !== null);
  const averageScore =
    sitesWithScores.length > 0
      ? Math.round(
          sitesWithScores.reduce((sum, s) => sum + (s.score ?? 0), 0) /
            sitesWithScores.length
        )
      : null;
  const totalNew = sites.reduce((sum, s) => sum + s.newViolations, 0);
  const totalResolved = sites.reduce(
    (sum, s) => sum + s.resolvedViolations,
    0
  );

  return (
    <Html>
      <Head />
      <Preview>
        Your Weekly Accessibility Report ({weekStart} — {weekEnd})
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://accessaudit.com/logo.png"
              width="40"
              height="40"
              alt="AccessAudit"
              style={logo}
            />
            <Text style={logoText}>AccessAudit</Text>
          </Section>

          <Section style={content}>
            <Text style={dateRange}>
              {weekStart} — {weekEnd}
            </Text>
            <Heading style={h1}>Your Weekly Accessibility Report</Heading>

            <Text style={paragraph}>
              Hi {userName || 'there'}, here&apos;s your weekly summary across
              all monitored sites.
            </Text>

            {/* Overview Stats */}
            <Section style={overviewSection}>
              <Section style={overviewRow}>
                <Section style={overviewStat}>
                  <Text style={overviewNumber}>{sites.length}</Text>
                  <Text style={overviewLabel}>
                    Site{sites.length !== 1 ? 's' : ''} Monitored
                  </Text>
                </Section>
                <Section style={overviewStat}>
                  <Text
                    style={{
                      ...overviewNumber,
                      color: averageScore !== null
                        ? getScoreColor(averageScore)
                        : '#94a3b8',
                    }}
                  >
                    {averageScore !== null ? averageScore : '—'}
                  </Text>
                  <Text style={overviewLabel}>Avg. Score</Text>
                </Section>
                <Section style={overviewStat}>
                  <Text style={{ ...overviewNumber, color: '#dc2626' }}>
                    {totalNew}
                  </Text>
                  <Text style={overviewLabel}>New Issues</Text>
                </Section>
                <Section style={overviewStat}>
                  <Text style={{ ...overviewNumber, color: '#16a34a' }}>
                    {totalResolved}
                  </Text>
                  <Text style={overviewLabel}>Resolved</Text>
                </Section>
              </Section>
            </Section>

            {/* Per-Site Breakdown */}
            <Section style={sitesSection}>
              <Text style={sitesTitle}>Site-by-Site Breakdown</Text>
              {sites.map((site, i) => {
                const change = getChangeIndicator(
                  site.score,
                  site.previousScore
                );
                return (
                  <Section key={i} style={siteCard}>
                    <Section style={siteCardHeader}>
                      <Text style={siteName}>{site.name}</Text>
                      <Text style={siteUrlText}>{site.url}</Text>
                    </Section>
                    <Section style={siteCardStats}>
                      <Section style={siteStatItem}>
                        <Text
                          style={{
                            ...siteScore,
                            color:
                              site.score !== null
                                ? getScoreColor(site.score)
                                : '#94a3b8',
                          }}
                        >
                          {site.score !== null ? site.score : '—'}
                        </Text>
                        {change.text && (
                          <Text style={{ ...siteChange, color: change.color }}>
                            {change.text}
                          </Text>
                        )}
                      </Section>
                      <Section style={siteStatsRight}>
                        <Text style={siteStatDetail}>
                          {site.totalViolations} total violation
                          {site.totalViolations !== 1 ? 's' : ''}
                        </Text>
                        {site.newViolations > 0 && (
                          <Text
                            style={{
                              ...siteStatDetail,
                              color: '#dc2626',
                            }}
                          >
                            {site.newViolations} new
                          </Text>
                        )}
                        {site.resolvedViolations > 0 && (
                          <Text
                            style={{
                              ...siteStatDetail,
                              color: '#16a34a',
                            }}
                          >
                            {site.resolvedViolations} resolved
                          </Text>
                        )}
                      </Section>
                    </Section>
                  </Section>
                );
              })}
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={dashboardUrl}>
                Open Dashboard
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Sent by AccessAudit — ADA Compliance Monitoring
            </Text>
            <Text style={footerLinksStyle}>
              <a href="https://accessaudit.com" style={footerLink}>
                Website
              </a>
              {' · '}
              <a href="https://accessaudit.com/unsubscribe" style={footerLink}>
                Unsubscribe
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const main: React.CSSProperties = {
  backgroundColor: '#f4f4f7',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  padding: '40px 0',
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  margin: '0 auto',
  maxWidth: '560px',
  overflow: 'hidden',
};

const header: React.CSSProperties = {
  backgroundColor: '#0f172a',
  padding: '24px 40px',
  display: 'flex',
  alignItems: 'center',
};

const logo: React.CSSProperties = {
  display: 'inline-block',
  verticalAlign: 'middle',
};

const logoText: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: 700,
  display: 'inline-block',
  verticalAlign: 'middle',
  marginLeft: '12px',
  marginTop: '0',
  marginBottom: '0',
};

const content: React.CSSProperties = {
  padding: '40px',
};

const dateRange: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '13px',
  fontWeight: 500,
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 8px',
};

const h1: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: 700,
  lineHeight: '32px',
  margin: '0 0 16px',
};

const paragraph: React.CSSProperties = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 24px',
};

const overviewSection: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '24px',
  margin: '0 0 32px',
};

const overviewRow: React.CSSProperties = {
  display: 'flex',
  textAlign: 'center' as const,
};

const overviewStat: React.CSSProperties = {
  flex: '1',
};

const overviewNumber: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '28px',
  fontWeight: 800,
  margin: '0 0 4px',
  lineHeight: '1.2',
};

const overviewLabel: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '11px',
  fontWeight: 500,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0',
};

const sitesSection: React.CSSProperties = {
  margin: '0 0 8px',
};

const sitesTitle: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '16px',
  fontWeight: 600,
  margin: '0 0 16px',
};

const siteCard: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 0 12px',
};

const siteCardHeader: React.CSSProperties = {
  margin: '0 0 12px',
};

const siteName: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '15px',
  fontWeight: 600,
  margin: '0 0 2px',
};

const siteUrlText: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '13px',
  margin: '0',
};

const siteCardStats: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

const siteStatItem: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  marginRight: '24px',
};

const siteScore: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 800,
  lineHeight: '1',
  margin: '0',
};

const siteChange: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  marginLeft: '8px',
  margin: '0 0 0 8px',
};

const siteStatsRight: React.CSSProperties = {
  flex: '1',
};

const siteStatDetail: React.CSSProperties = {
  color: '#64748b',
  fontSize: '13px',
  margin: '0 0 2px',
};

const buttonContainer: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '32px 0 0',
};

const button: React.CSSProperties = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 600,
  lineHeight: '100%',
  padding: '14px 32px',
  textDecoration: 'none',
};

const hr: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '0',
};

const footer: React.CSSProperties = {
  padding: '24px 40px',
};

const footerText: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 8px',
  textAlign: 'center' as const,
};

const footerLinksStyle: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
  textAlign: 'center' as const,
};

const footerLink: React.CSSProperties = {
  color: '#64748b',
  textDecoration: 'underline',
};

export default WeeklyDigestEmail;
