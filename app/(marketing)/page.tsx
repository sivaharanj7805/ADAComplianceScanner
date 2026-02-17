import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Shield,
  Gavel,
  Scale,
  FileWarning,
  Building2,
  ShoppingCart,
  Landmark,
  FileText,
  Bell,
  BarChart3,
  FileDown,
  ScrollText,
  ArrowRight,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import ScanForm from '@/components/marketing/ScanForm';

export const metadata: Metadata = {
  title: 'AccessAudit — ADA Website Compliance Scanner & Monitoring',
  description:
    'Find and fix ADA/WCAG accessibility violations on your website. Free scan, plain-English reports, automated monitoring. Plans from $79/month.',
  openGraph: {
    title: 'AccessAudit — Stop ADA Lawsuits Before They Start',
    description:
      'Scan your website for WCAG 2.1 AA violations. Get plain-English reports with actionable fixes. Free scan, no signup required.',
    url: 'https://www.accessaudit.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AccessAudit — ADA Website Compliance Scanner & Monitoring',
    description:
      'Find and fix ADA/WCAG accessibility violations on your website. Free scan, plain-English reports, automated monitoring.',
  },
  alternates: {
    canonical: 'https://www.accessaudit.com',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AccessAudit',
  url: 'https://www.accessaudit.com',
  logo: 'https://www.accessaudit.com/logo.png',
  description:
    'ADA and WCAG 2.1 AA compliance scanning with plain-English reports, automated monitoring, and compliance scoring.',
  sameAs: [],
};

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AccessAudit',
  applicationCategory: 'WebApplication',
  operatingSystem: 'Web',
  url: 'https://www.accessaudit.com',
  description:
    'Automated ADA/WCAG website compliance scanner with plain-English violation reports, ongoing monitoring, and compliance scoring.',
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: '79',
    highPrice: '199',
    offerCount: '3',
  },
  featureList: [
    'WCAG 2.1 AA compliance scanning',
    'Plain-English violation reports',
    'Automated weekly monitoring',
    'Compliance scoring (0-100)',
    'PDF report generation',
    'Accessibility statement generator',
    'White-label reports for agencies',
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is ADA web compliance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Americans with Disabilities Act (ADA) requires businesses to make their websites accessible to people with disabilities. Courts consistently reference WCAG 2.1 Level AA as the technical benchmark for compliance.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does an ADA website lawsuit cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ADA web accessibility lawsuits typically settle for $5,000 to $150,000+. Over 5,100 ADA web lawsuits were filed in 2025 alone, with 69% targeting e-commerce websites.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does AccessAudit scan for accessibility violations?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AccessAudit uses axe-core, the industry-standard accessibility testing engine trusted by Microsoft, Google, and the US government. It loads your page in a real browser and checks against WCAG 2.1 Level AA criteria.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are accessibility overlay widgets and do they work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Accessibility overlays are JavaScript widgets that claim to fix compliance issues automatically. However, they do not fix underlying code violations, courts do not accept them as compliance, and the FTC fined the largest overlay provider $1M for deceptive practices.',
      },
    },
  ],
};

const features = [
  {
    icon: FileText,
    title: 'Plain-English Reports',
    description:
      'No technical jargon. Every violation is explained in language anyone can understand, with step-by-step fix instructions.',
  },
  {
    icon: Bell,
    title: 'Automated Monitoring',
    description:
      'Weekly scans catch new violations as your site changes. Get alerted before issues become lawsuits.',
  },
  {
    icon: BarChart3,
    title: 'Compliance Scoring',
    description:
      'Track your progress with a 0-100 compliance score. Show stakeholders measurable improvement over time.',
  },
  {
    icon: FileDown,
    title: 'PDF Reports',
    description:
      'Export branded compliance reports for clients, legal teams, or internal stakeholders. White-label available for agencies.',
  },
  {
    icon: ScrollText,
    title: 'Accessibility Statement Generator',
    description:
      'Generate a legally-informed accessibility statement for your site — updated automatically as your compliance improves.',
  },
];

