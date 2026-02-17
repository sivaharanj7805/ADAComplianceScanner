import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShoppingCart,
  Gavel,
  AlertTriangle,
  Bell,
  BarChart3,
  ScrollText,
  Shield,
  ArrowRight,
  XCircle,
  CheckCircle2,
  RefreshCw,
  FileWarning,
  Scale,
} from 'lucide-react';
import ScanForm from '@/components/marketing/ScanForm';

export const metadata: Metadata = {
  title: 'ADA Compliance for E-Commerce | AccessAudit',
  description:
    'Is your online store an ADA lawsuit target? 69% of ADA lawsuits target e-commerce. Scan your store free — no signup required.',
  openGraph: {
    title: 'Is Your Online Store an ADA Lawsuit Target? | AccessAudit',
    description:
      '69% of ADA web lawsuits target e-commerce sites. Scan your store for free and get plain-English compliance reports.',
  },
};

const lawsuitStats = [
  {
    icon: Gavel,
    stat: '5,100+',
    label: 'ADA web lawsuits filed in 2025',
    color: 'text-red-500',
    bg: 'bg-red-50',
  },
  {
    icon: ShoppingCart,
    stat: '69%',
    label: 'target e-commerce websites',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    icon: Scale,
    stat: '$5K-$75K',
    label: 'typical settlement range',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    icon: RefreshCw,
    stat: '46%',
    label: 'of defendants get sued again',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
];

const ecomFeatures = [
  {
    icon: Bell,
    title: 'Automated Weekly Monitoring',
    description:
      'Your store changes constantly — new products, updated pages, seasonal promotions. Weekly scans catch new violations the moment they appear.',
  },
  {
    icon: AlertTriangle,
    title: 'Instant Violation Alerts',
    description:
      'Get notified when new accessibility violations are detected. Fix them before a lawsuit firm adds you to their target list.',
  },
  {
    icon: BarChart3,
    title: 'Compliance Progress for Legal Defense',
    description:
      'If you do get a demand letter, documented compliance progress shows good faith effort. Courts look favorably on businesses actively improving.',
  },
  {
    icon: ScrollText,
    title: 'Accessibility Statement Generator',
    description:
      'Publish a legally-informed accessibility statement on your site. Shows customers and plaintiffs that you take accessibility seriously.',
  },
];

export default function EcommercePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
        <div className="relative pt-16 sm:pt-24 pb-12 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-red-100">
              <Gavel className="w-4 h-4" />
              69% of ADA lawsuits target e-commerce
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">
              Is Your Online Store an{' '}
              <span className="text-[#F97316]">ADA Lawsuit Target?</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Scan your store for WCAG violations in seconds. Get plain-English
              results with exact fixes. Free, no signup required.
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

      {/* Lawsuit Stats */}
      <section className="py-12 px-4 sm:px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
            The Numbers Every E-Commerce Owner Should Know
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lawsuitStats.map((item) => (
              <div
                key={item.label}
                className={`${item.bg} rounded-xl p-6 text-center border border-gray-100`}
              >
                <item.icon
                  className={`w-8 h-8 ${item.color} mx-auto mb-3`}
                />
                <div className="text-3xl font-extrabold text-gray-900 mb-1">
                  {item.stat}
                </div>
                <div className="text-sm text-gray-600">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Settlement cost breakdown */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                The Real Cost of Non-Compliance
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                ADA web lawsuits aren&apos;t abstract. They&apos;re demand
                letters arriving in your inbox with specific dollar amounts.
                Most businesses settle because fighting costs more than paying.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-900">
                      $5,000 — $25,000:
                    </span>{' '}
                    <span className="text-gray-600">
                      Typical first-time settlement for small stores
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-900">
                      $25,000 — $75,000:
                    </span>{' '}
                    <span className="text-gray-600">
                      Mid-size e-commerce with repeat violations
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-900">
                      $75,000+:
                    </span>{' '}
                    <span className="text-gray-600">
                      Large retailers or repeat defendants
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-900">
                      46% get sued again
                    </span>{' '}
                    <span className="text-gray-600">
                      — a settlement without remediation invites repeat filings
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Average cost of a lawsuit
                </div>
                <div className="text-5xl font-extrabold text-red-600 mb-2">
                  $25,000
                </div>
                <div className="text-gray-500 text-sm mb-6">
                  average settlement for small e-commerce
                </div>
                <div className="border-t border-gray-100 pt-6">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Cost of prevention
                  </div>
                  <div className="text-5xl font-extrabold text-green-600 mb-2">
                    $99
                  </div>
                  <div className="text-gray-500 text-sm">
                    per month with AccessAudit
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Anti-Overlay Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#0F172A] rounded-2xl p-8 sm:p-12">
            <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 text-sm font-medium px-3 py-1.5 rounded-full mb-4">
              <XCircle className="w-4 h-4" />
              Overlay Warning
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              That Accessibility Widget Won&apos;t Save You
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              The FTC fined the largest overlay provider{' '}
              <span className="text-white font-semibold">
                $1M for misleading compliance claims
              </span>
              . Overlays don&apos;t fix your code. Courts don&apos;t accept them
              as compliance. And plaintiffs specifically target sites using them
              because it signals awareness without actual remediation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">
                  Overlays don&apos;t fix underlying code violations
                </span>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">
                  400+ lawsuits name overlay users as defendants
                </span>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">
                  FTC $1M fine for deceptive compliance claims
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">
                  Real compliance = fixing violations at the source
                </span>
              </div>
            </div>
            <Link
              href="/blog/why-overlays-dont-work"
              className="inline-flex items-center gap-2 text-[#F97316] hover:text-orange-400 font-semibold text-sm transition-colors"
            >
              Read our full analysis of overlay failures
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Protect Your Store. Automatically.
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Set it up once. Get continuous protection against accessibility
              violations and the lawsuits they invite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ecomFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl border border-gray-200 p-6 flex gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-[#0F172A] flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-[#F97316]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
            Three Steps to Protect Your Store
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Scan Your Store',
                desc: 'Enter your URL and get a compliance score with violations explained in plain English.',
              },
              {
                step: '2',
                title: 'Fix What Matters',
                desc: 'We prioritize violations by legal risk. Start with critical issues that plaintiffs look for.',
              },
              {
                step: '3',
                title: 'Monitor Continuously',
                desc: 'Automated weekly scans catch new violations from product updates, themes, and plugin changes.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 bg-[#F97316] text-white font-bold rounded-full flex items-center justify-center mx-auto mb-3 text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#0F172A]">
        <div className="max-w-2xl mx-auto text-center">
          <FileWarning className="w-12 h-12 text-orange-400 mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Scan Your Store Free — No Signup Required
          </h2>
          <p className="text-gray-400 mb-8">
            Find out what a plaintiff would find before they do. Get your
            compliance score and top violations in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors shadow-lg shadow-orange-500/25 text-lg"
            >
              Scan Your Store Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-white border border-gray-600 hover:border-gray-400 font-semibold px-8 py-3.5 rounded-lg transition-colors text-lg"
            >
              Start Free Trial
            </Link>
          </div>
          <p className="text-gray-600 text-sm mt-4">
            Plans from $99/month after trial. No credit card required.
          </p>
        </div>
      </section>
    </>
  );
}
