import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Landmark,
  Clock,
  FileText,
  BarChart3,
  Bell,
  ScrollText,
  Shield,
  ArrowRight,
  CheckCircle2,
  Users,
  CalendarClock,
  Scale,
  AlertTriangle,
} from 'lucide-react';
import ScanForm from '@/components/marketing/ScanForm';

export const metadata: Metadata = {
  title: 'Municipal Website ADA Compliance | Title II Deadline Scanner',
  description:
    'Is your municipal website ready for the ADA Title II deadline? April 2026 for cities over 50,000. Automated WCAG 2.1 AA scanning with reports your council can understand. Plans from $79/month.',
  openGraph: {
    title: 'Municipal Website ADA Compliance | Title II Deadline Scanner',
    description:
      'Automated WCAG 2.1 AA scanning with plain-English reports for municipal websites. Title II deadline approaching — start scanning today.',
    url: 'https://www.accessaudit.com/municipalities',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Municipal Website ADA Compliance | Title II Deadline Scanner',
    description:
      'Is your town website ready for the ADA Title II deadline? Automated scanning with plain-English reports. $79/month.',
  },
  alternates: {
    canonical: 'https://www.accessaudit.com/municipalities',
  },
};

const deadlines = [
  {
    population: 'Over 50,000 population',
    deadline: 'April 24, 2026',
    urgency: 'high' as const,
  },
  {
    population: 'Under 50,000 population',
    deadline: 'April 26, 2027',
    urgency: 'medium' as const,
  },
];

const municipalFeatures = [
  {
    icon: Bell,
    title: 'Automated Monitoring',
    description:
      'Weekly scans detect new violations whenever your staff updates content. No manual audits needed.',
  },
  {
    icon: BarChart3,
    title: 'Compliance Scoring for Council Presentations',
    description:
      'A single 0-100 score your council members and city manager can understand. Track progress meeting-to-meeting.',
  },
  {
    icon: Clock,
    title: 'Progress Tracking Toward Deadline',
    description:
      'See a clear timeline of your compliance improvement. Demonstrate to oversight bodies that you\'re making measurable progress.',
  },
  {
    icon: ScrollText,
    title: 'Accessibility Statement Generator',
    description:
      'Automatically generate a compliant accessibility statement for your website — required under Title II.',
  },
  {
    icon: FileText,
    title: 'Plain-English PDF Reports',
    description:
      'Reports written for non-technical staff. No WCAG jargon — just clear descriptions of what\'s wrong and how to fix it.',
  },
  {
    icon: Users,
    title: 'Multi-Department Support',
    description:
      'Parks, library, utilities — scan all your department sites from one dashboard. One login, one bill.',
  },
];

