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

interface NewViolation {
  title: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  pageUrl: string;
}

interface NewViolationsEmailProps {
  userName: string;
  siteName: string;
  siteUrl: string;
  newViolations: NewViolation[];
  dashboardUrl: string;
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

function getSeverityBg(severity: string): string {
  switch (severity) {
    case 'critical':
      return '#fef2f2';
    case 'serious':
      return '#fff7ed';
    case 'moderate':
      return '#fefce8';
    case 'minor':
      return '#f8fafc';
    default:
      return '#f8fafc';
  }
}

export function NewViolationsEmail({
  userName,
  siteName,
  siteUrl,
  newViolations,
  dashboardUrl,
}: NewViolationsEmailProps) {
  const criticalCount = newViolations.filter(
    (v) => v.severity === 'critical'
  ).length;
  const seriousCount = newViolations.filter(
    (v) => v.severity === 'serious'
  ).length;

  return (
    <Html>
      <Head />
      <Preview>
        {`${newViolations.length} new violation${newViolations.length !== 1 ? 's' : ''} detected on ${siteName}`}
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

          <Section style={alertBanner}>
            <Text style={alertText}>New Violations Detected</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>
              New Violations Detected on {siteName}
            </Heading>

            <Text style={paragraph}>
              Hi {userName || 'there'}, our latest scan of{' '}
              <strong>{siteName}</strong> ({siteUrl}) found{' '}
              <strong>{newViolations.length}</strong> new accessibility
              violation{newViolations.length !== 1 ? 's' : ''} that weren&apos;t
              present in your previous scan.
            </Text>

            {(criticalCount > 0 || seriousCount > 0) && (
              <Section style={urgentBox}>
                <Text style={urgentText}>
                  {criticalCount > 0 && (
                    <>
                      <strong style={{ color: '#dc2626' }}>
                        {criticalCount} critical
                      </strong>
                      {seriousCount > 0 ? ' and ' : ' '}
                    </>
                  )}
                  {seriousCount > 0 && (
                    <strong style={{ color: '#ea580c' }}>
                      {seriousCount} serious
                    </strong>
                  )}
                  {' '}issue{criticalCount + seriousCount !== 1 ? 's' : ''} need
                  immediate attention.
                </Text>
              </Section>
            )}

            <Section style={violationsSection}>
              <Text style={violationsTitle}>New Issues Found</Text>
              {newViolations.slice(0, 5).map((v, i) => (
                <Section
                  key={i}
                  style={{
                    ...violationCard,
                    backgroundColor: getSeverityBg(v.severity),
                    borderLeftColor: getSeverityColor(v.severity),
                  }}
                >
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
                  <Text style={violationPage}>Found on: {v.pageUrl}</Text>
                </Section>
              ))}
              {newViolations.length > 5 && (
                <Text style={moreText}>
                  ...and {newViolations.length - 5} more violation
                  {newViolations.length - 5 !== 1 ? 's' : ''}
                </Text>
              )}
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={dashboardUrl}>
                Review All Violations
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

const alertBanner: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderBottom: '2px solid #dc2626',
  padding: '12px 40px',
  textAlign: 'center' as const,
};

const alertText: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '14px',
  fontWeight: 600,
  margin: '0',
  letterSpacing: '0.5px',
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

const urgentBox: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  border: '1px solid #fecaca',
  padding: '16px',
  margin: '0 0 24px',
};

const urgentText: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
};

const violationsSection: React.CSSProperties = {
  margin: '0 0 8px',
};

const violationsTitle: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '16px',
  fontWeight: 600,
  margin: '0 0 12px',
};

const violationCard: React.CSSProperties = {
  borderRadius: '8px',
  borderLeft: '4px solid',
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
  margin: '0 0 2px',
};

const violationPage: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '0',
};

const moreText: React.CSSProperties = {
  color: '#64748b',
  fontSize: '14px',
  fontStyle: 'italic',
  textAlign: 'center' as const,
  margin: '12px 0 0',
};

const buttonContainer: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '32px 0 0',
};

const button: React.CSSProperties = {
  backgroundColor: '#dc2626',
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

export default NewViolationsEmail;
