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

interface TrialEndingEmailProps {
  userName: string;
  daysLeft: number;
  sitesCount: number;
  averageScore: number | null;
  upgradeUrl: string;
}

export function TrialEndingEmail({
  userName,
  daysLeft,
  sitesCount,
  averageScore,
  upgradeUrl,
}: TrialEndingEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {`Your AccessAudit trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} — upgrade to keep monitoring`}
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

          <Section style={urgentBanner}>
            <Text style={urgentText}>
              Trial Ends in {daysLeft} Day{daysLeft !== 1 ? 's' : ''}
            </Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>
              Your Trial Ends in {daysLeft} Day{daysLeft !== 1 ? 's' : ''}
            </Heading>

            <Text style={paragraph}>
              Hi {userName || 'there'}, your AccessAudit free trial is about to
              expire. After your trial ends, you&apos;ll lose access to:
            </Text>

            <Section style={featureList}>
              <Text style={featureItem}>
                <span style={featureIcon}>✕</span> Scheduled weekly scans
              </Text>
              <Text style={featureItem}>
                <span style={featureIcon}>✕</span> Multi-page crawling
              </Text>
              <Text style={featureItem}>
                <span style={featureIcon}>✕</span> Historical score tracking
              </Text>
              <Text style={featureItem}>
                <span style={featureIcon}>✕</span> PDF compliance reports
              </Text>
              <Text style={featureItem}>
                <span style={featureIcon}>✕</span> New violation alerts
              </Text>
            </Section>

            {/* What they've built so far */}
            {(sitesCount > 0 || averageScore !== null) && (
              <Section style={progressSection}>
                <Text style={progressTitle}>
                  Here&apos;s what you&apos;ve built so far
                </Text>
                <Section style={progressRow}>
                  {sitesCount > 0 && (
                    <Section style={progressStat}>
                      <Text style={progressNumber}>{sitesCount}</Text>
                      <Text style={progressLabel}>
                        Site{sitesCount !== 1 ? 's' : ''} Monitored
                      </Text>
                    </Section>
                  )}
                  {averageScore !== null && (
                    <Section style={progressStat}>
                      <Text style={progressNumber}>{averageScore}</Text>
                      <Text style={progressLabel}>Avg. Score</Text>
                    </Section>
                  )}
                </Section>
                <Text style={progressNote}>
                  Don&apos;t lose your monitoring history and compliance data.
                </Text>
              </Section>
            )}

            <Section style={buttonContainer}>
              <Button style={button} href={upgradeUrl}>
                Upgrade Now
              </Button>
            </Section>

            <Text style={subtext}>
              Plans start at just $79/month. All plans include automated scans,
              weekly monitoring, and PDF reports.
            </Text>
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

const urgentBanner: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  borderBottom: '2px solid #f59e0b',
  padding: '12px 40px',
  textAlign: 'center' as const,
};

const urgentText: React.CSSProperties = {
  color: '#92400e',
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
  margin: '0 0 20px',
};

const featureList: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '20px 24px',
  margin: '0 0 24px',
};

const featureItem: React.CSSProperties = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '28px',
  margin: '0',
};

const featureIcon: React.CSSProperties = {
  color: '#dc2626',
  fontWeight: 700,
  marginRight: '8px',
  display: 'inline-block',
  width: '16px',
};

const progressSection: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '24px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const progressTitle: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '15px',
  fontWeight: 600,
  margin: '0 0 16px',
};

const progressRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  margin: '0 0 16px',
};

const progressStat: React.CSSProperties = {
  padding: '0 24px',
};

const progressNumber: React.CSSProperties = {
  color: '#2563eb',
  fontSize: '36px',
  fontWeight: 800,
  lineHeight: '1',
  margin: '0 0 4px',
};

const progressLabel: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '12px',
  fontWeight: 500,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0',
};

const progressNote: React.CSSProperties = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0',
  fontStyle: 'italic',
};

const buttonContainer: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '32px 0 16px',
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

const subtext: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '14px',
  lineHeight: '22px',
  textAlign: 'center' as const,
  margin: '0',
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

export default TrialEndingEmail;
