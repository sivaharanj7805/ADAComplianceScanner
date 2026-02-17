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

interface ViolationSummary {
  title: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
}

interface ScanCompleteEmailProps {
  userName: string;
  siteName: string;
  siteUrl: string;
  score: number;
  totalViolations: number;
  criticalCount: number;
  seriousCount: number;
  pagesScanned: number;
  topViolations: ViolationSummary[];
  reportUrl: string;
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#16a34a';
  if (score >= 70) return '#ca8a04';
  if (score >= 50) return '#ea580c';
  return '#dc2626';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Work';
  return 'Poor';
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return '#dc2626';
    case 'serious':
      return '#ea580c';
    case 'moderate':
      return '#ca8a04';
    case 'minor':
      return '#64748b';
    default:
      return '#64748b';
  }
}

export function ScanCompleteEmail({
  userName,
  siteName,
  siteUrl,
  score,
  totalViolations,
  criticalCount,
  seriousCount,
  pagesScanned,
  topViolations,
  reportUrl,
}: ScanCompleteEmailProps) {
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <Html>
      <Head />
      <Preview>
        {`Scan Complete: ${siteName} scored ${score}/100 — ${totalViolations} violation${totalViolations !== 1 ? 's' : ''} found`}
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
            <Heading style={h1}>Scan Complete: Your Score is {score}</Heading>

            <Text style={paragraph}>
              Hi {userName || 'there'}, your accessibility scan for{' '}
              <strong>{siteName}</strong> ({siteUrl}) has finished.
            </Text>

            {/* Score Badge */}
            <Section style={scoreSection}>
              <Text style={{ ...scoreNumber, color: scoreColor }}>{score}</Text>
              <Text style={{ ...scoreLabelStyle, color: scoreColor }}>
                {scoreLabel}
              </Text>
              <Text style={scoreSubtext}>out of 100</Text>
            </Section>

            {/* Stats Row */}
            <Section style={statsRow}>
              <Section style={statBox}>
                <Text style={statNumber}>{totalViolations}</Text>
                <Text style={statLabel}>
                  Violation{totalViolations !== 1 ? 's' : ''}
                </Text>
              </Section>
              <Section style={statBox}>
                <Text style={{ ...statNumber, color: '#dc2626' }}>
                  {criticalCount}
                </Text>
                <Text style={statLabel}>Critical</Text>
              </Section>
              <Section style={statBox}>
                <Text style={{ ...statNumber, color: '#ea580c' }}>
                  {seriousCount}
                </Text>
                <Text style={statLabel}>Serious</Text>
              </Section>
              <Section style={statBox}>
                <Text style={statNumber}>{pagesScanned}</Text>
                <Text style={statLabel}>
                  Page{pagesScanned !== 1 ? 's' : ''} Scanned
                </Text>
              </Section>
            </Section>

            {/* Top Violations */}
            {topViolations.length > 0 && (
              <Section style={violationsSection}>
                <Text style={violationsTitle}>Top Violations</Text>
                {topViolations.map((v, i) => (
                  <Section key={i} style={violationCard}>
                    <Text style={violationHeader}>
                      <span
                        style={{
                          ...severityBadge,
                          backgroundColor: getSeverityColor(v.severity),
                        }}
                      >
                        {v.severity.toUpperCase()}
                      </span>{' '}
                      {v.title}
                    </Text>
                    <Text style={violationDesc}>{v.description}</Text>
                  </Section>
                ))}
              </Section>
            )}

            <Section style={buttonContainer}>
              <Button style={button} href={reportUrl}>
                View Full Report
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

const scoreSection: React.CSSProperties = {
  textAlign: 'center' as const,
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '32px',
  margin: '0 0 24px',
};

const scoreNumber: React.CSSProperties = {
  fontSize: '64px',
  fontWeight: 800,
  lineHeight: '1',
  margin: '0 0 4px',
};

const scoreLabelStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 600,
  margin: '0 0 4px',
};

const scoreSubtext: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '14px',
  margin: '0',
};

const statsRow: React.CSSProperties = {
  display: 'flex',
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const statBox: React.CSSProperties = {
  flex: '1',
  padding: '12px 8px',
};

const statNumber: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: 700,
  margin: '0',
  lineHeight: '1.2',
};

const statLabel: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '12px',
  fontWeight: 500,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '4px 0 0',
};

const violationsSection: React.CSSProperties = {
  margin: '0 0 24px',
};

const violationsTitle: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '16px',
  fontWeight: 600,
  margin: '0 0 12px',
};

const violationCard: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  borderLeft: '4px solid #dc2626',
  padding: '12px 16px',
  margin: '0 0 8px',
};

const violationHeader: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '14px',
  fontWeight: 600,
  margin: '0 0 4px',
};

const severityBadge: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '10px',
  fontWeight: 700,
  padding: '2px 6px',
  borderRadius: '4px',
  display: 'inline-block',
  verticalAlign: 'middle',
  letterSpacing: '0.5px',
};

const violationDesc: React.CSSProperties = {
  color: '#64748b',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
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

export default ScanCompleteEmail;
