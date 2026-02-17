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

interface ScoreImprovedEmailProps {
  userName: string;
  siteName: string;
  siteUrl: string;
  oldScore: number;
  newScore: number;
  dashboardUrl: string;
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#16a34a';
  if (score >= 70) return '#ca8a04';
  if (score >= 50) return '#ea580c';
  return '#dc2626';
}

export function ScoreImprovedEmail({
  userName,
  siteName,
  siteUrl,
  oldScore,
  newScore,
  dashboardUrl,
}: ScoreImprovedEmailProps) {
  const improvement = newScore - oldScore;

  return (
    <Html>
      <Head />
      <Preview>
        {`Great news! ${siteName}'s compliance score improved from ${oldScore} to ${newScore}`}
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

          <Section style={successBanner}>
            <Text style={successText}>Score Improved!</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>
              Your Compliance Score Improved!
            </Heading>

            <Text style={paragraph}>
              Hi {userName || 'there'}, great work! The latest scan of{' '}
              <strong>{siteName}</strong> ({siteUrl}) shows your accessibility
              compliance score has improved.
            </Text>

            {/* Score Comparison */}
            <Section style={scoreComparison}>
              <Section style={scoreBox}>
                <Text style={scoreLabel}>Before</Text>
                <Text style={{ ...scoreValue, color: getScoreColor(oldScore) }}>
                  {oldScore}
                </Text>
              </Section>

              <Section style={arrowBox}>
                <Text style={arrow}>→</Text>
              </Section>

              <Section style={scoreBox}>
                <Text style={scoreLabel}>After</Text>
                <Text style={{ ...scoreValue, color: getScoreColor(newScore) }}>
                  {newScore}
                </Text>
              </Section>
            </Section>

            <Section style={improvementBadge}>
              <Text style={improvementText}>
                +{improvement} point{improvement !== 1 ? 's' : ''}
              </Text>
            </Section>

            <Text style={encouragement}>
              {newScore >= 90
                ? 'Outstanding! Your site is in excellent compliance shape. Keep maintaining this high standard.'
                : newScore >= 70
                  ? "You're making solid progress toward full compliance. Keep up the great work and aim for 90+!"
                  : "Every improvement matters. You're heading in the right direction. Review remaining violations to keep climbing."}
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={dashboardUrl}>
                View Dashboard
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

const successBanner: React.CSSProperties = {
  backgroundColor: '#f0fdf4',
  borderBottom: '2px solid #16a34a',
  padding: '12px 40px',
  textAlign: 'center' as const,
};

const successText: React.CSSProperties = {
  color: '#16a34a',
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

const scoreComparison: React.CSSProperties = {
  display: 'flex',
  textAlign: 'center' as const,
  margin: '0 0 16px',
};

const scoreBox: React.CSSProperties = {
  flex: '1',
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '24px 16px',
};

const scoreLabel: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '13px',
  fontWeight: 500,
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 8px',
};

const scoreValue: React.CSSProperties = {
  fontSize: '48px',
  fontWeight: 800,
  lineHeight: '1',
  margin: '0',
};

const arrowBox: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 12px',
};

const arrow: React.CSSProperties = {
  color: '#16a34a',
  fontSize: '32px',
  fontWeight: 700,
  margin: '0',
};

const improvementBadge: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const improvementText: React.CSSProperties = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '20px',
  color: '#16a34a',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 700,
  padding: '8px 20px',
  margin: '0',
};

const encouragement: React.CSSProperties = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 8px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '16px',
};

const buttonContainer: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '32px 0 0',
};

const button: React.CSSProperties = {
  backgroundColor: '#16a34a',
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

export default ScoreImprovedEmail;