export default function MunicipalitiesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] to-[#1E293B]" />
        <div className="relative pt-16 sm:pt-24 pb-16 sm:pb-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-300 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-amber-500/20">
              <CalendarClock className="w-4 h-4" />
              Title II Compliance Deadline Approaching
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              Is Your Town Website Ready for the{' '}
              <span className="text-[#F97316]">ADA Title II Deadline?</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Automated WCAG 2.1 AA scanning with reports your council can
              understand. No technical jargon.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/scan"
                className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors shadow-lg shadow-orange-500/25 text-lg"
              >
                Scan Your Municipal Website Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <p className="text-gray-500 text-sm mt-4">
              Free scan — no signup, no budget approval needed
            </p>
          </div>
        </div>
      </section>

      {/* Deadline Urgency */}
      <section className="py-12 px-4 sm:px-6 bg-amber-50 border-y border-amber-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-gray-900">
              Federal Compliance Deadlines
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {deadlines.map((item) => (
              <div
                key={item.population}
                className={`rounded-xl p-6 text-center ${
                  item.urgency === 'high'
                    ? 'bg-red-50 border-2 border-red-200'
                    : 'bg-white border border-amber-200'
                }`}
              >
                <CalendarClock
                  className={`w-8 h-8 mx-auto mb-3 ${
                    item.urgency === 'high'
                      ? 'text-red-500'
                      : 'text-amber-500'
                  }`}
                />
                <p
                  className={`text-2xl sm:text-3xl font-bold mb-1 ${
                    item.urgency === 'high'
                      ? 'text-red-700'
                      : 'text-amber-700'
                  }`}
                >
                  {item.deadline}
                </p>
                <p className="text-sm text-gray-600 font-medium">
                  {item.population}
                </p>
                {item.urgency === 'high' && (
                  <p className="text-xs text-red-500 mt-2 font-semibold uppercase tracking-wider">
                    Less than 14 months away
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600 mt-6 max-w-xl mx-auto">
            The DOJ finalized rules requiring state and local government
            websites to meet WCAG 2.1 Level AA standards. Non-compliance risks
            federal enforcement action and civil rights complaints.
          </p>
        </div>
      </section>

      {/* Plain Language Emphasis */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Reports Your Council Can Actually Understand
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                Most accessibility tools generate reports full of WCAG
                references and HTML code snippets. Your city council
                doesn&apos;t speak that language — and they shouldn&apos;t have
                to.
              </p>
              <p className="text-gray-500 leading-relaxed mb-6">
                AccessAudit translates every violation into plain English. When
                we find a missing alt tag on an image, we don&apos;t say
                &ldquo;WCAG 1.1.1 Non-text Content Level A failure.&rdquo; We
                say: &ldquo;An image on your Parks page has no description, so
                blind residents using screen readers can&apos;t tell what
                it shows.&rdquo;
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    No WCAG jargon — every issue explained in everyday language
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Compliance score (0-100) for council meeting presentations
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    PDF reports with progress charts your city manager can share
                  </span>
                </div>
              </div>
            </div>

            {/* Simplified report preview */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <Landmark className="w-5 h-5 text-[#F97316]" />
                <span className="font-bold text-gray-900 text-sm">
                  Town of Springfield — Compliance Report
                </span>
              </div>

              {/* Score */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-amber-400 mb-2">
                  <span className="text-2xl font-bold text-amber-600">62</span>
                </div>
                <p className="text-sm text-gray-500">Compliance Score</p>
                <p className="text-xs text-amber-600 font-medium">
                  Needs Improvement
                </p>
              </div>

              {/* Sample violations */}
              <div className="space-y-3">
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-700 mb-1">
                    Critical
                  </p>
                  <p className="text-sm text-gray-700">
                    The online permit form cannot be completed using a keyboard
                    alone. Residents who can&apos;t use a mouse are unable to
                    apply for permits.
                  </p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1">
                    Serious
                  </p>
                  <p className="text-sm text-gray-700">
                    12 images on the Parks &amp; Recreation page have no text
                    descriptions. Screen reader users cannot tell what they show.
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-700 mb-1">
                    Minor
                  </p>
                  <p className="text-sm text-gray-700">
                    Some links on the Council page say &ldquo;Click here&rdquo;
                    instead of describing where they go.
                  </p>
                </div>
              </div>

              <p className="text-center text-xs text-gray-400 mt-4">
                Sample report — your results will be specific to your site
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Municipalities */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Everything Your Municipality Needs
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Built for government teams with limited IT budgets and
              non-technical stakeholders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {municipalFeatures.map((feature) => (
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

      {/* Pricing */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Compliance Shouldn&apos;t Break a Municipal Budget
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-10">
            Accessibility consultants charge $150-$300/hour. A full manual audit
            can cost $10,000+. AccessAudit gives you continuous monitoring for
            a fraction of the cost.
          </p>

          <div className="bg-white rounded-2xl border-2 border-[#F97316] p-8 max-w-md mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-[#F97316] text-sm font-semibold px-3 py-1.5 rounded-full mb-4">
              <Landmark className="w-4 h-4" />
              Municipal Plan
            </div>
            <div className="mb-4">
              <span className="text-5xl font-extrabold text-gray-900">$79</span>
              <span className="text-gray-500 text-lg">/month</span>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Less than one hour of a consultant&apos;s time
            </p>

            <ul className="space-y-3 text-left mb-8">
              {[
                'Unlimited pages per site',
                'Weekly automated scans',
                'Plain-English violation reports',
                'Compliance score tracking',
                'PDF reports for council meetings',
                'Accessibility statement generator',
                'Email alerts for new violations',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="block w-full bg-[#F97316] hover:bg-orange-600 text-white font-semibold py-3.5 rounded-lg transition-colors text-center text-lg"
            >
              Start 14-Day Free Trial
            </Link>
            <p className="text-xs text-gray-400 mt-3">
              No credit card required. No procurement process needed for trial.
            </p>
          </div>
        </div>
      </section>

      {/* Scan CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Scan Your Municipal Website Free
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              See where your town website stands right now. No signup, no
              budget approval, no IT department required.
            </p>
          </div>
          <ScanForm />
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Powered by axe-core
            </span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span>WCAG 2.1 AA standard</span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span>Results in under 60 seconds</span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#0F172A]">
        <div className="max-w-2xl mx-auto text-center">
          <Scale className="w-12 h-12 text-gray-600 mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            The Deadline Won&apos;t Wait
          </h2>
          <p className="text-gray-400 mb-4 leading-relaxed">
            Every week without monitoring is a week your residents can&apos;t
            fully access your services — and a week closer to federal
            enforcement.
          </p>
          <p className="text-gray-400 mb-8">
            <span className="text-white font-semibold">$79/month</span>.
            14-day free trial. Cancel anytime.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors shadow-lg shadow-orange-500/25 text-lg"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
