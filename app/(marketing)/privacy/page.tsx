import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - AccessAudit',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <article className="prose prose-gray max-w-none">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: February 18, 2026</p>

        <h2>Information We Collect</h2>
        <p>
          We collect information you provide directly to us, including your name,
          email address, and website URLs submitted for scanning. When you create
          an account or subscribe to a paid plan, we also collect billing
          information through our payment processor, Stripe. We automatically
          collect certain technical information when you use our service,
          including scan results, compliance scores, and usage data.
        </p>

        <h2>How We Use It</h2>
        <p>
          We use the information we collect to provide, maintain, and improve our
          accessibility scanning and monitoring services. This includes running
          scans on your submitted URLs, generating compliance reports, sending
          scan result notifications, and processing payments. We may also use
          your information to communicate with you about product updates, service
          announcements, and promotional offers you can opt out of at any time.
        </p>

        <h2>Data Storage</h2>
        <p>
          Your data is stored securely using Supabase (hosted on AWS) with
          encryption at rest and in transit. Scan results and compliance reports
          are retained for the duration of your account. We implement
          industry-standard security measures, including row-level security
          policies, to ensure that your data is only accessible to you and
          authorized members of your organization. You may request deletion of
          your data at any time by contacting us.
        </p>

        <h2>Contact</h2>
        <p>
          If you have any questions about this Privacy Policy or our data
          practices, please contact us at{' '}
          <a href="mailto:privacy@accessaudit.com">privacy@accessaudit.com</a>.
        </p>
      </article>
    </div>
  );
}
