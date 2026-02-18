import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { format } from 'date-fns';
import { getScanByShareToken } from '@/lib/supabase/queries';
import SharedReportContent from './SharedReportContent';

interface SharedReportPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({
  params,
}: SharedReportPageProps): Promise<Metadata> {
  const { token } = await params;
  const { data } = await getScanByShareToken(token);

  if (!data) {
    return { title: 'Report Not Found - AccessAudit' };
  }

  const brandName = data.agencySettings?.agency_name ?? 'AccessAudit';

  return {
    title: `Accessibility Report — ${data.siteName} - ${brandName}`,
    description: `WCAG 2.1 AA compliance scan results for ${data.siteUrl}. Score: ${data.scan.score ?? 'N/A'}/100.`,
  };
}

export default async function SharedReportPage({
  params,
}: SharedReportPageProps) {
  const { token } = await params;

  // Validate token format (24 alphanumeric characters)
  if (!/^[A-Za-z0-9]{24}$/.test(token)) {
    notFound();
  }

  const { data, error } = await getScanByShareToken(token);

  if (error || !data) {
    notFound();
  }

  const { scan, violations, siteName, siteUrl, agencySettings } = data;

  const isWhiteLabel = agencySettings !== null;
  const brandName = agencySettings?.agency_name ?? 'AccessAudit';
  const primaryColor = agencySettings?.primary_color ?? '#f97316'; // orange-500
  const logoUrl = agencySettings?.logo_url ?? null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="border-b bg-white"
        style={{ borderBottomColor: primaryColor }}
      >
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={brandName}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {brandName.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Compliance Report
                </p>
                <h1 className="text-lg font-semibold text-gray-900">
                  {siteName}
                </h1>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Scanned on</p>
              <p className="text-sm font-medium text-gray-700">
                {format(new Date(scan.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <SharedReportContent
          scan={scan}
          violations={violations}
          siteName={siteName}
          siteUrl={siteUrl}
          shareToken={token}
          primaryColor={primaryColor}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          {isWhiteLabel ? (
            <div className="text-center">
              {agencySettings.report_footer_text ? (
                <p className="text-xs text-gray-400">
                  {agencySettings.report_footer_text}
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  Report by{' '}
                  <span className="font-medium" style={{ color: primaryColor }}>
                    {brandName}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-xs text-gray-400">
              Powered by{' '}
              <Link
                href="/"
                className="font-medium text-orange-600 hover:text-orange-700"
              >
                AccessAudit
              </Link>
              {' '}— Accessibility compliance monitoring
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
