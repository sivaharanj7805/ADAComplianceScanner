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

interface WelcomeEmailProps {
  userName: string;
  addSiteUrl: string;
}

export function WelcomeEmail({ userName, addSiteUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to AccessAudit — start monitoring your site&apos;s accessibility</Preview>
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
            <Heading style={h1}>Welcome to AccessAudit</Heading>

            <Text style={paragraph}>
              Hi {userName || 'there'},
            </Text>

            <Text style={paragraph}>
              You&apos;re all set to start monitoring your websites for ADA and
              WCAG 2.1 AA compliance. AccessAudit scans your pages, translates
              technical violations into plain English, and tracks your
              compliance score over time.
            </Text>

            <Text style={paragraph}>
              Get started by adding your first website:
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={addSiteUrl}>
                Add Your First Site
              </Button>
            </Section>

            <Section style={stepsSection}>
              <Text style={stepsTitle}>Here&apos;s how it works:</Text>
              <Text style={step}>
                <strong>1.</strong> Add your website URL
              </Text>
              <Text style={step}>
                <strong>2.</strong> We scan every page for accessibility issues
              </Text>
              <Text style={step}>
                <strong>3.</strong> Get a compliance score and plain-English fix instructions
              </Text>
              <Text style={step}>
                <strong>4.</strong> Track improvements over time with scheduled scans
              </Text>
            </Section>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Sent by AccessAudit — ADA Compliance Monitoring
            </Text>
            <Text style={footerLinks}>
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
  fontSize: '28px',
  fontWeight: 700,
  lineHeight: '36px',
  margin: '0 0 24px',
};

const paragraph: React.CSSProperties = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
};

const buttonContainer: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '32px 0',
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

const stepsSection: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0 0',
};

const stepsTitle: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '16px',
  fontWeight: 600,
  margin: '0 0 16px',
};

const step: React.CSSProperties = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px',
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

const footerLinks: React.CSSProperties = {
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

export default WelcomeEmail;
