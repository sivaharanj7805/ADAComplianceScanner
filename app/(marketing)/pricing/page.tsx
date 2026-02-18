import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CheckCircle2,
  ArrowRight,
  Building2,
  ShoppingCart,
  Landmark,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'ADA Compliance Scanner Pricing | Plans from $79/month',
  description:
    'AccessAudit pricing for ADA/WCAG compliance scanning and monitoring. Plans for e-commerce ($79/mo), municipalities ($99/mo), and agencies ($149/mo). Free 14-day trial, no credit card required.',
  openGraph: {
    title: 'ADA Compliance Scanner Pricing | Plans from $79/month',
    description:
      'Automated ADA compliance monitoring plans for every budget. Free 14-day trial, no credit card required.',
    url: 'https://www.accessaudit.com/pricing',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ADA Compliance Scanner Pricing | Plans from $79/month',
    description:
      'ADA/WCAG compliance scanning plans from $79/month. Free 14-day trial.',
  },
  alternates: {
    canonical: 'https://www.accessaudit.com/pricing',
  },
};

const plans = [
  {
    name: 'E-Commerce',
    icon: ShoppingCart,
    price: 79,
    description: 'For e-commerce and business websites',
    features: [
      '1 website',
      'Up to 500 pages per site',
      'Weekly automated scans',
      'Plain-English violation reports',
      'Compliance score tracking',
      'PDF reports',
      'Accessibility statement generator',
      'Email alerts for new violations',
    ],
    cta: 'Start Free Trial',
    href: '/signup?plan=ecom_shield',
    highlighted: false,
  },
  {
    name: 'Municipal',
    icon: Landmark,
    price: 99,
    description: 'For cities and local government websites',
    features: [
      '1 website',
      'Up to 500 pages per site',
      'Weekly automated scans',
      'Plain-English violation reports',
      'Title II compliance tracking',
      'PDF reports for council meetings',
      'Accessibility statement generator',
      'Email alerts for new violations',
    ],
    cta: 'Start Free Trial',
    href: '/signup?plan=municipal_starter',
    highlighted: true,
  },
  {
    name: 'Agency',
    icon: Building2,
    price: 149,
    description: 'For agencies managing multiple client sites',
    features: [
      'Up to 10 websites',
      'Up to 500 pages per site',
      'Weekly automated scans',
      'Multi-site dashboard',
      'White-labeled PDF reports',
      'Client-facing compliance scores',
      'Accessibility statement generator',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    href: '/signup?plan=agency_starter',
    highlighted: false,
  },
];

const pricingJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AccessAudit',
  applicationCategory: 'WebApplication',
  offers: plans.map((plan) => ({
    '@type': 'Offer',
    name: `${plan.name} Plan`,
    price: plan.price.toString(),
    priceCurrency: 'USD',
    description: plan.description,
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: plan.price.toString(),
      priceCurrency: 'USD',
      billingDuration: 'P1M',
    },
  })),
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />

      {/* Hero */}
      <section className="pt-16 sm:pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">
            Compliance Monitoring That{' '}
            <span className="text-[#F97316]">Fits Your Budget</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-4 leading-relaxed">
            Plans start at less than one hour of a consultant&apos;s time.
            Free 14-day trial on all plans.
          </p>
          <p className="text-sm text-gray-400">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 flex flex-col ${
                  plan.highlighted
                    ? 'border-2 border-[#F97316] bg-white shadow-lg shadow-orange-100'
                    : 'border border-gray-200 bg-white'
                }`}
              >
                {plan.highlighted && (
                  <div className="inline-flex self-start items-center gap-1.5 bg-orange-50 text-[#F97316] text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    Most Popular
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#0F172A] flex items-center justify-center">
                    <plan.icon className="w-5 h-5 text-[#F97316]" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {plan.name}
                  </h2>
                </div>
                <p className="text-sm text-gray-500 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-500 text-lg">/month</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`block w-full font-semibold py-3.5 rounded-lg transition-colors text-center text-lg ${
                    plan.highlighted
                      ? 'bg-[#F97316] hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25'
                      : 'bg-[#0F172A] hover:bg-gray-800 text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free scan CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Not Sure Yet? Try a Free Scan First
          </h2>
          <p className="text-gray-500 mb-8">
            Scan any page for WCAG 2.1 AA violations — free, no signup
            required. See your compliance score and top violations in seconds.
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors shadow-lg shadow-orange-500/25 text-lg"
          >
            Scan Your Site Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
