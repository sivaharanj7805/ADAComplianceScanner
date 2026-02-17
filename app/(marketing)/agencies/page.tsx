import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Monitor,
  BarChart3,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  XCircle,
  Palette,
  LayoutDashboard,
  DollarSign,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'ADA Compliance Monitoring for Web Agencies | White-Label Reports',
  description:
    'Monitor ADA/WCAG accessibility across all your client sites from one dashboard. White-labeled PDF reports, per-portfolio pricing. Start your free 14-day trial.',
  openGraph: {
    title: 'ADA Compliance Monitoring for Web Agencies | AccessAudit',
    description:
      'One dashboard for every client. White-labeled PDF reports. Per-portfolio pricing, not per-domain. Free 14-day trial.',
    url: 'https://www.accessaudit.com/agencies',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ADA Compliance Monitoring for Web Agencies | White-Label Reports',
    description:
      'Monitor accessibility across all client sites. White-labeled reports, per-portfolio pricing.',
  },
  alternates: {
    canonical: 'https://www.accessaudit.com/agencies',
  },
};

const painPoints = [
  {
    icon: AlertTriangle,
    title: 'Your Clients Are One Lawsuit Away from Blaming You',
    description:
      'When a client gets an ADA demand letter, the first call they make is to you. "Didn\'t you build this site?" If you can\'t show proactive monitoring, you\'re on the hook.',
  },
  {
    icon: Clock,
    title: 'Manual Audits Take 40+ Hours Per Site',
    description:
      'Your team is already stretched thin. Manual accessibility audits are expensive, tedious, and outdated the moment a client pushes a content update.',
  },
];

const agencyFeatures = [
  {
    icon: LayoutDashboard,
    title: 'Multi-Site Dashboard',
    description:
      'See compliance scores, violation counts, and scan status for every client site — all in one view. No logging into separate accounts.',
  },
  {
    icon: Palette,
    title: 'White-Labeled PDF Reports',
    description:
      'Your logo. Your colors. Your brand on every report. Send clients polished compliance reports that look like you built the tooling yourself.',
  },
  {
    icon: BarChart3,
    title: 'Client-Facing Compliance Scores',
    description:
      'Give each client a 0-100 score they can understand. Track improvement over time and use it in client reviews and upsell conversations.',
  },
  {
    icon: DollarSign,
    title: 'Per-Portfolio Pricing',
    description:
      'Competitors charge per domain. We charge per portfolio. Add and remove sites as clients come and go — no surprise cost jumps.',
  },
];

const comparisonRows = [
  { feature: 'Pricing model', competitor: 'Per domain ($99-$499 each)', accessaudit: 'Per portfolio ($199/mo for 10 sites)' },
  { feature: 'White-label reports', competitor: 'Enterprise only ($499+/mo)', accessaudit: 'Included on all agency plans' },
  { feature: 'Multi-site dashboard', competitor: 'Limited or add-on', accessaudit: 'Built-in from day one' },
  { feature: 'Plain-English reports', competitor: 'Technical developer output', accessaudit: 'Non-technical language by default' },
  { feature: 'Scheduled monitoring', competitor: 'Manual re-scans', accessaudit: 'Automated weekly scans' },
];

export default function AgenciesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] to-[#1E293B]" />
        <div className="relative pt-16 sm:pt-24 pb-16 sm:pb-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-300 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-orange-500/20">
              <Users className="w-4 h-4" />
              For Web Agencies &amp; Consultancies
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              Monitor Accessibility Across{' '}
              <span className="text-[#F97316]">All Your Client Sites</span>{' '}
              From One Dashboard
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              White-labeled reports. Per-portfolio pricing. Stop selling hours,
              start selling monitoring.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors shadow-lg shadow-orange-500/25 text-lg"
              >
                Start Your 14-Day Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/scan"
                className="inline-flex items-center gap-2 text-white border border-gray-600 hover:border-gray-400 font-semibold px-8 py-3.5 rounded-lg transition-colors text-lg"
              >
                Try a Free Scan First
              </Link>
            </div>
            <p className="text-gray-500 text-sm mt-4">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
            The Problem Every Agency Ignores (Until It&apos;s Too Late)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {painPoints.map((point) => (
              <div
                key={point.title}
                className="bg-red-50 border border-red-100 rounded-xl p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                  <point.icon className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">
                  {point.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features for Agencies */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Built for How Agencies Actually Work
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Not a single-site scanner repackaged. AccessAudit was designed
              from day one for multi-client workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agencyFeatures.map((feature) => (
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

      {/* Pricing Comparison */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Stop Paying Per Domain
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Competitors charge $99-$499 per domain. We charge{' '}
              <span className="font-semibold text-gray-900">
                $199/month for up to 10 sites
              </span>
              . Add more for $15/site.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">
                      Feature
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-500">
                      Typical Competitor
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-[#F97316]">
                      AccessAudit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {row.feature}
                      </td>
                      <td className="py-4 px-6 text-gray-500">
                        <span className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                          {row.competitor}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {row.accessaudit}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
            Up and Running in Minutes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Add Your Client Sites',
                desc: 'Import your portfolio — no limit on pages per site. Set scan frequency for each client.',
              },
              {
                step: '2',
                title: 'Upload Your Branding',
                desc: 'Add your logo, pick your colors, and optionally set a custom report domain.',
              },
              {
                step: '3',
                title: 'Send Client Reports',
                desc: 'Download branded PDF reports or share live compliance dashboards with your clients.',
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

      {/* Testimonial / Social proof placeholder */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Monitor className="w-12 h-12 text-gray-300 mx-auto mb-6" />
          <blockquote className="text-xl sm:text-2xl font-medium text-gray-900 leading-relaxed mb-4">
            &ldquo;We used to spend 2 days per client doing manual accessibility
            audits. Now we scan all 23 client sites in the time it takes to
            make coffee.&rdquo;
          </blockquote>
          <p className="text-gray-500 text-sm">
            — Agency owner managing 23 client sites
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#0F172A]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Start Your 14-Day Free Trial
          </h2>
          <p className="text-gray-400 mb-4">
            Add up to 10 client sites. Full access to white-label reports,
            multi-site dashboard, and automated monitoring.
          </p>
          <p className="text-gray-400 mb-8">
            <span className="font-semibold text-white">$199/month</span> for up
            to 10 sites after trial. No per-domain surprises.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors shadow-lg shadow-orange-500/25 text-lg"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-gray-600 text-sm mt-4">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>
    </>
  );
}