const audienceCards = [
  {
    icon: Building2,
    title: 'For Agencies',
    description:
      'Monitor all client sites from one dashboard. White-labeled reports, per-portfolio pricing.',
    href: '/agencies',
    stat: 'Manage 10+ sites',
  },
  {
    icon: ShoppingCart,
    title: 'For E-Commerce',
    description:
      '69% of ADA lawsuits target online stores. Protect yours with continuous monitoring.',
    href: '/ecommerce',
    stat: '#1 lawsuit target',
  },
  {
    icon: Landmark,
    title: 'For Municipalities',
    description:
      'Title II compliance deadlines are approaching. Reports your council can actually read.',
    href: '/municipalities',
    stat: 'April 2026 deadline',
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
        <div className="relative pt-16 sm:pt-24 pb-12 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Urgency badge */}
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-red-100">
              <Gavel className="w-4 h-4" />
              5,100+ ADA website lawsuits filed in 2025
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">
              Stop ADA Lawsuits{' '}
              <span className="text-[#F97316]">Before They Start</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Scan your website for WCAG 2.1 AA violations. Get plain-English
              reports with actionable fixes. No signup required.
            </p>

            {/* Embedded Scan Form */}
            <ScanForm />

            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                Powered by axe-core
              </span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span>WCAG 2.1 AA standard</span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span>No signup required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-100 bg-[#0F172A] py-6 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <Gavel className="w-5 h-5 text-red-400" />
                <span className="text-2xl font-bold text-white">5,100+</span>
              </div>
              <span className="text-sm text-gray-400">
                lawsuits filed in 2025
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <Scale className="w-5 h-5 text-orange-400" />
                <span className="text-2xl font-bold text-white">37%</span>
              </div>
              <span className="text-sm text-gray-400">increase year over year</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <FileWarning className="w-5 h-5 text-amber-400" />
                <span className="text-2xl font-bold text-white">69%</span>
              </div>
              <span className="text-sm text-gray-400">
                target e-commerce sites
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Audience Cards */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Built for Teams That Can&apos;t Afford Non-Compliance
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Whether you manage one site or one hundred, AccessAudit gives you
              the tools to stay compliant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {audienceCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:border-[#F97316] hover:shadow-lg hover:shadow-orange-50 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                    <card.icon className="w-5 h-5 text-[#F97316]" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#F97316]">
                    {card.stat}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  {card.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#F97316] group-hover:gap-2 transition-all">
                  Learn more
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Everything You Need to Stay Compliant
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Not just a scanner. A complete compliance monitoring platform that
              keeps you protected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-[#0F172A] flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-[#F97316]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Anti-Overlay Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#0F172A] rounded-2xl p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 text-sm font-medium px-3 py-1.5 rounded-full mb-4">
                  <XCircle className="w-4 h-4" />
                  Warning
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Why Accessibility Overlays Don&apos;t Work
                </h2>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Accessibility overlay widgets promise one-line compliance. The
                  reality: they don&apos;t fix your actual code, courts
                  don&apos;t accept them as compliance, and the FTC fined the
                  largest overlay provider $1M for deceptive practices.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">
                      Over 400 lawsuits have named overlay users as defendants
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">
                      The National Federation of the Blind opposes overlay
                      products
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">
                      Real compliance means fixing violations at the source code
                      level
                    </span>
                  </div>
                </div>
                <Link
                  href="/blog/why-overlays-dont-work"
                  className="inline-flex items-center gap-2 text-[#F97316] hover:text-orange-400 font-semibold text-sm transition-colors"
                >
                  Read the full breakdown
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Compliance Monitoring That Fits Your Budget
          </h2>
          <p className="text-gray-500 mb-2">
            Plans start at{' '}
            <span className="font-bold text-gray-900">$79/month</span> — less
            than one hour of a consultant&apos;s time.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Free 14-day trial on all plans. No credit card required.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors shadow-lg shadow-orange-500/25 text-lg"
          >
            View Pricing
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#0F172A]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Don&apos;t Wait for a Demand Letter
          </h2>
          <p className="text-gray-400 mb-8">
            Start monitoring your website&apos;s accessibility today. Catch
            violations before they become lawsuits.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors shadow-lg shadow-orange-500/25 text-lg"
            >
              Scan Your Site Free
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-white border border-gray-600 hover:border-gray-400 font-semibold px-8 py-3.5 rounded-lg transition-colors text-lg"
            >
              Start Free Trial
            </Link>
          </div>
          <p className="text-gray-600 text-sm mt-4">
            No credit card required
          </p>
        </div>
      </section>
    </>
  );
}
